"use client";
import { useEffect,useState } from "react";
import { useRouter,useSearchParams } from "next/navigation";
import { Sidebar } from "@/components/sidebar";
import { Check,LoaderCircle,ExternalLink,RefreshCw, ShieldCheck, CircleDollarSign, Clock3, Ban } from "lucide-react";
import "./billing-pricing.css";
type VideoExample={modelSlug:string;name:string;duration:number;resolution:string;creditsPerVideo:number;approxVideos:number};
type Pack={id:string;name:string;priceMnt:number;credits:number;popular?:boolean;examples?:VideoExample[]};
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
  return <main className="shell"><Sidebar/><section className="content"><header className="topbar"><div><b>Сарын credit багц</b><span>Wire.mn • нэг удаагийн аюулгүй төлбөр</span></div></header><section className="billingPage">
    <div className="sectionHead"><div><small>RAVS WALLET · PREPAID MONTHLY</small><h1>Хэрэглэсэн хэмжээгээр төл. <em>Ил тод үнэ.</em></h1><p>Нэг удаа төлөөд хуанлийн 1 сар ашиглах видео бүтээх кредитийн багц. Бүх төрлийн модельд хугацаа, нягтаршил, тохиргооноос хамаарч өөр өөр кредит зарцуулна. Автомат renewal, нууц суутгал, «Unlimited» амлалт байхгүй.</p></div></div>
    <div className="planTrustStrip"><span><ShieldCheck size={17}/> Генерацын үнийг эхлээд харна</span><span><CircleDollarSign size={17}/> API загвар бүрийн бодит өртгөөр</span><span><Clock3 size={17}/> 1 сарын хугацаатай</span><span><Ban size={17}/> Автомат төлбөргүй</span></div>
    {grants.length>0&&<div className="accountNotice"><div><b>Таны идэвхтэй багцууд</b>{grants.map(g=><p key={g.id}>{g.remaining.toLocaleString()} credit · Дуусах: {new Date(g.expiresAt).toLocaleString("mn-MN",{timeZone:"Asia/Ulaanbaatar"})}</p>)}</div></div>}
    {notice&&<div className="statusMsg center">{notice}</div>}{error&&<div className="formError center">{error}</div>}
    {returnedPaymentId&&<div style={{display:"flex",justifyContent:"center",margin:"12px 0 22px"}}><button className="ghost" disabled={checking} onClick={()=>check()}>{checking?<LoaderCircle className="spin" size={15}/>:<RefreshCw size={15}/>} Төлбөрийн төлөв шалгах</button></div>}
    {loading&&<div className="screenEmpty" role="status"><LoaderCircle className="spin"/><p>Кредитийн багц ачаалж байна…</p></div>}
    {!loading&&!available&&<div className="accountNotice"><RefreshCw size={20}/><div>Кредит худалдан авах үйлчилгээ бэлтгэгдэж байна. Төлбөр нээгдэх хүртэл жишээ, гарын авлага үзэж танилцаарай. <a href="/video-guide">Заавар үзэх →</a></div></div>}
    <div className="pricingGrid revampedPlanGrid">{packs.map(p=><article className={p.popular?"priceCard popular":"priceCard"} key={p.id}>
     {p.popular&&<span className="popularBadge">Хамгийн тохиромжтой</span>}
     <div className="planCardIntro"><small>{p.id==="starter"?"ТУРШИХ, ТАНИЛЦАХ":p.id==="creator"?"КОНТЕНТ БҮТЭЭГЧ":p.id==="pro"?"ТОГТМОЛ БҮТЭЭЛ":p.id==="studio"?"СТУДИ, БАГ":p.id==="agency"?"АГЕНТЛАГ, БАГ":"САРЫН БАГЦ"}</small><h3>{p.name}</h3></div>
     <div className="bigPrice">{p.priceMnt.toLocaleString("mn-MN")}₮ <small>/ 1 сарын эрх</small></div>
     <strong className="planCreditCount">{p.credits.toLocaleString("mn-MN")} кредит</strong>
     <div className="planPerCredit">1 кредит ≈ {(p.priceMnt/p.credits).toFixed(2)}₮</div>
     <div className="videoCapacity" aria-label={p.name+" багцын видео бүтээх жишээ"}>
       <strong>Энэ багцаар хэдэн видео вэ?</strong>
       <small>5 сек · 720p · босоо 9:16 · нэг удаагийн жишиг үнэ</small>
       {(p.examples||[]).map(example=><div className="videoCapacityRow" key={example.modelSlug}>
         <span>{example.name}<small>{example.creditsPerVideo.toLocaleString("mn-MN")} кредит / видео</small></span>
         <b>{example.approxVideos} видео</b>
       </div>)}
       {(!p.examples||p.examples.length===0)&&<p>Жишиг үнийг түр шалгаж байна. Studio-д баталгаат үнийг харуулна.</p>}
     </div>
     <ul><li><Check size={14}/>Үнэ баталгаажсан AI моделүүд</li><li><Check size={14}/>Видео, зураг, Genjutsu (дэмжигдвэл)</li><li><Check size={14}/>Алдаатай үүсгэлтийн кредит буцаалт</li><li><Check size={14}/>Хуанлийн 1 сарын хугацаатай</li></ul>
     <button className="primary wide" disabled={!!busy||!available} onClick={()=>buy(p.id)}>{busy===p.id?<LoaderCircle className="spin" size={16}/>:<><ExternalLink size={15}/> {available?"Нэг удаа төлж идэвхжүүлэх":"Төлбөр түр хаалттай"}</>}</button>
    </article>)}</div>
    <section className="planHowPricingWorks" aria-label="Кредит ба subscription нөхцөл"><h2>Кредит хэрхэн зарцуулагддаг вэ?</h2>
     <div className="planHowGrid"><div><strong>01 · Үнийг урьдчилж харна</strong><p>Studio-д модель, хугацаа, resolution сонгоход тухайн генерацын кредитийг харуулна. Баталгаажаагүй загвараар кредит суутгахгүй.</p></div>
     <div><strong>02 · Гүйцэтгэлийн дараа</strong><p>Амжилтгүй эсвэл provider цуцалсан үүсгэлтийн кредитийг холбогдох төлөвөөр буцаана. Амжилттай видео, зураг бүр API өртөгтэй.</p></div>
     <div><strong>03 · Сунгалт, хугацаа</strong><p>Энэ нь автоматаар сунгагддаг subscription биш. Дараагийн сард үргэлжлүүлэх бол шинэ багц авч болно. Үлдэгдэл кредитийн дуусах өдрийг дээрээс харна.</p></div></div>
     <p className="planPolicyFootnote">Видео тоонууд нь бүтээх боломжийн ойролцоо жишээ бөгөөд сонгосон загвар, нягтаршил, хугацаа, нэмэлт параметрээс хамаарч өөрчлөгдөнө. Эцсийн кредитийг үүсгэхийн өмнө серверээр шалгана. Багцын өртгийн хамгаалалт нь төлөвлөлтийн ханш, нөөц зардал, суурь API үнийн дараах хамгийн багадаа 70% cost markup-ын зорилт; бодит цэвэр ашгийн баталгаа биш. Нийт үнэ Монгол төгрөгөөр. API-ийн өртөг, валютын зөрүү, шимтгэл, татвар болон серверийн нөөцийг RAINY үнийн хамгаалалтдаа тооцдог. Таны дансны татвар, баримтын шаардлагыг хүчин төгөлдөр нөхцөлөөр шийдвэрлэнэ; Higgsfield вебийн subscription RAINY-ийн багцад дагалдахгүй.</p>
    </section>
  </section></section></main>
}
