import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { TrendShowcase } from "@/components/trend-showcase";
import { CommunityInspiration } from "@/components/community-inspiration";

export default function TrendsPage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar">
          <div><b>Trend Video</b><span>Higgsfield Viral · Монгол тайлбар</span></div>
          <Link href="/apps" className="primary">Effects нээх <ArrowRight size={14} /></Link>
        </header>
        <section className="videoGuideHero trendHero">
          <div className="eyebrow"><TrendingUp size={14}/> TREND NOW</div>
          <h1>Одоо тренд болж буй <em>video effect</em>-үүд.</h1>
          <p>Higgsfield-ийн viral preset demo-уудыг Монгол тайлбартай харж, өөрийн creative workflow-оо сонго.</p>
        </section>
        <CommunityInspiration surface="trends" title="Community trend inspiration" />
        <TrendShowcase />
      </section>
    </main>
  );
}
