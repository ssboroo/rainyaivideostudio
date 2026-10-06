import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Image, LayoutTemplate, Megaphone, ShoppingBag } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

const lanes = [
  [Image, "Product Shots", "Бүтээгдэхүүний зургаас студийн болон амьдралын хэв маягийн зураг бүтээ."],
  [Megaphone, "Ads", "Сошиал зарын зохиомж, гарчгийн зай, өнгө төрхөө төлөвлө."],
  [ShoppingBag, "Marketplace", "Онлайн дэлгүүрт оруулах бүтээгдэхүүний зураг, зохиомж бүтээ."],
  [LayoutTemplate, "Posters", "Бичвэр, бүтээгдэхүүн төвтэй постерын зохиомж бүтээ."],
] as const;

export default function MarketingPage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar"><div><b>Marketing Studio</b><span>Бүтээгдэхүүний контент бүтээх</span></div><Link href="/studio?model=marketing-studio" className="primary">Контент бүтээх</Link></header>
        <section className="featurePage">
          <div className="featureHero marketingHero">
            <div className="featureKicker"><BadgeDollarSign size={15}/> PRODUCT → CONTENT</div>
            <h1>Нэг бүтээгдэхүүнээс <em>бүх сувгийн контент.</em></h1>
            <p>Бүтээгдэхүүний зургаа оруулаад сурталчилгаа, дэлгүүрийн зураг, постер болон брэндийн контент бүтээ.</p>
            <div className="featureActions"><Link className="primary large" href="/studio?model=marketing-studio">Контент бүтээж эхлэх <ArrowRight size={17}/></Link><Link className="ghost large" href="/apps">Хурдан хэрэгслүүд</Link></div>
          </div>
          <div className="laneGrid">{lanes.map(([Icon,title,desc])=><Link href={"/studio?model=marketing-studio&prompt="+encodeURIComponent(title+" — premium commercial creative")} className="laneCard" key={title}><Icon/><div><b>{title}</b><p>{desc}</p></div><ArrowRight size={15}/></Link>)}</div>
          <div className="featureCallout"><div><small>RAVS ADVANTAGE</small><h2>Монгол UI + ₮ credit + Wire.mn</h2><p>Нэг дансаар хэрэгслүүдээ ашиглаж, бүтээл бүрийн кредитийг үүсгэхээс өмнө харна. Кредит худалдан авах үйлчилгээ нээгдэх үед ₮-өөр төлөх боломжтой.</p></div><Link href="/billing" className="ghost">Credit авах</Link></div>
        </section>
      </section>
    </main>
  );
}
