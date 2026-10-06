export type VideoShowcaseItem = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  useCases: string[];
  capabilities: string[];
  studioHref: string;
  officialHref: string;
  accent: string;
  previewSrc?: string;
};

export const videoShowcases: VideoShowcaseItem[] = [
  {
    id: "seedance",
    title: "Seedance 2.5",
    subtitle: "Text / Image / Reference → Video",
    description: "Текст, зураг, видео, аудио reference ашиглан 30 секунд хүртэл видео үүсгэнэ. Social reel, cinematic scene, product motion зэрэгт хамгийн уян хатан сонголт.",
    useCases: ["Reel & Shorts", "Cinematic scene", "Product motion"],
    capabilities: ["30 сек", "1080p", "Optional audio", "Multi-reference"],
    studioHref: "/studio?model=seedance-2-5",
    officialHref: "https://open.higgsfield.ai/explore/video",
    accent: "violet",
    previewSrc: process.env.NEXT_PUBLIC_RAVS_DEMO_SEEDANCE || undefined,
  },
  {
    id: "genjutsu",
    title: "Higgsfield Genjutsu",
    subtitle: "Нэг хөдөлгөөн → шинэ ертөнц",
    description: "Эх видеоны хөдөлгөөн, камер, timing-ийг хадгалаад character, location, product, outfit зэрэг дүрслэлийг reference-ээр шинээр бүтээнэ.",
    useCases: ["Motion transfer", "Object swap", "Restyle"],
    capabilities: ["Motion хадгална", "Camera хадгална", "Object swap", "Reference-driven"],
    studioHref: "/studio?model=genjutsu-motion",
    officialHref: "https://higgsfield.ai/genjutsu",
    accent: "rose",
    previewSrc: process.env.NEXT_PUBLIC_RAVS_DEMO_GENJUTSU || undefined,
  },
  {
    id: "cinema",
    title: "Cinema Studio 4.0",
    subtitle: "AI filmmaking workspace",
    description: "Scene direction, genre, camera movement, reference болон 30 секунд хүртэлх clip-ийг нэг filmmaking workflow-д удирдана.",
    useCases: ["Short film", "Commercial", "Music video"],
    capabilities: ["30 сек", "30 API refs", "Native sound", "Scene direction"],
    studioHref: "/studio?model=cinema-studio-4",
    officialHref: "https://higgsfield.ai/cinematic-video-generator",
    accent: "amber",
    previewSrc: process.env.NEXT_PUBLIC_RAVS_DEMO_CINEMA || undefined,
  },
  {
    id: "effects",
    title: "Visual Effects",
    subtitle: "One-click cinematic effects",
    description: "Earth zoom, melting, world morphing, bullet time, clones зэрэг viral effect төрлүүдийг task-first байдлаар ойлгомжтой сонгодог хэсэг.",
    useCases: ["Viral effects", "Transitions", "Stylized clips"],
    capabilities: ["One-click flow", "Trend presets", "Transform", "Transitions"],
    studioHref: "/apps",
    officialHref: "https://higgsfield.ai/effects",
    accent: "cyan",
    previewSrc: process.env.NEXT_PUBLIC_RAVS_DEMO_EFFECTS || undefined,
  },
  {
    id: "kling",
    title: "Kling 3.0",
    subtitle: "Multi-shot + native audio",
    description: "Text эсвэл image-ээс multi-shot video үүсгэж, native audio болон cinematic sequence хийхэд тохиромжтой.",
    useCases: ["Multi-shot ad", "Narrative reel", "Image animation"],
    capabilities: ["15 сек", "Multi-shot", "Native audio", "Image → Video"],
    studioHref: "/studio?model=kling-3-standard",
    officialHref: "https://open.higgsfield.ai/explore/video",
    accent: "blue",
    previewSrc: process.env.NEXT_PUBLIC_RAVS_DEMO_KLING || undefined,
  },
  {
    id: "wan",
    title: "Wan 3.0 Prime",
    subtitle: "Хурдан, уян хатан video generation",
    description: "2–30 секундийн text-to-video болон image-to-video. Үнэ/чанарын хувьд өдөр тутмын олон generation хийхэд тохиромжтой.",
    useCases: ["Daily content", "Fast concepts", "Longer clips"],
    capabilities: ["30 сек", "1080p", "Text → Video", "Image → Video"],
    studioHref: "/studio?model=wan-3-prime",
    officialHref: "https://open.higgsfield.ai/explore/video",
    accent: "lime",
    previewSrc: process.env.NEXT_PUBLIC_RAVS_DEMO_WAN || undefined,
  },
];
