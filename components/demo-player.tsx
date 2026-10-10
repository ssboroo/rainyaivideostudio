"use client";
import { useEffect, useRef, useState } from "react";
import { RotateCcw, Video, LoaderCircle } from "lucide-react";
export function DemoPlayer({ source, src, poster, title }: { source: string; src?: string; poster?: string; title: string }) {
 const [ratio,setRatio]=useState("16 / 9");
 const viewportRef=useRef<HTMLDivElement>(null);
 const [active,setActive]=useState(false);
 useEffect(()=>{
  const target=viewportRef.current;
  if(!target||typeof IntersectionObserver==="undefined"){setActive(true);return;}
  const observer=new IntersectionObserver(([entry])=>{if(entry.isIntersecting){setActive(true);observer.disconnect();}}, {rootMargin:"450px"});
  observer.observe(target);
  return()=>observer.disconnect();
 },[]);
 const [url, setUrl] = useState(src || ""); const [image, setImage] = useState(poster || ""); const [state, setState] = useState<"loading"|"ready"|"error">("loading"); const [retry, setRetry] = useState(0); const ref=useRef<HTMLVideoElement>(null);
 useEffect(()=>{ if(!active)return;let alive=true; if(src) {setUrl(src);return;} const abort=new AbortController(); setState("loading");fetch('/api/community/meta?url='+encodeURIComponent(source),{signal:abort.signal}).then(r=>r.ok?r.json():null).then(v=>{if(!alive)return;if(v?.image)setImage(v.image);if(v?.video){setUrl(v.video);}else setState("error");}).catch(()=>{if(alive)setState("error");});return()=>{alive=false;abort.abort();};},[source,src,retry,active]);
 return <div className="ravsDemoPlayer" ref={viewportRef} style={{aspectRatio:ratio}}>
 {active && url && state!=="error" ? <video key={url+retry} ref={ref} src={url} poster={image||undefined} controls playsInline preload="metadata" aria-label={title+" — жишээ видео"} onLoadedMetadata={(event)=>{const video=event.currentTarget;if(video.videoWidth&&video.videoHeight)setRatio(video.videoWidth+" / "+video.videoHeight);setState("ready");}} onError={()=>setState("error")} /> : image ? <img src={image} alt={title+" жишээ"} loading="lazy" /> : <div className="demoEmpty"><Video size={32}/></div>}
 {active && state==="loading" && <span className="demoLoading"><LoaderCircle size={15} className="spin"/> Жишээ ачаалж байна</span>}
 {state==="error" && <div className="demoError"><span>Жишээ видео одоогоор ачаалагдсангүй.</span><button type="button" onClick={()=>{setState("loading");setRetry(v=>v+1);}}><RotateCcw size={13}/> Дахин оролдох</button></div>}
 </div>;
}
