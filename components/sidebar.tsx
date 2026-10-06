import Link from "next/link";
import { Clapperboard, Image, Sparkles, WandSparkles, ScanFace, PanelsTopLeft, WalletCards, Home, Film, Move3D } from "lucide-react";

const items = [
  ["/", "Нүүр", Home],
  ["/studio", "AI Видео", Clapperboard],
  ["/studio?mode=image", "AI Зураг", Image],
  ["/studio?mode=effects", "Effects", Sparkles],
  ["/studio?mode=cinema", "Cinema", Film],
  ["/studio?mode=motion", "Motion", Move3D],
  ["/studio?mode=genjutsu", "Genjutsu", WandSparkles],
  ["/studio?mode=influencer", "AI Influencer", ScanFace],
  ["/studio?mode=templates", "Templates", PanelsTopLeft],
  ["/studio?mode=credits", "Credit", WalletCards]
] as const;

export function Sidebar() {
  return (
    <aside className="sidebar">
      <Link href="/" className="brand"><span>R</span><b>RAVS</b></Link>
      <nav>
        {items.map(([href, label, Icon]) => (
          <Link key={label} href={href} className="navItem"><Icon size={18}/><span>{label}</span></Link>
        ))}
      </nav>
      <div className="sidebarFoot"><div className="avatar">RB</div><div><b>Rainy Studio</b><small>0 credit</small></div></div>
    </aside>
  );
}
