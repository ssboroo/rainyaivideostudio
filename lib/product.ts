export type ProductWorkflow = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  href: string;
  badge: string;
  accent: string;
  tags: string[];
  status: "api" | "suite";
};

export const workflows: ProductWorkflow[] = [
  {
    id: "video",
    title: "AI Видео",
    eyebrow: "CREATE",
    description: "Text, image болон reference-ээс cinematic видео. Kling, Seedance, Wan.",
    href: "/studio?surface=video&model=seedance-2-5",
    badge: "30 сек",
    accent: "violet",
    tags: ["Text → Video", "Image → Video", "Native audio"],
    status: "api",
  },
  {
    id: "image",
    title: "AI Зураг",
    eyebrow: "CREATE",
    description: "Portrait, poster, campaign, product болон brand visual-ууд.",
    href: "/studio?surface=image&model=soul-2",
    badge: "1K–4K",
    accent: "blue",
    tags: ["Soul 2", "Ideogram 4", "Recraft 4.1"],
    status: "api",
  },
  {
    id: "cinema",
    title: "Cinema Studio",
    eyebrow: "FILMMAKING",
    description: "30 секунд хүртэлх scene, references, cinematic direction болон pacing.",
    href: "/cinema",
    badge: "PRO",
    accent: "amber",
    tags: ["Up to 30s", "50 refs", "Cinematic controls"],
    status: "api",
  },
  {
    id: "genjutsu",
    title: "Genjutsu",
    eyebrow: "VIDEO TRANSFORM",
    description: "Motion transfer, object swap, restyle — хөдөлгөөнийг хадгалж дүрслэлийг соль.",
    href: "/studio?group=Genjutsu",
    badge: "EXCLUSIVE",
    accent: "rose",
    tags: ["Motion", "Object Swap", "Restyle"],
    status: "api",
  },
  {
    id: "marketing",
    title: "Marketing Studio",
    eyebrow: "COMMERCE",
    description: "Product shots, ads, marketplace, posters болон campaign creative.",
    href: "/marketing",
    badge: "ADS",
    accent: "lime",
    tags: ["Product", "Ads", "Marketplace"],
    status: "api",
  },
  {
    id: "influencer",
    title: "AI Influencer",
    eyebrow: "CHARACTER",
    description: "Character sheet үүсгээд Genjutsu motion workflow руу үргэлжлүүл.",
    href: "/influencer",
    badge: "NEW",
    accent: "cyan",
    tags: ["Character", "Face ref", "Motion"],
    status: "api",
  },
  {
    id: "apps",
    title: "Effects & Apps",
    eyebrow: "ONE-CLICK",
    description: "Restyle, edit, poster, motion, product creative зэрэг хурдан workflow-ууд.",
    href: "/apps",
    badge: "TOOLS",
    accent: "indigo",
    tags: ["Effects", "Edit", "Templates"],
    status: "suite",
  },
];

export const promptPresets = [
  {
    title: "Улаанбаатар cinematic",
    subtitle: "Rainy night · 9:16",
    model: "seedance-2-5",
    prompt:
      "Улаанбаатарын төвөөр бороотой шөнө алхаж буй Монгол залуу. Неон гэрэл нойтон асфальтан дээр ойж, камер араас нь зөөлөн tracking хийнэ. Cinematic, realistic, shallow depth of field.",
  },
  {
    title: "Luxury product reel",
    subtitle: "Studio commercial",
    model: "kling-3-standard",
    prompt:
      "Luxury product commercial, black reflective studio, slow controlled dolly-in, dramatic rim light, premium macro details, elegant pacing, high-end advertising finish.",
  },
  {
    title: "Монгол fashion editorial",
    subtitle: "Portrait · editorial",
    model: "soul-2",
    prompt:
      "Монгол төрхтэй fashion model, contemporary editorial styling inspired by modern Mongolian design, soft window light, premium magazine photography, natural skin texture.",
  },
  {
    title: "Product poster",
    subtitle: "Typography · social ad",
    model: "ideogram-4",
    prompt:
      "Minimal premium social media product poster, bold clean headline area, high contrast composition, modern editorial typography, product centered, luxury art direction.",
  },
  {
    title: "Marketplace packshot",
    subtitle: "Clean commerce",
    model: "marketing-studio",
    prompt:
      "Clean marketplace product image, accurate product shape, soft commercial lighting, subtle shadow, premium neutral backdrop, ecommerce-ready composition.",
  },
  {
    title: "Brand illustration",
    subtitle: "Controlled palette",
    model: "recraft-4-1",
    prompt:
      "Minimal vector-inspired brand illustration, geometric shapes, restrained premium palette, clean negative space, modern technology identity.",
  },
];

export const appTools = [
  { title: "Video Edit", description: "Prompt-оор видеоны дүрслэл, орчин, деталь өөрчлөх.", href: "/studio?model=seedance-edit", category: "Video Editing", accent: "violet" },
  { title: "Motion Transfer", description: "Reference хөдөлгөөнийг шинэ дүрд шилжүүлэх.", href: "/studio?model=genjutsu-motion", category: "Professional", accent: "cyan" },
  { title: "Object Swap", description: "Видео доторх дүр, хувцас, бүтээгдэхүүн солих.", href: "/studio?model=genjutsu-object", category: "Video Editing", accent: "rose" },
  { title: "Restyle", description: "Motion, camera timing-ийг хадгалж бүх style-ийг солих.", href: "/studio?model=genjutsu-restyle", category: "Enhance & Style", accent: "amber" },
  { title: "Product Ads", description: "Product reference-ээс campaign creative үүсгэх.", href: "/studio?model=marketing-studio", category: "Ads & Products", accent: "lime" },
  { title: "Poster Maker", description: "Typography сайтай poster, packaging, graphic layout.", href: "/studio?model=ideogram-4", category: "Ads & Products", accent: "blue" },
  { title: "Portrait Studio", description: "Photorealistic portrait болон fashion editorial.", href: "/studio?model=soul-2", category: "Face & Identity", accent: "indigo" },
  { title: "Brand Graphics", description: "Palette-controlled graphic болон illustration.", href: "/studio?model=recraft-4-1", category: "Professional", accent: "violet" },
];

export const suiteOnly = [
  { title: "Audio & Lipsync", detail: "TTS, voice change, translate, talking clips", status: "Provider suite" },
  { title: "Ads Studio", detail: "Website → brand kit → static ad batches", status: "Provider suite" },
  { title: "3D Jutsu", detail: "Prompt/reference → editable 3D scene → video", status: "Provider suite" },
];
