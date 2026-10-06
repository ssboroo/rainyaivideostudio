import Link from "next/link";
import { Aperture, ArrowRight, Clock3, Film, Layers3, SlidersHorizontal } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { CommunityInspiration } from "@/components/community-inspiration";

const features = [
  [Clock3, "30 секунд", "Нэг generation дотор scene-ийн beat хөгжих хангалттай хугацаа."],
  [Layers3, "50 reference", "Face, product, location, style consistency-г references-ээр lock хийнэ."],
  [Aperture, "Cinematic direction", "Camera, lens, pacing, colour болон shot logic-д зориулагдсан workflow."],
  [SlidersHorizontal, "Direct controls", "Prompt дээр бүгдийг тайлбарлахын оронд setting-ээр удирдах чиглэл."],
] as const;

export default function CinemaPage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar"><div><b>Cinema Studio</b><span>Professional filmmaking workflow</span></div><Link href="/studio?model=cinema-studio-4" className="primary">Scene үүсгэх</Link></header>
        <section className="featurePage">
          <div className="featureHero cinemaHero">
            <div className="featureKicker"><Film size={15}/> CINEMA STUDIO 4.0</div>
            <h1>Prompt биш. <em>Scene-ээ найруул.</em></h1>
            <p>Long-form cinematic generation-д зориулсан RAVS workspace. Reference, хугацаа, харьцаа, audio болон cinematic prompt-оо нэг дор удирдана.</p>
            <div className="featureActions"><Link className="primary large" href="/studio?model=cinema-studio-4">Cinema Studio нээх <ArrowRight size={17}/></Link><Link className="ghost large" href="/explore">Preset харах</Link></div>
            <div className="cinemaFrames" aria-hidden><div/><div/><div/></div>
          </div>
          <div className="featureGrid">{features.map(([Icon,title,desc])=><div className="featureCell" key={title}><Icon/><b>{title}</b><p>{desc}</p></div>)}</div>
          <CommunityInspiration surface="cinema" title="Community film inspiration" />
          <div className="featureCallout"><div><small>WORKFLOW</small><h2>Reference → Direction → Generate → Remix</h2><p>RAVS generation history-д бүх result үлдэнэ. Completed result-оо татах, дахин prompt болгох, өөр model-р үргэлжлүүлэхэд бэлэн.</p></div><Link href="/studio?model=cinema-studio-4" className="primary">Эхлэх <ArrowRight size={15}/></Link></div>
        </section>
      </section>
    </main>
  );
}
