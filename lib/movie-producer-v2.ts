import { Prisma } from "@prisma/client";
import {createHash} from "node:crypto";
import { db } from "@/lib/db";
import { createLongMoviePlan } from "@/lib/long-movie-plan";
import { createUserGeneration, getUserGeneration } from "@/lib/generation-service";

const MOVIE_ACTIVE = ["QUEUED", "RUNNING"];
const MAX_RETRIES = 1;
const STALE_LEASE_MS = 90_000;

export type CreateMovieRequest = {
  title?: string; prompt: string; targetSeconds: number; modelSlug: string;
  aspectRatio: string; resolution: string; qualityProfile: "cinematic"|"balanced"|"fast";
  generateAudio: boolean; styleBible?: string; maxCredits: number;
  aiQaApproved?: boolean; confirmBudget: true; idempotencyKey:string;
};

export class MovieError extends Error {
  constructor(message: string, public status = 400) {super(message);}
}

export async function createMovie(userId:string, request:CreateMovieRequest) {
  if (request.confirmBudget !== true) throw new MovieError("Нийт кредитийн дээд төсвийг зөвшөөрнө үү.");
  if (!Number.isSafeInteger(request.maxCredits) || request.maxCredits < 1 || request.maxCredits > 10_000_000)
    throw new MovieError("Нийт төсөв буруу байна.");
  if(!/^[A-Za-z0-9_-]{16,128}$/.test(request.idempotencyKey||""))throw new MovieError("Idempotency key 16–128 тэмдэгт байна.");
  const requestHash=createHash("sha256").update(JSON.stringify([
    request.prompt,request.targetSeconds,request.modelSlug,request.aspectRatio,
    request.resolution,request.qualityProfile,request.generateAudio,request.styleBible||"",
    request.maxCredits,!!request.aiQaApproved,request.title||""
  ])).digest("hex");
  const prior=await db.movieProject.findUnique({where:{userId_requestKey:{userId,requestKey:request.idempotencyKey}}});
  if(prior){if(prior.requestHash!==requestHash)throw new MovieError("Энэ түлхүүр өөр төсөлд ашиглагдсан.",409);return getOwnMovie(userId,prior.id);}
  const plan = createLongMoviePlan(request);
  if (plan.totalVideoCredits > request.maxCredits)
    throw new MovieError(`Төлөвлөгөөнд ${plan.totalVideoCredits} кредит хэрэгтэй. Баталсан хэмжээ: ${request.maxCredits}.`,409);
  // Budget is checked before each scene and never exceeded. It is not prepaid escrow:
  // other user actions may use wallet credits in the meantime, which pauses this job.
  return db.$transaction(async tx => {
    const owner = await tx.user.findUnique({where:{id:userId},select:{credits:true}});
    if (!owner) throw new MovieError("Бүртгэл олдсонгүй.",401);
    if (owner.credits < plan.totalVideoCredits) throw new MovieError("Кредит хүрэлцэхгүй байна.",402);
    const active = await tx.movieProject.count({where:{userId,status:{in:MOVIE_ACTIVE}}});
    if (active >= 2) throw new MovieError("Нэг зэрэг 2 хүртэл киноны ажил эхлүүлнэ.",429);
    const project = await tx.movieProject.create({data:{
      userId,requestKey:request.idempotencyKey,requestHash,title:request.title?.trim().slice(0,120)||"RAINY One-Prompt Movie",
      prompt:request.prompt,targetSeconds:request.targetSeconds,
      aspectRatio:request.aspectRatio,resolution:request.resolution,
      modelSlug:request.modelSlug,qualityProfile:request.qualityProfile,
      maxCredits:request.maxCredits,quotedCredits:plan.totalVideoCredits,
      aiQaApproved:request.aiQaApproved===true,
      scenes:{create:plan.scenes.map(scene=>({
        number:scene.number,duration:scene.duration,prompt:scene.templateInput.prompt,
        input:scene.templateInput as Prisma.InputJsonValue,
        quotedCredits:scene.credits,
      }))},
    },include:{scenes:{orderBy:{number:"asc"}}}});
    return project;
  },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
}

export async function getOwnMovie(userId:string,id:string){
  return db.movieProject.findFirst({where:{id,userId},include:{scenes:{orderBy:{number:"asc"}}}});
}
export async function listOwnMovies(userId:string){
  return db.movieProject.findMany({where:{userId},orderBy:{createdAt:"desc"},take:20,
    include:{scenes:{select:{number:true,status:true,qaStatus:true,generationId:true}}}});
}

async function countCharged(projectId:string){
  // A generated request's cost counts even when it ultimately fails;
  // provider/account credits and refunds are handled by GenerationService.
  const attempts = await db.movieGenerationAttempt.findMany({where:{scene:{projectId}},select:{generationId:true}});
  const generationIds = attempts.map(x=>x.generationId);
  if(!generationIds.length) return 0;
  const paid = await db.generation.findMany({where:{id:{in:generationIds}},select:{costCredits:true,refunded:true}});
  return paid.reduce((total,g)=>total+(g.refunded?0:g.costCredits),0);
}

export async function tickMovieProducer(){
  if(process.env.MOVIE_SCHEDULER_ENABLED !== "true") return {status:"disabled"};
  const now = new Date();
  const candidate = await db.movieProject.findFirst({
    where:{status:{in:MOVIE_ACTIVE},OR:[{leaseUntil:null},{leaseUntil:{lt:now}}]},
    orderBy:{createdAt:"asc"},select:{id:true},
  });
  if(!candidate) return {status:"idle"};
  const locked = await db.movieProject.updateMany({where:{id:candidate.id,status:{in:MOVIE_ACTIVE},
    OR:[{leaseUntil:null},{leaseUntil:{lt:now}}]},data:{leaseUntil:new Date(Date.now()+STALE_LEASE_MS),status:"RUNNING"}});
  if(!locked.count) return {status:"busy"};
  try {return await processMovie(candidate.id);}
  finally {
    await db.movieProject.update({where:{id:candidate.id},data:{leaseUntil:null}}).catch(()=>null);
  }
}

async function processMovie(id:string){
  const movie = await db.movieProject.findUnique({where:{id},include:{scenes:{orderBy:{number:"asc"}}}});
  if(!movie) return {status:"gone"};
  const scene = movie.scenes.find(s=>!["COMPLETED"].includes(s.status));
  if(!scene){await db.movieProject.update({where:{id},data:{status:"SCENES_READY"}});return {status:"scenes_ready",id};}
  if(["NEEDS_REVIEW","FAILED","PAUSED"].includes(scene.status)){
    await db.movieProject.update({where:{id},data:{status:"REVIEW_REQUIRED",lastError:scene.lastError||"Кадрын шалгалт шаардлагатай."}});
    return {status:"review_required",scene:scene.number};
  }
  if(scene.nextAttemptAt && scene.nextAttemptAt.getTime()>Date.now()) return {status:"backoff",scene:scene.number};
  if(scene.generationId){
    try {
      const report=await getUserGeneration(movie.userId,scene.generationId);
      const gen=report.generation;
      if(gen.status==="COMPLETED" && gen.media?.url){
        // A completed provider request is not automatically a semantic quality pass.
        // The AI vision gate below may request manual approval or a budgeted retry.
        const qa = await performQualityGate(movie.aiQaApproved,gen.media.url,scene.prompt);
        if(qa.verdict==="regenerate" && scene.attempts<MAX_RETRIES){
          const charged=await countCharged(movie.id);
          if(charged+scene.quotedCredits<=movie.maxCredits){
            await db.movieScene.update({where:{id:scene.id},data:{status:"PENDING",generationId:null,attempts:{increment:1},qaStatus:"RETRY",qaReport:qa as Prisma.InputJsonValue,lastError:"QA дахин үүсгэлт санал болгосон."}});
            return {status:"retry_queued",scene:scene.number};
          }
        }
        await db.movieScene.update({where:{id:scene.id},data:{status:qa.verdict==="review"?"NEEDS_REVIEW":"COMPLETED",qaStatus:qa.source==="provider_only"?"NOT_VERIFIED":qa.verdict.toUpperCase(),qaReport:qa as Prisma.InputJsonValue,lastError:qa.verdict==="review"?qa.reason:null}});
        return {status:qa.verdict,scene:scene.number};
      }
      if(["FAILED","CANCELED","NSFW"].includes(gen.status)){
        await db.movieScene.update({where:{id:scene.id},data:{status:"FAILED",lastError:`Video: ${gen.status}`}});
        return {status:"failed",scene:scene.number};
      }
      return {status:"processing",scene:scene.number,providerStatus:gen.status};
    }catch(e){return {status:"poll_delayed",scene:scene.number};}
  }
  const charged=await countCharged(movie.id);
  if(charged+scene.quotedCredits>movie.maxCredits){
    await db.movieProject.update({where:{id},data:{status:"PAUSED_BUDGET",lastError:"Баталсан төсөв хүрэлцэхгүй."}});
    return {status:"paused_budget",scene:scene.number};
  }
  const key=`movie-${id}-scene-${scene.number}-attempt-${scene.attempts}`;
  try {
    const payload=scene.input as Record<string,unknown>;
    const next=await createUserGeneration(movie.userId,{...payload,modelSlug:movie.modelSlug},
      {idempotencyKey:key,maxCredits:scene.quotedCredits});
    await db.$transaction(async tx=>{
      await tx.movieGenerationAttempt.upsert({where:{sceneId_attempt:{sceneId:scene.id,attempt:scene.attempts}},
        update:{generationId:next.generation.id},
        create:{sceneId:scene.id,attempt:scene.attempts,generationId:next.generation.id,quotedCredits:scene.quotedCredits}});
      await tx.movieScene.update({where:{id:scene.id},data:{generationId:next.generation.id,status:"PROCESSING",lastError:null}});
    });
    return {status:"submitted",scene:scene.number,generationId:next.generation.id};
  }catch(error){
    const message=error instanceof Error?error.message:"Generation error";
    const status=error instanceof Error&&"status" in error?Number((error as {status:number}).status):0;
    if(status===429){await db.movieScene.update({where:{id:scene.id},data:{nextAttemptAt:new Date(Date.now()+65000),lastError:"Rate limit"}});return {status:"rate_limited"};}
    if(status===402){await db.movieProject.update({where:{id},data:{status:"PAUSED_CREDITS",lastError:"Кредит хүрэлцэхгүй."}});return {status:"paused_credits"};}
    // Errors following an unknown upstream submission must NEVER lead to an automatic
    // new provider request. A persisted idempotency key is safe for manual reconciliation.
    await db.movieScene.update({where:{id:scene.id},data:{status:"NEEDS_REVIEW",lastError:message.slice(0,300)}});
    return {status:"needs_review",message:message.slice(0,160)};
  }
}

type QaResult={verdict:"pass"|"review"|"regenerate";reason:string;source:string;score?:number};
async function performQualityGate(approved:boolean,mediaUrl:string,prompt:string):Promise<QaResult>{
  if(!approved || process.env.MOVIE_AI_QA_ENABLED!=="true")
    return {verdict:"pass",reason:"Vision QA opt-in/config missing; completed video is not visually certified.",source:"provider_only"};
  const {analyzeVisualScene}=await import("@/lib/movie-visual-qa");
  return analyzeVisualScene(mediaUrl,prompt);
}

export async function pauseOwnMovie(userId:string,id:string){
  const changed=await db.movieProject.updateMany({where:{id,userId,status:{in:["QUEUED","RUNNING"]}},
    data:{status:"PAUSED_USER",leaseUntil:null,lastError:"Хэрэглэгч түр зогсоов. Нэгэнт provider руу явсан scene дуусч магадгүй."}});
  if(!changed.count)throw new MovieError("Зогсоож болох идэвхтэй төсөл олдсонгүй.",409);
  return getOwnMovie(userId,id);
}
export async function resumeOwnMovie(userId:string,id:string){
  const changed=await db.movieProject.updateMany({where:{id,userId,status:"PAUSED_USER"},
    data:{status:"QUEUED",leaseUntil:null,lastError:null}});
  if(!changed.count)throw new MovieError("Үргэлжлүүлж болох түр зогссон төсөл олдсонгүй.",409);
  return getOwnMovie(userId,id);
}