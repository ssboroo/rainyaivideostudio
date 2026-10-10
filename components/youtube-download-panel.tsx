"use client";
import {useEffect,useRef,useState} from "react";
import {ArrowDownToLine,ArrowUpRight,CheckCircle2,ExternalLink,Film,LoaderCircle,Play,Scissors,ShieldCheck,Youtube} from "lucide-react";
import {parseYouTubeVideo,youtubeClipEmbed} from "@/lib/youtube-clip";
export function YoutubeDownloadPanel(){
 const [source,setSource]=useState("");
 const [begin,setBegin]=useState(0);
 const [end,setEnd]=useState(10);
 const [play,setPlay]=useState(false);
 const [version,setVersion]=useState(0);
 const [owned,setOwned]=useState(false);
 const [file,setFile]=useState<File|null>(null);
 const [busy,setBusy]=useState(false);
 const [feedback,setFeedback]=useState("");
 const [preview,setPreview]=useState("");
 const input=useRef<HTMLInputElement>(null);
 const localVideo=useRef<HTMLVideoElement>(null);
 const video=parseYouTubeVideo(source);
 const valid=Number.isFinite(begin)&&Number.isFinite(end)&&begin>=0&&end-begin>=1&&end-begin<=30&&end<=3600;
 useEffect(()=>{
  if(!file){setPreview("");return;}
  const url=URL.createObjectURL(file);
  setPreview(url);
  return()=>URL.revokeObjectURL(url);
 },[file]);
 function setYouTubeLink(value:string){
  setSource(value);
  const parsed=parseYouTubeVideo(value);
  if(parsed){setBegin(Math.min(parsed.start,3570));setEnd(Math.min(parsed.start,3570)+10);}
  setPlay(false);setFeedback("");
 }
 async function download(){
  if(!valid||!file||!owned||busy)return;
  setBusy(true);setFeedback("MP4 клипийг дууны хамт тайрч байна…");
  try{
   const body=new FormData();
   body.set("file",file);body.set("start",String(begin));body.set("end",String(end));body.set("confirmRights","true");
   const response=await fetch("/api/clips/export",{method:"POST",credentials:"same-origin",body});
   if(!response.ok){
    const result=await response.json().catch(()=>({error:"MP4 татаж чадсангүй."}));
    throw new Error(result.error||"MP4 бэлтгэж чадсангүй.");
   }
   if(!response.headers.get("content-type")?.includes("video/mp4"))throw new Error("Серверээс зөв MP4 файл ирсэнгүй.");
   const blob=await response.blob();
   if(blob.size<1024)throw new Error("Клипийн файл буруу байна.");
   const url=URL.createObjectURL(blob);
   const el=document.createElement("a");el.href=url;el.download="rainy-clip-"+Math.floor(begin)+"-"+Math.ceil(end)+".mp4";
   document.body.appendChild(el);el.click();el.remove();
   setTimeout(()=>URL.revokeObjectURL(url),30000);
   setFeedback("MP4 файл бэлэн болж татагдлаа.");
  }catch(error){setFeedback(error instanceof Error?error.message:"MP4 татахад алдаа гарлаа.");}
  finally{setBusy(false);}
 }
 function previewOriginal(){
  if(!localVideo.current||!valid)return;
  localVideo.current.currentTime=begin;
  void localVideo.current.play().catch(()=>setFeedback("Эх видеог тоглуулж чадсангүй."));
 }
 return <div className="ytDownload">
  <div className="ytDownloadHero">
   <div className="ytDownloadLabel"><Youtube size={17}/> YOUTUBE VIDEO / MP4</div>
   <h1>Бичлэгээ үз.<br/><em>MP4-гээ тат.</em></h1>
   <p>Өөрийн YouTube бичлэгийн холбоосыг үзээд хэрэгтэй хэсгээ сонго. YouTube Studio-оос эх видеогоо татсаны дараа RAINY дээр 1–30 секундын MP4 клип болгон экспортол.</p>
  </div>
  <div className="ytDownloadSteps">
   <section className="ytDownloadCard">
    <div className="ytDownloadStepTitle"><span>01</span><div><h2>YouTube холбоос</h2><p>Видео сайт дотроо тоглоно. YouTube-ээс MP4 файл шууд татахгүй.</p></div></div>
    <label className="ytDownloadField"><span>YouTube видео URL</span>
     <input type="url" autoComplete="url" placeholder="https://www.youtube.com/watch?v=..." value={source} onChange={e=>setYouTubeLink(e.target.value)}/>
    </label>
    {source&&!video&&<p className="ytDownloadError" role="alert">YouTube-ийн хүчинтэй холбоос оруулна уу.</p>}
    {video&&valid&&<div className="ytDownloadPlayer">
      {play?<iframe key={video.id+"-"+version} title="YouTube сонгосон видео хэсэг" src={youtubeClipEmbed(video.id,begin,end)} referrerPolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>:
       <button className="ytDownloadPlayCover" type="button" onClick={()=>setPlay(true)}><Play size={28}/><span>Сонгосон хэсгийг үзэх</span></button>}
      <button type="button" className="ytDownloadGhost" onClick={()=>{setPlay(true);setVersion(x=>x+1);}}><Play size={14}/> Дахин эхлүүлэх</button>
    </div>}
    <div className="ytDownloadTwo">
      <label className="ytDownloadField"><span>Эхлэх секунд</span><input type="number" min="0" max="3600" step=".1" value={begin} onChange={e=>{setBegin(Number(e.target.value));setPlay(false);}}/></label>
      <label className="ytDownloadField"><span>Дуусах секунд</span><input type="number" min="0" max="3600" step=".1" value={end} onChange={e=>{setEnd(Number(e.target.value));setPlay(false);}}/></label>
    </div>
    {!valid&&<p className="ytDownloadError">1–30 секундийн клип сонгоно уу.</p>}
    <p className="ytDownloadFoot">Энэ тоглуулагч нь YouTube-ийн албан embed. Үзүүлсэн клип нь татсан MP4 файл биш.</p>
   </section>
   <section className="ytDownloadCard">
    <div className="ytDownloadStepTitle"><span>02</span><div><h2>Өөрийн эх MP4-г авах</h2><p>Өөрийн сувагт байршуулсан видеог YouTube Studio-оос татна.</p></div></div>
    <div className="ytDownloadOfficial">
     <ShieldCheck size={24}/><p>YouTube-ийн албан ёсны арга: <b>YouTube Studio → Content → ⋮ → Download</b>. Эсвэл өөрт байгаа эх MP4-г шууд ашигла.</p>
     <a href="https://studio.youtube.com/" target="_blank" rel="noopener noreferrer">YouTube Studio нээх <ArrowUpRight size={16}/></a>
    </div>
    <p className="ytDownloadFoot">Бусдын бичлэгийг YouTube холбоосоор автоматаар татах албан ёсны API байхгүй. Эрхгүй бичлэг татах, хуулах үйлчилгээ санал болгохгүй.</p>
    <label className="ytDownloadUpload">
      <span><Film size={18}/> Эх MP4-гээ оруулах</span>
      <input ref={input} type="file" accept="video/mp4" onChange={e=>{setFile(e.target.files?.[0]||null);setFeedback("");}}/>
      <small>{file?file.name:"80 MB хүртэлх файл сонгоно уу"}</small>
    </label>
    {preview&&<div className="ytDownloadLocalPreview">
      <video ref={localVideo} src={preview} controls playsInline preload="metadata" onTimeUpdate={e=>{if(e.currentTarget.currentTime>=end&&!e.currentTarget.paused)e.currentTarget.pause();}}/>
      <button type="button" className="ytDownloadGhost" disabled={!valid} onClick={previewOriginal}><Play size={14}/> Сонгосон хэсгийг үзэх</button>
    </div>}
   </section>
   <section className="ytDownloadCard ytDownloadExport">
    <div className="ytDownloadStepTitle"><span>03</span><div><h2>MP4 клип татах</h2><p>FFmpeg-ээр 1–30 секундын хэсгийг дууны хамт тасалж бэлтгэнэ.</p></div></div>
    <div className="ytDownloadSummary"><span>Сонгосон хугацаа</span><strong>{valid?(end-begin).toFixed(1)+" секунд":"—"}</strong></div>
    <label className="ytDownloadConsent"><input type="checkbox" checked={owned} onChange={e=>setOwned(e.target.checked)}/><span>Энэ видеог засварлах болон татаж ашиглах эрхтэй гэдгээ баталгаажуулж байна.</span></label>
    <button type="button" className="ytDownloadButton" disabled={busy||!file||!valid||!owned} onClick={()=>void download()}>
      {busy?<LoaderCircle size={17}/>:<ArrowDownToLine size={18}/>} {busy?"Клип боловсруулж байна…":"MP4 клип татах"}
    </button>
    {feedback&&<p className="ytDownloadFeedback" role="status"><CheckCircle2 size={15}/>{feedback}</p>}
    <p className="ytDownloadFoot">MP4 экспорт хийхэд AI кредит зарцуулахгүй. Genjutsu эсвэл AI генерац эхлэхгүй.</p>
   </section>
  </div>
 </div>;
}
