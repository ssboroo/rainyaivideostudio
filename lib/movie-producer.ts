import { createHash } from "node:crypto";
import { db } from "./db.ts";
import { createLongMoviePlan } from "./long-movie-plan.ts";
import { createUserGeneration, getUserGeneration } from "./generation-service.ts";

export type MovieScene={number:number;duration:number;credits:number;modelSlug:string;
 input:Record<string,unknown>;generationId?:string;state:"queued"|"submitted"|"completed"|"failed";mediaUrl?:string;error?:string};
type Payload={prompt:string;sceneCount:number;targetSeconds:number;aspectRatio:string;qualityProfile:string;
 scenes:MovieScene[];videoCreditsQuoted:number;spentCredits:number;reference:string};
type MovieRow={id:string;user_id:string;status:string;payload:Payload;updated_at:Date};
const enabled=()=>process.env.RAVS_MOVIE_PRODUCER_ENABLED==="true";
export function movieEnabled(){return enabled()}
export async function ensureMovieTables(){
 if(!enabled())return;
 await db.$executeRawUnsafe('CREATE TABLE IF NOT EXISTS rainy_movie_jobs (id TEXT PRIMARY KEY,user_id TEXT NOT NULL REFERENCES "User"(id) ON DELETE CASCADE,status TEXT NOT NULL DEFAULT \'queued\',payload JSONB NOT NULL,created_at TIMESTAMPTZ NOT NULL DEFAULT now(),updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),lease_until TIMESTAMPTZ)');
 await db.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS rainy_movie_jobs_user_idx ON rainy_movie_jobs(user_id,created_at DESC)');
 await db.$executeRawUnsafe('CREATE INDEX IF NOT EXISTS rainy_movie_jobs_queue_idx ON rainy_movie_jobs(status,lease_until,updated_at)');
}
function view(row:MovieRow){
 const p=row.payload;
 return {id:row.id,status:row.status,targetSeconds:p.targetSeconds,sceneCount:p.sceneCount,
  completedScenes:p.scenes.filter(s=>s.state==="completed").length,
  spentVideoCredits:p.spentCredits,approvedVideoCredits:p.videoCreditsQuoted,
  scenes:p.scenes.map(s=>({number:s.number,state:s.state,duration:s.duration,credits:s.credits,
  generationId:s.generationId,mediaUrl:s.state==="completed"?s.mediaUrl:undefined,error:s.error})),
  backgroundWorker:true,finalMp4Ready:false,
  exportReady:row.status==="completed"&&p.scenes.every(s=>s.state==="completed"&&s.mediaUrl),
  lastUpdated:row.updated_at,
  note:"Scene generation нь сервер дээр үргэлжилнэ. MP4 export, Монгол дуу нь тусдаа Voice MCP дээр зөвшөөрөгдсөн CDN шаардлагатай."};
}
async function getRow(userId:string,id:string){
 const rows=await db.$queryRawUnsafe<MovieRow[]>('SELECT id,user_id,status,payload,updated_at FROM rainy_movie_jobs WHERE id=$1 AND user_id=$2',id,userId);
 if(!rows.length)throw new Error("Таны кино олдсонгүй.");
 return rows[0];
}
export async function movieStatus(userId:string,id:string){
 if(!enabled())throw new Error("Movie Producer идэвхгүй.");
 if(!/^[a-f0-9]{40}$/.test(id))throw new Error("Movie ID буруу.");
 await ensureMovieTables();return view(await getRow(userId,id));
}
export async function createMovie(userId:string,args:{prompt:string;targetSeconds:number;modelSlug:string;aspectRatio:string;resolution:string;generateAudio:boolean;qualityProfile:"cinematic"|"balanced"|"fast";styleBible?:string;maxVideoCredits:number;confirmGeneration:true;idempotencyKey:string}){
 if(!enabled())throw new Error("Movie Producer идэвхгүй.");
 if(args.confirmGeneration!==true||!/^[A-Za-z0-9_-]{16,128}$/.test(args.idempotencyKey))
  throw new Error("Кредитийн зөвшөөрөл, idempotencyKey шаардлагатай.");
 if(!Number.isSafeInteger(args.maxVideoCredits)||args.maxVideoCredits<1)throw new Error("Видео кредитийн лимит буруу.");
 const plan=createLongMoviePlan(args);
 if(plan.totalVideoCredits>args.maxVideoCredits)throw new Error("Нийт видео кредитийн зөвшөөрсөн хэмжээнээс хэтэрсэн.");
 await ensureMovieTables();
 const id=createHash("sha256").update(userId+"\0"+args.idempotencyKey).digest("hex").slice(0,40);
 const payload:Payload={prompt:args.prompt,sceneCount:plan.sceneCount,targetSeconds:plan.targetSeconds,
  aspectRatio:args.aspectRatio,qualityProfile:args.qualityProfile,videoCreditsQuoted:plan.totalVideoCredits,
  spentCredits:0,reference:createHash("sha256").update(JSON.stringify([args.prompt,args.targetSeconds,args.modelSlug,args.aspectRatio,args.resolution,args.generateAudio,args.qualityProfile,args.styleBible])).digest("hex"),
  scenes:plan.scenes.map(s=>({number:s.number,duration:s.duration,credits:s.credits,modelSlug:s.modelSlug,
    input:s.templateInput,state:"queued"}))};
 const existing=await db.$queryRawUnsafe<MovieRow[]>('SELECT id,user_id,status,payload,updated_at FROM rainy_movie_jobs WHERE id=$1 AND user_id=$2',id,userId);
 if(existing.length){
  if(existing[0].payload.reference!==payload.reference)throw new Error("Ижил idempotencyKey өөр киноны хүсэлтэд ашигласан.");
  return view(existing[0]);
 }
 // No debit at creation. Each scene is charged by the existing RAVS generation service.
 await db.$executeRawUnsafe('INSERT INTO rainy_movie_jobs(id,user_id,status,payload) VALUES($1,$2,\'queued\',$3::jsonb) ON CONFLICT(id) DO NOTHING',id,userId,JSON.stringify(payload));
 return view(await getRow(userId,id));
}
export async function cancelMovie(userId:string,id:string){
 if(!enabled())throw new Error("Movie Producer идэвхгүй.");
 if(!/^[a-f0-9]{40}$/.test(id))throw new Error("Movie ID буруу.");
 await ensureMovieTables();
 await db.$executeRawUnsafe("UPDATE rainy_movie_jobs SET status='canceled',updated_at=now() WHERE id=$1 AND user_id=$2 AND status IN ('queued','blocked')",id,userId);
 return movieStatus(userId,id);
}
async function persist(row:MovieRow,status:string){
 await db.$executeRawUnsafe("UPDATE rainy_movie_jobs SET payload=$1::jsonb,status=$2,updated_at=now(),lease_until=NULL WHERE id=$3 AND status='running'",JSON.stringify(row.payload),status,row.id);
}
export async function tickMovieJobs(){
 if(!enabled())return false;
 await ensureMovieTables();
 const claim=await db.$queryRawUnsafe<MovieRow[]>("UPDATE rainy_movie_jobs j SET status='running',lease_until=now()+interval '4 minutes',updated_at=now() WHERE j.id=(SELECT id FROM rainy_movie_jobs WHERE status='queued' OR (status='running' AND lease_until<now()) ORDER BY updated_at ASC FOR UPDATE SKIP LOCKED LIMIT 1) RETURNING id,user_id,status,payload,updated_at");
 const row=claim[0];if(!row)return false;
 const p=row.payload;
 try{
  const scene=p.scenes.find(s=>s.state!=="completed");
  if(!scene){await persist(row,"completed");return true;}
  if(scene.state==="failed"){await persist(row,"blocked");return true;}
  const key="rainy-movie-"+row.id+"-scene-"+scene.number;
  if(!scene.generationId){
    try{
      const reply=await createUserGeneration(row.user_id,{...scene.input,modelSlug:scene.modelSlug},{idempotencyKey:key,maxCredits:scene.credits});
      scene.generationId=(reply as {generation:{id:string}}).generation.id;
      scene.state="submitted";p.spentCredits+=scene.credits;
    }catch{
      // Recover the SAME idempotent generation, never issue a second paid provider request.
      const external=createHash("sha256").update(JSON.stringify([row.user_id,key])).digest("hex");
      const g=await db.generation.findFirst({where:{userId:row.user_id,externalRequestKey:external}});
      if(g){scene.generationId=g.id;scene.state="submitted";p.spentCredits+=g.costCredits;}
      else{scene.state="failed";scene.error="Үүсгэлт тодорхойгүй эсвэл кредит хүрэлцээгүй. Админ шалгана.";}
    }
  }else{
    const reply=await getUserGeneration(row.user_id,scene.generationId) as {generation:{status:string;media?:{url:string;type:string}|null}};
    const g=reply.generation;
    if(g.status==="COMPLETED"){
      if(g.media?.type==="video"&&g.media.url.startsWith("https://")){
        scene.state="completed";scene.mediaUrl=g.media.url;
      }else{scene.state="failed";scene.error="Provider видео холбоос буцаасангүй.";}
    }else if(["FAILED","NSFW","CANCELED"].includes(g.status)){
      scene.state="failed";scene.error="Provider хүсэлт амжилтгүй. Зардал ба буцаалтыг шалга.";
    }
  }
  await persist(row,scene.state==="failed"?"blocked":"queued");
 }catch{
  const scene=p.scenes.find(s=>s.state!=="completed");
  if(scene)scene.error="Ажил зогссон. Давхар үүсгэхгүйгээр төлөвийг нягтлана.";
  await persist(row,"blocked");
 }
 return true;
}
