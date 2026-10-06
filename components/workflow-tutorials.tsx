"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import { WorkflowIcon } from "@/components/workflow-icon";
import { DemoPlayer } from "@/components/demo-player";
import { tutorials } from "@/lib/workflow-tutorials";

export function WorkflowTutorials({compact=false}:{compact?:boolean}) {
 const [search,setSearch]=useState("");
 const visible=compact?tutorials.slice(0,4):tutorials.filter(t=>[t.title,t.hint,t.prompt].join(" ").toLowerCase().includes(search.trim().toLowerCase()));
 return <section className="productSection tutorialSection"><div className="sectionTitleRow"><div><small>АЛХАМЧИЛСАН ЗААВАР</small><h2>Үзээд, дагаад, өөрөө бүтээ</h2><p>Хэрэгслээ ойлгож, Монгол жишиг prompt-оор шууд эхлээрэй.</p></div>{compact&&<Link href="/video-guide"><BookOpen size={15}/> Бүх заавар</Link>}</div>
 {!compact&&<div className="videoLibraryToolbar"><input aria-label="Заавар хайх" placeholder="Камер, бүтээгдэхүүн, дүр, эффект…" value={search} onChange={e=>setSearch(e.target.value)}/><span>{visible.length} дэлгэрэнгүй заавар</span><a href="https://higgsfield.ai/academy" target="_blank" rel="noopener noreferrer">Higgsfield Academy ↗</a></div>}{visible.length===0&&<p className="videoLibraryEmpty">Заавар олдсонгүй. <button onClick={()=>setSearch("")}>Хайлтыг цэвэрлэх</button></p>}<div className="tutorialGrid">{visible.map(t=><article className="tutorialCard" id={t.id} key={t.id}>
 {t.src&&<DemoPlayer source={t.source} src={t.src} title={t.title}/>}
 <div className="tutorialBody"><span className="tutorialKicker"><WorkflowIcon id={t.id} size={18}/> {t.hint}</span><h3>{t.title}</h3><div className="lessonMeta"><span>{t.steps.length} алхам</span><span>{t.id.startsWith("camera-")?"Камерын дасгал":"Бүтээх урсгал"}</span></div><ol>{t.steps.map(step=><li key={step}><Check size={13}/><span>{step}</span></li>)}</ol>
 <div className="lessonCheck"><b>Үр дүнгээ шалгах</b><p>Гол дүрийн төрх, объектын хэлбэр, камерын чиглэл тогтвортой байна уу? Алдаа гарвал нэг удаад нэг нөхцөлийг өөрчилж дахин туршаарай.</p></div><details><summary>Монгол prompt жишээ</summary><p className="tutorialPrompt">{t.prompt}</p></details><div className="tutorialLinks"><Link className="primary" href={t.href+ (t.href.includes('?')?'&':'?')+'prompt='+encodeURIComponent(t.prompt)}>Туршиж бүтээх <ArrowRight size={13}/></Link><a href={t.source} target="_blank" rel="noopener noreferrer">Higgsfield жишээ ↗</a></div></div>
 </article>)}</div></section>;
}
