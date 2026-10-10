import {models} from "@/lib/models";
import {quoteApiCredits} from "@/lib/api-pricing";

export type ApiAuditState="unsupported_endpoint"|"source_clip_required"|"pricing_unavailable"|"quote_implemented";
export type ApiAuditItem={
 slug:string;name:string;modelId:string;kind:string;group:string;
 endpointDocumented:boolean;pricing:ApiAuditState;note:string;
};
/** No network, no credits, no model generation. Data is CODE verification only. */
export function inspectModelApi():ApiAuditItem[]{
 return models.map(model=>{
  const base={slug:model.slug,name:model.name,modelId:model.modelId,kind:model.kind,group:model.group,endpointDocumented:!!model.apiVerified};
  if(!model.apiVerified)return{...base,pricing:"unsupported_endpoint" as const,note:"API параметр эсвэл endpoint баталгаажаагүй"};
  if(model.slug==="genjutsu-motion")return{...base,pricing:"source_clip_required" as const,note:"Бодит 1–30 секундын MP4 тайрч баталгаажуулсны дараа 480p/720p үнэлнэ"};
  if(model.slug==="genjutsu-restyle")return{...base,pricing:"pricing_unavailable" as const,note:"Restyle-ийн албан API тариф тусдаа баталгаажаагүй"};
  const sample={
   duration:model.durationOptions?.[0]||model.minDuration||5,
   resolution:model.resolutions.find(s=>s!=="auto"&&s!=="default")||model.resolutions[0]||"720p",
   aspect_ratio:model.aspectRatios.find(s=>s!=="auto")||"16:9",
  };
  try {
   // This merely exercises our local quote algorithm with a representative
   // configuration; it is not a live provider-account price or access test.
   const credits=quoteApiCredits(model.modelId,sample);
   if(!Number.isSafeInteger(credits)||credits<=0)throw Error("invalid quote");
   return{...base,pricing:"quote_implemented" as const,note:"Орон нутгийн үнийн томьёо бий; provider account эрх / бодит генерац баталгаажаагүй"};
  }catch{
   return{...base,pricing:"pricing_unavailable" as const,note:"Энэ endpoint/тохиргооны үнийн томьёо баталгаажаагүй"};
  }
 });
}
