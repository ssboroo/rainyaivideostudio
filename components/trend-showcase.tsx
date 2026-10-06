"use client";

import Link from "next/link";
import { DemoPlayer } from "@/components/demo-player";
import { ArrowRight, TrendingUp } from "lucide-react";
import { trendDemos } from "@/lib/trend-demos";

function TrendMedia({item}:{item:(typeof trendDemos)[number]}) {
 return <div className="trendMedia"><DemoPlayer source={item.official} src={item.previewSrc} poster={item.poster} title={item.title}/><span className="trendBadge">{item.badge}</span></div>;
}

export function TrendShowcase({ compact = false }: { compact?: boolean }) {
  const items = compact ? trendDemos.slice(0, 4) : trendDemos;

  return (
    <section className={compact ? "productSection trendSection" : "catalogPage trendPage"}>
      <div className="sectionTitleRow">
        <div>
          <small>ТРЕНД ЭФФЕКТҮҮД</small>
          <h2>{compact ? "Видеоныхоо өнгө төрхийг өөрчил" : "Тренд видео эффектийн жишээнүүд"}</h2>
          <p>Жишээг тоглуулж үзээд, өөрийн зураг эсвэл видеонд тохирсон эффектийг сонго.</p>
        </div>
        {compact && <Link href="/trends">Бүгдийг харах <ArrowRight size={15} /></Link>}
      </div>

      <div className={compact ? "trendGrid compact" : "trendGrid"}>
        {items.map((item) => (
          <article className="trendCard" key={item.id}>
            <TrendMedia item={item} />
            <div className="trendBody">
              <div className="trendTitle">
                <div><small>ЭФФЕКТИЙН ЖИШЭЭ</small><h3>{item.title}</h3></div>
                <TrendingUp size={15} />
              </div>
              <p>{item.description}</p>
              <div className="trendUse"><b>Юунд тохирох вэ?</b><span>{item.use}</span></div>
              <div className="trendActions">
                <Link className="primary" href="/apps">Эффект турших <ArrowRight size={12} /></Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!compact && <div className="trendDisclaimer"><b>Өөрийн эх материалтай туршаарай.</b><p>Жишээ видео нь Higgsfield-ийн эх сурвалжаас тоглоно. Шинээр бүтээхдээ өөрийн зураг, видео болон тайлбарыг ашиглана.</p></div>}
    </section>
  );
}
