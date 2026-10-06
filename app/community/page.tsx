import Link from "next/link";
import { ArrowRight, UsersRound } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { CommunityFeed } from "@/components/community-feed";

export default function CommunityPage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content communityPage">
        <header className="topbar">
          <div><b>Community</b><span>Playable demos · Recreate in RAVS</span></div>
          <Link href="/studio?surface=video" className="primary">Видео үүсгэх <ArrowRight size={13} /></Link>
        </header>

        <section className="communityWallHero">
          <div className="eyebrow"><UsersRound size={14} /> COMMUNITY WALL</div>
          <h1>Үзээд шууд <em>өөрийн хувилбарыг</em> бүтээ.</h1>
          <p>Higgsfield-ийн public demo media-г дахин upload хийхгүйгээр шууд stream хийнэ. Official page руу үсрэхгүй; play, mute, pause бүгд энэ хуудсан дээр.</p>
        </section>

        <CommunityFeed />
      </section>
    </main>
  );
}
