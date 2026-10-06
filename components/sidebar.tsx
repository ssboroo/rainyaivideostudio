"use client";

import Link from "next/link";
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
  const path = href.split("?")[0].split("#")[0];
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(path + "/");
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <Link href="/" className="brand ravsSidebarBrand" aria-label="RAVS home">
        <RavsLogo showSubtitle />
      </Link>

      <nav className="sideNav">
        {groups.map((group) => (
          <div className="sideGroup" key={group.label}>
            <div className="sideLabel">{group.label}</div>
            {group.items.map(([href, label, Icon]) => (
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

      <div className="sidebarPromo">
        <div className="promoIcon"><RavsLogo compact /></div>
        <div>
          <b>Нэг студи</b>
          <small>Видео · Зураг · Зар</small>
        </div>
      </div>

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
