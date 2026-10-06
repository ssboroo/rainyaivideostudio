import { hfModelSpecs, type HfParameter } from "./hf-model-specs.ts";
export type ModelKind = "video" | "image" | "workflow";

export type RavsModel = {
  slug: string;
  name: string;
  provider: string;
  maker?: string;
  modelId: string;
  kind: ModelKind;
  group: string;
  badge: string;
  description: string;
  pricingType: "second" | "flat";
  creditRate: number;
  minDuration?: number;
  maxDuration?: number;
  resolutions: string[];
  aspectRatios: string[];
  supportsAudio?: boolean;
  supportsImage?: boolean;
  supportsVideo?: boolean;
  supportsMultipleReferences?: boolean;
  maxReferences?: number;
  requiresPrompt?: boolean;
  capabilities?: string[];
  featured?: boolean;
  apiVerified?: boolean;
  apiReason?: string;
  apiSource?: string;
  parameters?: HfParameter[];
  durationOptions?: number[];
  tone?: string;
};

const existingModels: RavsModel[] = [
  {
    slug: "seedance-2-5", name: "Seedance 2.5", provider: "Higgsfield API", maker: "ByteDance",
    modelId: "bytedance/seedance-2.5/text-to-video", kind: "video", group: "Видео", badge: "SOTA",
    description: "Тайлбараас 4–30 секундийн видео бүтээж, дуу нэмнэ.", pricingType: "second", creditRate: 42,
    minDuration: 4, maxDuration: 30, resolutions: ["480p","720p","1080p"], aspectRatios: ["16:9","4:3","1:1","3:4","9:16","21:9"],
    supportsAudio: true, capabilities: ["30 sec","1080p","Audio"], featured: true, tone: "violet",
  },
  {
    slug: "seedance-2-5-image", name: "Seedance 2.5 Image → Video", provider: "Higgsfield API", maker: "ByteDance",
    modelId: "bytedance/seedance-2.5/image-to-video", kind: "video", group: "Видео", badge: "IMAGE → VIDEO",
    description: "Жишиг зургийг хөдөлгөөн, дуутай видео болгоно.", pricingType: "second", creditRate: 42,
    minDuration: 4, maxDuration: 30, resolutions: ["480p","720p","1080p"], aspectRatios: ["16:9","4:3","1:1","3:4","9:16","21:9"],
    supportsAudio: true, supportsImage: true, capabilities: ["Image ref","1080p","Audio"], tone: "violet",
  },
  {
    slug: "seedance-reference", name: "Seedance 2.5 Reference", provider: "Higgsfield API", maker: "ByteDance",
    modelId: "bytedance/seedance-2.5/reference-to-video", kind: "video", group: "Видео", badge: "REFERENCE",
    description: "Зураг, видео, дууны жишиг материалаар шинэ видео бүтээнэ.", pricingType: "second", creditRate: 51,
    minDuration: 4, maxDuration: 30, resolutions: ["480p","720p","1080p"], aspectRatios: ["16:9","4:3","1:1","3:4","9:16","21:9"],
    supportsAudio: true, supportsImage: true, supportsVideo: true, supportsMultipleReferences: true, maxReferences: 8,
    capabilities: ["Multi ref","30 sec","Audio"], tone: "violet",
  },
  {
    slug: "kling-3-standard", name: "Kling 3.0 Standard", provider: "Higgsfield API", maker: "Kling",
    modelId: "kling-video/v3.0/std/text-to-video", kind: "video", group: "Видео", badge: "MULTI-SHOT",
    description: "Олон кадртай кино дүрслэл, дуутай видео бүтээнэ.", pricingType: "second", creditRate: 36,
    minDuration: 3, maxDuration: 15, resolutions: ["720p"], aspectRatios: ["16:9","9:16","1:1"],
    supportsAudio: true, capabilities: ["Multi-shot","Native audio","15 sec"], featured: true, tone: "blue",
  },
  {
    slug: "kling-3-turbo", name: "Kling 3.0 Turbo", provider: "Higgsfield API", maker: "Kling",
    modelId: "kling-video/v3.0-turbo/text-to-video", kind: "video", group: "Видео", badge: "FAST",
    description: "Тайлбараас 720p, 1080p видео хурдан бүтээнэ.", pricingType: "second", creditRate: 24,
    minDuration: 3, maxDuration: 15, resolutions: ["720p","1080p"], aspectRatios: ["16:9","9:16","1:1"],
    capabilities: ["Fast","1080p","15 sec"], tone: "blue",
  },
  {
    slug: "kling-3-image", name: "Kling 3.0 Image → Video", provider: "Higgsfield API", maker: "Kling",
    modelId: "kling-video/v3.0/pro/image-to-video", kind: "video", group: "Видео", badge: "PRO",
    description: "Жишиг зургийг хөдөлгөөнтэй болгож, камерын дүрслэлийг удирдана.", pricingType: "second", creditRate: 42,
    minDuration: 3, maxDuration: 15, resolutions: ["720p"], aspectRatios: ["16:9","9:16","1:1"],
    supportsAudio: true, supportsImage: true, capabilities: ["Image ref","Audio","Pro"], tone: "blue",
  },
  {
    slug: "wan-3-prime", name: "Wan 3.0 Prime", provider: "Higgsfield API", maker: "Alibaba",
    modelId: "alibaba/wan-3.0-prime/text-to-video", kind: "video", group: "Видео", badge: "VALUE",
    description: "Тайлбараас 2–30 секундийн видео бүтээнэ.", pricingType: "second", creditRate: 27,
    minDuration: 2, maxDuration: 30, resolutions: ["720p","1080p"], aspectRatios: ["16:9","9:16","1:1"],
    capabilities: ["30 sec","1080p","Value"], featured: true, tone: "amber",
  },
  {
    slug: "wan-3-prime-image", name: "Wan 3.0 Prime Image → Video", provider: "Higgsfield API", maker: "Alibaba",
    modelId: "alibaba/wan-3.0-prime/image-to-video", kind: "video", group: "Видео", badge: "IMAGE → VIDEO",
    description: "Эхний зургаас үргэлжилсэн видео бүтээнэ.", pricingType: "second", creditRate: 30,
    minDuration: 2, maxDuration: 30, resolutions: ["720p","1080p"], aspectRatios: ["adaptive","16:9","9:16","1:1"],
    supportsAudio: true, supportsImage: true, capabilities: ["Image ref","30 sec","1080p"], tone: "amber",
  },
  {
    slug: "cinema-studio-4", name: "Cinema Studio 4.0", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfield/cinema-studio/4.0", kind: "workflow", group: "Cinema", badge: "CINEMA",
    description: "Дүр, камер, орчныг төлөвлөж киноны хэсэг бүтээнэ.", pricingType: "second", creditRate: 84,
    minDuration: 4, maxDuration: 30, resolutions: ["480p","720p"], aspectRatios: ["16:9","9:16","1:1"],
    supportsAudio: true, supportsMultipleReferences: true, maxReferences: 30,
    capabilities: ["30 sec","30 API refs","Scene direction"], featured: true, tone: "amber",
  },
  {
    slug: "kling-motion", name: "Kling 3 Motion Control", provider: "Higgsfield API", maker: "Kling",
    modelId: "kling-video/v3/motion-control/std", kind: "workflow", group: "Motion", badge: "MOTION",
    description: "Жишиг видеоны хөдөлгөөнийг зурган дээрх дүрд шилжүүлнэ.", pricingType: "flat", creditRate: 660,
    resolutions: ["720p"], aspectRatios: ["auto"], supportsImage: true, supportsVideo: true, requiresPrompt: false,
    capabilities: ["Motion ref","Character","Audio keep"], tone: "cyan",
  },
  {
    slug: "genjutsu-motion", name: "Genjutsu Motion Transfer", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfiled/genjutsu/motion-transfer/v1.0", kind: "workflow", group: "Genjutsu", badge: "EXCLUSIVE",
    description: "Хөдөлгөөн, камерын хэмнэлийг хадгалж дүрслэлийг өөрчилнө.", pricingType: "flat", creditRate: 840,
    resolutions: ["480p","720p"], aspectRatios: ["auto"], supportsImage: true, supportsVideo: true, supportsMultipleReferences: true,
    maxReferences: 8, requiresPrompt: false, capabilities: ["Motion","8 refs","Transform"], featured: true, tone: "rose",
  },
  {
    slug: "genjutsu-object", name: "Genjutsu Object Swap", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfiled/genjutsu/object-swap/v1.0", kind: "workflow", group: "Genjutsu", badge: "OBJECT SWAP",
    description: "Видеоны дүр, хувцас, бүтээгдэхүүн зэрэг объектыг солино.", pricingType: "flat", creditRate: 840,
    resolutions: ["480p","720p"], aspectRatios: ["auto"], supportsImage: true, supportsVideo: true, supportsMultipleReferences: true,
    maxReferences: 8, requiresPrompt: false, capabilities: ["Swap","Video ref","Image refs"], tone: "rose",
  },
  {
    slug: "genjutsu-restyle", name: "Genjutsu Restyle", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfield/genjutsu/restyle/v1.0", kind: "workflow", group: "Genjutsu", badge: "RESTYLE",
    description: "Хөдөлгөөн, хэмнэлийг хадгалж видеоны хэв маягийг өөрчилнө.", pricingType: "flat", creditRate: 720,
    resolutions: ["720p"], aspectRatios: ["auto"], supportsImage: true, supportsVideo: true, supportsMultipleReferences: true,
    maxReferences: 5, requiresPrompt: false, capabilities: ["Style preset","Motion keep","Audio keep"], tone: "rose",
  },
  {
    slug: "seedance-edit", name: "Seedance 2.5 Video Edit", provider: "Higgsfield API", maker: "ByteDance",
    modelId: "bytedance/seedance-2.5/video-edit", kind: "workflow", group: "Видео засвар", badge: "EDIT",
    description: "Тайлбараар видеоны орчин, дүрслэл, нарийн хэсгийг өөрчилнө.", pricingType: "second", creditRate: 54,
    minDuration: 4, maxDuration: 30, resolutions: ["480p","720p","1080p"], aspectRatios: ["16:9","9:16","1:1"],
    supportsAudio: true, supportsVideo: true, capabilities: ["Video edit","Audio","1080p"], tone: "indigo",
  },
  {
    slug: "marketing-studio", name: "Marketing Studio Image", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "marketing-studio/image", kind: "image", group: "Ads", badge: "COMMERCE",
    description: "Бүтээгдэхүүний зураг, сурталчилгаа, дэлгүүрийн контент бүтээнэ.", pricingType: "flat", creditRate: 72,
    resolutions: ["1k","2k","4k"], aspectRatios: ["auto","1:1","3:2","2:3","4:3","3:4","16:9","9:16","21:9"],
    supportsImage: true, supportsMultipleReferences: true, maxReferences: 16,
    capabilities: ["16 refs","1K–4K","Presets"], featured: true, tone: "lime",
  },
  {
    slug: "ai-influencer", name: "AI Influencer", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfield/ai-influencer", kind: "image", group: "Influencer", badge: "NEW",
    description: "Нэг дүрийн олон өнцөг, төрх бүхий жишиг зураг бүтээнэ.", pricingType: "flat", creditRate: 75,
    resolutions: ["default"], aspectRatios: ["auto"], supportsImage: true, supportsMultipleReferences: true, maxReferences: 8,
    requiresPrompt: false, capabilities: ["Character sheet","Face ref","Items"], featured: true, tone: "cyan",
  },
  {
    slug: "soul-2", name: "Soul 2", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfield-ai/soul/v2/standard", kind: "image", group: "Зураг", badge: "PORTRAIT",
    description: "Бодит мэт хөрөг, амьдралын хэв маяг, загварын зураг бүтээнэ.", pricingType: "flat", creditRate: 24,
    resolutions: ["720p","1080p"], aspectRatios: ["9:16","16:9","4:3","3:4","1:1","2:3","3:2"],
    capabilities: ["Portrait","Fashion","1080p"], featured: true, tone: "indigo",
  },
  {
    slug: "soul-2-image", name: "Soul 2 Image → Image", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfield-ai/soul/v2/image-to-image", kind: "image", group: "Зураг", badge: "REFERENCE",
    description: "Жишиг зургаас хөрөг, амьдралын хэв маягийн шинэ зураг бүтээнэ.", pricingType: "flat", creditRate: 27,
    resolutions: ["720p","1080p"], aspectRatios: ["9:16","16:9","4:3","3:4","1:1","2:3","3:2"],
    supportsImage: true, capabilities: ["Image ref","Portrait","1080p"], tone: "indigo",
  },
  {
    slug: "ideogram-4", name: "Ideogram 4.0", provider: "Higgsfield API", maker: "Ideogram",
    modelId: "ideogram/v4.0", kind: "image", group: "Зураг", badge: "TEXT / POSTER",
    description: "Бичвэртэй постер, сав баглаа боодол, график дизайн бүтээнэ.", pricingType: "flat", creditRate: 42,
    resolutions: ["default"], aspectRatios: ["1:1","16:9","9:16","4:3","3:4"], supportsImage: true,
    capabilities: ["Typography","Poster","Image edit"], tone: "blue",
  },
  {
    slug: "recraft-4-1", name: "Recraft 4.1", provider: "Higgsfield API", maker: "Recraft",
    modelId: "recraft/v4.1/text-to-image", kind: "image", group: "Зураг", badge: "BRAND",
    description: "Брэндийн өнгөтэй график, дүрслэл, дизайны материал бүтээнэ.", pricingType: "flat", creditRate: 54,
    resolutions: ["1k"], aspectRatios: ["1:1","2:1","1:2","3:2","2:3","4:3","3:4","5:4","4:5","16:9","9:16"],
    capabilities: ["Palette","Brand","PNG/WebP"], featured: true, tone: "violet",
  },
  {
    slug: "qwen-image-3", name: "Qwen Image 3", provider: "Higgsfield API", maker: "Alibaba",
    modelId: "alibaba/qwen-image-3/text-to-image", kind: "image", group: "Зураг", badge: "2K",
    description: "Тайлбарыг баяжуулж өндөр чанартай зураг бүтээнэ.", pricingType: "flat", creditRate: 60,
    resolutions: ["1k","2k"], aspectRatios: ["1:1","2:3","3:2","3:4","4:3","7:9","9:7","9:16","16:9","21:9"],
    capabilities: ["2K","Prompt enhance","Seed"], tone: "amber",
  },
  {
    slug: "qwen-image-3-edit", name: "Qwen Image 3 Edit", provider: "Higgsfield API", maker: "Alibaba",
    modelId: "alibaba/qwen-image-3/edit", kind: "image", group: "Зураг", badge: "EDIT",
    description: "Заавар болон 1–3 жишиг зургаар зураг засварлана.", pricingType: "flat", creditRate: 60,
    resolutions: ["1k","2k"], aspectRatios: ["1:1","2:3","3:2","3:4","4:3","7:9","9:7","9:16","16:9","21:9"],
    supportsImage: true, supportsMultipleReferences: true, maxReferences: 3,
    capabilities: ["1–3 refs","2K","Edit"], tone: "amber",
  },
  {
    slug: "grok-image-2", name: "Grok Imagine 2.0", provider: "Higgsfield API", maker: "xAI",
    modelId: "xai/grok-imagine-image-2.0", kind: "image", group: "Зураг", badge: "PRECISE EDIT",
    description: "Нарийн хэсгийг хадгалж зураг үүсгэх, засварлах хэрэгсэл.", pricingType: "flat", creditRate: 60,
    resolutions: ["1k","2k"], aspectRatios: ["auto","1:1","16:9","9:16","4:3","3:4"], supportsImage: true,
    capabilities: ["2K","Precise edit","Consistency"], tone: "cyan",
  },
];

