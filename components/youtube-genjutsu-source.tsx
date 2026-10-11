"use client";
import {useEffect,useRef,useState} from "react";
import {CheckCircle2,Clapperboard,Film,LoaderCircle,Play,Scissors,ShieldCheck,Upload} from "lucide-react";
import {validClipSourceType} from "@/lib/clip-media";
import "./youtube-genjutsu.css";

type Props={onPrepared:(videoUrl:string,seconds:number,proof:string)=>void;onSourceChange:()=>void;onProcessing:(active:boolean)=>void;minSeconds?:number};
/** Locally owned media only. YouTube has no supported direct MP4 download API for this workflow. */
export function YouTubeGenjutsuSource({onPrepared,onSourceChange,onProcessing,minSeconds=1}:Props){
 const [from,setFrom]=useState(0);
 const [to,setTo]=useState(8);
 const [file,setFile]=useState<File|null>(null);
 const [rights,setRights]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [localPreview,setLocalPreview]=useState("");
 const videoRef=useRef<HTMLVideoElement>(null);
 const seconds=to-from;
 const validTimes=Number.isFinite(from)&&Number.isFinite(to)&&from>=0&&to<=3600&&seconds>=minSeconds&&seconds<=30;
 useEffect(()=>{onProcessing(busy);},[busy,onProcessing]);
 useEffect(()=>{
  if(!file){setLocalPreview("");return;}
  const src=URL.createObjectURL(file);setLocalPreview(src);
  return()=>URL.revokeObjectURL(src);
 },[file]);
 function resetPrepared(){onSourceChange();setMessage("");}
 function updateFile(candidate:File|null){
  resetPrepared();
  if(candidate&&!validClipSourceType(candidate.name,candidate.type)){
   setFile(null);setMessage("MP4, MOV эсвэл M4V файл сонгоно уу.");return;
  }
  if(candidate&&candidate.size>80*1024*1024){
   setFile(null);setMessage("Видео 80 MB-аас бага байх шаардлагатай.");return;
  }
  setFile(candidate);
  setFrom(0);setTo(8);
 }
 function previewLocal(){
  if(!videoRef.current||!validTimes)return;
  videoRef.current.currentTime=from;void videoRef.current.play().catch(()=>setMessage("Видео тоглуулах боломжгүй."));
 }
 async function action(endpoint:"/api/clips/export"|"/api/clips/prepare"){
  if(busy||!file||!rights||!validTimes)return;
  setBusy(true);setMessage("Видеоны сонгосон хэсгийг боловсруулж байна…");
  try{
   const body=new FormData();body.append("file",file);body.append("start",String(from));body.append("end",String(to));body.append("confirmRights","true");
   const response=await fetch(endpoint,{method:"POST",body,credentials:"same-origin"});
   if(!response.ok){const d=await response.json().catch(()=>({error:"Видео боловсруулах боломжгүй."}));throw new Error(d.error||"Клип боловсруулах боломжгүй.");}
   if(endpoint==="/api/clips/export"){
    if(!response.headers.get("content-type")?.includes("video/mp4"))throw new Error("MP4 файл ирсэнгүй.");
    const data=await response.blob();if(data.size<1024)throw new Error("Бэлэн клипийн хэмжээ буруу байна.");
    const url=URL.createObjectURL(data),a=document.createElement("a");
    a.href=url;a.download="rainy-clip-"+Math.floor(from)+"-"+Math.ceil(to)+".mp4";
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
    setMessage("Бэлэн! MP4 клип татагдлаа.");
   }else{
    const result=await response.json();
    if(typeof result.videoUrl!=="string"||typeof result.clipToken!=="string"||typeof result.duration!=="number")throw Error("Клипийн мэдээлэл буруу.");
    onPrepared(result.videoUrl,result.duration,result.clipToken);
    setMessage("Бэлэн! Genjutsu-д ашиглах клип сервер дээр бэлтгэгдлээ.");
   }
  }catch(e){setMessage(e instanceof Error?e.message:"Алдаа гарлаа.");}
  finally{setBusy(false);}
 }
 return <section className="ytGenjutsu" aria-label="Genjutsu эх видео бэлтгэх">
  <div className="ytGenjutsuHeading"><span><Clapperboard size={20}/></span><div><b>Genjutsu · Эх видеогоор бүтээх</b><small>Өөрийн MP4 / iPhone MOV видеог тайрч, хөдөлгөөн шилжүүлэхэд бэлтгэнэ</small></div></div>
  <div className="ytGenjutsuInputs">
   <div className="ytGenjutsuNotice"><ShieldCheck size={19}/><p>Зөвхөн өөрийн эсвэл ашиглах зөвшөөрөлтэй эх видеог оруулна. YouTube холбоосоос MP4 татах баталгаагүй функцийг хассан.</p></div>
   <label className="ytGenjutsuUpload"><span>1 · Эх MP4 / MOV / M4V файл (80 MB хүртэл)</span>
    <input type="file" accept=".mp4,.mov,.m4v,video/mp4,video/quicktime,video/x-m4v" onChange={e=>updateFile(e.target.files?.[0]||null)}/>
    <small><Upload size={14}/>{file?file.name:"Эх видео сонгох"}</small>
   </label>
   <div className="ytGenjutsuTime">
    <label><span>Эхлэх (сек)</span><input type="number" inputMode="decimal" min="0" step=".1" value={from} onChange={e=>{setFrom(Number(e.target.value));resetPrepared();}}/></label>
    <label><span>Дуусах (сек)</span><input type="number" inputMode="decimal" min="0" step=".1" value={to} onChange={e=>{setTo(Number(e.target.value));resetPrepared();}}/></label>
    <div className="ytGenjutsuDuration"><small>Клип</small><b>{Number.isFinite(seconds)?seconds.toFixed(1):"–"} сек</b></div>
   </div>
   {!validTimes&&<p className="ytGenjutsuHint" role="alert">{minSeconds}–30 секундийн хэсэг сонгоно уу.</p>}
   {localPreview&&<div className="ytGenjutsuLocal"><video ref={videoRef} src={localPreview} controls playsInline preload="metadata" onTimeUpdate={e=>{const video=e.currentTarget;if(video.currentTime>=to&&!video.paused)video.pause();}}/><button className="ghost" type="button" disabled={!validTimes} onClick={previewLocal}><Play size={14}/> Сонгосон хэсгийг үзэх</button></div>}
   <label className="ytGenjutsuConsent"><input type="checkbox" checked={rights} onChange={e=>{setRights(e.target.checked);resetPrepared();}}/><span>Энэ видеог боловсруулах, өөрчлөх эрх надад бий.</span></label>
   <div className="ytClipOutputActions">
    <button type="button" className="ytGenjutsuProcess" disabled={!file||!rights||!validTimes||busy} onClick={()=>void action("/api/clips/export")}>{busy?<LoaderCircle size={16} className="spin"/>:<Scissors size={16}/>} MP4 тайрч татах</button>
    <button type="button" className="ytClipToGenjutsu" disabled={!file||!rights||!validTimes||busy} onClick={()=>void action("/api/clips/prepare")}>{busy?<LoaderCircle size={16} className="spin"/>:<Clapperboard size={16}/>} Genjutsu-д бэлтгэх</button>
   </div>
   {message&&<p className="ytGenjutsuMessage" role="status">{message.startsWith("Бэлэн")?<CheckCircle2 size={16}/>:<Film size={16}/>} {message}</p>}
   <p className="ytGenjutsuFootnote"><Film size={13}/> MP4 тайрахад кредит суутгахгүй; Genjutsu үүсгэлтийн үнэ тусдаа тооцогдоно.</p>
  </div>
 </section>;
}
