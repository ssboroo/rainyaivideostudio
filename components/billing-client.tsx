"use client";
import { useEffect,useState } from "react";
import { useRouter,useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Check,LoaderCircle,ExternalLink,RefreshCw } from "lucide-react";
import { quoteApiCredits } from "@/lib/api-pricing";
const economyVideoCredits=quoteApiCredits("minimax/hailuo-2.3/standard/text-to-video",{duration:6});
type Pack={id:string;name:string;priceMnt:number;credits:number;popular?:boolean};
export function BillingClient(){
  const router=useRouter(),params=useSearchParams();
  const[packs,setPacks]=useState<Pack[]>([]),[busy,setBusy]=useState(""),[error,setError]=useState(""),[notice,setNotice]=useState(""),[checking,setChecking]=useState(false);
  const [loading,setLoading]=useState(true),[available,setAvailable]=useState(false);
  const [grants,setGrants]=useState<Array<{id:string;remaining:number;expiresAt:string}>>([]);
  useEffect(()=>{let alive=true;fetch("/api/billing/balance",{cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(alive)setGrants(d?.grants||[]);}).catch(()=>{});return()=>{alive=false;};},[]);
  const returnedPaymentId=params.get("paymentId");
  useEffect(()=>{let alive=true;Promise.all([fetch("/api/billing/packages").then(async r=>{if(!r.ok)throw new Error("Багц ачаалж чадсангүй.");return r.json();}),fetch("/api/health").then(r=>r.json())]).then(([d,h])=>{if(alive){setPacks(d.packages||[]);setAvailable(Boolean(h?.configuration?.wire));}}).catch(()=>{if(alive)setError("Кредитийн багцыг ачаалж чадсангүй. Хуудсаа дахин нээнэ үү.");}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};},[]);
  useEffect(()=>{if(params.get("payment")==="success"&&returnedPaymentId)check(returnedPaymentId,true)},[returnedPaymentId]);
  async function buy(id:string){
    setBusy(id);setError("");setNotice("");
    try{
      const r=await fetch("/api/billing/wire/create",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({packageId:id})});
      const d=await r.json();if(r.status===401){router.push("/login");return}if(!r.ok)throw new Error(d.error||"Wire.mn төлбөр үүсгэж чадсангүй.");
      if(d.paid){setNotice("Төлбөр аль хэдийн баталгаажсан. Credit wallet-д нэмэгдлээ.");return}
      if(!d.payUrl)throw new Error("Wire.mn checkout URL буцаасангүй.");
      window.location.assign(d.payUrl);
    }catch(e){setError(e instanceof Error?e.message:"Алдаа гарлаа.")}finally{setBusy("")}
  }
  async function check(id=returnedPaymentId||"",auto=false){
    if(!id)return;setChecking(true);setError("");
    try{
      const r=await fetch(`/api/billing/wire/status?paymentId=${encodeURIComponent(id)}`,{cache:"no-store"});
      const d=await r.json();if(!r.ok)throw new Error(d.error||"Төлөв шалгаж чадсангүй.");
      if(d.status==="PAID"){setNotice(`Төлбөр амжилттай. Таны wallet: ${Number(d.credits||0).toLocaleString()} credit`);router.replace("/billing")}
      else if(d.status==="FAILED"||d.status==="CANCELED")setError("Төлбөр амжилтгүй эсвэл цуцлагдсан байна.");
      else{setNotice("Төлбөр Wire.mn дээр боловсруулагдаж байна. Төлсний дараа дахин шалгана уу.");if(auto)setTimeout(()=>check(id,false),2500)}
    }catch(e){setError(e instanceof Error?e.message:"Алдаа гарлаа.")}finally{setChecking(false)}
  }
  return <main className="shell"><Sidebar/><section className="content"><header className="topbar"><div><b>Credit авах</b><span>Wire.mn secure hosted checkout</span></div></header><section className="billingPage">
    <div className="sectionHead"><div><small>RAVS WALLET</small><h1>Бүтээлээ зогсолтгүй үргэлжлүүл</h1><p>Төлбөр баталгаажсанаас хойш 1 сарын хугацаатай. Ашиглаагүй кредит хугацаа дуусахад хүчингүй болно. Сар бүр автоматаар төлбөр авахгүй.</p></div></div>
    {grants.length>0&&<div className="accountNotice"><div><b>Таны идэвхтэй багцууд</b>{grants.map(g=><p key={g.id}>{g.remaining.toLocaleString()} credit · Дуусах: {new Date(g.expiresAt).toLocaleString("mn-MN",{timeZone:"Asia/Ulaanbaatar"})}</p>)}</div></div>}
    {notice&&<div className="statusMsg center">{notice}</div>}{error&&<div className="formError center">{error}</div>}
    {returnedPaymentId&&<div style={{display:"flex",justifyContent:"center",margin:"12px 0 22px"}}><button className="ghost" disabled={checking} onClick={()=>check()}>{checking?<LoaderCircle className="spin" size={15}/>:<RefreshCw size={15}/>} Төлбөрийн төлөв шалгах</button></div>}
    {loading&&<div className="screenEmpty" role="status"><LoaderCircle className="spin"/><p>Кредитийн багц ачаалж байна…</p></div>}
    {!loading&&!available&&<div className="accountNotice"><RefreshCw size={20}/><div>Кредит худалдан авах үйлчилгээ бэлтгэгдэж байна. Төлбөр нээгдэх хүртэл жишээ, гарын авлага үзэж танилцаарай. <a href="/video-guide">Заавар үзэх →</a></div></div>}
    <div className="pricingGrid">{packs.map(p=><article className={p.popular?"priceCard popular":"priceCard"} key={p.id}>{p.popular&&<span className="popularBadge">Хамгийн их сонголт</span>}<h3>{p.name}</h3><div className="bigPrice">{p.priceMnt.toLocaleString()}₮ <small>/ 1 сар</small></div><strong>{p.credits.toLocaleString()} credit</strong><p>Hailuo 2.3 · 6 секундийн {Math.floor(p.credits/economyVideoCredits)} бичлэг хүртэл</p><small>Нэг бичлэг {economyVideoCredits} кредит. Бусад загвар, уртаас үнэ өөрчлөгдөнө.</small><ul><li><Check size={14}/>Үнэ баталгаажсан AI загварууд</li><li><Check size={14}/>Video / Image / Workflow</li><li><Check size={14}/>Төлбөрөөс хойш 1 сарын эрх</li><li><Check size={14}/>Үлдэгдэл дараагийн сар руу шилжихгүй</li></ul><button className="primary wide" disabled={!!busy||!available} onClick={()=>buy(p.id)}>{busy===p.id?<LoaderCircle className="spin"/>:<><ExternalLink size={15}/> {available?"Wire.mn-аар төлөх":"Төлбөр удахгүй нээгдэнэ"}</>}</button></article>)}</div>
  </section></section></main>
}
