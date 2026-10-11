import {NextResponse} from "next/server";
import {requireAdmin,jsonError} from "@/lib/http";
import {models} from "@/lib/models";
import {estimateCredits} from "@/lib/model-credit-estimate";
import {hfModelSpecs} from "@/lib/hf-model-specs";
import {getPricingScenario} from "@/lib/billing";
export const dynamic="force-dynamic";

/** Admin-only complete model price coverage. NO paid provider API calls. */
export async function GET(){
 const admin=await requireAdmin();
 if(!admin)return jsonError("Админ эрх шаардлагатай.",403);
 const reports=models.map(model=>{
  const parameterDefaults=Object.fromEntries((model.parameters||[]).filter(p=>p.default!==undefined).map(p=>[p.name,p.default]));
  const source=hfModelSpecs.find(spec=>spec.id===model.modelId);
  const resolution=model.resolutions.find(x=>x!=="auto")||String(parameterDefaults.resolution||"720p");
  const duration=Number(parameterDefaults.duration||model.minDuration||5);
  const aspect_ratio=model.aspectRatios.find(x=>x!=="auto")||String(parameterDefaults.aspect_ratio||"16:9");
  try{
   if(!model.apiVerified)throw new Error(model.apiReason||"API нэвтрэх эрх баталгаажаагүй.");
   const credits=estimateCredits(model,duration,{...parameterDefaults,resolution,aspect_ratio});
   return {modelSlug:model.slug,modelId:model.modelId,name:model.name,maker:model.maker,
    pricing:"QUOTABLE",example:{duration:model.kind==="image"?null:duration,resolution,aspect_ratio,credits},source:source?.source||model.apiSource||null};
  }catch(e){
   return {modelSlug:model.slug,modelId:model.modelId,name:model.name,maker:model.maker,
    pricing:model.apiVerified?"NEEDS_INPUT_OR_PRICE_REVIEW":"API_UNVERIFIED",
    reason:e instanceof Error?e.message:"Үнэ баталгаажаагүй.",source:source?.source||model.apiSource||null};
  }
 });
 return NextResponse.json({reviewedAt:"2026-10-11",total:reports.length,
  quotable:reports.filter(m=>m.pricing==="QUOTABLE").length,
  unverified:reports.filter(m=>m.pricing==="API_UNVERIFIED").length,
  needsReview:reports.filter(m=>m.pricing==="NEEDS_INPUT_OR_PRICE_REVIEW").length,
  profitability:getPricingScenario(),models:reports,
  warning:"Энэ шалгалт зөвхөн нийтлэгдсэн жагсаалт/тооцооны coverage. Reference video, music, input token, нэмэлт параметр, эсвэл бодит charged usage-д нэгдсэн баталгаа биш. Тохиргоо бүрийг provider талтай баталгаажуулж байж нээнэ."},
 {headers:{"Cache-Control":"private, no-store"}});
}
