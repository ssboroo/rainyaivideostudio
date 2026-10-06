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
          <div><b>Бүтээлчдийн сан</b><span>Жишээ үзээд өөрийн хувилбарыг бүтээ</span></div>
          <Link href="/studio?surface=video" className="primary">Видео үүсгэх <ArrowRight size={13} /></Link>
        </header>

        <section className="communityWallHero">
          <div className="eyebrow"><UsersRound size={14} /> БҮТЭЭЛЧДИЙН САН</div>
          <h1>Үзээд шууд <em>өөрийн хувилбарыг</em> бүтээ.</h1>
          <p>Бүтээлчдийн жишээ видеог үзэж, таалагдсан санаагаа өөрийн тайлбар, жишиг зургаар шинээр бүтээ.</p>
        </section>

        <CommunityFeed />
      </section>
    </main>
  );
}
