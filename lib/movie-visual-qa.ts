/** Optional visual AI QA. Requires explicit creator opt-in, trusted CDN host,
 * licensed video rights, an image-model API key, and an isolated egress policy.
 * It never silently approves a clip when the vision service fails.
 */
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { isIP } from "node:net";
import { lookup } from "node:dns/promises";

type Verdict="pass"|"regenerate"|"review";
type QaResult={verdict:Verdict;reason:string;source:"vision_ai"|"configuration"|"timeout";score?:number};
const MB=1024*1024;
const MAX_VIDEO_BYTES=90*MB;

function ipIsGlobal(value:string){
  // RFC1918, loopback, link-local and IPv6 local are never allowed.
  if(!isIP(value))return false;
  if(value.includes(":"))return !(value==="::1"||value.startsWith("fe80:")||value.startsWith("fc")||value.startsWith("fd")||value==="::");
  const nums=value.split(".").map(Number);
  return !(nums[0]===10||nums[0]===127||nums[0]===0||nums[0]>=224||
    (nums[0]===192&&nums[1]===168)||(nums[0]===172&&nums[1]>=16&&nums[1]<=31)||
    (nums[0]===169&&nums[1]===254)||(nums[0]===100&&nums[1]>=64&&nums[1]<=127)||
    (nums[0]===198&&nums[1]>=18&&nums[1]<=19));
}
async function verifyUrl(url:string){
  const u=new URL(url);
  const allow=new Set((process.env.MOVIE_QA_MEDIA_HOSTS||"").split(",").map(x=>x.trim().toLowerCase()).filter(Boolean));
  if(u.protocol!=="https:"||u.username||u.password||u.hash||u.port&&u.port!=="443"||!allow.has(u.hostname.toLowerCase())||isIP(u.hostname))
    throw new Error("Video media host was not verified.");
  const resolutions=await lookup(u.hostname,{all:true});
  if(!resolutions.length||resolutions.some(x=>!ipIsGlobal(x.address)))throw new Error("Unsafe media CDN IP.");
  return u.toString();
}
async function ffmpeg(args:string[],seconds=18){
  await new Promise<void>((resolve,reject)=>{
    const child=spawn("ffmpeg",["-nostdin","-hide_banner","-loglevel","error","-y",...args],{stdio:"ignore"});
    const timer=setTimeout(()=>{child.kill("SIGKILL");reject(new Error("FFmpeg timeout"))},seconds*1000);
    child.on("exit",code=>{clearTimeout(timer);code===0?resolve():reject(new Error("FFmpeg failed"))});
    child.on("error",error=>{clearTimeout(timer);reject(error)});
  });
}
export async function analyzeVisualScene(url:string,prompt:string):Promise<QaResult>{
  const key=process.env.MOVIE_VISION_API_KEY||"";
  const model=process.env.MOVIE_VISION_MODEL||"gpt-4.1-mini";
  if(process.env.MOVIE_AI_QA_ENABLED!=="true"||key.length<20)
    return {verdict:"review",reason:"AI vision QA үйлчилгээг баталгаажуулж идэвхжүүлээгүй.",source:"configuration"};
  let folder="";
  try{
    const verified=await verifyUrl(url);
    folder=await mkdtemp(path.join(tmpdir(),"rainy-qa-"));
    // Do not follow redirects or proxy environment credentials. Network egress
    // should also be restricted to the verified media host at Railway level.
    const res=await fetch(verified,{redirect:"error",headers:{Accept:"video/mp4"},signal:AbortSignal.timeout(18000)});
    if(!res.ok || Number(res.headers.get("content-length")||0)>MAX_VIDEO_BYTES)throw new Error("Oversize media");
    const type=res.headers.get("content-type")?.split(";")[0]||"";
    if(type && !["video/mp4","application/octet-stream"].includes(type))throw new Error("Unexpected media MIME");
    const reader=res.body?.getReader();if(!reader)throw new Error("No media stream");
    const chunks:Uint8Array[]=[];let length=0;
    while(true){const {done,value}=await reader.read();if(done)break;if(value){length+=value.byteLength;if(length>MAX_VIDEO_BYTES){await reader.cancel();throw new Error("Too large");}chunks.push(value)}}
    const file=path.join(folder,"source.mp4");await writeFile(file,Buffer.concat(chunks.map(chunk=>Buffer.from(chunk))));
    const frames=await Promise.all([0.7,2.2].map(async(sec,i)=>{
      const target=path.join(folder,`f${i}.jpg`);
      await ffmpeg(["-ss",String(sec),"-i",file,"-frames:v","1","-vf","scale=640:-2",target]);
      return "data:image/jpeg;base64,"+(await readFile(target)).toString("base64");
    }));
    const response=await fetch("https://api.openai.com/v1/chat/completions",{
      method:"POST",headers:{Authorization:`Bearer ${key}` ,"Content-Type":"application/json"},
      signal:AbortSignal.timeout(20000),
      body:JSON.stringify({model,temperature:0,response_format:{type:"json_object"},max_tokens:230,
        messages:[{role:"system",content:"You perform conservative cinematic frame QA. Inspect two frames from one synthetic video clip. Return compact JSON {verdict:pass|review|regenerate, score:0..1, reason:string}. Regenerate ONLY on obvious corruption, severe facial/body deformation or destroyed/illegible branded objects. Choose review when uncertain. A frame pair cannot verify lip-sync, temporal motion or real identity."},
          {role:"user",content:[{type:"text",text:`Scene prompt: ${prompt.slice(0,1400)}. Evaluate rendering quality, consistency and severe visual artifacts.`},
            ...frames.map(image_url=>({type:"image_url",image_url:{url:image_url,detail:"low"}}))]}]}),
    });
    if(!response.ok)throw new Error("Vision provider failure");
    const payload=await response.json() as {choices?:{message?:{content?:string}}[]};
    const parsed=JSON.parse(payload.choices?.[0]?.message?.content||"null") as {verdict?:string;reason?:string;score?:number};
    if(!parsed || !["pass","review","regenerate"].includes(parsed.verdict||"") || typeof parsed.score!=="number")throw new Error("Malformed QA");
    const score=Math.max(0,Math.min(1,parsed.score));
    const verdict:Verdict=parsed.verdict==="regenerate" && score>0.55?"review":parsed.verdict as Verdict;
    return {verdict,score,reason:String(parsed.reason||"Visual QA").slice(0,400),source:"vision_ai"};
  }catch{return {verdict:"review",reason:"AI visual QA үйлчилгээний алдаа. Кадрыг автоматаар дахин үүсгэхгүй.",source:"timeout"};}
  finally{if(folder)await rm(folder,{recursive:true,force:true});}
}