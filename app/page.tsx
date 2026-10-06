import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { Generator } from "@/components/generator";
import { models } from "@/lib/models";
import { ArrowRight, Play, Sparkles } from "lucide-react";

const presets = ["Монгол cinematic", "Product Ad", "Fashion Reel", "Ulaanbaatar Night", "Наадам", "AI Influencer"];

export default function Home() {
  return <main className="shell"><Sidebar/><section className="content">
    <header className="topbar"><div><b>RAVS</b><span>Rainy AI Video Studio</span></div><div className="topActions"><button className="ghost">Explore</button><Link className="primary" href="/studio">Studio нээх</Link></div></header>
    <section className="hero">
      <div className="eyebrow"><Sparkles size={15}/> Монгол хэл дээрх AI Creative Studio</div>
      <h1>Санаагаа <em>дүрс</em> болго.</h1>
      <p>Higgsfield API-ийн хүчирхэг video, image, motion, cinema, marketing workflow-уудыг нэг Монгол интерфэйсээс ашигла.</p>
      <Generator/>
      <div className="presetRow">{presets.map(x=><button key={x}>{x}</button>)}</div>
    </section>
    <section className="section"><div className="sectionHead"><div><small>MODELS</small><h2>Бүх хүчирхэг модель нэг дор</h2></div><Link href="/studio">Бүгдийг харах <ArrowRight size={16}/></Link></div>
      <div className="modelGrid">{models.map((m,i)=><article className={`modelCard m${i%4}`} key={m.id}><div className="cardGlow"/><div className="badge">{m.badge}</div><div className="play"><Play size={18} fill="currentColor"/></div><div className="cardText"><small>{m.provider}</small><h3>{m.name}</h3><p>{m.description}</p></div></article>)}</div>
    </section>
  </section></main>
}
