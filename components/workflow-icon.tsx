import { Clapperboard, Image, Film, WandSparkles, Megaphone, ScanFace, Sparkles, Wind, Camera, AudioLines, Layers3 } from "lucide-react";
export function WorkflowIcon({ id, size = 28 }: { id: string; size?: number }) {
 const Icon = /genjutsu/.test(id) ? WandSparkles : /cinema/.test(id) ? Film : /marketing/.test(id) ? Megaphone : /influencer/.test(id) ? ScanFace : /soul|image/.test(id) ? Image : /wan/.test(id) ? Wind : /kling/.test(id) ? Camera : /seedance/.test(id) ? AudioLines : /apps|effects/.test(id) ? Sparkles : /recraft/.test(id) ? Layers3 : Clapperboard;
 return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}
