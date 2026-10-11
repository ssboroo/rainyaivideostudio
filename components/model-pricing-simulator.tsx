"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {Calculator,AlertTriangle,Coins,ArrowRight} from "lucide-react";

type Model={slug:string;name:string;provider:string;kind:string;apiVerified:boolean;resolutions:string[];aspectRatios:string[];minDuration:number|null;maxDuration:number|null};
type Quote={model:string;credits:number};
const number=(v:number)=>v.toLocaleString("mn-MN");
export function ModelPricingSimulator(){
 const [models,setModels]=useState<Model[]>([]);
 const [selected,setSelected]=useState("kling-3-standard");
 const [resolution,setResolution]=useState("720p"),[duration,setDuration]=useState(5),[ratio,setRatio]=useState("9:16"),[audio,setAudio]=useState(false);
 const [quote,setQuote]=useState<Quote|null>(null),[error,setError]=useState(""),[busy,setBusy]=useState(false);
 const model=models.find(m=>m.slug===selected);
 useEffect(()=>{let active=true;fetch("/api/billing/quote",{cache:"no-store"}).then(r=>r.json()).then(d=>{if(active&&Array.isArray(d.models))setModels(d.models)}).catch(()=>{if(active)setError("Модель ачаалж чадсангүй.")});return()=>{active=false}},[]);
 useEffect(()=>{
  if(!model)return;
  if(!model.resolutions.includes(resolution))setResolution(model.resolutions[0]||"720p");
  if(!model.aspectRatios.includes(ratio))setRatio(model.aspectRatios[0]||"16:9");
  if(model.minDuration&&duration<model.minDuration)setDuration(model.minDuration);
  if(model.maxDuration&&duration>model.maxDuration)setDuration(model.maxDuration);
 },[model?.slug]);
 useEffect(()=>{
  if(!model)return;
  const cancel=new AbortController();
  const timer=setTimeout(async()=>{
   setBusy(true);setQuote(null);setError("");
   const query=new URLSearchParams({modelSlug:selected,resolution,duration:String(duration),aspectRatio:ratio,audio:String(audio)});
   try{
    const res=await fetch("/api/billing/quote?"+query,{signal:cancel.signal,cache:"no-store"});
    const body=await res.json();
    if(!res.ok)throw Error(body.error||"Үнийн тохиргоо баталгаажаагүй");
    if(!cancel.signal.aborted)setQuote(body);
   }catch(e){if(!cancel.signal.aborted)setError(e instanceof Error?e.message:"Үнэ тооцоолж чадсангүй.");}
   finally{if(!cancel.signal.aborted)setBusy(false)}
  },300);
  return()=>{clearTimeout(timer);cancel.abort()};
 },[selected,resolution,duration,ratio,audio,model?.slug]);
 return <section className="subscriptionCalculator" aria-label="Моделийн кредит тооцоолуур">
  <header><Calculator size={21}/><div><h2>Модель бүрийн кредит тооцоолуур</h2><p>Үүсгэх загвар, нягтаршил, хугацаагаар шаардлагатай кредитийг урьдчилан тооцно.</p></div></header>
  <div className="subscriptionCalcGrid">
   <label><span>AI модель</span><select value={selected} onChange={e=>setSelected(e.target.value)}>{models.map(m=><option key={m.slug} value={m.slug}>{m.name}{m.apiVerified?"":" · API шалгаж байна"}</option>)}</select></label>
   <label><span>Resolution</span><select value={resolution} onChange={e=>setResolution(e.target.value)}>{(model?.resolutions||["720p"]).map(x=><option key={x} value={x}>{x}</option>)}</select></label>
   {model?.kind!=="image"&&<label><span>Секунд</span><input type="number" min={model?.minDuration||1} max={model?.maxDuration||30} value={duration} onChange={e=>setDuration(Math.min(30,Math.max(1,Number(e.target.value)||1)))}/></label>}
   <label><span>Харьцаа</span><select value={ratio} onChange={e=>setRatio(e.target.value)}>{(model?.aspectRatios||["9:16"]).map(x=><option key={x} value={x}>{x}</option>)}</select></label>
   {model?.kind!=="image"&&<label className="subscriptionAudio"><input type="checkbox" checked={audio} onChange={e=>setAudio(e.target.checked)}/><span>Аудио нэмэх (дэмжвэл)</span></label>}
  </div>
  <div className="subscriptionCalcResult" role="status" aria-live="polite">
   {busy?<p><Coins size={16}/> Үнийг шалгаж байна…</p>:quote?<><div className="subscriptionCalcBig"><span>Нэг генерацад</span><strong>{number(quote.credits)} <small>кредит</small></strong></div>
    <Link href={"/studio?model="+encodeURIComponent(selected)}>Studio-д бүтээх <ArrowRight size={15}/></Link></>:
    <p className="subscriptionCalcWarn"><AlertTriangle size={17}/>{error||"Сонголтоо хийнэ үү."}</p>}
  </div>
  <p className="subscriptionCalcDisclaimer">Энэ нь жишиг кредит юм. Үүсгэхээс өмнө таны сонгосон бүх тохиргоогоор сервер нийт кредитийг шалгана. Үнийн мэдээлэл баталгаажаагүй горимд генерац эхлэхгүй.</p>
 </section>;
}
