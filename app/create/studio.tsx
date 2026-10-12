'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
type Project={id:string;status:string;title:string;narration:string;seconds:number;sceneCount:number;completedScenes:number;expiresAt:number;price:{videoMnt:number;voiceMnt:number;assemblyMnt:number;totalMnt:number};error?:string;downloadUrl:string|null};
const labels:Record<string,string>={QUOTED:'Үнийн санал бэлэн',AWAITING_PAYMENT:'Төлбөр баталгаажихыг хүлээж байна',VIDEO:'Видео кадруудыг бүтээж байна',VOICE:'Монгол дуу оруулж байна',ASSEMBLY:'Бичлэгийг эвлүүлж байна',COMPLETED:'Таны бичлэг бэлэн',REVIEW_REQUIRED:'Ажилд шалгалт шаардлагатай',DISPATCH_VIDEO:'Видео эхлүүлж байна',DISPATCH_VOICE:'Дуу эхлүүлж байна',DISPATCH_ASSEMBLY:'Эвлүүлэг эхлүүлж байна'};
const money=(n:number)=>new Intl.NumberFormat('mn-MN').format(n)+' ₮';
export function CreateStudio(){
 const [brief,setBrief]=useState(''),[seconds,setSeconds]=useState(30),[ratio,setRatio]=useState('9:16');
 const [ready,setReady]=useState<boolean|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[project,setProject]=useState<Project|null>(null);
 const [id,setId]=useState('');
 useEffect(()=>{
  const ctrl=new AbortController();fetch('/api/campaigns',{signal:ctrl.signal}).then(r=>r.json()).then(v=>setReady(v.ready===true)).catch(()=>setReady(false));
  setId(new URLSearchParams(window.location.search).get('project')||'');return ()=>ctrl.abort();
 },[]);
 useEffect(()=>{
  if(!id)return;const ctrl=new AbortController();let timer:ReturnType<typeof setTimeout>;
  async function poll(){try{const r=await fetch('/api/campaigns/'+encodeURIComponent(id),{signal:ctrl.signal,cache:'no-store'});const v=await r.json();if(!r.ok)throw new Error(v.error);setProject(v.project);if(!['COMPLETED','REVIEW_REQUIRED','QUOTED'].includes(v.project.status))timer=setTimeout(poll,10000);}catch(e){if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:'Төлөв авч чадсангүй.');}}
  void poll();return ()=>{ctrl.abort();clearTimeout(timer);};
 },[id]);
 async function quote(){setBusy(true);setError('');try{
  const r=await fetch('/api/campaigns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({brief,seconds,ratio})});const v=await r.json();if(!r.ok)throw new Error(v.error);
  setProject(v.project);setId(v.project.id);window.history.replaceState(null,'','/create?project='+v.project.id);
 }catch(e){setError(e instanceof Error?e.message:'Алдаа гарлаа.');}finally{setBusy(false);}}
 async function pay(){if(!project)return;setBusy(true);setError('');try{
  const r=await fetch('/api/campaigns/'+project.id+'/checkout',{method:'POST'});const v=await r.json();if(!r.ok)throw new Error(v.error);
  if(v.payUrl)window.location.assign(v.payUrl);else window.location.assign('/create?project='+project.id);
 }catch(e){setError(e instanceof Error?e.message:'Төлбөр үүсгэсэнгүй.');setBusy(false);}}
 return <main className="rainyCreate"><nav><Link href="/create" className="createBrand">☂ RAINY <span>Create</span></Link><div><a href="https://video.rainy.studio">Video</a><a href="https://voice.rainy.studio">Voice</a><Link href="/login">Нэвтрэх</Link></div></nav>
 <section className="createHero"><p className="createEyebrow">VIDEO + VOICE · НЭГ БҮТЭЭЛ</p><h1>Санаагаа бич.<br/><span>Бичлэгээ ав.</span></h1><p>Видео дүрслэл, Монгол дуу оруулалт, эвлүүлэг.<br/>Бүгд нэг хүсэлтээс, нэг төлбөрөөр.</p></section>
 <div className="createWorkspace"><section className="createCard"><div className="createCardHead"><span>01 / ТАНЫ САНАА</span><span>✦ AI найруулагч</span></div>
 <label htmlFor="brief">Юу бүтээмээр байна?</label><textarea id="brief" maxLength={4000} value={brief} onChange={e=>{setBrief(e.target.value);setProject(null);setId('');}} placeholder="Жишээ: Монголын өглөөний кофены 30 секундийн сурталчилгаа. Дулаан өнгө, бодит дүрслэл, тайван Монгол дуу оруулалттай…"/>
 <div className="createOptions"><label>Хугацаа<select value={seconds} onChange={e=>{setSeconds(Number(e.target.value));setProject(null);setId('');}}><option value={15}>15 секунд</option><option value={30}>30 секунд</option><option value={60}>60 секунд</option></select></label><label>Формат<select value={ratio} onChange={e=>{setRatio(e.target.value);setProject(null);setId('');}}><option>9:16</option><option>16:9</option><option>1:1</option></select></label></div>
 <div className="createIncluded"><span>◉ AI видео</span><span>♫ Монгол дуу</span><span>▣ MP4 эвлүүлэг</span></div>
 {ready===false?<p className="createNotice">Нэгдсэн үйлчилгээ бэлтгэгдэж байна. Одоогоор төлбөр авахгүй.</p>:null}
 <button className="createPrimary" disabled={busy||ready!==true||brief.trim().length<20} onClick={quote}>{busy?'Боловсруулж байна…':'Нийт үнийг тооцоолох →'}</button><small>Үнийг харах үед видео үүсгэх төлбөр суутгахгүй.</small>
 </section><section className="createCard createResult"><div className="createCardHead"><span>02 / ТАНЫ БҮТЭЭЛ</span><span>720p MP4</span></div>
 {project?<><h2>{project.title}</h2><p className="createStatus" role="status">{labels[project.status]||'Боловсруулж байна'}</p>
 <p>{project.seconds} секунд · {project.completedScenes}/{project.sceneCount} кадр бэлэн</p>
 <progress max={project.sceneCount+2} value={project.completedScenes+(project.status==='ASSEMBLY'?1:project.status==='COMPLETED'?2:0)} aria-label="Бичлэгийн явц"/>
 <details><summary>Дуу оруулах зохиол</summary><p>{project.narration}</p></details>
 <dl><div><dt>Видео</dt><dd>{money(project.price.videoMnt)}</dd></div><div><dt>Дуу оруулалт</dt><dd>{money(project.price.voiceMnt)}</dd></div><div><dt>Эвлүүлэг</dt><dd>{money(project.price.assemblyMnt)}</dd></div><div className="createTotal"><dt>Нийт төлбөр</dt><dd>{money(project.price.totalMnt)}</dd></div></dl>
 {project.status==='QUOTED'?<button className="createPrimary" disabled={busy||ready!==true} onClick={pay}>Төлөх · Бичлэг үүсгэх</button>:null}
 {project.downloadUrl?<a className="createPrimary" href={project.downloadUrl}>Бэлэн MP4 татах ↓</a>:null}
 {project.error?<p role="alert" className="createError">{project.error}</p>:null}
 </>:<div className="createEmpty"><div className={'createCanvas '+(ratio==='16:9'?'wide':ratio==='1:1'?'square':'')}><span>▶</span><p>Таны дараагийн<br/>бүтээл энд</p></div><h2>Нэг санаа. Нэг бэлэн бичлэг.</h2><p>Санаагаа бичээд, эхлээд нийт үнээ хараарай.</p></div>}
 </section></div>{error?<p role="alert" className="createError createPageError">{error}</p>:null}<footer>RAINY Studio · Төлбөр баталгаажсаны дараа бүтээл эхэлнэ.</footer></main>;
}