function enrichModel(model:RavsModel):RavsModel {
 const spec=hfModelSpecs.find(s=>s.id===model.modelId);
 const fields=spec?.parameters||[];
 const field=(name:string)=>fields.find(f=>f.name===name);
 const duration=field("duration");
 const maxReferences=model.modelId.startsWith("marketing-studio/")?16:model.slug==="genjutsu-restyle"?5:model.slug==="qwen-image-3-edit"?3:model.maxReferences||8;
 const ordered=(f:HfParameter|undefined,fallback:string[])=>f?.options?[(String(f.default)),...f.options].filter((x,i,a)=>f.options!.includes(x)&&a.indexOf(x)===i):typeof f?.default==="string"?[f.default]:fallback;
 return {...model,maxReferences,apiVerified:!!spec?.verified,badge:spec?.verified?model.badge:"API ШАЛГАЖ БАЙНА",apiReason:spec?.verified?"":"Энэ хувилбарын API баримт эсвэл холболтын шаардлага бүрэн баталгаажаагүй. Параметртэй өөр хувилбар сонгоно уу.",apiSource:spec?.source,parameters:fields,
  resolutions:ordered(field("resolution"),["auto"]),aspectRatios:ordered(field("aspect_ratio"),["auto"]),
  minDuration:duration?(duration.minimum||Math.min(...(duration.options?.map(Number)||[Number(duration.default)||5]))):undefined,
  maxDuration:duration?(duration.maximum||Math.max(...(duration.options?.map(Number)||[Number(duration.default)||5]))):undefined,
  durationOptions:duration?.options?.map(Number),
  supportsImage:fields.some(f=>["image_url","image_urls","first_frame_url","start_image_url"].includes(f.name)),
  supportsVideo:fields.some(f=>["video_url","video_urls"].includes(f.name)),
  supportsMultipleReferences:fields.some(f=>["image_urls","video_urls","reference_urls"].includes(f.name)),
  supportsAudio:fields.some(f=>["generate_audio","sound","keep_original_sound"].includes(f.name)),
  requiresPrompt:field("prompt")?.required||false};
}
// Keep stable website slugs; canonical endpoint IDs come from model-specific docs.
export const models:RavsModel[]=[...existingModels.map(m=>({...m,modelId:m.slug==="genjutsu-motion"?"higgsfield/genjutsu/motion-transfer/v1.0":m.modelId})),
 ...hfModelSpecs.filter(s=>s.id!=="higgsfield/genjutsu/object-swap/v1.0"&&!existingModels.some(m=>(m.slug==="genjutsu-motion"?"higgsfield/genjutsu/motion-transfer/v1.0":m.modelId)===s.id)).map((s):RavsModel=>{
 const image=/text-to-image|image-to-image|soul|qwen|z-image|ideogram|recraft|grok-imagine-image|marketing-studio|ai-influencer/.test(s.id);
 return {slug:s.id.replace(/[^a-z0-9]+/gi,"-"),name:(s.id==="marketing-studio/image/flare"?"Marketing Studio 2.5 Flare":s.id==="marketing-studio/image/sunburst"?"Marketing Studio 2.5 Sunburst":s.name)+(/text-to-video/.test(s.id)&&!/text to video/i.test(s.name)?" · Текст → Видео":""),provider:"Higgsfield API",maker:({bytedance:"ByteDance",alibaba:"Alibaba",wan:"Alibaba",minimax:"MiniMax","kling-video":"Kling",lightricks:"Lightricks",higgsfield:"Higgsfield","higgsfield-ai":"Higgsfield","marketing-studio":"Higgsfield",xai:"xAI",ideogram:"Ideogram",recraft:"Recraft","z-image":"Z-Image"} as Record<string,string>)[s.id.split('/')[0]]||s.id.split('/')[0],modelId:s.id,kind:image?"image":/motion-control|motion-transfer|video-edit|video-extend|restyle|object-swap/.test(s.id)?"workflow":"video",group:image?"Зураг":/motion-control/.test(s.id)?"Motion":/video-edit|video-extend/.test(s.id)?"Видео засвар":"Видео",badge:s.verified?"API":"БАТАЛГААЖУУЛАХ",description:image?"Тайлбар, жишиг материалаар зураг бүтээх загвар.":"Тайлбар, жишиг материалаар видео бүтээх загвар.",pricingType:image?"flat":"second",creditRate:image?120:720,resolutions:["auto"],aspectRatios:["auto"],maxReferences:8};
 })].map(enrichModel);

