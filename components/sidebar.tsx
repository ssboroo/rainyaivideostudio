"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Aperture,
  BadgeDollarSign,
  Boxes,
  Clapperboard,
  Compass,
  Film,
  Home,
  Image,
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
      ["/studio", "Studio", Clapperboard],
      ["/explore", "Explore", Compass],
    ],
  },
  {
    label: "Workflow",
    items: [
      ["/cinema", "Cinema Studio", Film],
      ["/studio?group=Genjutsu", "Genjutsu", WandSparkles],
      ["/marketing", "Marketing", Megaphone],
      ["/influencer", "AI Influencer", ScanFace],
      ["/apps", "Effects & Apps", Sparkles],
    ],
  },
  {
    label: "Сан",
    items: [
      ["/studio#generations", "Бүтээлүүд", LayoutGrid],
      ["/billing", "Credit", WalletCards],
      ["/admin", "Admin", ShieldCheck],
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
      <Link href="/" className="brand" aria-label="RAVS home">
        <span className="brandMark"><Aperture size={18} /></span>
        <span className="brandCopy">
          <b>RAVS</b>
          <small>Rainy AI Video Studio</small>
        </span>
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
        <div className="promoIcon"><Boxes size={16} /></div>
        <div>
          <b>One Studio</b>
          <small>Video · Image · Ads</small>
        </div>
      </div>

      <div className="sidebarFoot">
        <div className="avatar">R</div>
        <div>
          <b>Rainy AI</b>
          <small>Монгол creative platform</small>
        </div>
      </div>
    </aside>
  );
}
