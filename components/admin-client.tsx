"use client";
import {useEffect,useState} from "react";
import {AdminDemos} from "@/components/admin-demos";
import {AdminReconciliation} from "@/components/admin-reconciliation";
import {Sidebar} from "@/components/sidebar";
import {UsersRound,Clapperboard,CheckCircle2,TriangleAlert,WalletCards,BadgeDollarSign,RefreshCw,LoaderCircle,KeyRound,ShieldCheck,Server} from "lucide-react";
type Stats={expiredCredits:number;users:number;today:{generations:number;completed:number;failed:number;payments:number;revenueMnt:number}};
type Health={database?:string;configuration?:{missing?:string[];higgsfield?:boolean;wire?:boolean}};
type ApiAudit={credentialConfigured:boolean;totals:Record<string,number>;models:Array<{slug:string;name:string;pricing:string;endpointDocumented:boolean;note:string}>;disclaimer:string};
export function AdminClient(){
 const[data,setData]=useState<Stats|null>(null),[health,setHealth]=useState<Health|null>(null),[error,setError]=useState(""),[loading,setLoading]=useState(true);
 const[audit,setAudit]=useState<ApiAudit|null>(null),[auditError,setAuditError]=useState(""),[checkingApi,setCheckingApi]=useState(false),[probeResult,setProbeResult]=useState("");
 async function loadAudit(){
  setAuditError("");
  try{const r=await fetch("/api/admin/model-api-audit",{cache:"no-store"});const d=await r.json();if(!r.ok)throw Error(d.error||"API аудит олдсонгүй.");setAudit(d);}
  catch(e){setAuditError(e instanceof Error?e.message:"API аудит ачаалж чадсангүй.");}
 }
 async function testApiConnection(){
  if(checkingApi)return;
  setCheckingApi(true);setProbeResult("");
  try{
   const r=await fetch("/api/admin/model-api-audit",{method:"POST",credentials:"same-origin"});
   const d=await r.json();setProbeResult((r.ok?"✓ ":"✕ ")+(d.message||d.error||"Шалгалт дууссан."));
  }catch{setProbeResult("API холболтын шалгалт хийж чадсангүй.");}
  finally{setCheckingApi(false);}
 }
 async function load(){setLoading(true);setError("");try{const [stats,config]=await Promise.all([fetch('/api/admin/stats',{cache:'no-store'}),fetch('/api/health',{cache:'no-store'})]);const d=await stats.json();if(!stats.ok)throw new Error(d.error||"Үзүүлэлт ачаалж чадсангүй.");setData(d);setHealth(await config.json());}catch(e){setError(e instanceof Error?e.message:"Сүлжээний алдаа.");}finally{setLoading(false);}}
 useEffect(()=>{void load();void loadAudit();},[]);
 const cards=data?[[UsersRound,"Нийт хэрэглэгч",data.users],[Clapperboard,"Өнөөдрийн үүсгэлт",data.today.generations],[CheckCircle2,"Бэлэн бүтээл",data.today.completed],[TriangleAlert,"Алдаа / цуцлалт",data.today.failed],[WalletCards,"Төлсөн захиалга",data.today.payments],[BadgeDollarSign,"Орлого",data.today.revenueMnt.toLocaleString()+"₮"]] as const:[];
 return <main className="shell"><Sidebar/><section className="content"><header className="topbar"><div><b>Удирдлага</b><span>Зөвхөн админ • Улаанбаатарын цаг</span></div><button className="ghost" onClick={load} disabled={loading}><RefreshCw size={15}/>Шинэчлэх</button></header><section className="adminPage"><h1>Өнөөдрийн үзүүлэлт</h1>{error&&<div className="formError" role="alert">{error}</div>}{loading&&!data?<div className="screenEmpty" role="status"><LoaderCircle className="spin"/><p>Үзүүлэлт ачаалж байна…</p></div>:<div className="statsGrid">{cards.map(([Icon,title,value])=><div key={title}><Icon size={22}/><small>{title}</small><b>{value}</b></div>)}</div>}
 <section className="adminGuide"><h2><Server size={22}/> Үйлчилгээний төлөв</h2><div className="guideSteps"><div><ShieldCheck/><h3>Өгөгдлийн сан</h3><p>{health?.database==="ok"?"Холболт хэвийн":health?"Холболтоо шалгана уу":"Шалгаж байна…"}</p></div><div><KeyRound/><h3>Higgsfield</h3><p>{health?.configuration?.higgsfield?"Түлхүүр тохируулагдсан. Хүчинтэй эсэхийг тест үүсгэлтээр шалгана.":"API түлхүүр тохируулаагүй. Доорх зааврыг дагана уу."}</p></div><div><WalletCards/><h3>Wire.mn</h3><p>{health?.configuration?.wire?"Түлхүүр болон webhook secret тохируулагдсан.":"Төлбөр нээгдээгүй. API key болон webhook secret шаардлагатай."}</p></div></div>{!!health?.configuration?.missing?.length&&<p className="formError">Дутуу үндсэн тохиргоо: {health.configuration.missing.join(', ')}</p>}</section>
 <section className="adminGuide"><h2><Server size={20}/> API бэлэн байдлын аудит</h2>
 <p>Код дахь бүх Higgsfield загварыг шалгана. <b>API баримттай</b> гэсэн төлөв нь таны account-д эрхтэй, үнэ баталгаатай, генерац амжилттай болно гэсэн үг биш.</p>
 {auditError&&<p className="formError">{auditError}</p>}
 {audit&&<>
  <p>Нийт {audit.models.length} модель · Үнэ тооцох кодтой {audit.totals.quote_implemented||0} · Клип шаардлагатай {audit.totals.source_clip_required||0} · Үнэ баталгаагүй {audit.totals.pricing_unavailable||0} · Endpoint баталгаагүй {audit.totals.unsupported_endpoint||0}.</p>
  <p>Higgsfield key: {audit.credentialConfigured?"Тохируулсан (хүчинтэйг батлах шаардлагатай)":"Тохиргоо дутуу"}.</p>
  <div style={{display:"flex",gap:10,flexWrap:"wrap",margin:"14px 0"}}>
    <button type="button" className="ghost" onClick={()=>void loadAudit()}>Каталог дахин шалгах</button>
    <button type="button" className="ghost" disabled={checkingApi} onClick={()=>void testApiConnection()}>{checkingApi?"Шалгаж байна…":"Higgsfield холболт шалгах (генерацгүй)"}</button>
  </div>
  {probeResult&&<p role="status">{probeResult}</p>}
  <details className="modelExtraSettings"><summary>Бүх загварын API төлөв ({audit.models.length})</summary>
    <div style={{maxHeight:420,overflowY:"auto",border:"1px solid var(--line, #333)",borderRadius:9,marginTop:12}}>
      {audit.models.map(m=><div key={m.slug} style={{borderBottom:"1px solid #4444",padding:"10px 12px"}}>
       <strong style={{display:"block"}}>{m.name} · {m.slug}</strong>
       <small>{m.pricing==="quote_implemented"?"Үнийн кодтой":m.pricing==="source_clip_required"?"MP4 клип шаардлагатай":m.pricing==="unsupported_endpoint"?"API endpoint баталгаагүй":"Үнэ баталгаажаагүй"} — {m.note}</small>
      </div>)}
    </div>
  </details>
 </>}
 </section>
 <section className="adminGuide"><h2>Higgsfield API холбох</h2><ol><li><a href="https://console.higgsfield.ai" target="_blank" rel="noreferrer">Higgsfield Console ↗</a>-д орж API key ID, secret үүсгэнэ.</li><li>Railway → rainyaivideostudio → Variables дээр <code>HF_CREDENTIALS=API_KEY</code> (Higgsfield-ээс хуулсан бүтэн түлхүүр; хуучин <code>ID:SECRET</code> форматыг мөн дэмжинэ) нэмнэ. Нууц утгыг frontend болон GitHub-д оруулахгүй.</li><li><code>HIGGSFIELD_BASE_URL=https://api.higgsfield.ai</code> ашиглаад Deploy хийнэ.</li><li>Энэ хуудсыг шинэчилж тохиргоог шалгана. Дараа нь Studio дээр Soul 2-оор нэг зураг үүсгэн, хүсэлтийн төлөв, үр дүн, кредитийг шалгана. Provider тест төлбөртэй байж болно.</li></ol><p>Түлхүүр байгаа эсэх нь balance, model access, холболт хүчинтэйг батлахгүй. Кодын сан дахь <code>docs/HIGGSFIELD_SETUP_MN.md</code> файлыг ашиглана.</p></section>
 <section className="adminGuide"><h2>Хугацаа дууссан кредит</h2><p>{(data?.expiredCredits||0).toLocaleString()} credit хүчингүй болсон.</p><p>Ашиглаагүй кредитэд API зардал гараагүй тул зарцуулаагүй мөнгө Higgsfield API баланс дээр хэвээр байна. Энэ тоо нь RAVS дотоод кредитийн тайлан бөгөөд API долларын баланс биш.</p></section>
 <AdminDemos/>
 <AdminReconciliation/>
 <section className="adminGuide"><h2>Нээлтийн бэлтгэл</h2><p>Имэйл баталгаажуулалт, нууц үг сэргээх mail provider, media архив, shared rate limiter болон session revoke одоогоор нэмэлт ажил шаардлагатай. API түлхүүрийг хэрэглэгчээс чат эсвэл form-оор авахгүй.</p></section>
 </section></section></main>;
}
