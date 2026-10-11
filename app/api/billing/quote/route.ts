import {NextResponse} from "next/server";
import {models,estimateCredits,getModel} from "@/lib/models";
import {providerCostUsd,PricingUnavailableError} from "@/lib/api-pricing";

export const dynamic="force-dynamic";
const error=(message:string,status=400)=>NextResponse.json({error:message},{status,headers:{"Cache-Control":"no-store"}});

export function pricePreview(modelSlug:string, options:{duration?:number;resolution?:string;aspectRatio?:string;audio?:boolean}){
 const model=getModel(modelSlug);
 if(!model)throw new Error("Модель олдсонгүй.");
 if(!model.apiVerified)throw new PricingUnavailableError(model.apiReason||"Моделийн API холболт баталгаажаагүй.");
 const resolution=options.resolution||model.resolutions.find(x=>x!=="auto")||"auto";
 const duration=options.duration??model.minDuration??5;
 const aspectRatio=options.aspectRatio||model.aspectRatios.find(x=>x!=="auto")||"16:9";
 if(model.kind!=="image" && (!Number.isInteger(duration)||duration<1||duration>30))throw new Error("Хугацаа 1–30 секунд байна.");
 if(model.resolutions.length && !model.resolutions.includes(resolution)&&!model.resolutions.includes("auto"))throw new Error("Моделийн resolution сонголт буруу.");
 if(!model.aspectRatios.includes(aspectRatio)&&!model.aspectRatios.includes("auto"))throw new Error("Кадрын харьцаа дэмжигдэхгүй.");
 const defaults=Object.fromEntries((model.parameters||[]).filter(p=>p.default!==undefined).map(p=>[p.name,p.default]));
 const input={...defaults,duration,resolution,aspect_ratio:aspectRatio,
  generate_audio:options.audio??defaults.generate_audio,
  sound:options.audio===undefined?defaults.sound:options.audio?"on":"off",
 };
 const costUsd=providerCostUsd(model.modelId,input);
 const credits=estimateCredits(model,duration,input);
 if(!Number.isFinite(costUsd)||!Number.isSafeInteger(credits)||credits<1)throw new Error("Үнэ баталгаажаагүй.");
 return {modelSlug:model.slug,model:model.name,provider:model.maker||model.provider,kind:model.kind,
  duration:model.kind==="image"?null:duration,resolution,aspectRatio,
  credits,approximate:true,
  note:"Кредит нь энэ тохиргооны жишиг тооцоо юм. Бүтээхээс өмнө сервер сонгосон параметрүүдээр баталгаажуулна. Үнэ нь баталгаажаагүй горимоор бүтээл эхлүүлэхгүй."
 };
}
export async function GET(req:Request){
 const query=new URL(req.url).searchParams;
 const slug=query.get("modelSlug");
 if(!slug){
  return NextResponse.json({models:models.map(m=>({slug:m.slug,name:m.name,provider:m.maker||m.provider,kind:m.kind,
    group:m.group,apiVerified:!!m.apiVerified,resolutions:m.resolutions,aspectRatios:m.aspectRatios,
    minDuration:m.minDuration||null,maxDuration:m.maxDuration||null,
    availabilityNote:m.apiVerified?"Үнийн тохиргоогоор тооцно":"API нээлт хараахан баталгаажаагүй"})),
    note:"Моделиудын жагсаалт нь генерацын үнэ бүгд нээлттэй гэсэн үг биш."},
  {headers:{"Cache-Control":"no-store"}});
 }
 if(slug.length>120)return error("Модель ID хэт урт.");
 const duration=query.has("duration")?Number(query.get("duration")):undefined;
 if(duration!==undefined && (!Number.isInteger(duration)||duration<1||duration>30))return error("Хугацаа 1–30 сек.");
 const resolution=query.get("resolution")||undefined;
 const aspectRatio=query.get("aspectRatio")||undefined;
 if(resolution&&(!/^[a-z0-9]{1,12}$/i.test(resolution)))return error("Resolution буруу.");
 if(aspectRatio&&!/^(auto|\d{1,2}:\d{1,2})$/.test(aspectRatio))return error("Aspect ratio буруу.");
 const audio=query.get("audio");
 if(audio!==null&&!["true","false"].includes(audio))return error("Дууны сонголт буруу.");
 try{
  return NextResponse.json(pricePreview(slug,{duration,resolution,aspectRatio,audio:audio===null?undefined:audio==="true"}),
    {headers:{"Cache-Control":"no-store"}});
 }catch(e){
  return error(e instanceof Error?e.message:"Үнэ тооцоолох боломжгүй.",e instanceof PricingUnavailableError?422:400);
 }
}
