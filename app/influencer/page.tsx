import Link from "next/link";
import { ArrowRight, ScanFace, Sparkles, Upload, WandSparkles } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

export default function InfluencerPage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar"><div><b>AI Influencer</b><span>Дүр → Хөдөлгөөн</span></div><Link href="/studio?model=ai-influencer" className="primary">Дүр үүсгэх</Link></header>
        <section className="featurePage">
          <div className="featureHero influencerHero">
            <div className="featureKicker"><ScanFace size={15}/> CHARACTER STUDIO</div>
            <h1>Нэг дүр. <em>Олон контент.</em></h1>
            <p>Дүрийн жишиг зураг үүсгээд Genjutsu хэрэгслээр хөдөлгөөн шилжүүлэх эсвэл видеоны дүрийг солиорой.</p>
            <div className="featureActions"><Link className="primary large" href="/studio?model=ai-influencer">Дүр үүсгэх <ArrowRight size={17}/></Link><Link className="ghost large" href="/studio?model=genjutsu-motion">Хөдөлгөөн шилжүүлэх</Link></div>
            <div className="characterSteps">
              <div><Upload/><b>1. Жишиг зураг</b><span>Төрх, хувцас, бүтээгдэхүүн</span></div>
              <div><Sparkles/><b>2. Дүр бүтээх</b><span>Олон өнцгийн жишиг</span></div>
              <div><WandSparkles/><b>3. Хөдөлгөөн</b><span>Genjutsu ашиглах</span></div>
            </div>
          </div>
          <div className="featureGrid three">
            <div className="featureCell"><ScanFace/><b>Бодит төрх</b><p>Сошиал, өдөр тутмын амьдрал, танилцуулгад ашиглах бодит мэт дүр.</p></div>
            <div className="featureCell"><Sparkles/><b>Онцгой төрх</b><p>Сошиалд ялгарах содон төрх, хувцас, хэв маяг.</p></div>
            <div className="featureCell"><WandSparkles/><b>Уран зөгнөлт төрх</b><p>Хошин болон уран зөгнөлт контентод зориулсан өвөрмөц дүр.</p></div>
          </div>
        </section>
      </section>
    </main>
  );
}
