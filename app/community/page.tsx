import Link from "next/link";
import { ArrowRight, UsersRound } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { CommunityAll } from "@/components/community-inspiration";

export default function CommunityPage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar">
          <div><b>Community Inspiration</b><span>Official public projects · RAVS recreate</span></div>
          <Link href="/studio" className="primary">Studio нээх <ArrowRight size={13} /></Link>
        </header>
        <section className="videoGuideHero communityHero">
          <div className="eyebrow"><UsersRound size={14} /> COMMUNITY INSPIRATION</div>
          <h1>Үз. Сур. <em>Өөрийнхөөрөө шинээр бүтээ.</em></h1>
          <p>RAVS community бүтээлийг mirror хийхгүй. Official source-ийг харуулж, зөвшөөрөгдсөн эсвэл ерөнхий creative direction дээр өөрийн шинэ prompt/model preset-ээр Recreate хийдэг.</p>
        </section>
        <CommunityAll />
      </section>
    </main>
  );
}
