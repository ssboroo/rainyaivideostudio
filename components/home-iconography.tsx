import {
  Aperture, ArrowUpRight, Clapperboard, Film, Image as ImageIcon, Layers3,
  Megaphone, ScanFace, SlidersHorizontal, Sparkles, WandSparkles,
  Play, Orbit, Wind, Camera, Type, Palette, type LucideIcon,
} from "lucide-react";

/**
 * Distinctive, consistent pictograms for RAVS creative paths.
 * These are capability icons, not claims to reproduce providers' trademarks.
 * All decorative shapes are hidden from assistive technology; readable names
 * and button labels stay in the calling card.
 */
const workflowSymbols: Record<string, { primary: LucideIcon; secondary: LucideIcon; category: string }> = {
  video: { primary: Clapperboard, secondary: Play, category: "MOTION / 01" },
  image: { primary: ImageIcon, secondary: Aperture, category: "IMAGE / 02" },
  cinema: { primary: Film, secondary: Camera, category: "DIRECT / 03" },
  genjutsu: { primary: WandSparkles, secondary: Orbit, category: "TRANSFORM / 04" },
  marketing: { primary: Megaphone, secondary: Layers3, category: "CAMPAIGN / 05" },
  influencer: { primary: ScanFace, secondary: Sparkles, category: "IDENTITY / 06" },
  apps: { primary: SlidersHorizontal, secondary: Aperture, category: "CREATE / 07" },
};

export function WorkflowArtwork({ id }: { id: string }) {
  const item = workflowSymbols[id] ?? workflowSymbols.apps;
  const Primary = item.primary;
  const Secondary = item.secondary;
  return (
    <div className={"homeWorkflowArtwork homeWorkflowArtwork--" + id} aria-hidden="true">
      <div className="homeArtworkGrid" />
      <div className="homeArtworkHalo" />
      <div className="homeArtworkFrame">
        <div className="homeArtworkCorners" />
        <Primary size={46} strokeWidth={1.5} />
      </div>
      <div className="homeArtworkSatellite"><Secondary size={19} strokeWidth={1.9} /></div>
      <div className="homeArtworkCaption"><span className="homeArtworkLive" /> {item.category}</div>
      <div className="homeArtworkRuler"><span /><span /><span /><span /><span /><span /><span /></div>
    </div>
  );
}

function engineIdentity(slug: string, kind: string): { icon: LucideIcon; family: string; label: string } {
  if (slug.startsWith("seedance")) return { icon: Play, family: "seedance", label: "S" };
  if (slug.startsWith("kling")) return { icon: Orbit, family: "kling", label: "K" };
  if (slug.startsWith("wan")) return { icon: Wind, family: "wan", label: "W" };
  if (slug.startsWith("cinema")) return { icon: Aperture, family: "cinema", label: "C" };
  if (slug.startsWith("genjutsu")) return { icon: WandSparkles, family: "genjutsu", label: "G" };
  if (slug.startsWith("marketing")) return { icon: Megaphone, family: "marketing", label: "M" };
  if (slug.startsWith("ai-influencer") || slug.startsWith("soul")) return { icon: ScanFace, family: "portrait", label: "P" };
  if (slug.startsWith("ideogram")) return { icon: Type, family: "ideogram", label: "I" };
  if (slug.startsWith("recraft")) return { icon: Palette, family: "recraft", label: "R" };
  return { icon: kind === "image" ? ImageIcon : kind === "video" ? Clapperboard : Layers3, family: "default", label: "AI" };
}

export function EngineMark({ slug, kind }: { slug: string; kind: string }) {
  const identity = engineIdentity(slug, kind);
  const Icon = identity.icon;
  return (
    <div className={"homeEngineMark homeEngineMark--" + identity.family} aria-hidden="true">
      <span className="homeEngineMarkOrbit" />
      <Icon size={23} strokeWidth={1.75} />
      <span className="homeEngineMarkIndex">{identity.label}</span>
    </div>
  );
}

export function EngineLaunch() {
  return <span className="homeEngineLaunch" aria-hidden="true"><ArrowUpRight size={17} strokeWidth={2} /></span>;
}
