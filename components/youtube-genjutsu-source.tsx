"use client";
import {useEffect,useRef,useState} from "react";
import {CheckCircle2,Clapperboard,ClipboardCopy,ExternalLink,Film,LoaderCircle,Play,Scissors,ShieldCheck,Upload, Youtube} from "lucide-react";
import {useSearchParams} from "next/navigation";
import {parseYouTubeVideo,youtubeClipEmbed,youtubeClipSharePath} from "@/lib/youtube-clip";
import "./youtube-genjutsu.css";

type Props={onPrepared:(videoUrl:string,seconds:number,proof:string)=>void;onSourceChange:()=>void;onProcessing:(active:boolean)=>void};
export function YouTubeGenjutsuSource({onPrepared,onSourceChange,onProcessing}:Props){
 const params=useSearchParams();
 const initialId=params.get("youtube")||"";
 const initialStart=Number(params.get("start")||"0");
 const initialEnd=Number(params.get("end")||"8");
 const safeInitial= /^[A-Za-z0-9_-]{11}$/.test(initialId)&&Number.isFinite(initialStart)&&Number.isFinite(initialEnd)
  &&initialStart>=0&&initialEnd<=86400&&initialEnd-initialStart>=1&&initialEnd-initialStart<=30;
 const [link,setLink]=useState(safeInitial?"https://www.youtube.com/watch?v="+initialId:"");
 const [from,setFrom]=useState(safeInitial?initialStart:0);
 const [to,setTo]=useState(safeInitial?initialEnd:8);
 const [file,setFile]=useState<File|null>(null);
 const [rights,setRights]=useState(false);
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [loaded,setLoaded]=useState(safeInitial);
 const [copied,setCopied]=useState(false);
 const [embedRevision,setEmbedRevision]=useState(0);
 const [localPreview,setLocalPreview]=useState("");
 const fileRef=useRef<HTMLInputElement>(null);
 const videoRef=useRef<HTMLVideoElement>(null);
 const youtube=parseYouTubeVideo(link);
 const seconds=to-from;
 const validTimes=Number.isFinite(from)&&Number.isFinite(to)&&from>=0&&to<=86400&&seconds>=1&&seconds<=30;
 const previewSharePath=youtube&&validTimes?youtubeClipSharePath(youtube.id,from,to):"";
 useEffect(()=>{
  if(!file){setLocalPreview("");return;}
  const src=URL.createObjectURL(file);setLocalPreview(src);
  return()=>URL.revokeObjectURL(src);
 },[file]);
 useEffect(()=>{onProcessing(busy)},[busy,onProcessing]);
 function resetPrepared(){onSourceChange();setMessage("");setCopied(false);}
 function previewYoutube(){if(!youtube||!validTimes)return;setLoaded(true);setCopied(false);setEmbedRevision(n=>n+1);}
 async function copyPreview(){
  if(!previewSharePath)return;
  try{await navigator.clipboard.writeText(window.location.origin+previewSharePath);setCopied(true);}
  catch{setMessage("Холбоосыг хуулах боломжгүй. Доорх «Бэлдсэн хэсгийг нээх» товчийг ашиглана уу.");}
 }
 function previewLocal(){
  const v=videoRef.current;if(!v||!validTimes)return;
  v.currentTime=from;void v.play().catch(()=>setMessage("Видео үзүүлэх боломжгүй."));
 }
 function updateFile(candidate:File|null){
  resetPrepared();
  setFile(candidate);
 }
 async function prepare(){
  if(busy||!file||!rights||!validTimes)return;
  setBusy(true);setMessage("Эх файлын сонгосон хэсгийг тайрч, Genjutsu-д бэлтгэж байна…");
  try{
   const body=new FormData();
   body.append("file",file);body.append("start",String(from));body.append("end",String(to));body.append("confirmRights","true");
   const response=await fetch("/api/clips/prepare",{method:"POST",body,credentials:"same-origin"});
   const result=await response.json();
   if(!response.ok)throw new Error(result.error||"Клип бэлтгэж чадсангүй.");
   if(typeof result.videoUrl!=="string"||typeof result.clipToken!=="string"||typeof result.duration!=="number")throw new Error("Бэлэн клипийн мэдээлэл буруу байна.");
   onPrepared(result.videoUrl,result.duration,result.clipToken);
   setMessage("Бэлэн! Хөдөлгөөн шилжүүлэх жишиг зураг, prompt-оо нэмээд зардлаа шалгаж үүсгэнэ.");
  }catch(e){setMessage(e instanceof Error?e.message:"Клипийн боловсруулалт амжилтгүй.");}
  finally{setBusy(false);}
 }
 return <section className="ytGenjutsu" aria-label="YouTube видеоноос Genjutsu клип бэлтгэх">
  <div className="ytGenjutsuHeading"><span><Youtube size={20}/></span><div><b>YouTube → Genjutsu</b><small>Холбоосоор үзэх · 1–30 сек сонгох · өөрийн MP4-г тайрах</small></div></div>
  <div className="ytGenjutsuInputs">
   <label><span>1 · YouTube холбоос (хэсэг сонгож үзэх)</span><input type="url" value={link} placeholder="https://www.youtube.com/watch?v=..." onChange={e=>{
    const value=e.target.value;
    const parsed=parseYouTubeVideo(value);
    setLink(value);setLoaded(false);resetPrepared();
    if(parsed){setFrom(parsed.start);setTo(parsed.start+8);}
   }}/></label>
   {link&&!youtube&&<p className="ytGenjutsuHint" role="status">YouTube-ийн watch, youtu.be, shorts эсвэл live холбоос оруулна уу.</p>}
   <div className="ytGenjutsuTime">
    <label><span>Эхлэх (сек)</span><input type="number" inputMode="decimal" min="0" step=".1" value={from} onChange={e=>{setFrom(Number(e.target.value));setLoaded(false);resetPrepared();}}/></label>
    <label><span>Дуусах (сек)</span><input type="number" inputMode="decimal" min="0" step=".1" value={to} onChange={e=>{setTo(Number(e.target.value));setLoaded(false);resetPrepared();}}/></label>
    <div className="ytGenjutsuDuration"><small>Сонгосон клип</small><b>{Number.isFinite(seconds)?seconds.toFixed(1):"–"} сек</b></div>
   </div>
   {!validTimes&&<p className="ytGenjutsuHint" role="alert">1–30 секундийн хэсэг сонгоно уу.</p>}
   {youtube&&<div className="ytGenjutsuPreview">
    {loaded&&validTimes?<iframe key={youtube.id+"-"+embedRevision} title="YouTube клипийн урьдчилсан үзлэг" src={youtubeClipEmbed(youtube.id,from,to)} allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen referrerPolicy="strict-origin-when-cross-origin"/>:
    <div className="ytGenjutsuPlaceholder"><Youtube size={34}/><p>YouTube дээрээс хэрэгтэй 1–30 секундийг шууд сонгоод үзнэ.</p><button type="button" className="ghost" disabled={!validTimes} onClick={previewYoutube}><Play size={14}/> Сонгосон хэсгийг бэлтгэж үзэх</button></div>}
    {loaded&&validTimes&&<div className="ytClipShareActions">
      <button type="button" className="ghost" onClick={previewYoutube}><Play size={13}/> Хэсгийг дахин тоглуулах</button>
      <a className="ytClipShareLink" href={previewSharePath} target="_blank" rel="noopener noreferrer"><ExternalLink size={14}/> Бэлдсэн үзэх клипийг нээх</a>
      <button type="button" className="ghost" onClick={()=>void copyPreview()}><ClipboardCopy size={13}/> {copied?"Холбоос хуулсан":"Клипийн холбоос хуулах"}</button>
    </div>}
    {loaded&&validTimes&&<p className="ytClipPreviewDisclaimer" role="status">YouTube-ийн сонгосон хэсгийн тоглуулах холбоос бэлэн. <b>MP4 видео файл үүсээгүй.</b> Genjutsu-д зориулсан жинхэнэ клипийг дараах алхмаар бэлтгэнэ.</p>}
    <a href={"https://www.youtube.com/watch?v="+youtube.id} target="_blank" rel="noopener noreferrer" className="ytGenjutsuSource">YouTube эх сурвалж <ExternalLink size={12}/></a>
   </div>}
   <div className="ytGenjutsuNotice"><ShieldCheck size={19}/><p>YouTube холбоосоор <b>хэсэгчилсэн preview клип</b> тоглуулж, холбоосоор хуваалцаж болно. YouTube видеог MP4 болгон шууд татах албан API байхгүй. Genjutsu-д бодит клип хэрэгтэй тул зөвшөөрөлтэй эх файлыг доор оруулна. <a href="https://support.google.com/youtube/answer/56100" target="_blank" rel="noopener noreferrer">Өөрийн YouTube бичлэгийг татах албан заавар ↗</a></p></div>
   <label className="ytGenjutsuUpload"><span>2 · Genjutsu-д ашиглах эх MP4 файл (80MB хүртэл)</span><input ref={fileRef} type="file" accept="video/mp4" onChange={e=>updateFile(e.target.files?.[0]||null)}/><small><Upload size={14}/> {file?file.name:"Эх видео сонгох"}</small></label>
   {localPreview&&<div className="ytGenjutsuLocal"><video ref={videoRef} src={localPreview} controls playsInline preload="metadata" onTimeUpdate={e=>{const v=e.currentTarget;if(v.currentTime>=to&&!v.paused)v.pause();}}/><button type="button" className="ghost" onClick={previewLocal} disabled={!validTimes}><Play size={13}/> Эх файлын сонгосон хэсэг</button></div>}
   <label className="ytGenjutsuConsent"><input type="checkbox" checked={rights} onChange={e=>{setRights(e.target.checked);resetPrepared();}}/><span>Энэ файлыг боловсруулах болон өөрчилсөн хувилбар бүтээх эрх надад бий.</span></label>
   <button type="button" className="ytGenjutsuProcess" disabled={!file||!rights||!validTimes||busy} onClick={()=>void prepare()}>
    {busy?<LoaderCircle size={16} className="spin"/>:<Scissors size={16}/>} {busy?"Клип бэлтгэж байна…":"3 · Клип тайрч Genjutsu-д бэлтгэх"}
   </button>
   {message&&<p className="ytGenjutsuMessage" role="status">{message.includes("Бэлэн!")?<CheckCircle2 size={16}/>:<Clapperboard size={15}/>} {message}</p>}
   <p className="ytGenjutsuFootnote"><Film size={13}/> Клип бэлтгэхэд AI кредит зарцуулахгүй. Genjutsu-ийн үнийг дараа нь бодит клипийн хугацаанд үндэслэн үзүүлнэ.</p>
  </div>
 </section>;
}
