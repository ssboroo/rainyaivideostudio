import Link from "next/link";
import { ArrowRight, ScanFace, Sparkles, Upload, WandSparkles } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { CommunityInspiration } from "@/components/community-inspiration";

export default function InfluencerPage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar"><div><b>AI Influencer</b><span>Character → Motion</span></div><Link href="/studio?model=ai-influencer" className="primary">Character үүсгэх</Link></header>
        <section className="featurePage">
          <div className="featureHero influencerHero">
            <div className="featureKicker"><ScanFace size={15}/> CHARACTER STUDIO</div>
            <h1>Нэг дүр. <em>Олон контент.</em></h1>
            <p>Character sheet үүсгээд дараагийн алхамд Genjutsu Motion Transfer эсвэл Object Swap-аар хөдөлгөөнд оруул.</p>
            <div className="featureActions"><Link className="primary large" href="/studio?model=ai-influencer">Influencer үүсгэх <ArrowRight size={17}/></Link><Link className="ghost large" href="/studio?model=genjutsu-motion">Motion нээх</Link></div>
            <div className="characterSteps">
              <div><Upload/><b>1. Reference</b><span>Optional face / item</span></div>
              <div><Sparkles/><b>2. Character</b><span>Generate sheet</span></div>
              <div><WandSparkles/><b>3. Motion</b><span>Genjutsu workflow</span></div>
            </div>
          </div>
          <div className="featureGrid three">
            <div className="featureCell"><ScanFace/><b>Бодит төрх</b><p>UGC, lifestyle, presenter төрлийн natural character.</p></div>
            <div className="featureCell"><Sparkles/><b>Онцгой төрх</b><p>Feed дээр ялгарах ч approachable character direction.</p></div>
            <div className="featureCell"><WandSparkles/><b>Уран зөгнөлт төрх</b><p>Meme, comedy, sketch, highly distinctive character direction.</p></div>
          </div>
          <CommunityInspiration surface="influencer" title="Creator & character inspiration" />
        </section>
      </section>
    </main>
  );
}
