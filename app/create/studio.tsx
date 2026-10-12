'use client';
import Link from 'next/link';
import {UploadedAsset,productPhoto,referenceFrames,uploadAsset} from './media-input';
import {useEffect,useState} from 'react';
type Project={assets?:{url:string;name:string;mimeType:string;kind:'product'|'video'}[];id:string;status:string;title:string;narration:string;seconds:number;sceneCount:number;completedScenes:number;expiresAt:number;storyboardApproved:boolean;storyboard:{logline:string;styleBible:string;characters:string[];scenes:{number:number;durationSeconds:number;startSeconds:number;endSeconds:number;shot:string;videoPrompt:string;voiceover:string;subtitle:string}[]}|null;price:{videoMnt:number;voiceMnt:number;assemblyMnt:number;totalMnt:number;totalCredits?:number;creditMnt?:number}|null;error?:string;downloadUrl:string|null};
const labels:Record<string,string>={STORYBOARD:'Storyboard бэлэн · Төлөвлөгөөгөө шалгана уу',QUOTED:'Үнийн санал бэлэн',AWAITING_PAYMENT:'Төлбөр баталгаажихыг хүлээж байна',VIDEO:'Видео кадруудыг бүтээж байна',VOICE:'Монгол дуу оруулж байна',ASSEMBLY:'Бичлэгийг эвлүүлж байна',COMPLETED:'Таны бичлэг бэлэн',REVIEW_REQUIRED:'Ажилд шалгалт шаардлагатай',DISPATCH_VIDEO:'Видео эхлүүлж байна',DISPATCH_VOICE:'Дуу эхлүүлж байна',DISPATCH_ASSEMBLY:'Эвлүүлэг эхлүүлж байна'};
const money=(n:number)=>new Intl.NumberFormat('mn-MN').format(n)+' ₮';
export function CreateStudio(){
 const [brief,setBrief]=useState(''),[seconds,setSeconds]=useState(30),[ratio,setRatio]=useState('9:16');
 const [ready,setReady]=useState<boolean|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[project,setProject]=useState<Project|null>(null);
 const [id,setId]=useState('');
 const [assets,setAssets]=useState<UploadedAsset[]>([]),[productInfo,setProductInfo]=useState(''),[uploading,setUploading]=useState(false);
 const [storyboardReady,setStoryboardReady]=useState<boolean|null>(null);
 useEffect(()=>{
  const ctrl=new AbortController();fetch('/api/campaigns',{signal:ctrl.signal}).then(r=>r.json()).then(v=>{setReady(v.ready===true);setStoryboardReady(v.storyboardReady===true);}).catch(()=>setReady(false));
  setId(new URLSearchParams(window.location.search).get('project')||'');return ()=>ctrl.abort();
 },[]);
 useEffect(()=>{
  if(!id)return;const ctrl=new AbortController();let timer:ReturnType<typeof setTimeout>;
  async function poll(){try{const r=await fetch('/api/campaigns/'+encodeURIComponent(id),{signal:ctrl.signal,cache:'no-store'});const v=await r.json();if(!r.ok)throw new Error(v.error);setProject(v.project);if(!['COMPLETED','REVIEW_REQUIRED','QUOTED','STORYBOARD'].includes(v.project.status))timer=setTimeout(poll,10000);}catch(e){if(!ctrl.signal.aborted)setError(e instanceof Error?e.message:'Төлөв авч чадсангүй.');}}
  void poll();return ()=>{ctrl.abort();clearTimeout(timer);};
 },[id]);
 async function addMedia(file:File,kind:'product'|'video'){
  setUploading(true);setError('');setProject(null);setId('');
  try{
   if(kind==='product'){const photo=await uploadAsset(await productPhoto(file),'product');setAssets(old=>[...old.filter(a=>a.kind!=='product'),photo]);}
   else{const frames=await referenceFrames(file);const uploaded:UploadedAsset[]=[await uploadAsset(file,'video')];for(const frame of frames)uploaded.push(await uploadAsset(frame,'frame'));setAssets(old=>[...old.filter(a=>a.kind==='product'),...uploaded]);}
  }catch(e){setError(e instanceof Error?e.message:'Upload алдаа.');}finally{setUploading(false);}
 }
 async function quote(){setBusy(true);setError('');try{
  const r=await fetch('/api/campaigns',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({brief,seconds,ratio,productInfo,assets})});const v=await r.json();if(!r.ok)throw new Error(v.error);
  setProject(v.project);setId(v.project.id);window.history.replaceState(null,'','/create?project='+v.project.id);
 }catch(e){setError(e instanceof Error?e.message:'Алдаа гарлаа.');}finally{setBusy(false);}}
 async function approve(){if(!project)return;setBusy(true);setError('');try{
  const r=await fetch('/api/campaigns/'+project.id+'/quote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({confirmStoryboard:true})});const v=await r.json();if(!r.ok)throw new Error(v.error);setProject(v.project);
 }catch(e){setError(e instanceof Error?e.message:'Үнийн санал авч чадсангүй.');}finally{setBusy(false);}}
 async function pay(){if(!project)return;setBusy(true);setError('');try{
  const r=await fetch('/api/campaigns/'+project.id+'/checkout',{method:'POST'});const v=await r.json();if(!r.ok)throw new Error(v.error);
  if(v.payUrl)window.location.assign(v.payUrl);else window.location.assign('/create?project='+project.id);
 }catch(e){setError(e instanceof Error?e.message:'Төлбөр үүсгэсэнгүй.');setBusy(false);}}
 return <main className="rainyCreate"><nav><Link href="/create" className="createBrand">☂ RAINY <span>Create</span></Link><div><a href="https://video.rainy.studio">Video</a><a href="https://voice.rainy.studio">Voice</a><Link href="/login">Нэвтрэх</Link></div></nav>
 <section className="createHero"><p className="createEyebrow">БҮТЭЭГДЭХҮҮН → STORYBOARD → VIDEO + VOICE</p><h1>Санаагаа бич.<br/><span>Бичлэгээ ав.</span></h1><p>Санаа → Storyboard → Батлах → Бэлэн бичлэг.<br/>Видео, Монгол дуу оруулалт, эвлүүлэг нэг төлбөрөөр.</p></section>
 <div className="createWorkspace"><section className="createCard"><div className="createCardHead"><span>01 / ТАНЫ САНАА</span><span>✦ AI найруулагч</span></div>
 <label htmlFor="brief">Юу бүтээмээр байна?</label><textarea disabled={busy||uploading} id="brief" maxLength={4000} value={brief} onChange={e=>{setBrief(e.target.value);setProject(null);setId('');}} placeholder="Жишээ: Монголын өглөөний кофены 30 секундийн сурталчилгаа. Дулаан өнгө, бодит дүрслэл, тайван Монгол дуу оруулалттай…"/>
 <div className="createMediaInputs"><label className="createUpload">＋ Бүтээгдэхүүний зураг<input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy||uploading} onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(file)void addMedia(file,'product');}}/></label><label className="createUpload">＋ Жишиг видео<input type="file" accept="video/mp4" disabled={busy||uploading} onChange={e=>{const file=e.currentTarget.files?.[0];e.currentTarget.value='';if(file)void addMedia(file,'video');}}/></label></div>
 <p className="createMediaHelp">Зураг: JPG, PNG, WebP · Видео: MP4, 60 секунд / 100MB хүртэл. Видеоныхоо 3 кадрыг storyboard-ийн дүрслэлийн жишиг болгоно.</p>
 {uploading?<p role="status">Файл байршуулж, жишиг кадр бэлтгэж байна…</p>:null}
 <div className="createAssetPreviews">{assets.filter(a=>a.kind!=='frame').map(a=><div key={a.url}>{a.kind==='product'?<img src={a.url} alt="Бүтээгдэхүүний жишиг зураг"/>:<video src={a.url} controls preload="metadata"/>}<span>{a.name}</span><button type="button" disabled={busy||uploading} onClick={()=>{setAssets(old=>old.filter(item=>a.kind==='video'?item.kind==='product':item.kind!=='product'));setProject(null);setId('');}}>Хасах</button></div>)}</div>
 <label htmlFor="product-info">Бүтээгдэхүүний мэдээлэл</label><textarea id="product-info" className="createProductInfo" maxLength={1800} disabled={busy||uploading} value={productInfo} onChange={e=>{setProductInfo(e.target.value);setProject(null);setId('');}} placeholder="Бүтээгдэхүүний нэр, үнэ, онцлог, зориулалт, брэнд…"/>
 <div className="createOptions"><label>Хугацаа<select disabled={busy||uploading} value={seconds} onChange={e=>{setSeconds(Number(e.target.value));setProject(null);setId('');}}><option value={15}>15 секунд</option><option value={30}>30 секунд</option><option value={60}>60 секунд</option></select></label><label>Формат<select disabled={busy||uploading} value={ratio} onChange={e=>{setRatio(e.target.value);setProject(null);setId('');}}><option>9:16</option><option>16:9</option><option>1:1</option></select></label></div>
 <div className="createIncluded"><span>◉ AI видео</span><span>♫ Монгол дуу</span><span>▣ MP4 эвлүүлэг</span></div>
 {storyboardReady===false?<p className="createNotice">AI storyboard найруулагчийн холболт бэлтгэгдэж байна.</p>:null}
 <button className="createPrimary" disabled={busy||uploading||storyboardReady!==true||brief.trim().length<20} onClick={quote}>{busy?'Боловсруулж байна…':'Storyboard гаргах →'}</button><small>Эхлээд storyboard-оо шалгана. Бичлэг баталсны дараа үүснэ.</small>
 </section><section className="createCard createResult"><div className="createCardHead"><span>02 / STORYBOARD & БҮТЭЭЛ</span><span>720p MP4</span></div>
 {project?<><h2>{project.title}</h2><p className="createStatus" role="status">{labels[project.status]||'Боловсруулж байна'}</p>
 {project.assets?.length?<div className="createAssetPreviews">{project.assets.map(a=><div key={a.url}>{a.kind==='product'?<img src={a.url} alt="Storyboard-ийн бүтээгдэхүүний зураг"/>:<video src={a.url} controls preload="metadata"/>}<span>{a.name}</span></div>)}</div>:null}
 {project.storyboard?<div className="createStoryboard"><p>{project.storyboard.logline}</p><div className="createStoryTimeline">{project.storyboard.scenes.map(scene=><article key={scene.number} className="createStoryShot"><header><strong>Кадр {scene.number}</strong><span>{scene.startSeconds}–{scene.endSeconds} сек</span></header><h3>{scene.shot}</h3><p><b>Дуу:</b> {scene.voiceover||'Дуу оруулалтгүй'}</p>{scene.subtitle?<p><b>Хадмалын ноорог:</b> {scene.subtitle}</p>:null}<details><summary>Кадрын үүсгэх тайлбар</summary><p>{scene.videoPrompt}</p></details></article>)}</div><details><summary>Дүр ба өнгө төрхийн нэгдсэн чиглэл</summary><p>{project.storyboard.styleBible}</p>{project.storyboard.characters.map((c,i)=><p key={i}>{c}</p>)}</details></div>:null}
 {project.status==='STORYBOARD'?<><button className="createPrimary" disabled={busy||ready!==true} onClick={approve}>Storyboard батлах · Үнийг харах →</button><small>Баталсан кадр, дараалал, дууны текстээр бүтээнэ.</small>{ready===false?<p className="createNotice">Үнийн тооцоо, төлбөрийн холболт бэлтгэгдэж байна.</p>:null}</>:null}
 <p>{project.seconds} секунд · {project.status==='STORYBOARD'?`${project.storyboard?.scenes.length||0} кадрын төлөвлөгөө`:`${project.completedScenes}/${project.sceneCount} кадр бэлэн`}</p>
 {project.status!=='STORYBOARD'?<progress max={project.sceneCount+2} value={project.completedScenes+(project.status==='ASSEMBLY'?1:project.status==='COMPLETED'?2:0)} aria-label="Бичлэгийн явц"/>:null}
 <details><summary>Дуу оруулах зохиол</summary><p>{project.narration}</p></details>
 {project.price?<><p><strong>{project.price.totalCredits??Math.ceil(project.price.totalMnt/10)} Create кредит</strong> · 1 кредит = {money(project.price.creditMnt??10)}</p><dl><div><dt>Видео</dt><dd>{money(project.price.videoMnt)}</dd></div><div><dt>Дуу оруулалт</dt><dd>{money(project.price.voiceMnt)}</dd></div><div><dt>Эвлүүлэг</dt><dd>{money(project.price.assemblyMnt)}</dd></div><div className="createTotal"><dt>Нэг удаагийн төлбөр</dt><dd>{money(project.price.totalMnt)}</dd></div></dl><small>Зөвхөн энэ бичлэгийн нэг удаагийн төлбөр. Төлсний дараа бэлэн MP4 авна.</small></>:null}
 {project.status==='QUOTED'&&project.storyboardApproved?<button className="createPrimary" disabled={busy||ready!==true} onClick={pay}>{project.price?money(project.price.totalMnt):'Төлөх'} · Нэг удаа төлж үүсгэх</button>:null}
 {project.downloadUrl?<a className="createPrimary" href={project.downloadUrl}>Бэлэн MP4 татах ↓</a>:null}
 {project.error?<p role="alert" className="createError">{project.error}</p>:null}
 </>:<div className="createEmpty"><div className={'createCanvas '+(ratio==='16:9'?'wide':ratio==='1:1'?'square':'')}><span>▶</span><p>Таны дараагийн<br/>бүтээл энд</p></div><h2>Нэг санаа. Нэг бэлэн бичлэг.</h2><p>Санаагаа бичээд, кадр бүрийн storyboard-оо хараарай.</p></div>}
 </section></div>{error?<p role="alert" className="createError createPageError">{error}</p>:null}<footer>RAINY Studio · Төлбөр баталгаажсаны дараа бүтээл эхэлнэ.</footer></main>;
}
