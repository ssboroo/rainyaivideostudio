import {NextResponse} from "next/server";
import {requireUser} from "@/lib/http";
import {createSignedUpload} from "@/lib/higgsfield";
import {issueClipProof} from "@/lib/clip-proof";
import {mkdtemp,readFile,rm,stat,writeFile} from "node:fs/promises";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {spawn} from "node:child_process";
import {validClipSourceType,validClipWindow} from "@/lib/clip-media";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const MAX_FILE=80*1024*1024;
const MAX_OUTPUT=35*1024*1024;
let processing=false; // prevent parallel heavy transcodes on one Railway replica
const error=(message:string,status=400)=>NextResponse.json({error:message},{status,headers:{"Cache-Control":"no-store"}});
async function processMedia(args:string[],maxMs:number){
 return new Promise<string>((resolve,reject)=>{
  const bin=args[0],proc=spawn(bin,args.slice(1),{stdio:["ignore","ignore","pipe"],timeout:maxMs,killSignal:"SIGKILL"});
  let stderr="";
  proc.stderr.on("data",(chunk:Buffer)=>{stderr=(stderr+chunk.toString()).slice(-1800)});
  proc.on("error",()=>reject(new Error("FFmpeg сервер дээр суусан эсэхийг шалгана уу.")));
  proc.on("close",code=>code===0?resolve(stderr):reject(new Error(bin+" боловсруулах алдаа: "+stderr.slice(-500))));
 });
}
export async function POST(request:Request){
 const user=await requireUser();
 if(!user)return error("Нэвтэрнэ үү.",401);
 const origin=request.headers.get("origin");
 if(origin){try{if(new URL(origin).host!==new URL(request.url).host)return error("Хүсэлтийн эх сурвалж зөвшөөрөгдөөгүй.",403);}
 catch{return error("Хүсэлтийн эх сурвалж буруу.",403);}}
 if(processing)return error("Видео боловсруулалт үргэлжилж байна. Дахин оролдоно уу.",429);
 const contentLength=Number(request.headers.get("content-length")||0);
 if(contentLength>MAX_FILE+1024*1024)return error("Эх MP4 80MB-аас бага байна.",413);
 if(!request.headers.get("content-type")?.startsWith("multipart/form-data"))return error("MP4 файлтай форм илгээнэ үү.");
 processing=true;
 let directory="";
 try{
  const form=await request.formData();
  const media=form.get("file"),rights=form.get("confirmRights");
  const start=Number(form.get("start")),end=Number(form.get("end"));
  if(rights!=="true")return error("Эх видеог ашиглах эрхээ баталгаажуулна уу.");
  if(!(media instanceof File)||!validClipSourceType(media.name,media.type)||media.size===0||media.size>MAX_FILE)return error("MP4/MOV/M4V (80MB хүртэл) файл оруулна уу.",413);
  if(!form.has("start")||!form.has("end")||!validClipWindow(start,end))return error("Клипийн эхлэл, төгсгөл 1–30 секунд байна.");
  directory=await mkdtemp(join(tmpdir(),"ravs-clip-"));
  const input=join(directory,"input.mp4"),output=join(directory,"clip.mp4");
  await writeFile(input,Buffer.from(await media.arrayBuffer()));
  const info=await new Promise<{format?:{duration?:string};streams?:Array<{codec_type:string}>}>((resolve,reject)=>{
   const proc=spawn("ffprobe",["-v","error","-show_entries","format=duration:stream=codec_type","-of","json",input],{stdio:["ignore","pipe","pipe"],timeout:15000});
   let data="",err="";proc.stdout.on("data",(v:Buffer)=>{data+=v.toString();if(data.length>10000)proc.kill()});
   proc.stderr.on("data",(v:Buffer)=>err+=v.toString());
   proc.on("error",()=>reject(new Error("Видео мета өгөгдөл шалгах ffprobe байхгүй.")));
   proc.on("close",code=>{try{if(code!==0)throw Error(err);resolve(JSON.parse(data))}catch{reject(new Error("Эх файл бодит MP4 видео биш байна."))}});
  });
  const sourceDuration=Number(info.format?.duration);
  if(!Number.isFinite(sourceDuration)||sourceDuration<=0||sourceDuration>3600||!info.streams?.some(v=>v.codec_type==="video"))return error("Видео 1 цаг хүртэл, гэмтээгүй MP4 байх шаардлагатай.");
  if(end>sourceDuration+0.05)return error("Клипийн төгсгөл эх видеоны хугацаанаас хэтэрсэн байна.");
  // Extract a user-provided original. NEVER pass a YouTube URL to FFmpeg.
  await processMedia(["ffmpeg","-hide_banner","-loglevel","error","-nostdin",
   "-protocol_whitelist","file,pipe",
   "-ss",start.toFixed(3),"-i",input,"-t",(end-start).toFixed(3),"-map","0:v:0",
   "-vf","scale=trunc(min(1280\\,iw)/2)*2:-2,fps=30",
   "-an","-c:v","libx264","-preset","veryfast","-crf","25","-pix_fmt","yuv420p",
   "-movflags","+faststart","-y",output],90000);
  const outputStat=await stat(output);
  if(outputStat.size<1000||outputStat.size>MAX_OUTPUT)return error("Клипийн хэмжээ хэт том байна. Богино хэсэг сонгоно уу.");
  // Provider bills by actual media duration rounded up to the next second.
  // Measure the rendered clip, not just the requested timeline interval.
  const finalProbe=await new Promise<number>((resolve,reject)=>{
    const probe=spawn("ffprobe",["-v","error","-show_entries","format=duration","-of","default=noprint_wrappers=1:nokey=1",output],{stdio:["ignore","pipe","ignore"],timeout:10000});
    let buffer="";probe.stdout.on("data",(chunk:Buffer)=>buffer+=chunk.toString());
    probe.on("error",()=>reject(new Error("Бэлэн клипийн хугацааг шалгаж чадсангүй.")));
    probe.on("close",code=>code===0?resolve(Number(buffer.trim())):reject(new Error("Бэлэн клипийн хугацаа буруу.")));
  });
  if(!Number.isFinite(finalProbe)||finalProbe<0.8||finalProbe>30.05)return error("Гарсан клип 1–30 секундийн хязгаараас гарсан байна.");
  const clipDuration=Math.max(end-start,finalProbe);
  const signed=await createSignedUpload("video/mp4");
  const uploadURL=new URL(String(signed.upload_url)),url=new URL(String(signed.public_url));
  if(uploadURL.protocol!=="https:"||url.protocol!=="https:"||uploadURL.username||url.username)throw Error("Provider upload URL буруу.");
  const buffer=await readFile(output);
  const put=await fetch(uploadURL,{method:"PUT",headers:(signed.upload_headers||{}) as Record<string,string>,body:new Uint8Array(buffer),redirect:"error",signal:AbortSignal.timeout(45000)});
  if(!put.ok)throw Error("Клипийг Higgsfield-д байршуулж чадсангүй.");
  return NextResponse.json({videoUrl:url.toString(),duration:clipDuration,
   clipToken:issueClipProof(user.id,url.toString(),clipDuration),source:"user_uploaded_original",
   message:"Genjutsu-д бэлэн. Кредит зөвхөн дараагийн үүсгэлтэд зарцуулагдана."},
   {headers:{"Cache-Control":"no-store"}});
 }catch(e){
  console.warn("[clip] upload or transcode failed:",e instanceof Error?e.name:"unknown");
  return error("Клип боловсруулах боломжгүй. MP4 файл, 1–30 секундийн хэсэг болон үйлчилгээний тохиргоог шалгана уу.",422);
 }finally{
  if(directory)await rm(directory,{recursive:true,force:true}).catch(()=>null);
  processing=false;
 }
}
