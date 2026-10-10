import {NextResponse} from "next/server";
import {getModel,buildProviderInput} from "@/lib/models";
import {quoteValidatedGeneration} from "@/lib/generation-credit-quote";
import {requireUser} from "@/lib/http";
import {boundedBody} from "@/lib/mcp-oauth";
export const dynamic="force-dynamic";
const headers={"Cache-Control":"no-store"};
/** Informational quote only. Never reserves credits or submits a provider job. */
export async function POST(request:Request){
 let raw:Record<string,unknown>;
 try {
  const content=await boundedBody(request,32768);
  const parsed=JSON.parse(content);
  if(!parsed||typeof parsed!=="object"||Array.isArray(parsed))
   return NextResponse.json({error:"Үнийн тохиргоо буруу байна."},{status:400,headers});
  raw=parsed as Record<string,unknown>;
 }catch{return NextResponse.json({error:"Үнийн хүсэлт буруу байна."},{status:400,headers});}
 const model=getModel(typeof raw.modelSlug==="string"?raw.modelSlug:"");
 if(!model)return NextResponse.json({error:"Сонгосон загвар олдсонгүй."},{status:404,headers});
 try{
  const input=buildProviderInput(model,raw);
  const user=await requireUser();
  const quote=quoteValidatedGeneration(user?.id||null,model,input,raw.clipToken);
  return NextResponse.json({
   modelSlug:model.slug,credits:quote.credits,pricingStatus:"confirmed",
   resolution:input.resolution||null,durationSeconds:quote.verifiedSourceSeconds??input.duration??null,
   disclaimer:"Энэ нь одоогийн API-т суурилсан үнийн тооцоо. Үүсгэх товч дарахад сервер дахин шалгаж, зөвшөөрсөн кредитээс хэтрүүлэхгүй.",
  },{headers});
 }catch(error){
  const message=error instanceof Error?error.message:"Үнийн тооцоолол боломжгүй байна.";
  return NextResponse.json({error:message,pricingStatus:"unavailable"},{status:422,headers});
 }
}
