import Link from "next/link";
import { UserActions } from "@/components/user-actions";
import { WorkflowArtwork, EngineMark, EngineLaunch } from "@/components/home-iconography";
import { WorkflowTutorials } from "@/components/workflow-tutorials";
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
import { RavsLogo, RavsWordmark } from "@/components/ravs-logo";
import { VideoShowcase } from "@/components/video-showcase";
import { TrendShowcase } from "@/components/trend-showcase";
import { CommunityInspiration } from "@/components/community-inspiration";
import { promptPresets, workflows } from "@/lib/product";
import { models } from "@/lib/models";
import "./home-studio.css";

export default function Home() {
  const featured = models.filter((model) => model.featured).slice(0, 8);

  return (
    <main className="shell">
      <Sidebar />
      <section className="content productHome">
        <header className="topbar">
          <div className="topBrand ravsTopBrand">
            <RavsWordmark className="ravsTopWordmark" />
            <span>AI бүтээлч студи</span>
          </div>
          <UserActions />
        </header>

        <section className="dashboardHero ravsCinematicHero">
          <img className="ravsHeroPhoto" src="/brand/website-header-real-wet.webp" alt="" aria-hidden="true" fetchPriority="high" width={1920} height={800} />
          <div className="ravsHeroShade" aria-hidden="true" />
          <div className="heroInner">
            <div className="eyebrow"><Sparkles size={14} /> Монгол хэл дээрх AI бүтээлч студи</div>
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

        <Link href="/movie-producer" className="moviePromoHome" aria-label="AI Director / One-Prompt Movie">
          <div><small>AI DIRECTOR · ONE-PROMPT MOVIE</small><h2>Нэг санаанаас олон кадрын кино.</h2><p>Киноны storyboard, scene чанарын QA, Монгол дуу, MP4 post-production, 1080p/4K экспортын боломж ба бодит төлөв.</p></div>
          <span>Боломжуудыг харах →</span>
        </Link>
        <section className="productSection">
          <div className="sectionTitleRow">
            <div>
              <small>БҮТЭЭХ ХЭРЭГСЛҮҮД</small>
              <h2>Хийх зүйлээрээ сонго</h2>
              <p>Model нэр мэдэх шаардлагагүй. Ажлын төрлөө сонгоод шууд эхэл.</p>
            </div>
            <Link href="/explore">Бүгдийг харах <ChevronRight size={16} /></Link>
          </div>
          <div className="workflowGrid homeWorkflowGrid">
            {workflows.map((item, index) => (
              <article className={"workflowCard homeWorkflowCard accent-" + item.accent} key={item.id}>
                <div className="workflowTop homeWorkflowTop">
                  <span><span className="homeWorkflowSequence">{String(index + 1).padStart(2, "0")}</span> {item.eyebrow}</span>
                  <b>{item.badge}</b>
                </div>
                <WorkflowArtwork id={item.id} />
                <div className="homeWorkflowBody">
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                  <div className="tagRow homeWorkflowTags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </div>
                <div className="workflowActions homeWorkflowActions">
                  <Link href={item.href} className="homeWorkflowPrimary" aria-label={item.title + " — бүтээж эхлэх"}>
                    Бүтээж эхлэх <ArrowRight size={16} />
                  </Link>
                  <Link href={"/video-guide#" + item.id} className="homeWorkflowHelp" aria-label={item.title + " — Монгол заавар"}>Заавар</Link>
                </div>
              </article>
            ))}
          </div>
        </section>

        <WorkflowTutorials compact />
        <TrendShowcase compact />

        <VideoShowcase compact />

        <CommunityInspiration surface="home" title="Community дээр хүмүүс юу бүтээж байна?" />
        <section className="productSection splitSection">
          <div>
            <div className="sectionTitleRow compact">
              <div>
                <small>ХУРДАН ЭХЛЭХ</small>
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
                <small>ЗАГВАРУУД</small>
                <h2>Шилдэг engine-үүд</h2>
                <p>RAVS model бүрийн оролт, хугацаа, харьцаа, reference-ийг автоматаар тааруулна.</p>
              </div>
            </div>
            <div className="modelMiniGrid homeEngineGrid">
              {featured.map((model) => (
                <Link
                  href={"/studio?model=" + encodeURIComponent(model.slug)}
                  className="modelMini homeEngineCard"
                  key={model.slug}
                  aria-label={model.name + " — Studio-д нээх"}
                >
                  <EngineMark slug={model.slug} kind={model.kind} />
                  <div className="homeEngineDescription">
                    <span className="homeEngineKind">{model.kind === "video" ? "ВИДЕО" : model.kind === "image" ? "ЗУРАГ" : "WORKFLOW"}</span>
                    <strong>{model.name}</strong>
                    <small>{model.maker || model.provider}</small>
                    <span className="homeEngineCapabilities">{(model.capabilities || []).slice(0, 2).map((capability) => <span key={capability}>{capability}</span>)}</span>
                  </div>
                  <div className="homeEngineAside"><EngineLaunch /></div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bottomCta"><div><small>NEW · RAINY MOVIE PRODUCER BETA</small>
          <h2>Нэг prompt. Олон кадр. Нэг cinematic төсөл.</h2>
          <p>ChatGPT / Claude-аас удирдах persistent scene scheduler, AI storyboard QA, Монгол voice-over ба FFmpeg export roadmap. Туршилтын боломж, бодит лимит болон идэвхжүүлэлтийн төлөвтэй танилц.</p></div>
          <Link href="/movie" className="primary large">Movie Producer <ArrowRight size={17}/></Link>
        </section>
        <section className="bottomCta">
          <div>
            <small>БҮТЭЭЛЧ ОРЧИН</small>
            <h2>Нэг санаа. Олон формат. Нэг workflow.</h2>
            <p>9:16 Reel, 16:9 film, 1:1 ad, product image, poster — бүгд нэг төслөөс.</p>
          </div>
          <Link href="/studio" className="primary large">Одоо бүтээх <ArrowRight size={17} /></Link>
        </section>
      </section>
    </main>
  );
}
