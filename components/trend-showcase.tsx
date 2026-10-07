"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { DemoPlayer } from "@/components/demo-player";
import { ArrowRight, TrendingUp } from "lucide-react";
import { trendDemos } from "@/lib/trend-demos";

function TrendMedia({item}:{item:(typeof trendDemos)[number]}) {
 return <div className="trendMedia"><DemoPlayer source={item.official} src={item.previewSrc} poster={item.poster} title={item.title}/><span className="trendBadge">{item.badge}</span></div>;
}

export function TrendShowcase({ compact = false }: { compact?: boolean }) {
  const [imported,setImported]=useState<typeof trendDemos>([]);
  useEffect(()=>{let alive=true;fetch('/api/demos',{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(alive&&d)setImported(d.items.map((v:{id:string;title:string;videoUrl:string;sourceUrl:string;category:string})=>({id:v.id,title:v.title,previewSrc:v.videoUrl,official:v.sourceUrl,category:v.category,badge:'ШИНЭ',description:'Шинээр нэмэгдсэн видео жишээ',use:'Контент бүтээх санаа',poster:'',accent:'amber'})));}).catch(()=>{});return()=>{alive=false;};},[]);
  const demos=[...imported,...trendDemos];
  const [category,setCategory]=useState("all");
  const [search,setSearch]=useState("");
  const matching=demos.filter(item=>(category==="all"||(item.category||"effects")===category)&&[item.title,item.description,item.use].join(" ").toLowerCase().includes(search.toLowerCase().trim()));
  const items = compact ? demos.slice(0, 8) : matching;

  return (
    <section className={compact ? "productSection trendSection" : "catalogPage trendPage"}>
      <div className="sectionTitleRow">
        <div>
          <small>ТРЕНД ЭФФЕКТҮҮД</small>
          <h2>{compact ? "Видеоныхоо өнгө төрхийг өөрчил" : "Тренд видео эффектийн жишээнүүд"}</h2>
          <p>Жишээг тоглуулж үзээд, өөрийн зураг эсвэл видеонд тохирсон эффектийг сонго.</p>
        </div>
        {compact && <Link href="/trends">Бүгдийг харах <ArrowRight size={15} /></Link>}
      </div>

      {!compact && <div className="videoLibraryToolbar"><div className="videoLibraryFilters">{[["all","Бүгд"],["effects","Эффект"],["genjutsu","Genjutsu"]].map(([value,label])=><button key={value} type="button" aria-pressed={category===value} onClick={()=>setCategory(value)}>{label} · {demos.filter(item=>value==="all"||(item.category||"effects")===value).length}</button>)}</div><input aria-label="Видео жишээ хайх" placeholder="Видео жишээ хайх…" value={search} onChange={event=>setSearch(event.target.value)}/><span>{items.length} жишээ</span></div>}
      {!compact && items.length===0 && <p className="videoLibraryEmpty">Тохирох жишээ олдсонгүй. Өөр үгээр хайгаарай.</p>}
      <div className={compact ? "trendGrid compact" : "trendGrid"}>
        {items.map((item) => (
          <article className="trendCard" key={item.id}>
            <TrendMedia item={item} />
            <div className="trendBody">
              <div className="trendTitle">
                <div><small>ЭФФЕКТИЙН ЖИШЭЭ</small><h3>{item.title}</h3></div>
                <TrendingUp size={15} />
              </div>
              <p>{item.description}</p>
              <div className="trendUse"><b>Юунд тохирох вэ?</b><span>{item.use}</span></div>
              <details className="trendLesson"><summary>Хэрхэн бүтээх вэ?</summary><ol><li>Гол дүр эсвэл объект тод харагдах эх материал бэлтгэ.</li><li>Жишээний хөдөлгөөн, хувирах мөчийг ажигла.</li><li>Жишиг тайлбарыг өөрийн орчин, дүрээр солино.</li><li>Үр дүнг үзэж нүүр, хэлбэр, шилжилтийг шалга.</li></ol><Link href={"/video-guide#"+(item.category==="genjutsu"?"genjutsu":"apps")}>Дэлгэрэнгүй заавар ↗</Link></details><div className="trendActions">
                <Link className="primary" href={(item.category==="genjutsu"?(item.id.startsWith("motion")?"/studio?model=genjutsu-motion":"/studio?model=genjutsu-object"):"/studio?model=seedance-2-5-image")+"&prompt="+encodeURIComponent(item.description+" "+item.use+". Гол дүр, объектын хэлбэрийг хадгал.")}>Бүтээж эхлэх <ArrowRight size={12} /></Link><a className="ghost" href={item.official} target="_blank" rel="noopener noreferrer">Эх сурвалж ↗</a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!compact && <div className="trendDisclaimer"><b>Өөрийн эх материалтай туршаарай.</b><p>Жишээ видео нь Higgsfield-ийн эх сурвалжаас тоглоно. Шинээр бүтээхдээ өөрийн зураг, видео болон тайлбарыг ашиглана.</p></div>}
    </section>
  );
}
