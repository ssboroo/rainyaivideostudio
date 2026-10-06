"use client";

import Link from "next/link";
import { DemoPlayer } from "@/components/demo-player";
import { WorkflowTutorials } from "@/components/workflow-tutorials";
import { ArrowRight, Sparkles } from "lucide-react";
import { videoShowcases, type VideoShowcaseItem } from "@/lib/video-showcase";

function Preview({ item }: { item: VideoShowcaseItem }) {
 return <DemoPlayer source={item.officialHref} src={item.previewSrc} title={item.title}/>;
}

export function VideoShowcase({ compact = false }: { compact?: boolean }) {
  const items = compact ? videoShowcases.slice(0, 4) : videoShowcases;

  return (
    <section className={compact ? "productSection videoShowcaseSection" : "catalogPage videoGuidePage"}>
      <div className="sectionTitleRow">
        <div>
          <small>ВИДЕО ЖИШЭЭ</small>
          <h2>{compact ? "Видео боломжуудыг жишээгээр ойлго" : "Ямар видео хэрэгсэл юунд тохирох вэ?"}</h2>
          <p>Жишээ видеогоо тоглуулж үзээд, тохирох хэрэгслээр бүтээж эхлээрэй.</p>
        </div>
        {compact && <Link href="/video-guide">Бүгдийг харах <ArrowRight size={15} /></Link>}
      </div>

      <div className={compact ? "videoShowcaseGrid compact" : "videoShowcaseGrid"}>
        {items.map((item) => (
          <article className="videoShowcaseCard" key={item.id}>
            <div className="showcaseMedia">
              <Preview item={item} />
              <div className="showcaseBadge">{item.subtitle}</div>
            </div>
            <div className="showcaseBody">
              <div className="showcaseTitleRow">
                <div><small>ВИДЕО ХЭРЭГСЭЛ</small><h3>{item.title}</h3></div>
                <Sparkles size={16} />
              </div>
              <p>{item.description}</p>
              <div className="showcaseUse"><b>Юунд ашиглах вэ?</b><div>{item.useCases.map((value) => <span key={value}>{value}</span>)}</div></div>
              <div className="showcaseCapabilities">{item.capabilities.map((value) => <span key={value}>{value}</span>)}</div>
              <div className="showcaseActions">
                <Link className="primary" href={item.studioHref}>Бүтээж эхлэх <ArrowRight size={14} /></Link>
                <Link href={"/video-guide#"+(item.id==="effects"?"apps":item.id)}>Монгол заавар</Link>
                <a href={item.officialHref} target="_blank" rel="noopener noreferrer">Higgsfield жишээ ↗</a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!compact && <WorkflowTutorials />}
    </section>
  );
}
