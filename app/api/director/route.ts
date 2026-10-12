import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/session";
import { boundedBody } from "@/lib/mcp-oauth";
import { createDirectorPlan, DirectorError, validateDirectorInput } from "@/lib/creative-director";

export const dynamic="force-dynamic";
export const runtime="nodejs";
const noStore={"Cache-Control":"no-store"};
const limit=new Map<string,{count:number;until:number}>();
function limited(userId:string){
 const now=Date.now();
 if(limit.size>3000)for(const [k,v] of limit)if(v.until<now)limit.delete(k);
 const slot=limit.get(userId);
 if(!slot||slot.until<now){limit.set(userId,{count:1,until:now+3600_000});return false;}
 if(slot.count>=6)return true;
 slot.count++;return false;
}
export async function GET(){
 const user=await getSessionUser();
 if(!user)return NextResponse.json({error:"Нэвтэрнэ үү."},{status:401,headers:noStore});
 const enabled=process.env.RAINY_DIRECTOR_ENABLED==="true"&&(user.role==="ADMIN"||process.env.RAINY_DIRECTOR_PUBLIC==="true");
 const providers={gpt:!!(process.env.OPENAI_API_KEY&&process.env.RAINY_OPENAI_MODEL),
 claude:!!(process.env.ANTHROPIC_API_KEY&&process.env.RAINY_CLAUDE_MODEL),
 gemini:!!(process.env.GEMINI_API_KEY&&process.env.RAINY_GEMINI_MODEL)};
 return NextResponse.json({enabled,providers,note:"AI төлөвлөлтийн API зардал Video generation кредитэд ороогүй; хязгаарлагдмал beta. Видео/Voice-ийг тусдаа баталгаажуулж төлнө."},{headers:noStore});
}
export async function POST(request:Request){
 const user=await getSessionUser();
 if(!user)return NextResponse.json({error:"Нэвтэрнэ үү."},{status:401,headers:noStore});
 if(process.env.RAINY_DIRECTOR_ENABLED!=="true"||(user.role!=="ADMIN"&&process.env.RAINY_DIRECTOR_PUBLIC!=="true"))
 return NextResponse.json({error:"AI Director туршилтын горимд байна. Админ тохиргоо шаардлагатай."},{status:503,headers:noStore});
 const origin=request.headers.get("origin");
 const requestOrigin=new URL(request.url).origin;
 const allowed=[requestOrigin,process.env.APP_URL,process.env.RAINY_PUBLIC_URL,"https://video.rainy.studio"].filter(Boolean);
 if(!origin||!allowed.includes(origin))return NextResponse.json({error:"Эх сурвалж зөвшөөрөгдөөгүй."},{status:403,headers:noStore});
 if(!request.headers.get("content-type")?.startsWith("application/json"))return NextResponse.json({error:"JSON шаардлагатай."},{status:415,headers:noStore});
 if(limited(user.id))return NextResponse.json({error:"AI Director-ийн цагийн 6 туршилтын лимит хүрлээ."},{status:429,headers:noStore});
 try{
 const input=validateDirectorInput(JSON.parse(await boundedBody(request,8192)));
 const plan=await createDirectorPlan(input);
 return NextResponse.json({plan,charge:"No video credits charged. External LLM provider costs may be incurred by the service."},{headers:noStore});
 }catch(error){
  const status=error instanceof DirectorError?error.status:502;
  return NextResponse.json({error:error instanceof DirectorError?error.message:"AI provider холболт тасарлаа. Дахин төлбөртэй хүсэлт автоматаар илгээхгүй."},{status,headers:noStore});
 }
}
