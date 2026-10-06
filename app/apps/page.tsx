import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { WorkflowIcon } from "@/components/workflow-icon";
import { Sidebar } from "@/components/sidebar";
import { CommunityInspiration } from "@/components/community-inspiration";
import { appTools } from "@/lib/product";

export default function AppsPage() {
  return (
    <main className="shell">
      <Sidebar />
      <section className="content">
        <header className="topbar">
          <div><b>Эффект ба хэрэгсэл</b><span>Санаанаас үр дүн хүртэл</span></div>
          <Link href="/studio" className="primary">Studio нээх</Link>
        </header>
        <section className="catalogPage">
          <div className="catalogHero compactHero">
            <div className="eyebrow"><Sparkles size={14} /> ХУРДАН ХЭРЭГСЛҮҮД</div>
            <h1>Нэг үйлдэл. <em>Шууд үр дүн.</em></h1>
            <p>Видеогоо өөрчлөх, дүрийн хөдөлгөөн шилжүүлэх, бүтээгдэхүүний зураг болон постер бүтээх хэрэгслээ сонго.</p>
          </div>
          <div className="appsGrid">
            {appTools.map((tool) => (
              <Link href={tool.href} className={"appTool accent-" + tool.accent} key={tool.title}>
                <div className="appToolVisual"><WorkflowIcon id={tool.href} size={28} /></div>
                <small>{tool.category}</small>
                <h3>{tool.title}</h3>
                <p>{tool.description}</p>
                <span>Нээх <ArrowRight size={14} /></span>
              </Link>
            ))}
          </div>

          <CommunityInspiration surface="apps" title="Effects ашигласан community санаанууд" />
          <div className="featureCallout"><div><small>АЛХАМЧИЛСАН ЗААВАР</small><h2>Эхний бүтээлээ хамтдаа эхлүүлье</h2><p>Хэрэгсэл бүрийн оролт, тохиргоо, үр дүнг тайлбарласан Монгол заавартай танилцаарай.</p></div><Link className="primary" href="/video-guide">Заавар үзэх <ArrowRight size={15}/></Link></div>
        </section>
      </section>
    </main>
  );
}
