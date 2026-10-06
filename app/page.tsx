import Link from "next/link";
import {
  ArrowRight,
  ChevronRight,
  Clapperboard,
  Image as ImageIcon,
  Layers3,
  Play,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { VideoShowcase } from "@/components/video-showcase";
import { TrendShowcase } from "@/components/trend-showcase";
import { promptPresets, workflows } from "@/lib/product";
import { models } from "@/lib/models";

export default function Home() {
  const featured = models.filter((model) => model.featured).slice(0, 8);

  return (
    <main className="shell">
      <Sidebar />
      <section className="content productHome">
        <header className="topbar">
          <div className="topBrand">
            <b>RAVS</b>
            <span>AI Creative Suite</span>
          </div>
          <div className="topActions">
            <Link className="ghost" href="/login">Нэвтрэх</Link>
            <Link className="creditPill" href="/billing">Credit авах</Link>
            <Link className="primary" href="/studio">Studio нээх</Link>
          </div>
        </header>

        <section className="dashboardHero">
          <div className="heroAtmosphere heroDots" />
          <div className="heroAtmosphere heroGlow" />
          <div className="heroInner">
            <div className="heroVisuals" aria-hidden>
              <div className="heroFrame heroFrameLeft"><span>VIDEO</span><div className="frameOrb orbA" /></div>
              <div className="heroFrame heroFrameMain"><span>RAVS</span><div className="frameOrb orbB" /><i>AI CREATIVE STUDIO</i></div>
              <div className="heroFrame heroFrameRight"><span>IMAGE</span><div className="frameOrb orbC" /></div>
            </div>

            <div className="eyebrow"><Sparkles size={14} /> Монгол хэл дээрх AI Creative Suite</div>
            <h1>Санаанаас <em>бэлэн контент</em> хүртэл.</h1>
            <p>
              Video, image, cinema, motion, Genjutsu, product ads болон character workflow-уудыг
              нэг ойлгомжтой Монгол Studio-д.
            </p>

            <Link href="/studio" className="commandBar">
              <div className="commandIcon"><WandSparkles size={18} /></div>
              <div>
                <b>Юу бүтээх вэ?</b>
                <span>Монгол хэлээр санаагаа бичээд хамгийн тохиромжтой model-оо сонго.</span>
              </div>
              <div className="commandGo">Studio <ArrowRight size={16} /></div>
            </Link>

            <div className="heroQuick">
              <Link href="/studio?surface=video"><Clapperboard size={14} /> Видео</Link>
              <Link href="/studio?surface=image"><ImageIcon size={14} /> Зураг</Link>
              <Link href="/marketing"><Layers3 size={14} /> Product Ads</Link>
            </div>
          </div>
        </section>

        <section className="productSection">
          <div className="sectionTitleRow">
            <div>
              <small>WORKFLOWS</small>
              <h2>Хийх зүйлээрээ сонго</h2>
              <p>Model нэр мэдэх шаардлагагүй. Ажлын төрлөө сонгоод шууд эхэл.</p>
            </div>
            <Link href="/explore">Бүгдийг харах <ChevronRight size={16} /></Link>
          </div>
          <div className="workflowGrid">
            {workflows.map((item) => (
              <Link className={"workflowCard accent-" + item.accent} href={item.href} key={item.id}>
                <div className="workflowTop">
                  <span>{item.eyebrow}</span>
                  <b>{item.badge}</b>
                </div>
                <div className="workflowArt"><div /><div /><div /></div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
                <div className="tagRow">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
              </Link>
            ))}
          </div>
        </section>

        <TrendShowcase compact />

        <VideoShowcase compact />

        <section className="productSection splitSection">
          <div>
            <div className="sectionTitleRow compact">
              <div>
                <small>START FAST</small>
                <h2>Монгол prompt preset</h2>
                <p>Нэг даралтаар Studio-д prompt болон model бэлэн нээгдэнэ.</p>
              </div>
            </div>
            <div className="presetList">
              {promptPresets.map((preset, index) => (
                <Link
                  key={preset.title}
                  href={"/studio?model=" + encodeURIComponent(preset.model) + "&prompt=" + encodeURIComponent(preset.prompt)}
                  className="presetLine"
                >
                  <span className="presetIndex">0{index + 1}</span>
                  <div><b>{preset.title}</b><small>{preset.subtitle}</small></div>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <div className="sectionTitleRow compact">
              <div>
                <small>MODELS</small>
                <h2>Шилдэг engine-үүд</h2>
                <p>RAVS model бүрийн оролт, хугацаа, харьцаа, reference-ийг автоматаар тааруулна.</p>
              </div>
            </div>
            <div className="modelMiniGrid">
              {featured.map((model) => (
                <Link href={"/studio?model=" + model.slug} className="modelMini" key={model.slug}>
                  <div className={"modelGlyph tone-" + (model.tone || "violet")}><Play size={13} fill="currentColor" /></div>
                  <div>
                    <b>{model.name}</b>
                    <small>{model.maker || model.provider} · {model.badge}</small>
                  </div>
                  <span>{model.kind}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bottomCta">
          <div>
            <small>RAVS CREATIVE CLOUD</small>
            <h2>Нэг санаа. Олон формат. Нэг workflow.</h2>
            <p>9:16 Reel, 16:9 film, 1:1 ad, product image, poster — бүгд нэг төслөөс.</p>
          </div>
          <Link href="/studio" className="primary large">Одоо бүтээх <ArrowRight size={17} /></Link>
        </section>
      </section>
    </main>
  );
}
