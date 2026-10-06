import { Sidebar } from "@/components/sidebar";
import { Generator } from "@/components/generator";
import { models } from "@/lib/models";

export default function StudioPage() {
  return <main className="shell"><Sidebar/><section className="content studioPage">
    <header className="topbar"><div><b>AI Видео</b><span>RAVS Studio</span></div><div className="creditPill">0 credit</div></header>
    <div className="studioGrid">
      <div><h1>Видео үүсгэх</h1><p className="muted">Монгол prompt-оос cinematic AI video үүсгээрэй.</p><Generator/>
        <div className="toolGrid"><div><b>Image → Video</b><span>Зургаа амилуул</span></div><div><b>Motion Control</b><span>Хөдөлгөөн дамжуул</span></div><div><b>Genjutsu</b><span>Restyle & Object Swap</span></div><div><b>Cinema</b><span>Кино түвшний workflow</span></div></div>
      </div>
      <aside className="modelPanel"><h3>Модель</h3>{models.filter(x=>x.kind !== "image").map(x=><div className="modelLine" key={x.id}><div><b>{x.name}</b><span>{x.description}</span></div><small>{x.badge}</small></div>)}</aside>
    </div>
  </section></main>
}
