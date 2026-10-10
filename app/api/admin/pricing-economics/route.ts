import {NextResponse} from "next/server";
import {requireAdmin} from "@/lib/http";
import {getPricingScenario} from "@/lib/billing";
import {quoteApiCredits,providerCostUsd,pricingPolicy} from "@/lib/api-pricing";
import {models,estimateCredits} from "@/lib/models";

export const dynamic="force-dynamic";
const noStore={"Cache-Control":"no-store"};
export async function GET(){
 if(!await requireAdmin())return NextResponse.json({error:"Админ эрх шаардлагатай."},{status:403,headers:noStore});
 try{
  const plan=getPricingScenario();
  const reviewed=new Date(plan.reviewedAt+"T00:00:00Z").getTime();
  const reviewAgeDays=Number.isFinite(reviewed)?Math.floor((Date.now()-reviewed)/86400000):null;
  const examples=[
   {name:"Kling 3.0 Standard · 10 секунд",id:"kling-video/v3.0/std/text-to-video",input:{duration:10,resolution:"720p"}},
   {name:"Genjutsu Motion · 8 секунд",id:"higgsfield/genjutsu/motion-transfer/v1.0",input:{video_url:"https://example.com/quoted-clip.mp4",__verifiedClipSeconds:8,resolution:"720p"}},
   {name:"Soul 2 · 1 зураг",id:"higgsfield-ai/soul/v2/text-to-image",input:{num_images:1,resolution:"720p"}},
  ];
  const sampleQuotes=examples.map(x=>{try{return{name:x.name,providerUsd:providerCostUsd(x.id,x.input),saleCredits:quoteApiCredits(x.id,x.input),note:"Зөвхөн ижил тохиргооны ойролцоо, жишиг API зардал."};}catch{return{name:x.name,available:false}}});
  // Example configuration for every catalog model. Unsupported / unpriced
  // models are shown, never assigned a fabricated price.
  const cheapestPackUnit=Math.min(...plan.packages.map(p=>p.unitMnt));
  const modelCatalog=models.map(model=>{
   const res=model.resolutions?.[0]||"720p";
   const duration=model.kind==="image"?undefined:(model.minDuration||5);
   const input:Record<string,unknown>={
      resolution:res,aspect_ratio:model.aspectRatios?.[0]||"16:9",
      batch_size:1,num_images:1,generate_audio:false,
   };
   if(model.modelId.includes("/genjutsu/")){
     input.video_url="https://example.com/verified-clip.mp4";
     input.__verifiedClipSeconds=8;
   }
   try{
    if(!model.apiVerified)throw new Error(model.apiReason||"Endpoint баталгаажаагүй.");
    const effectiveDuration=model.modelId.includes("/genjutsu/")?8:duration;
    const credits=estimateCredits(model,effectiveDuration,input);
    const usd=providerCostUsd(model.modelId,{...input,duration:effectiveDuration||5});
    if(!Number.isFinite(credits)||!Number.isFinite(usd)||credits<=0||usd<=0)throw Error("Үнэ тооцож чадсангүй.");
    const retailMnt=Math.ceil(credits*cheapestPackUnit);
    // Reserve and FX-stressed contribution of THIS example configuration.
    const burden=usd*pricingPolicy.usdMnt*(1+pricingPolicy.fxStress) +
      retailMnt*(pricingPolicy.paymentFeeReserve+pricingPolicy.taxReserve+pricingPolicy.infrastructureReserve);
    const stressMargin=(retailMnt-burden)/retailMnt;
    return {slug:model.slug,name:model.name,modelId:model.modelId,kind:model.kind,apiVerified:true,
      status:"sample_quoted",resolution:res,durationSeconds:effectiveDuration??null,
      providerUsd:usd,credits,retailMnt,stressMargin};
   }catch(e){
    return {slug:model.slug,name:model.name,modelId:model.modelId,kind:model.kind,
      apiVerified:!!model.apiVerified,status:"quote_unavailable",
      note:e instanceof Error?e.message:"Энэ тохиргооны үнэ баталгаажаагүй."};
   }
  });
  return NextResponse.json({checkedAt:new Date().toISOString(),...plan,
    reviewAgeDays,reviewDue:reviewAgeDays===null||reviewAgeDays>30,
    emergencyHold:process.env.RAVS_PRICING_HOLD==="true",
    sampleQuotes,modelCatalog,disclaimer:"30% contribution бол зах зээлийн баталгаа биш, зөвхөн нөөц тооцсон сценарийн босго. Wire гэрээний шимтгэл, татвар, бодит USD/MNT, провайдерийн нэхэмжлэхийг санхүүгийн тайлангаар заавал тулгана."},{headers:noStore});
 }catch{return NextResponse.json({error:"Үнэ, багцын хамгаалалтын тохиргоог шалгана уу."},{status:503,headers:noStore});}
}
