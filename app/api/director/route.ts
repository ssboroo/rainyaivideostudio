import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { boundedBody } from "@/lib/mcp-oauth";
import { createDirectorPlan, DirectorError, validateDirectorInput } from "@/lib/creative-director";
import { createLocalDirectorPlan } from "@/lib/local-director";

export const dynamic="force-dynamic";
export const runtime="nodejs";
const noStore={"Cache-Control":"no-store"};
const limit=new Map<string,{count:number;until:number}>();
function limited(userId:string,maxRequests=6){
 const now=Date.now();
 if(limit.size>3000)for(const [k,v] of limit)if(v.until<now)limit.delete(k);
 const slot=limit.get(userId);
 if(!slot||slot.until<now){limit.set(userId,{count:1,until:now+3600_000});return false;}
 if(slot.count>=maxRequests)return true;
 slot.count++;return false;
}
export async function GET(){
 const user=await getSessionUser();
 if(!user)return NextResponse.json({error:"Нэвтэрнэ үү."},{status:401,headers:noStore});
 const aiEnabled=process.env.RAINY_DIRECTOR_ENABLED==="true"&&(user.role==="ADMIN"||process.env.RAINY_DIRECTOR_PUBLIC==="true");
 const providers={local:true,gpt:aiEnabled&&!!(process.env.OPENAI_API_KEY&&process.env.RAINY_OPENAI_MODEL),
 claude:aiEnabled&&!!(process.env.ANTHROPIC_API_KEY&&process.env.RAINY_CLAUDE_MODEL),
 gemini:aiEnabled&&!!(process.env.GEMINI_API_KEY&&process.env.RAINY_GEMINI_MODEL)};
 return NextResponse.json({enabled:true,providers,note:"Үнэгүй storyboard нь гаднын API ашиглахгүй. GPT/Claude/Gemini зөвхөн админы beta эрхтэй. Видео/Voice generation нь тусдаа зөвшөөрөл, кредиттэй."},{headers:noStore});
}
export async function POST(request:Request){
 const user=await getSessionUser();
 if(!user)return NextResponse.json({error:"Нэвтэрнэ үү."},{status:401,headers:noStore});
 const origin=request.headers.get("origin");
 const requestOrigin=new URL(request.url).origin;
 const allowed=[requestOrigin,process.env.APP_URL,process.env.RAINY_PUBLIC_URL,"https://video.rainy.studio"].filter(Boolean);
 if(!origin||!allowed.includes(origin))return NextResponse.json({error:"Эх сурвалж зөвшөөрөгдөөгүй."},{status:403,headers:noStore});
 if(!request.headers.get("content-type")?.startsWith("application/json"))return NextResponse.json({error:"JSON шаардлагатай."},{status:415,headers:noStore});
 try{
 const input=validateDirectorInput(JSON.parse(await boundedBody(request,8192)));
 if(input.provider==="local"){
  if(limited(user.id+":local",30))return NextResponse.json({error:"Үнэгүй storyboard-ийн цагийн 30 хүсэлтийн лимит хүрлээ."},{status:429,headers:noStore});
  const plan=createLocalDirectorPlan({...input,provider:"local",ratio:input.ratio as "9:16"|"16:9"|"1:1"});
  return NextResponse.json({plan,charge:"0 credits; no external AI API called."},{headers:noStore});
 }
 if(process.env.RAINY_DIRECTOR_ENABLED!=="true"||(user.role!=="ADMIN"&&process.env.RAINY_DIRECTOR_PUBLIC!=="true"))
  return NextResponse.json({error:"Төлбөртэй AI Director одоогоор beta горимд байна."},{status:503,headers:noStore});
 if(limited(user.id+":ai"))return NextResponse.json({error:"AI Director-ийн цагийн 6 туршилтын лимит хүрлээ."},{status:429,headers:noStore});
 const plan=await createDirectorPlan(input);
 return NextResponse.json({plan,charge:"No video credits charged. External LLM provider costs may be incurred by the service."},{headers:noStore});
 }catch(error){
  const status=error instanceof DirectorError?error.status:502;
  return NextResponse.json({error:error instanceof DirectorError?error.message:"AI provider холболт тасарлаа. Дахин төлбөртэй хүсэлт автоматаар илгээхгүй."},{status,headers:noStore});
 }
}
