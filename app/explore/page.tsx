import Link from "next/link";
import { ArrowRight, Compass, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { CommunityInspiration } from "@/components/community-inspiration";
import { promptPresets, workflows } from "@/lib/product";
import { models } from "@/lib/models";

export default function ExplorePage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar">
          <div><b>Explore</b><span>Workflow, preset, model</span></div>
          <Link href="/studio" className="primary">Studio нээх</Link>
        </header>

        <section className="catalogPage">
          <div className="catalogHero">
            <div className="eyebrow"><Compass size={14} /> RAVS Explore</div>
            <h1>Юу хийхээ сонго. <em>Яаж хийхийг RAVS шийднэ.</em></h1>
            <p>Workflow, prompt preset болон verified API model-уудаас өөрийн ажлын хамгийн хурдан замыг сонго.</p>
          </div>

          <CommunityInspiration surface="explore" title="Explore community projects" />
          <div className="catalogSection">
            <div className="sectionTitleRow compact"><div><small>WORKFLOWS</small><h2>Creative workflow</h2></div></div>
            <div className="workflowGrid">
              {workflows.map((item) => (
                <Link className={"workflowCard compactCard accent-" + item.accent} href={item.href} key={item.id}>
                  <div className="workflowTop"><span>{item.eyebrow}</span><b>{item.badge}</b></div>
                  <h3>{item.title}</h3><p>{item.description}</p>
                  <div className="tagRow">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                </Link>
              ))}
            </div>
          </div>

          <div className="catalogSection">
            <div className="sectionTitleRow compact"><div><small>PRESETS</small><h2>Prompt preset</h2></div></div>
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
                  <span>Preset ашиглах <ArrowRight size={14} /></span>
                </Link>
              ))}
            </div>
          </div>

          <div className="catalogSection">
            <div className="sectionTitleRow compact"><div><small>VERIFIED API CATALOG</small><h2>Model-ууд</h2></div></div>
            <div className="catalogModelGrid">
              {models.map((model) => (
                <Link href={"/studio?model=" + model.slug} className="catalogModel" key={model.slug}>
                  <div className={"modelGlyph large tone-" + (model.tone || "violet")}>{model.name.slice(0, 1)}</div>
                  <div><small>{model.maker || model.provider}</small><h3>{model.name}</h3><p>{model.description}</p></div>
                  <div className="catalogModelMeta"><span>{model.badge}</span><span>{model.creditRate}{model.pricingType === "second" ? "/сек" : ""} cr</span></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
