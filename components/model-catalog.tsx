'use client';
import Link from 'next/link';
import {useMemo,useState} from 'react';
import {ArrowRight,BookOpen,Search,SlidersHorizontal} from 'lucide-react';
import {models} from '@/lib/models';
import {durationLabel,modelGuide,modelMode,resolutionLabel} from '@/lib/model-guides';
import {WorkflowIcon} from '@/components/workflow-icon';

export function ModelCatalog(){
 const [search,setSearch]=useState(''),[kind,setKind]=useState('all'),[maker,setMaker]=useState('all'),[ready,setReady]=useState(false);
 const makers=Array.from(new Set(models.map(m=>m.maker||m.provider))).sort();
 const filtered=useMemo(()=>models.filter(m=>{const guide=modelGuide(m);return(kind==='all'||m.kind===kind)&&(maker==='all'||(m.maker||m.provider)===maker)&&(!ready||m.apiVerified)&&[m.name,m.maker,modelMode(m),guide.purpose,m.resolutions.join(' ')].join(' ').toLowerCase().includes(search.trim().toLowerCase())}),[search,kind,maker,ready]);
 return <section className="modelLibrary" id="model-library"><div className="libraryHeading"><div><span className="eyebrow">RAVS MODEL LIBRARY</span><h2>Таны бүтээлд тохирох загвар.</h2><p>Зориулалтаа сонго. Хэмжээг харьцуул. Монгол заавраар эхэл.</p></div><div className="libraryCounts"><b>{models.length}<small>ХУВИЛБАР</small></b><b>{models.filter(m=>m.apiVerified).length}<small>ПАРАМЕТРТЭЙ</small></b></div></div>
  <div className="libraryFilters"><label className="librarySearch"><Search size={17}/><input aria-label="Загвар болон зориулалтаар хайх" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Seedance, хөрөг, видео засвар, 1080p…"/></label><label className="libraryMaker"><SlidersHorizontal size={15}/><select aria-label="Хөгжүүлэгчээр шүүх" value={maker} onChange={e=>setMaker(e.target.value)}><option value="all">Бүх хөгжүүлэгч</option>{makers.map(x=><option key={x}>{x}</option>)}</select></label></div>
  <div className="libraryFilterBottom"><div className="libraryTabs">{[['all','Бүгд'],['video','Видео'],['image','Зураг'],['workflow','Хөдөлгөөн / Засвар']].map(([id,label])=><button aria-pressed={kind===id} className={kind===id?'active':''} key={id} onClick={()=>setKind(id)}>{label}</button>)}</div><label className="documentedToggle"><input type="checkbox" checked={ready} onChange={e=>setReady(e.target.checked)}/> Параметр баталгаажсан</label></div>
  <p className="libraryResultCount" role="status">{filtered.length} загвар · “Параметр баталгаажсан” нь бодит үүсгэлт амжилттай болсон гэсэн утга биш.</p>
  <div className="mnModelGrid">{filtered.map(m=><article className="mnModelCard" key={m.slug}><div className="mnModelCardTop"><span className={'modelGlyph tone-'+(m.tone||'violet')}><WorkflowIcon id={m.slug} size={23}/></span><span className={'schemaState '+(m.apiVerified?'documented':'pending')}>{m.apiVerified?'Параметртэй':'Нягталж байна'}</span></div><small className="mnModelMaker">{m.maker||m.provider}</small><h3>{m.name.replace(/ · Текст → Видео$/,'')}</h3><span className="mnModelMode">{modelMode(m)}</span><p>{modelGuide(m).purpose}</p><div className="mnModelFacts"><div><small>ХЭМЖЭЭ</small><b>{resolutionLabel(m)}</b></div><div><small>ХУГАЦАА</small><b>{durationLabel(m)}</b></div></div><footer><Link href={'/models/'+m.slug}><BookOpen size={14}/> Монгол заавар</Link>{m.apiVerified?<Link href={'/studio?model='+m.slug}>Сонгох <ArrowRight size={14}/></Link>:<span>Түр хаалттай</span>}</footer></article>)}</div>
  {!filtered.length&&<div className="libraryEmpty"><Search size={25}/><h3>Тохирох загвар олдсонгүй</h3><p>Хайх үг эсвэл шүүлтүүрээ өөрчилнө үү.</p><button className="ghost" onClick={()=>{setSearch('');setKind('all');setMaker('all');setReady(false)}}>Шүүлтүүр цэвэрлэх</button></div>}
 </section>;
}
