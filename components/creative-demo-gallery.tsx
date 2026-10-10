"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {ArrowRight,ArrowUpRight,Check,ClipboardCopy,Clapperboard,Search,TrendingUp,Video} from "lucide-react";
import {DemoPlayer} from "@/components/demo-player";
import {curatedCreativeDemos,getCreativePrompt,recentHiggsfieldIdeas,studioDemoHref,type CreativeDemo,type DemoCategory} from "@/lib/creative-demo-library";
import "./creative-demo-gallery.css";

type Surface="trends"|"home"|"cinema"|"marketing"|"influencer"|"apps"|"video-guide";
const categoryLabels:Record<DemoCategory,string>={effects:"Эффект",genjutsu:"Genjutsu",cinema:"Кино",marketing:"Зар · Бүтээгдэхүүн",influencer:"AI дүр"};
const surfaces:Record<Surface,{title:string;hint:string;categories:DemoCategory[];limit:number}>={
 trends:{title:"Higgsfield видео санаа · тоглуулж үз",hint:"Тоглох боломжтой жишээ, Монгол prompt, өөрийн модель руу шилжих үйлдэл.",categories:["effects","genjutsu","cinema","marketing","influencer"],limit:100},
 home:{title:"Тренд видео · жишгээр нь бүтээ",hint:"Бичлэгийг сайтдаа тоглуулж, Монгол prompt-оор өөрийн хувилбарыг эхлүүл.",categories:["effects","genjutsu","cinema","marketing","influencer"],limit:8},
 cinema:{title:"Кино кадрын жишээ",hint:"Камер, дүр, орчны хөдөлгөөнийг үзээд киноны prompt-ыг өөртөө тохируул.",categories:["cinema","effects"],limit:6},
 marketing:{title:"Зар ба бүтээгдэхүүний жишээ",hint:"Бүтээгдэхүүний видео сурталчилгааны санааг тоглуулж, брэндийн prompt ав.",categories:["marketing","effects"],limit:6},
 influencer:{title:"AI дүрийн видео жишээ",hint:"Дүрийн төрөл, хөдөлгөөн, жишиг материалыг сонгон өөрийн бүтээлээ эхлүүл.",categories:["influencer","genjutsu"],limit:6},
 apps:{title:"Эффектүүдийг видеогоор үз",hint:"Эффектийн хөдөлгөөн, шилжилтийг тоглуулж үзээд тохирох Studio workflow сонго.",categories:["effects","genjutsu"],limit:8},
 "video-guide":{title:"Тоглох видео + Монгол prompt",hint:"Зөвхөн үзүүлэх бус, жишиг prompt-ыг хуулж өөрийн бүтээлд ашигла.",categories:["effects","genjutsu","cinema","marketing","influencer"],limit:8},
};
type ImportedDemo={id:string;title:string;category:string;videoUrl:string;sourceUrl:string};
function normalizeImported(input:ImportedDemo):CreativeDemo|null {
 if(!input||typeof input.id!=="string"||typeof input.title!=="string"||typeof input.videoUrl!=="string")return null;
 try{
  const video=new URL(input.videoUrl),source=new URL(input.sourceUrl);
  if(video.protocol!=="https:"||source.protocol!=="https:"||!["higgsfield.ai","www.higgsfield.ai"].includes(source.hostname))return null;
  // Imported media is published only via the admin's reviewed Higgsfield pipeline.
  if(video.username||video.password||video.port||source.username||source.password)return null;
  const c=["effects","genjutsu","cinema","marketing","influencer"].includes(input.category)?input.category as DemoCategory:"effects";
  const hints={effects:"seedance-2-5-image",genjutsu:"genjutsu-motion",cinema:"seedance-2-5",marketing:"marketing-studio",influencer:"ai-influencer"} as const;
  const starter=getCreativePrompt(c==="marketing"?"product-ad":c==="influencer"?"ai-character":c==="genjutsu"?"motion-transfer-1":c==="cinema"?"world-morphing":"eyes-in");
  return{id:"admin-"+input.id.slice(0,80),title:input.title.slice(0,130),description:"Админ баталгаажуулж нэмсэн видео. Тайлбар нь жишиг санаа бөгөөд эх видеоны яг анхны prompt биш.",category:c,videoUrl:video.toString(),sourceUrl:source.toString(),poster:"",badge:"ШИНЭ ЖИШЭЭ",modelSlug:hints[c],prompt:starter.prompt,use:categoryLabels[c],isImported:true};
 }catch{return null;}
}
function PromptCopy({prompt}:{prompt:string}){
 const[copied,setCopied]=useState(false);
 return <button type="button" className="creativeCopyButton" onClick={async()=>{try{await navigator.clipboard.writeText(prompt);setCopied(true);}catch{setCopied(false);}}}>
 {copied?<Check size={14}/>:<ClipboardCopy size={14}/>} {copied?"Хууллаа":"Prompt хуулах"}
 </button>;
}
function ExampleCard({item}:{item:CreativeDemo}){
 const[copied,setCopied]=useState(false);
 async function copyPrompt(){
  try{await navigator.clipboard.writeText(item.prompt);setCopied(true);}catch{setCopied(false);}
 }
 return <article className="creativeDemoCard">
   <div className="creativeDemoMedia">
     <DemoPlayer source={item.sourceUrl} src={item.videoUrl} poster={item.poster} title={item.title}/>
     <span className="creativeDemoBadge">{item.badge}</span>
   </div>
   <div className="creativeDemoBody">
     <div className="creativeDemoMiniLabel">{categoryLabels[item.category]} <span>· Higgsfield жишээ</span></div>
     <h3>{item.title}</h3>
     <p>{item.description}</p>
     <div className="creativeDemoUsage"><span>Хэрэглэх санаа</span>{item.use}</div>
     <details className="creativeDemoPrompt">
       <summary>Монгол жишиг prompt <span>Дэлгэх ↗</span></summary>
       <p>{item.prompt}</p>
       <button type="button" className="creativeCopyButton" onClick={copyPrompt}>
        {copied?<Check size={14}/>:<ClipboardCopy size={14}/>} {copied?"Хууллаа":"Prompt хуулах"}
       </button>
     </details>
     <div className="creativeDemoActions">
       <Link href={studioDemoHref(item)} className="creativeDemoPrimary">Studio-д ашиглах <ArrowRight size={15}/></Link>
       <a href={item.sourceUrl} target="_blank" rel="noopener noreferrer" aria-label={item.title+" — албан эх сурвалж"} className="creativeDemoSource">Эх сурвалж <ArrowUpRight size={14}/></a>
     </div>
   </div>
 </article>;
}
export function CreativeDemoGallery({surface="trends",compact=false}:{surface?:Surface;compact?:boolean}){
 const config=surfaces[surface];
 const[added,setAdded]=useState<CreativeDemo[]>([]);
 const[category,setCategory]=useState("all");
 const[search,setSearch]=useState("");
 useEffect(()=>{
  let mounted=true;
  fetch("/api/demos",{cache:"no-store"}).then(r=>r.ok?r.json():null).then((body:{items?:ImportedDemo[]}|null)=>{
   if(mounted&&Array.isArray(body?.items))setAdded(body.items.slice(0,100).map(normalizeImported).filter((v):v is CreativeDemo=>v!==null));
  }).catch(()=>{});
  return()=>{mounted=false;};
 },[]);
 const all=useMemo(()=>{
  const used=new Set<string>();
  return [...added,...curatedCreativeDemos].filter(item=>{
   if(used.has(item.videoUrl))return false;used.add(item.videoUrl);return true;
  });
 },[added]);
 const scoped=useMemo(()=>all.filter(v=>config.categories.includes(v.category)),[all,config.categories]);
 const searched=scoped.filter(item=>(category==="all"||item.category===category)
  &&(item.title+" "+item.description+" "+item.use+" "+item.prompt+" "+item.badge).toLowerCase().includes(search.trim().toLowerCase()));
 const visible=compact?scoped.slice(0,config.limit):searched.slice(0,100);
 const categories=config.categories.filter(cat=>scoped.some(item=>item.category===cat));
 const latest=recentHiggsfieldIdeas.filter(idea=>config.categories.includes(idea.category));
 return <section className={"productSection creativeDemoSection "+(compact?"creativeDemoCompact":"creativeDemoFull")}>
   <div className="sectionTitleRow creativeDemoHeader">
    <div><small>ТӨЛБӨРГҮЙ ЖИШЭЭ ҮЗЭХ · HIGGSFIELD</small><h2>{config.title}</h2><p>{config.hint}</p></div>
    {compact&&<Link href="/trends">Бүх жишээ <ArrowRight size={15}/></Link>}
   </div>
   {!compact&&<div className="creativeDemoToolbar" role="search">
      <div className="creativeDemoFilters" aria-label="Жишээний ангилал">
       <button type="button" aria-pressed={category==="all"} onClick={()=>setCategory("all")}>Бүгд · {scoped.length}</button>
       {categories.map(c=><button type="button" key={c} aria-pressed={category===c} onClick={()=>setCategory(c)}>{categoryLabels[c]}</button>)}
      </div>
      <label className="creativeDemoSearch"><Search size={16}/><span className="sr-only">Жишээ видео хайх</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Тренд, хөдөлгөөн, prompt хайх…"/></label>
   </div>}
   {visible.length?<div className="creativeDemoGrid">{visible.map(item=><ExampleCard key={item.id} item={item}/>)}</div>:<p className="creativeDemoEmpty"><Video size={18}/> Тохирох видео олдсонгүй. Өөр төрлөөр хайна уу.</p>}
   {!compact&&latest.length>0&&<div className="creativeUpcoming">
      <div className="creativeUpcomingHead"><TrendingUp size={20}/><div><h3>Higgsfield-ийн шинэ трендүүд · 2026</h3><p>Албан ёсны чиглэлүүд. Яг таарсан видео файл баталгаажаагүй тул энд тоглох видео гэж дүр эсгэхгүй; зөвшөөрсөн демог админ импортолсны дараа галерейд гарна.</p></div></div>
      <div className="creativeUpcomingList">{latest.map(idea=><article key={idea.id}>
        <div><small>{categoryLabels[idea.category]}</small><h4>{idea.title}</h4><p>{idea.desc}</p></div>
        <details><summary>Монгол prompt жишээ</summary><p>{idea.prompt}</p><PromptCopy prompt={idea.prompt}/></details>
        <a href={idea.official} target="_blank" rel="noopener noreferrer">Албан эх сурвалж <ArrowUpRight size={13}/></a>
      </article>)}</div>
   </div>}
   <p className="creativeDemoDisclosure">Жишээ бичлэгүүдийг Higgsfield-ийн нийтэд нээлттэй медиа эх сурвалж болон админы зөвшөөрсөн видео сангаас тоглуулна. Монгол prompt нь RAINY-ийн шинэчилж бичсэн жишээ; ижил үр дүн, албан ёсны partnership эсвэл бүх preset RAVS-д шууд ажиллана гэж батлахгүй. Кредит зөвхөн Studio дээр баталсан генерацад зарцуулагдана.</p>
 </section>;
}
