import Link from "next/link";
import { ArrowRight, ExternalLink, Play, TrendingUp } from "lucide-react";
import { trendDemos } from "@/lib/trend-demos";

export function TrendShowcase({ compact = false }: { compact?: boolean }) {
  const items = compact ? trendDemos.slice(0, 4) : trendDemos;

  return (
    <section className={compact ? "productSection trendSection" : "catalogPage trendPage"}>
      <div className="sectionTitleRow">
        <div>
          <small>HIGGSFIELD VIRAL · TRENDING</small>
          <h2>{compact ? "Одоо тренд болж буй video effects" : "Higgsfield trend demo-ууд"}</h2>
          <p>Official Higgsfield public preview-үүдийг Монгол тайлбартайгаар нэг дор.</p>
        </div>
        {compact && <Link href="/trends">Бүгдийг харах <ArrowRight size={15} /></Link>}
      </div>

      <div className={compact ? "trendGrid compact" : "trendGrid"}>
        {items.map((item) => (
          <article className="trendCard" key={item.id}>
            <a className="trendMedia" href={item.official} target="_blank" rel="noreferrer">
              <img src={item.poster} alt={item.title + " Higgsfield preview"} loading="lazy" />
              <div className="trendOverlay" />
              <span className="trendBadge">{item.badge}</span>
              <span className="trendPlay"><Play size={17} fill="currentColor" /></span>
              <span className="trendDemoLabel">Official demo үзэх</span>
            </a>
            <div className="trendBody">
              <div className="trendTitle">
                <div><small>VIRAL PRESET</small><h3>{item.title}</h3></div>
                <TrendingUp size={15} />
              </div>
              <p>{item.description}</p>
              <div className="trendUse"><b>Юунд тохирох вэ?</b><span>{item.use}</span></div>
              <div className="trendActions">
                <a className="ghost" href={item.official} target="_blank" rel="noreferrer">Official demo <ExternalLink size={12} /></a>
                <Link className="primary" href="/apps">RAVS workflow <ArrowRight size={12} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!compact && (
        <div className="trendDisclaimer">
          <b>Эдгээр preview нь Higgsfield-ийн public media.</b>
          <p>RAVS нь media-г өөрийн сервер дээр хуулж хадгалахгүй. Card дарвал Higgsfield-ийн тухайн official demo page нээгдэнэ.</p>
        </div>
      )}
    </section>
  );
}
