import Link from "next/link";
import {CreativeDemoGallery} from "@/components/creative-demo-gallery";
import { Aperture, ArrowRight, Clock3, Film, Layers3, SlidersHorizontal } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

const features = [
  [Clock3, "30 секунд", "Үйл явдлаа үргэлжилсэн кадраар дүрслэх боломж."],
  [Layers3, "50 хүртэл жишиг материал", "Дүр, бүтээгдэхүүн, орчин болон хэв маягийн жишиг материалыг нэгтгэнэ."],
  [Aperture, "Киноны найруулга", "Камер, дуран, өнгө, хэмнэл болон кадрын зохиомжоо төлөвлө."],
  [SlidersHorizontal, "Тодорхой тохиргоо", "Хугацаа, хэмжээ болон харьцааг сонгож бүтээлээ удирдана."],
] as const;

export default function CinemaPage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar"><div><b>Cinema Studio</b><span>Кино бүтээх хэрэгслүүд</span></div><Link href="/studio?model=cinema-studio-4" className="primary">Кадр үүсгэх</Link></header>
        <section className="featurePage">
          <div className="featureHero cinemaHero">
            <div className="featureKicker"><Film size={15}/> CINEMA STUDIO 4.0</div>
            <h1>Киноны хэсгээ <em>өөрөө найруул.</em></h1>
            <p>Киноны дүр, орчин, камерын хөдөлгөөнөө тодорхойл. Жишиг материал, хугацаа, харьцаа болон дуугаа нэг дор тохируул.</p>
            <div className="featureActions"><Link className="primary large" href="/studio?model=cinema-studio-4">Cinema Studio нээх <ArrowRight size={17}/></Link><Link className="ghost large" href="/explore">Preset харах</Link></div>
            <div className="cinemaFrames"><Link href="/video-guide#cinema"><Film/><b>1. Кадраа төлөвлө</b><small>Камер, орчин, үйл явдлын заавар</small></Link><Link href="/studio?model=cinema-studio-4"><Layers3/><b>2. Жишиг материалаа оруул</b><small>Дүр, бүтээгдэхүүн, орчны зураг</small></Link><Link href="/trends"><Aperture/><b>3. Санаа авах видео үз</b><small>Кино ба эффектүүдийн жишээ</small></Link></div>
          </div>
          <div className="featureGrid">{features.map(([Icon,title,desc])=><div className="featureCell" key={title}><Icon/><b>{title}</b><p>{desc}</p></div>)}</div>
          <div className="featureCallout"><div><small>WORKFLOW</small><h2>Жишиг материал → Найруулга → Бүтээл → Шинэ хувилбар</h2><p>Бүтээлийн түүхээс үр дүнгээ үзэж, татаж хадгал. Гадаад файлын хадгалалтын хугацаа хязгаартай тул бэлэн бүтээлээ өөртөө татаж аваарай.</p></div><Link href="/studio?model=cinema-studio-4" className="primary">Эхлэх <ArrowRight size={15}/></Link></div>
        </section>
        <CreativeDemoGallery surface="cinema" compact/>
      </section>
    </main>
  );
}
