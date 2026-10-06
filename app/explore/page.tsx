import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { WorkflowIcon } from "@/components/workflow-icon";
import { Sidebar } from "@/components/sidebar";
import { CommunityInspiration } from "@/components/community-inspiration";
import { promptPresets, workflows } from "@/lib/product";
import { ModelCatalog } from "@/components/model-catalog";
import { MediaSizeGuide } from "@/components/model-guide";

export default function ExplorePage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar">
          <div><b>Бүтээлийн сан</b><span>Хэрэгсэл, бэлэн санаа, AI загвар</span></div>
          <Link href="/studio" className="primary">Studio нээх</Link>
        </header>

        <section className="catalogPage">
          <div className="catalogHero">
            <div className="eyebrow"><Compass size={14} /> RAVS Explore</div>
            <h1>Юу хийхээ сонго. <em>Яаж хийхийг RAVS шийднэ.</em></h1>
            <p>Хэрэгсэл, бэлэн тайлбар болон AI загваруудаас өөрийн ажилд тохирохыг сонго.</p>
          </div>

          <CommunityInspiration surface="explore" title="Бүтээлчдийн жишээ" />
          <div className="catalogSection">
            <div className="sectionTitleRow compact"><div><small>WORKFLOWS</small><h2>Бүтээх хэрэгслүүд</h2></div></div>
            <div className="workflowGrid">
              {workflows.map((item) => (
                <Link className={"workflowCard compactCard accent-" + item.accent} href={item.href} key={item.id}>
                  <div className="workflowTop"><span>{item.eyebrow}</span><b>{item.badge}</b></div>
                  <div className="workflowIconStage"><WorkflowIcon id={item.id}/></div><h3>{item.title}</h3><p>{item.description}</p>
                  <div className="tagRow">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="catalogSection">
            <div className="sectionTitleRow compact"><div><small>PRESETS</small><h2>Бэлэн санаа</h2></div></div>
            <div className="explorePresetGrid">
              {promptPresets.map((preset, index) => (
                <Link
                  className={"explorePreset tone-" + ["violet","blue","amber","rose","lime","cyan"][index % 6]}
                  href={"/studio?model=" + preset.model + "&prompt=" + encodeURIComponent(preset.prompt)}
                  key={preset.title}
                >
                  <div className="presetArt"><Sparkles size={18} /></div>
                  <small>{preset.subtitle}</small>
                  <h3>{preset.title}</h3>
                  <span>Санааг ашиглах <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          </div>

          <ModelCatalog />
          <MediaSizeGuide />
        </section>
      </section>
    </main>
  );
}
