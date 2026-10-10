import { getModel, buildProviderInput, estimateCredits } from "./models.ts";

export class MoviePlanError extends Error {
  constructor(message: string) { super(message); this.name="MoviePlanError"; }
}
export type LongMoviePlanInput={
  prompt:string; targetSeconds:number; modelSlug:string;
  aspectRatio:string; resolution:string; generateAudio:boolean;
  qualityProfile?:"cinematic"|"balanced"|"fast";
  styleBible?:string;
};
export function createLongMoviePlan(input:LongMoviePlanInput) {
  if(typeof input.prompt!=="string" || input.prompt.trim().length<12 || input.prompt.length>6000)
    throw new MoviePlanError("Киноны санаа 12–6000 тэмдэгттэй байх ёстой.");
  if(!Number.isInteger(input.targetSeconds) || input.targetSeconds<4 || input.targetSeconds>3600)
    throw new MoviePlanError("Энэ хувилбарт 4–3600 секундийн кино төлөвлөнө.");
  const model=getModel(input.modelSlug);
  if(!model || !model.apiVerified || model.kind!=="video" || !model.maxDuration || !model.minDuration || model.supportsImage)
    throw new MoviePlanError("Зөвхөн API баталгаажсан text-to-video модель дэмжинэ.");
  if(model.resolutions.length && !model.resolutions.includes(input.resolution))
    throw new MoviePlanError("Сонгосон нягтаршил дэмжигдээгүй.");
  if(model.aspectRatios.length && !model.aspectRatios.includes(input.aspectRatio))
    throw new MoviePlanError("Сонгосон харьцаа дэмжигдээгүй.");
  if(input.generateAudio && !model.supportsAudio)
    throw new MoviePlanError("Энэ модель native audio дэмжихгүй.");
  const quality=input.qualityProfile || "cinematic";
  const preferredClip=quality==="cinematic"?8:quality==="balanced"?15:model.maxDuration;
  const minimumScenes=Math.ceil(input.targetSeconds/model.maxDuration);
  const desiredScenes=Math.ceil(input.targetSeconds/Math.min(preferredClip,model.maxDuration));
  const maximumFeasibleScenes=Math.floor(input.targetSeconds/model.minDuration);
  const parts=Math.max(minimumScenes,Math.min(desiredScenes,120,maximumFeasibleScenes));
  if(parts>120)
    throw new MoviePlanError("Энэ модель болон хугацаанд 120-оос олон кадр хэрэгтэй. Төслийг бүлгүүдэд хуваана уу.");
  const base=Math.floor(input.targetSeconds/parts);
  const extra=input.targetSeconds%parts;
  if(base<model.minDuration)
    throw new MoviePlanError("Хүссэн хугацааг тухайн моделийн клипийн хамгийн бага хугацаанд тааруулах боломжгүй.");
  const shotTypes=["Establishing wide shot","Medium tracking shot","Intimate close-up","Detailed insert","Over-the-shoulder","Dynamic low-angle","Character reaction","Slow dolly movement"];
  const beatFor=(position:number)=>position<0.12?"setup":position<0.26?"inciting":position<0.64?"escalation":position<0.79?"turning-point":position<0.93?"climax":"resolution";
  const bible=typeof input.styleBible==="string"&&input.styleBible.trim()
    ?input.styleBible.trim().slice(0,2000)
    : "Director must extract and freeze: character face, hair, outfit, ethnicity when provided, prop shapes, brand logo, location, lighting, lens, color grade and time of day from user input. Never invent a user-provided face reference.";
  let time=0,totalCredits=0;
  const scenes=Array.from({length:parts},(_,i)=>{
    const duration=base+(i<extra?1:0);
    const beat=beatFor((i+0.5)/parts);
    const shotType=shotTypes[i%shotTypes.length];
    // A fallback prompt stays scene-specific if a client cannot run an LLM.
    // A creative assistant should still write an original scene-by-scene shot script.
    const scenePrompt=[
      input.prompt.trim(),
      `Film shot ${i+1}/${parts}; narrative beat: ${beat}; shot: ${shotType}.`,
      `Continuity reference: ${bible}.`,
      `Show one distinct moment moving the story forward. Compose an intentional beginning and end that cut cleanly into adjacent shots; vary action, staging, camera and lighting while preserving required identity.`,
      `Avoid reusing the previous shot action. Keep on-screen text and logos exactly as reference only where explicitly provided.`
    ].join(" ").slice(0,5800);
    const inputPayload={prompt:scenePrompt,duration,resolution:input.resolution,
      aspectRatio:input.aspectRatio,generateAudio:input.generateAudio};
    const provider=buildProviderInput(model,inputPayload);
    const credits=estimateCredits(model,duration,provider);
    if(!Number.isSafeInteger(credits) || credits<=0)
      throw new MoviePlanError("Энэ кадрын үнэ баталгаажаагүй байна.");
    totalCredits+=credits;
    if(!Number.isSafeInteger(totalCredits)) throw new MoviePlanError("Нийт кредит буруу байна.");
    const scene={
      number:i+1,startSeconds:time,endSeconds:time+duration,duration,
      beat,
      shotType,
      transition:i===0?"fade-in":i===parts-1?"ending":i%5===0?"motivated-cut":"match-action",
      modelSlug:model.slug,templateInput:inputPayload,
      instructions:"AI Director: build an independent original cinematic scene prompt. Preserve the style bible, identity and physical continuity. Use different camera blocking, composition, visual rhythm and action per shot; do not repeat the base prompt verbatim. Read narrative beat and shot type. A text-only reference cannot guarantee face identity.",
      credits,
    };
    time+=duration;
    return scene;
  });
  return {
    project:"RAINY One-Prompt Movie",
    requestedSeconds:input.targetSeconds,
    plannedSeconds:time,
    scenes,
    sceneCount:parts,
    qualityProfile:quality,
    continuityBible:bible,
    productionQualityGates:[
      "Timeline timing, video codec, frame rate, resolution and aspect ratio match delivery profile",
      "Visual references and identity consistency are manually reviewable; AI semantic QA is fallible",
      "No black frames, frozen shots, broken files or silent audio unless deliberately scripted",
      "Use short scene-specific prompts and verify camera direction, pacing and narrative continuity",
      "Check Mongolian voice and subtitle alignment before calling the final MP4 ready"
    ],
    totalVideoCredits:totalCredits,
    voiceCreditsIncluded:false,
    assemblyCreditsIncluded:false,
    confirmedPrice:false,
    readyToGenerate:false,
    status:"PLANNED",
    requires:"ChatGPT эсвэл Claude кадр тус бүрийн зохиол, prompt-ыг эхний санаанаас боловсруулж, хэрэглэгчийн нийт төсвийн зөвшөөрлийн дараа л үүсгэнэ.",
    limitations:["Seedance/Kling нэг клипийн API хугацааны хязгаартай.",
      "Олон scene-ийн дараалал, дүрийн нэгэн төрлийн байдлыг AI Director сайжруулах боловч 100% баталгаагүй.",
      "Энэ нь зөвхөн үнэ, кадрын төлөвлөгөө; backend multi-scene queue болон final MP4 одоогоор нэг товчоор автоматаар ажиллахгүй."],
  };
}
