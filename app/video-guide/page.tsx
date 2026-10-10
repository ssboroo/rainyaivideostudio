import Link from "next/link";
import {CreativeDemoGallery} from "@/components/creative-demo-gallery";
import { ArrowRight, Clapperboard } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { VideoShowcase } from "@/components/video-showcase";

export default function VideoGuidePage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar">
          <div><b>Видео гарын авлага</b><span>Higgsfield video workflows · Монгол тайлбар</span></div>
          <Link href="/studio?surface=video" className="primary">Видео үүсгэх <ArrowRight size={14} /></Link>
        </header>
        <section className="videoGuideHero">
          <div className="eyebrow"><Clapperboard size={14}/> VIDEO GUIDE</div>
          <h1>Видео хэрэгслээ <em>үр дүнгээр нь</em> сонго.</h1>
          <p>
            Model нэр цээжлэх шаардлагагүй. Ямар төрлийн видео хийх гэж байгаагаа хараад,
            тохирох workflow-оор RAVS Studio руу ор.
          </p>
        </section>
        <VideoShowcase />
        <CreativeDemoGallery surface="video-guide" compact/>
      </section>
    </main>
  );
}
