"use client";
import {useEffect,useState} from "react";
import {ArrowDown,ArrowRight,SlidersHorizontal} from "lucide-react";
import Link from "next/link";
import "./economy-model-choices.css";

type Choice={slug:string;name:string;credits:number;duration:number;resolution:string;modelId:string};
export function EconomyModelChoices({modelSlug,currentCredits,duration,resolution,aspectRatio,generateAudio,prompt}:{
 modelSlug:string;currentCredits:number;duration:number;resolution:string;aspectRatio:string;generateAudio:boolean;prompt:string;
}){
 const[items,setItems]=useState<Choice[]>([]);
 const[loading,setLoading]=useState(false);
 const[error,setError]=useState("");
 const[open,setOpen]=useState(false);
 useEffect(()=>{
  if(!open)return;
  const controller=new AbortController();
  setLoading(true);setError("");setItems([]);
  const timer=setTimeout(async()=>{
   try{
    const res=await fetch("/api/pricing/economy",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({duration,resolution,aspectRatio,generateAudio,prompt}),cache:"no-store",signal:controller.signal});
    const data=await res.json();
    if(!res.ok)throw Error(typeof data.error==="string"?data.error:"Хямд хувилбарын үнэ түр боломжгүй.");
    if(!controller.signal.aborted)setItems(Array.isArray(data.items)?data.items:[]);
   }catch(error){if(!controller.signal.aborted)setError(error instanceof Error?error.message:"Хямд хувилбар шалгаж чадсангүй.");}
   finally{if(!controller.signal.aborted)setLoading(false);}
  },450);
  return()=>{controller.abort();clearTimeout(timer);};
 },[open,duration,resolution,aspectRatio,generateAudio,prompt]);
 const candidates=items.filter(item=>item.slug!==modelSlug);
 return <section className="ravsEconomy" aria-label="Хямд AI видео загварууд">
  <button type="button" className="ravsEconomyToggle" aria-expanded={open} onClick={()=>setOpen(v=>!v)}>
   <span><ArrowDown size={16}/> Кредит хэмнэх — ижил тохиргоотой загварууд</span><SlidersHorizontal size={16}/>
  </button>
  {open&&<div className="ravsEconomyContent">
   <p>Ижил хугацаа ({duration} сек), нягтаршил ({resolution}), харьцаа, дууны шаардлагатай өөр моделийн кредитийг харьцуулна. Үр дүнгийн чанар нь өөр байж болно.</p>
   {loading&&<p role="status">Баталгаажсан API үнийн хувилбаруудыг тооцож байна…</p>}
   {error&&<p role="status">{error}</p>}
   {!loading&&!error&&!candidates.length&&<p>Энэ тохиргоотой өөр баталгаатай үнэ олдсонгүй. Хугацаа эсвэл нягтаршлаа багасгаж дахин үзнэ үү.</p>}
   {!!candidates.length&&<div className="ravsEconomyCards">{candidates.map(item=><Link key={item.modelId} className="ravsEconomyChoice"
      href={"/studio?model="+encodeURIComponent(item.slug)+"&duration="+duration+"&resolution="+encodeURIComponent(resolution)+"&aspect="+encodeURIComponent(aspectRatio)}>
     <span><b>{item.name}</b><small>{item.duration} сек · {item.resolution}{currentCredits>item.credits?" · "+Math.round((1-item.credits/currentCredits)*100)+"% бага кредит":""}</small></span>
     <strong>{item.credits.toLocaleString("mn-MN")} <small>кредит</small></strong>
     <ArrowRight size={15}/>
    </Link>)}</div>}
   <small>Харьцуулалт нь зөвхөн API-ийн одоогийн тооцоо; генерац эхлэх үед эцсийн үнийг сервер дахин батална. Төлбөргүй харьцуулалт.</small>
  </div>}
 </section>;
}
