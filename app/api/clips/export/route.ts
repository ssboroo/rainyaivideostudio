import {NextResponse} from "next/server";
import {requireUser} from "@/lib/http";
import {mkdtemp,readFile,rm,stat,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawn} from "node:child_process";

export const runtime="nodejs";
export const dynamic="force-dynamic";
let processing=false;
function fail(message:string,status=400){return NextResponse.json({error:message},{status,headers:{"Cache-Control":"private, no-store"}});}
async function command(binary:string,args:string[],deadline:number){
 return new Promise<string>((resolve,reject)=>{
   const task=spawn(binary,args,{stdio:["ignore","pipe","pipe"],timeout:deadline,killSignal:"SIGKILL"});
   let out="",err="";
   task.stdout.on("data",(chunk:Buffer)=>{out+=chunk.toString();if(out.length>20000)task.kill();});
   task.stderr.on("data",(chunk:Buffer)=>{err=(err+chunk.toString()).slice(-1200);});
   task.on("error",()=>reject(new Error(binary+" executable not available")));
   task.on("close",code=>code===0?resolve(out):reject(new Error(binary+" processing error: "+err.slice(-300))));
 });
}
export async function POST(request:Request){
 const user=await requireUser();
 if(!user)return fail("Нэвтрэх шаардлагатай.",401);
 // Authenticated cookie-based video processing must reject cross-site POSTs.
 const origin=request.headers.get("origin");
 if(origin){try{
  if(new URL(origin).host!==new URL(request.url).host)return fail("Хүсэлтийн эх сурвалж зөвшөөрөгдөөгүй.",403);
 }catch{return fail("Хүсэлтийн эх сурвалж буруу.",403);}}
 if(processing)return fail("Видео боловсруулалт явагдаж байна.",429);
 if(!request.headers.get("content-type")?.startsWith("multipart/form-data"))return fail("Эх MP4 файл оруулна уу.");
 const length=Number(request.headers.get("content-length")||0);
 if(length>81*1024*1024)return fail("80MB хүртэл MP4 файл зөвшөөрнө.",413);
 processing=true;
 let folder="";
 try{
  const form=await request.formData();
  if(form.get("confirmRights")!=="true")return fail("Ашиглах эрхээ баталгаажуулна уу.");
  const input=form.get("file"),start=Number(form.get("start")),end=Number(form.get("end"));
  if(!(input instanceof File)||input.type!=="video/mp4"||input.size===0||input.size>80*1024*1024)return fail("80MB хүртэлх эх MP4 сонгоно уу.",413);
  if(!Number.isFinite(start)||!Number.isFinite(end)||start<0||end-start<1||end-start>30||end>3600)return fail("1–30 секундын хэсэг сонгоно уу.");
  folder=await mkdtemp(join(tmpdir(),"rainy-export-"));
  const source=join(folder,"input.mp4"),output=join(folder,"output.mp4");
  await writeFile(source,Buffer.from(await input.arrayBuffer()));
  const meta=JSON.parse(await command("ffprobe",["-v","error","-show_entries","format=duration:stream=codec_type","-of","json",source],15000)) as {format?:{duration?:string},streams?:{codec_type:string}[]};
  const duration=Number(meta.format?.duration);
  if(!Number.isFinite(duration)||duration<end-.05||duration>3600||!meta.streams?.some(stream=>stream.codec_type==="video"))return fail("Эх видеоны урт эсвэл формат буруу байна.");
  await command("ffmpeg",[
   "-hide_banner","-loglevel","error","-nostdin","-protocol_whitelist","file,pipe",
   "-ss",start.toFixed(3),"-i",source,"-t",(end-start).toFixed(3),
   "-map","0:v:0","-map","0:a:0?",
   "-vf","scale=trunc(min(1280\\,iw)/2)*2:-2,fps=30",
   "-c:v","libx264","-preset","veryfast","-crf","25","-pix_fmt","yuv420p",
   "-c:a","aac","-b:a","128k","-movflags","+faststart","-y",output
  ],90000);
  const info=await stat(output);
  if(info.size<1024||info.size>35*1024*1024)return fail("Үүссэн MP4-ийн хэмжээ хэтэрсэн байна. Богино клип сонгоно уу.");
  const bytes=await readFile(output);
  return new Response(new Uint8Array(bytes),{status:200,headers:{
   "Content-Type":"video/mp4",
   "Content-Disposition":'attachment; filename="rainy-trimmed-clip.mp4"',
   "Content-Length":String(bytes.length),
   "Cache-Control":"private, no-store",
   "X-Content-Type-Options":"nosniff"
  }});
 }catch(err){
  console.warn("[clip-export] failed",err instanceof Error?err.name:"unknown");
  return fail("MP4 тайрахад алдаа гарлаа. Эх файлын формат, хугацаа болон серверийн тохиргоог шалгана уу.",422);
 }finally{
  if(folder)await rm(folder,{recursive:true,force:true}).catch(()=>null);
  processing=false;
 }
}
