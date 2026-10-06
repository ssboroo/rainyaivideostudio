"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clapperboard, Image, Sparkles, WandSparkles, ScanFace, PanelsTopLeft, WalletCards, Home, Film, Move3D, ShieldCheck } from "lucide-react";
const items=[
 ["/","Нүүр",Home],["/studio","AI Studio",Clapperboard],["/studio?group=Зураг","AI Зураг",Image],["/studio?group=Genjutsu","Genjutsu",WandSparkles],["/studio?group=Cinema","Cinema",Film],["/studio?group=Motion","Motion",Move3D],["/studio?group=Ads","Marketing",Sparkles],["/billing","Credit",WalletCards],["/admin","Admin",ShieldCheck]
] as const;
export function Sidebar(){
 const path=usePathname();
 return <aside className="sidebar"><Link href="/" className="brand"><span>R</span><b>RAVS</b></Link><nav>{items.map(([href,label,Icon])=><Link key={label} href={href} className={"navItem "+(path===href.split("?")[0]?"active":"")}><Icon size={18}/><span>{label}</span></Link>)}</nav><div className="sidebarFoot"><div className="avatar">R</div><div><b>Rainy AI</b><small>Video Studio</small></div></div></aside>
}
