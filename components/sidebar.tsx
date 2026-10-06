"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RavsLogo } from "@/components/ravs-logo";
import {
  BadgeDollarSign,
  Boxes,
  Clapperboard,
  Compass,
  Film,
  Home,
  Image,
  CirclePlay,
  TrendingUp,
  UsersRound,
  LayoutGrid,
  Megaphone,
  ScanFace,
  ShieldCheck,
  Sparkles,
  WandSparkles,
  WalletCards,
} from "lucide-react";

const groups = [
  {
    label: "Бүтээх",
    items: [
      ["/", "Нүүр", Home],
      ["/studio", "Бүтээх студи", Clapperboard],
      ["/explore", "Хэрэгсэл үзэх", Compass],
      ["/video-guide", "Видео гарын авлага", CirclePlay],
      ["/trends", "Тренд видео", TrendingUp],
      ["/community", "Бүтээлчдийн сан", UsersRound],
    ],
  },
  {
    label: "Ажлын төрөл",
    items: [
      ["/cinema", "Кино студи", Film],
      ["/studio?group=Genjutsu", "Genjutsu", WandSparkles],
      ["/marketing", "Маркетинг", Megaphone],
      ["/influencer", "AI дүр бүтээх", ScanFace],
      ["/apps", "Эффект ба хэрэгсэл", Sparkles],
    ],
  },
  {
    label: "Сан",
    items: [
      ["/studio#generations", "Бүтээлүүд", LayoutGrid],
      ["/billing", "Кредит", WalletCards],
      ["/admin", "Удирдлага", ShieldCheck],
    ],
  },
] as const;

function isActive(pathname: string, href: string) {
  if(href.includes("?") || href.includes("#")) return false;
  const path = href;
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(path + "/");
}

export function Sidebar() {
  const pathname = usePathname();
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    let alive = true; setIsAdmin(false);
    fetch("/api/auth/me", {cache:"no-store"}).then(r=>r.ok?r.json():null).then(d=>{if(alive)setIsAdmin(d?.user?.role === "ADMIN");}).catch(()=>null);
    return ()=>{alive=false;};
  }, [pathname]);

  return (
    <aside className="sidebar">
      <Link href="/" className="brand ravsSidebarBrand" aria-label="RAVS нүүр хуудас">
        <RavsLogo showSubtitle />
      </Link>

      <nav className="sideNav">
        {groups.map((group) => (
          <div className="sideGroup" key={group.label}>
            <div className="sideLabel">{group.label}</div>
            {group.items.filter(([href]) => href !== "/admin" || isAdmin).map(([href, label, Icon]) => (
              <Link
                key={label}
                href={href}
                className={"navItem " + (isActive(pathname, href) ? "active" : "")}
              >
                <Icon size={17} strokeWidth={1.8} />
                <span>{label}</span>
              </Link>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebarFoot">
        <div className="avatar"><RavsLogo compact /></div>
        <div>
          <b>RAVS</b>
          <small>Монгол бүтээлч платформ</small>
        </div>
      </div>
    </aside>
  );
}
