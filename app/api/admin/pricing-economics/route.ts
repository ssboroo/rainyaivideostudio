import {NextResponse} from "next/server";
import {requireAdmin} from "@/lib/http";
import {getPricingScenario} from "@/lib/billing";
import {quoteApiCredits,providerCostUsd} from "@/lib/api-pricing";

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
  return NextResponse.json({checkedAt:new Date().toISOString(),...plan,
    reviewAgeDays,reviewDue:reviewAgeDays===null||reviewAgeDays>30,
    emergencyHold:process.env.RAVS_PRICING_HOLD==="true",
    sampleQuotes,disclaimer:"30% contribution бол зах зээлийн баталгаа биш, зөвхөн нөөц тооцсон сценарийн босго. Wire гэрээний шимтгэл, татвар, бодит USD/MNT, провайдерийн нэхэмжлэхийг санхүүгийн тайлангаар заавал тулгана."},{headers:noStore});
 }catch{return NextResponse.json({error:"Үнэ, багцын хамгаалалтын тохиргоог шалгана уу."},{status:503,headers:noStore});}
}
