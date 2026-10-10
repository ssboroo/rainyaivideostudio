import type { Metadata } from "next";
import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { UserActions } from "@/components/user-actions";
import { ArrowRight, ArrowUpRight, AudioLines, Clapperboard, Film, Gauge, Layers3, LockKeyhole, Mic2, MonitorPlay, ShieldCheck, Sparkles, WandSparkles } from "lucide-react";
import "./movie-producer.css";

export const metadata: Metadata = {
  title: "One-Prompt Movie — AI Director",
  description: "RAINY Video-ийн кино төлөвлөлт, олон кадрын зардал, storyboard QA, ChatGPT/Claude MCP интеграц. Автомат үйлдвэрлэлийн боломжуудын хөгжүүлэлтийн төлөв.",
};

const milestones = [
  { icon: <WandSparkles size={23}/>, label: "01 — AI Director", title: "Нэг prompt-оос олон кадр", description: "4–3600 секундийн storyboard, дүрийн continuity bible, scene бүрийн камер, үйл явдал, урьдчилсан видео кредитийг гаргана.", state: "Хэрэгжсэн · төлөвлөлт" },
  { icon: <ShieldCheck size={23}/>, label: "02 — Storyboard QA", title: "Үүсгэхээс өмнөх чанарын хяналт", description: "Давхардсан prompt, хугацааны зөрүү, кадрын мэдээллийн дутуу хэсгийг төлбөргүй шалгана. Уран сайхны үнэлгээг баталгаажуулахгүй.", state: "Хэрэгжсэн · текстийн QA" },
  { icon: <Layers3 size={23}/>, label: "03 — Persistent Producer", title: "Чат хаагдсан ч ажлаа үргэлжлүүлэх", description: "Кадр бүрийг серверийн дараалалд хадгалах, дахин сэргээх, төлбөрийн дээд хязгаарыг мөрдөх зориулалттай нэмэлт worker.", state: "Шинэчлэлт · туршилтын шат" },
  { icon: <Gauge size={23}/>, label: "04 — Visual Quality", title: "Муу кадрыг дахин шалгах", description: "Файлын бүрэн бүтэн байдал, хэт харанхуй/frozen кадр, дүр/брэндийн нийцлийг шалгах нэмэлт AI QA. Автомат дахин үүсгэлт зөвхөн зөвшөөрсөн төсөвт багтана.", state: "Хөгжүүлж байна" },
  { icon: <AudioLines size={23}/>, label: "05 — Post-production", title: "Монгол дуу ба эцсийн MP4", description: "RAINY Voice MCP-ийн дуу, subtitle, mastering болон олон клипийн FFmpeg эвлүүлэг. Хоёр сайтад тус тусад нь бүртгэл, кредиттэй байна.", state: "MP4 engine · production gate" },
  { icon: <MonitorPlay size={23}/>, label: "06 — Delivery", title: "1080p / 4K гаралт", description: "Гаралтын сонголт, өндөр чанарын encode, өргөн дэлгэц/босоо хэмжээ. 4K upscale нь 4K native генерац гэсэн үг биш.", state: "Өргөтгөх шат" },
];

export default function MovieProducerPage() {
  return <main className="shell"><Sidebar/><section className="content rp-movie">
    <header className="topbar"><div className="topBrand"><b>RAVS / ONE-PROMPT MOVIE</b></div><UserActions/></header>
    <div className="rpm-wrap">
      <div className="rpm-hero">
        <div className="rpm-glow" aria-hidden="true"/>
        <div className="rpm-meta"><span className="rpm-pill"><Sparkles size={13}/> AI DIRECTOR</span><span className="rpm-pill muted">Production roadmap · 2026</span></div>
        <h1>Нэг санаа.<br/><em>Бүтэн киноны төлөвлөгөө.</em></h1>
        <p>Монгол хэлээр киногоо тайлбарла. AI Director олон кадрын зохиол, хэв маяг, видео өртгийг төлөвлөнө. RAINY Voice-той ChatGPT эсвэл Claude MCP-ээр хамтран ажиллуулах боломжтой.</p>
        <div className="rpm-actions"><Link className="rpm-primary" href="/integrations">MCP-ээр холбох <ArrowRight size={17}/></Link><Link className="rpm-secondary" href="/studio">Видео Studio <ArrowUpRight size={16}/></Link></div>
        <div className="rpm-facts"><span><Clapperboard size={16}/> Олон кадрын storyboard</span><span><Film size={16}/> 9:16 · 16:9 · 1:1</span><span><LockKeyhole size={16}/> Баталсан төсвийн хязгаар</span></div>
      </div>
      <div className="rpm-heading"><div><small>КИНО ҮЙЛДВЭРЛЭЛИЙН PIPELINE</small><h2>Бүтээл нэгтгэх 6 хөдөлгүүр</h2></div><p>Хэрэгжсэн боломж болон идэвхжүүлэлт хүлээж буй функцийг нээлттэй ялгав.</p></div>
      <div className="rpm-grid">{milestones.map(x=><article className="rpm-card" key={x.label}><div className="rpm-card-top"><span className="rpm-icon">{x.icon}</span><small>{x.label}</small></div><h3>{x.title}</h3><p>{x.description}</p><span className="rpm-state">{x.state}</span></article>)}</div>
      <section className="rpm-split"><div><small>WORKFLOW</small><h2>ChatGPT / Claude → RAVS → Voice</h2><p>Хоёр сайт тусдаа хэвээр. Видео болон дууны MCP-г тус тусад нь OAuth-р зөвшөөрнө. Үүсгэлт бүрийн зардлыг урьдчилан харуулж, зөвшөөрөөгүй төлбөртэй хүсэлт ажиллуулахгүй.</p><Link href="/integrations">Холболтын заавар <ArrowRight size={16}/></Link></div><div className="rpm-command"><small>Prompt жишээ</small><p>“Монголын говьд өрнөх 8 минутын кино. 16:9 cinematic, гол дүрийн төрх, хувцас тогтвортой. Кадр бүр өөр найруулгатай, Монгол өгүүлэгчийн дуу, хадмалтай. Storyboard, QA, нийт кредитийн дээд төсвийг танилцуул. Миний зөвшөөрлийн дараа эхлүүл.”</p></div></section>
      <div className="rpm-disclaimer"><ShieldCheck size={20}/><p><b>Бодит статус:</b> киноны төлөвлөлт, storyboard шалгалт хэрэгжсэн. ChatGPT хаагдсан хойно бүх сцен бие даан дуусгах worker, бодит дүрсний AI QA, lip-sync, 4K экспорт нь хөгжүүлэлт/баталгаажуулалтын шатанд. Voice-ийн MP4 эвлүүлгийн хэрэгсэл баталгаажсан CDN болон production тестийн дараа идэвхжинэ.</p></div>
      <div className="rpm-foot"><span>RAINY AI VIDEO STUDIO</span><Link href="https://voice.rainy.studio/movie">RAINY Voice post-production <Mic2 size={15}/></Link></div>
    </div>
  </section></main>;
}