export const getModel = (slug: string) => models.find((model) => model.slug === slug);

export function estimateCredits(model: RavsModel, duration?: number) {
  if (model.pricingType === "flat") return model.creditRate;
  const safeDuration = Math.max(
    model.minDuration || 1,
    Math.min(duration || model.minDuration || 5, model.maxDuration || 30),
  );
  return Math.max(model.creditRate, Math.ceil(model.creditRate * safeDuration));
}

function url(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function urls(value: unknown, max: number) {
  return Array.isArray(value)
    ? value.map(url).filter((item): item is string => Boolean(item)).slice(0, max)
    : [];
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function validateParameter(field:HfParameter,value:unknown):unknown {
 if(value===undefined||value===null||value===""){
  if(field.required)throw new Error(`${field.name}: шаардлагатай мэдээллийг оруулна уу.`);
  if(value===null&&field.default!==null&&!field.type.includes("null"))throw new Error(`${field.name}: null утга зөвшөөрөгдөхгүй.`);
  return value===null?null:undefined;
 }
 if(field.type.includes("array")){
  if(!Array.isArray(value)||value.length>50)throw new Error(`${field.name}: жагсаалт буруу байна.`);
  if(field.required&&!value.length)throw new Error(`${field.name}: жишиг материал шаардлагатай.`);
  if(field.type.includes("string")||field.type.includes("URL")){
   if(!value.every(v=>typeof v==="string"))throw new Error(`${field.name}: утга буруу байна.`);
   if(/urls/.test(field.name)&&!value.every(v=>url(v)))throw new Error(`${field.name}: зөв URL оруулна уу.`);
  }
 }else if(/integer|number/.test(field.type)){
  if(typeof value!=="number"||!Number.isFinite(value)||field.type.includes("integer")&&!Number.isInteger(value))throw new Error(`${field.name}: тоон утга буруу байна.`);
  if(field.minimum!==undefined&&value<field.minimum||field.maximum!==undefined&&value>field.maximum)throw new Error(`${field.name}: зөвшөөрсөн хязгаарт оруулна уу.`);
 }else if(field.type.includes("boolean")){
  if(typeof value!=="boolean")throw new Error(`${field.name}: сонголт буруу байна.`);
 }else if(field.type.includes("string")){
  if(typeof value!=="string")throw new Error(`${field.name}: текст оруулна уу.`);
  if(field.minLength!==undefined&&value.length<field.minLength||value.length>(field.maxLength||10000))throw new Error(`${field.name}: текстийн уртыг шалгана уу.`);
  if(field.type.includes("UUID")&&!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value))throw new Error(`${field.name}: зөв ID сонгоно уу.`);
  if(/_url$/.test(field.name)&&!url(value))throw new Error(`${field.name}: зөв URL оруулна уу.`);
 }else if(field.type.includes("object")&&(!value||typeof value!=="object"||Array.isArray(value)))throw new Error(`${field.name}: мэдээллийн бүтэц буруу байна.`);
 if(field.options&&!field.options.includes(String(value)))throw new Error(`${field.name}: зөвшөөрөөгүй сонголт байна.`);
 return value;
}
export function buildProviderInput(model:RavsModel,raw:Record<string,unknown>){
 if(!model.apiVerified)throw new Error(model.apiReason||"Энэ загварын API холболтыг баталгаажуулж байна.");
 const extra=objectValue(raw.modelOptions);
 if(Array.isArray(raw.referenceUrls)&&raw.referenceUrls.length+(raw.imageUrl?1:0)>(model.maxReferences||8))throw new Error("Жишиг материалын тоо хэтэрсэн байна.");
 const image=url(raw.imageUrl),video=url(raw.videoUrl),refs=urls(raw.referenceUrls,model.maxReferences||8);
 const candidates:Record<string,unknown>={
  prompt:typeof raw.prompt==="string"?raw.prompt.trim():undefined,
  duration:raw.duration===undefined?undefined:Number(raw.duration),resolution:raw.resolution,aspect_ratio:raw.aspectRatio,
  image_url:image,video_url:video,image_urls:[image,...refs].filter(Boolean),video_urls:video?[video]:[],reference_urls:[image,video,...refs].filter(Boolean),
  first_frame_url:image,start_image_url:image,
  generate_audio:raw.generateAudio,sound:raw.generateAudio===undefined?undefined:raw.generateAudio?"on":"off",keep_original_sound:raw.generateAudio===undefined?undefined:raw.generateAudio?"yes":"no",
  preset_id:raw.presetId||undefined,
 };
 const input:Record<string,unknown>={};
 for(const field of model.parameters||[]){
  let value=Object.hasOwn(candidates,field.name)?candidates[field.name]:extra[field.name];
  if(value===undefined||value===""&&!field.required)value=field.default;
  value=validateParameter(field,value);if(value!==undefined)input[field.name]=value;
 }
 if(model.modelId.startsWith("marketing-studio/image")&&input.enhance_prompt&&(!input.preset_id||!(input.image_urls as unknown[])?.length))throw new Error("Зарын хэв маяг болон бүтээгдэхүүний зураг сонгоно уу.");
 if(model.slug==="qwen-image-3"||model.slug==="qwen-image-3-edit")if(input.enable_thinking===true&&input.prompt_extend===false)throw new Error("Сэтгэх горимд тайлбар сайжруулалтыг идэвхжүүлнэ үү.");
 if(["genjutsu-motion","genjutsu-object"].includes(model.slug)&&Array.isArray(input.image_urls)&&input.image_urls.length>8)throw new Error("Хамгийн ихдээ 8 жишиг зураг оруулна уу.");
 if(model.slug==="qwen-image-3-edit"&&Array.isArray(input.image_urls)&&input.image_urls.length>3)throw new Error("Хамгийн ихдээ 3 жишиг зураг оруулна уу.");
 return input;
}
