export type CommunitySurface =
  | "home"
  | "video"
  | "cinema"
  | "explore"
  | "apps"
  | "marketing"
  | "influencer"
  | "trends";

export type CommunityItem = {
  id: string;
  title: string;
  creator: string;
  description: string;
  views?: string;
  sourceHref: string;
  surfaces: CommunitySurface[];
  model: string;
  prompt?: string;
  aspect?: string;
  duration?: number;
  tone: string;
  badge: string;
  recreate: boolean;
  note?: string;
};

export const communityItems: CommunityItem[] = [
  {
    id: "arena-zero",
    title: "ARENA ZERO",
    creator: "Higgsfield Studio",
    description: "Underground sci-fi action world, cinematic scale, high-contrast lighting and recurring characters.",
    views: "1.2M+ views",
    sourceHref: "https://higgsfield.ai/original-series/arena-zero/episode-1",
    surfaces: ["home","video","cinema","explore"],
    model: "cinema-studio-4",
    prompt: "Original sci-fi action scene in a vast underground arena, one lone protagonist, brutal industrial architecture, controlled handheld camera, hard rim lighting, cinematic tension, original characters and world design.",
    aspect: "16:9",
    duration: 12,
    tone: "violet",
    badge: "ORIGINAL",
    recreate: true,
    note: "RAVS recreation uses a new original scene, not Higgsfield assets."
  },
  {
    id: "hell-grind",
    title: "HELL GRIND",
    creator: "Higgsfield Studio",
    description: "Urban fantasy heist energy, street-kid ensemble, museum mystery and supernatural escalation.",
    views: "586K+ views",
    sourceHref: "https://higgsfield.ai/original-series/hell-grind/episode-1",
    surfaces: ["home","video","cinema","explore","apps"],
    model: "cinema-studio-4",
    prompt: "Original urban fantasy short-film scene: a crew of young outsiders breaks into an abandoned cultural archive at night and discovers a mysterious energy artifact; kinetic camera, moody practical lights, fast ensemble blocking, entirely original characters.",
    aspect: "16:9",
    duration: 10,
    tone: "rose",
    badge: "OPEN PROJECT",
    recreate: true,
    note: "Uses an original RAVS prompt inspired by the genre, not copied production materials."
  },
  {
    id: "zephyr",
    title: "ZEPHYR",
    creator: "Higgsfield Studio",
    description: "Colourful superhero-team storytelling with fashion, action, friendship and pop energy.",
    views: "237K+ views",
    sourceHref: "https://higgsfield.ai/original-series/zephyr/episode-1",
    surfaces: ["video","cinema","influencer","explore"],
    model: "cinema-studio-4",
    prompt: "Original pop-superhero team sequence in a bright futuristic city, glamorous original characters, coordinated fashion, alien threat in the distance, energetic crane-to-handheld camera move, playful but cinematic tone.",
    aspect: "16:9",
    duration: 10,
    tone: "cyan",
    badge: "REMIXABLE",
    recreate: true,
    note: "Creates a new original team and setting in RAVS."
  },
  {
    id: "oneiric",
    title: "ONEIRIC",
    creator: "Higgsfield Studio",
    description: "Dreamlike cinematic storytelling with surreal atmosphere and high-end visual continuity.",
    views: "142K+ views",
    sourceHref: "https://higgsfield.ai/original-series/oneiric/full-film",
    surfaces: ["home","video","cinema","explore"],
    model: "seedance-2-5",
    prompt: "Dreamlike original cinematic sequence: solitary character crossing a quiet impossible landscape at blue hour, subtle surreal transformations, slow dolly movement, soft volumetric haze, restrained colour palette, poetic film language.",
    aspect: "16:9",
    duration: 10,
    tone: "blue",
    badge: "ORIGINAL",
    recreate: true,
    note: "Style direction is newly written for RAVS."
  },
  {
    id: "the-trigger",
    title: "The Trigger",
    creator: "Higgsfield Studio",
    description: "Tense cinematic short-form storytelling with thriller pacing and controlled reveals.",
    views: "122K+ views",
    sourceHref: "https://higgsfield.ai/original-series/the-trigger/full-film",
    surfaces: ["video","cinema","explore"],
    model: "kling-3-standard",
    prompt: "Original suspense sequence in a quiet modern apartment: a character notices one impossible detail, pauses, then the environment subtly changes; slow push-in, motivated practical lighting, micro-reactions, escalating thriller pacing.",
    aspect: "16:9",
    duration: 10,
    tone: "amber",
    badge: "THRILLER",
    recreate: true
  },
  {
    id: "cully-hill",
    title: "The Cully Hill Boys",
    creator: "Higgsfield Studio",
    description: "Fast action-comedy crime film with London music culture, friendship and beat-driven editing.",
    views: "272K+ views",
    sourceHref: "https://higgsfield.ai/original-series/cully-hill-boys/full-film",
    surfaces: ["home","video","cinema","explore"],
    model: "cinema-studio-4",
    tone: "lime",
    badge: "STUDY ONLY",
    recreate: false,
    note: "HOL-RO-1.0 is study-only: watch and learn, but do not copy or reuse its prompts/assets."
  },
  {
    id: "bucket-list",
    title: "BUCKET LIST",
    creator: "Higgsfield Studio",
    description: "Trailer-driven cinematic storytelling designed around a strong hook and fast visual progression.",
    views: "65K+ views",
    sourceHref: "https://higgsfield.ai/original-series/bucket-list/episode-1",
    surfaces: ["video","cinema","marketing","explore"],
    model: "kling-3-standard",
    prompt: "Original high-retention trailer montage for a personal adventure story: three escalating locations, one recurring protagonist, strong visual hook in the first second, punchy multi-shot editing, premium commercial finish.",
    aspect: "16:9",
    duration: 12,
    tone: "violet",
    badge: "TRAILER",
    recreate: true
  },
  {
    id: "arena-music",
    title: "DEM — Music Video",
    creator: "Higgsfield Studio",
    description: "Music-video pacing, wasteland production design, rebellious performance energy and large-scale visual beats.",
    views: "24K+ views",
    sourceHref: "https://higgsfield.ai/original-series/arena-zero-music-video/episode-1",
    surfaces: ["video","apps","marketing","influencer","trends"],
    model: "seedance-2-5",
    prompt: "Original performance video in a silent futuristic wasteland, rebellious street crew discovers an old music device, rhythm-driven camera cuts, bold wardrobe, giant mechanical silhouettes, energetic editorial lighting.",
    aspect: "16:9",
    duration: 12,
    tone: "rose",
    badge: "MUSIC VIDEO",
    recreate: true
  },
  {
    id: "community-dino",
    title: "Rainy Forest Chase",
    creator: "Higgsfield community example",
    description: "High-retention action shot: character runs through a stormy forest while a huge creature closes in.",
    sourceHref: "https://higgsfield.ai/ai-movie-generator",
    surfaces: ["video","apps","trends"],
    model: "seedance-2-5",
    prompt: "Original action shot: a traveller in a bright rain jacket sprints through a storm-dark forest while a massive prehistoric creature crashes through the trees behind them; lightning, mud spray, handheld chase camera, cinematic motion blur.",
    aspect: "9:16",
    duration: 8,
    tone: "lime",
    badge: "COMMUNITY SHOT",
    recreate: true
  },
  {
    id: "community-rooftop",
    title: "Rooftop Dusk Performance",
    creator: "Higgsfield community example",
    description: "Lifestyle performance shot with city skyline, handheld energy and social-video aesthetic.",
    sourceHref: "https://higgsfield.ai/ai-movie-generator",
    surfaces: ["video","influencer","marketing","trends"],
    model: "kling-3-standard",
    prompt: "Original lifestyle performance clip: confident creator dancing on a high-rise rooftop at purple-pink dusk, city skyline behind, loose handheld operator movement, authentic social-film texture, subtle lens bloom.",
    aspect: "9:16",
    duration: 8,
    tone: "cyan",
    badge: "COMMUNITY SHOT",
    recreate: true
  },
  {
    id: "community-horse",
    title: "Golden Hour Horse Chase",
    creator: "Higgsfield community example",
    description: "Period-drama action with a rider moving toward camera across a dusty plain.",
    sourceHref: "https://higgsfield.ai/ai-movie-generator",
    surfaces: ["video","cinema","explore"],
    model: "seedance-2-5",
    prompt: "Original period-drama action shot: lone rider on a dark horse gallops toward camera across a dusty open plain at golden hour, distant pursuing riders, long-lens compression, slow-motion dust, elegant cinematic framing.",
    aspect: "16:9",
    duration: 8,
    tone: "amber",
    badge: "COMMUNITY SHOT",
    recreate: true
  },
  {
    id: "community-emotion",
    title: "Emotional Close-up",
    creator: "Higgsfield community example",
    description: "Performance-first close-up with subtle emotion, controlled light and film texture.",
    sourceHref: "https://higgsfield.ai/ai-movie-generator",
    surfaces: ["cinema","influencer","marketing"],
    model: "kling-3-standard",
    prompt: "Original emotional close-up: mature performer in a formal dark-red coat holding back tears, low-key practical light, trembling breath, tiny eye movement, shallow depth of field, restrained 35mm film texture.",
    aspect: "16:9",
    duration: 7,
    tone: "blue",
    badge: "COMMUNITY SHOT",
    recreate: true
  }
];

export function communityFor(surface: CommunitySurface, limit = 4) {
  return communityItems.filter((item) => item.surfaces.includes(surface)).slice(0, limit);
}

export function recreateHref(item: CommunityItem) {
  if (!item.recreate || !item.prompt) return item.sourceHref;
  const params = new URLSearchParams({
    model: item.model,
    prompt: item.prompt,
    source: item.title,
  });
  if (item.aspect) params.set("aspect", item.aspect);
  if (item.duration) params.set("duration", String(item.duration));
  return "/studio?" + params.toString();
}
