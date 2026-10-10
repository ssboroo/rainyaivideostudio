import {NextResponse} from "next/server";
import {boundedBody} from "@/lib/mcp-oauth";
import {affordableVideoModels} from "@/lib/economy-models";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const headers={"Cache-Control":"no-store"};
export async function POST(request:Request){
 let data:Record<string,unknown>;
 try{
  const body=await boundedBody(request,4096);
  const value=JSON.parse(body);
  if(!value||typeof value!=="object"||Array.isArray(value))throw Error();
  data=value;
 }catch{return NextResponse.json({error:"Харьцуулах хүсэлт буруу."},{status:400,headers});}
 try{
  const items=affordableVideoModels({
   duration:Number(data.duration),
   resolution:String(data.resolution||"720p"),
   aspectRatio:String(data.aspectRatio||"16:9"),
   generateAudio:data.generateAudio===true,
   prompt:typeof data.prompt==="string"?data.prompt:"",
  });
  return NextResponse.json({items,assumptions:"Ижил хугацаа, нягтаршил, харьцаа, аудио дэмжлэгтэй API загваруудыг өнөөгийн RAINY кредитийн үнээр харьцуулсан. Бодит генерац хийгээгүй; модель бүрийн дүрсний үр дүн ялгаатай."},{headers});
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Үнэ тооцох боломжгүй."},{status:422,headers});}
}
