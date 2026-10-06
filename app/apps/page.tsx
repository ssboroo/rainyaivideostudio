import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Sidebar } from "@/components/sidebar";
import { appTools, suiteOnly } from "@/lib/product";

export default function AppsPage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar">
          <div><b>Effects & Apps</b><span>One-click creative workflows</span></div>
          <Link href="/studio" className="primary">Studio нээх</Link>
        </header>
        <section className="catalogPage">
          <div className="catalogHero compactHero">
            <div className="eyebrow"><Sparkles size={14} /> QUICK TOOLS</div>
            <h1>Нэг үйлдэл. <em>Шууд үр дүн.</em></h1>
            <p>Higgsfield Apps-ийн task-first логикийг RAVS-ийн API-connected workflow-уудтай нэгтгэсэн.</p>
          </div>
          <div className="appsGrid">
            {appTools.map((tool) => (
              <Link href={tool.href} className={"appTool accent-" + tool.accent} key={tool.title}>
                <div className="appToolVisual"><Sparkles size={20} /></div>
                <small>{tool.category}</small>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <span>Нээх <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>

          <div className="suiteNotice">
            <div><small>PROVIDER SUITE</small><h2>API contract баталгаажаагүй хэсгүүд</h2><p>RAVS ажиллахгүй fake товч харуулахгүй. Public API contract ил болсон үед эдгээрийг server-side adapter-аар холбоно.</p></div>
            <div className="suiteOnlyList">
              {suiteOnly.map((item) => <div key={item.title}><b>{item.title}</b><span>{item.detail}</span><small>{item.status}</small></div>)}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
