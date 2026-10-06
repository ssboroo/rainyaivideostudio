import Link from "next/link";
import { ArrowRight, BadgeDollarSign, Image, LayoutTemplate, Megaphone, ShoppingBag } from "lucide-react";
import { Sidebar } from "@/components/sidebar";

const lanes = [
  [Image, "Product Shots", "Product reference-ээс clean, editorial, lifestyle campaign image."],
  [Megaphone, "Ads", "Social ad creative, composition, headline space, campaign direction."],
  [ShoppingBag, "Marketplace", "Listing-ready product image болон ecommerce composition."],
  [LayoutTemplate, "Posters", "Typography болон product-focused graphic layout."],
] as const;

export default function MarketingPage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar"><div><b>Marketing Studio</b><span>Product creative workspace</span></div><Link href="/studio?model=marketing-studio" className="primary">Campaign үүсгэх</Link></header>
        <section className="featurePage">
          <div className="featureHero marketingHero">
            <div className="featureKicker"><BadgeDollarSign size={15}/> PRODUCT → CONTENT</div>
            <h1>Нэг бүтээгдэхүүнээс <em>бүх сувгийн контент.</em></h1>
            <p>Product image-ээ оруулаад ad, marketplace, poster, campaign visual-уудаа нэг workflow-оор үүсгэ.</p>
            <div className="featureActions"><Link className="primary large" href="/studio?model=marketing-studio">Product creative эхлэх <ArrowRight size={17}/></Link><Link className="ghost large" href="/apps">Quick tools</Link></div>
          </div>
          <div className="laneGrid">{lanes.map(([Icon,title,desc])=><Link href={"/studio?model=marketing-studio&prompt="+encodeURIComponent(title+" — premium commercial creative")} className="laneCard" key={title}><Icon/><div><b>{title}</b><p>{desc}</p></div><ArrowRight size={15}/></Link>)}</div>
          <div className="featureCallout"><div><small>RAVS ADVANTAGE</small><h2>Монгол UI + ₮ credit + Wire.mn</h2><p>Provider-ийн USD billing хэрэглэгчид харагдахгүй. RAVS credit ашиглаад нэг бүтээгдэхүүний creative pipeline-аа дотроо удирдана.</p></div><Link href="/billing" className="ghost">Credit авах</Link></div>
        </section>
      </section>
    </main>
  );
}
