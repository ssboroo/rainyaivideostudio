"use client";
import { useEffect,useState } from "react";
import { useRouter,useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Check,LoaderCircle,ExternalLink,RefreshCw } from "lucide-react";
type Pack={id:string;name:string;priceMnt:number;credits:number;popular?:boolean};
export function BillingClient(){
  const router=useRouter(),params=useSearchParams();
  const[packs,setPacks]=useState<Pack[]>([]),[busy,setBusy]=useState(""),[error,setError]=useState(""),[notice,setNotice]=useState(""),[checking,setChecking]=useState(false);
  const returnedPaymentId=params.get("paymentId");
  useEffect(()=>{fetch("/api/billing/packages").then(r=>r.json()).then(d=>setPacks(d.packages||[]))},[]);
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
    <div className="sectionHead"><div><small>RAVS WALLET</small><h1>Бүтээлээ зогсолтгүй үргэлжлүүл</h1><p>₮-өөр Wire.mn hosted checkout ашиглан төлөөд credit wallet-д автоматаар нэмэгдэнэ.</p></div></div>
    {notice&&<div className="statusMsg center">{notice}</div>}{error&&<div className="formError center">{error}</div>}
    {returnedPaymentId&&<div style={{display:"flex",justifyContent:"center",margin:"12px 0 22px"}}><button className="ghost" disabled={checking} onClick={()=>check()}>{checking?<LoaderCircle className="spin" size={15}/>:<RefreshCw size={15}/>} Төлбөрийн төлөв шалгах</button></div>}
    <div className="pricingGrid">{packs.map(p=><article className={p.popular?"priceCard popular":"priceCard"} key={p.id}>{p.popular&&<span className="popularBadge">Хамгийн их сонголт</span>}<h3>{p.name}</h3><div className="bigPrice">{p.priceMnt.toLocaleString()}₮</div><strong>{p.credits.toLocaleString()} credit</strong><ul><li><Check size={14}/>Бүх AI model</li><li><Check size={14}/>Video / Image / Workflow</li><li><Check size={14}/>Хугацаагүй credit</li><li><Check size={14}/>Wire.mn баталгаатай checkout</li></ul><button className="primary wide" disabled={!!busy} onClick={()=>buy(p.id)}>{busy===p.id?<LoaderCircle className="spin"/>:<><ExternalLink size={15}/> Wire.mn-аар төлөх</>}</button></article>)}</div>
  </section></section></main>
}
