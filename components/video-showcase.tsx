import Link from "next/link";
import { ArrowRight, ExternalLink, Play, Sparkles } from "lucide-react";
import { videoShowcases, type VideoShowcaseItem } from "@/lib/video-showcase";

function Preview({ item }: { item: VideoShowcaseItem }) {
  if (item.previewSrc) {
    return (
      <video
        className="showcaseVideo"
        src={item.previewSrc}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
      />
    );
  }

  return (
    <div className={"showcaseFallback accent-" + item.accent} aria-label={item.title + " preview"}>
      <div className="showcaseNoise" />
      <div className="showcaseOrb showcaseOrbA" />
      <div className="showcaseOrb showcaseOrbB" />
      <div className="showcaseScan" />
      <div className="showcasePlay"><Play size={18} fill="currentColor" /></div>
      <span>RAVS DEMO SLOT</span>
    </div>
  );
}

export function VideoShowcase({ compact = false }: { compact?: boolean }) {
  const items = compact ? videoShowcases.slice(0, 4) : videoShowcases;

  return (
    <section className={compact ? "productSection videoShowcaseSection" : "catalogPage videoGuidePage"}>
      <div className="sectionTitleRow">
        <div>
          <small>VIDEO SHOWCASE</small>
          <h2>{compact ? "Видео боломжуудыг жишээгээр ойлго" : "Ямар видео хэрэгсэл юунд тохирох вэ?"}</h2>
          <p>
            Higgsfield-ийн video workflow-уудыг Монгол тайлбартайгаар ойлгож,
            RAVS дээр шууд тухайн model-оор эхэл.
          </p>
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
                <div>
                  <small>VIDEO WORKFLOW</small>
                  <h3>{item.title}</h3>
                </div>
                <Sparkles size={16} />
              </div>
              <p>{item.description}</p>
              <div className="showcaseUse">
                <b>Юунд ашиглах вэ?</b>
                <div>{item.useCases.map((value) => <span key={value}>{value}</span>)}</div>
              </div>
              <div className="showcaseCapabilities">
                {item.capabilities.map((value) => <span key={value}>{value}</span>)}
              </div>
              <div className="showcaseActions">
                <Link className="primary" href={item.studioHref}>RAVS дээр нээх <ArrowRight size={14} /></Link>
                <a className="ghost" href={item.officialHref} target="_blank" rel="noreferrer">
                  Official demo <ExternalLink size={13} />
                </a>
              </div>
            </div>
          </article>
        ))}
      </div>

      {!compact && (
        <div className="showcaseNote">
          <div>
            <small>MEDIA POLICY</small>
            <b>Official Higgsfield video-г шууд хуулж hotlink хийгээгүй.</b>
            <p>
              RAVS өөрийн generated demo video URL-уудыг тохируулмагц дээрх preview хэсгүүд autoplay loop video болж ажиллана.
              Ингэснээр CDN тасрах, permission/copyright эрсдэлгүй.
            </p>
          </div>
          <Link href="/studio" className="primary">Өөрийн demo үүсгэх <ArrowRight size={14} /></Link>
        </div>
      )}
    </section>
  );
}
