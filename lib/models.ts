export type RavsModel = {
  id: string;
  name: string;
  provider: string;
  kind: "video" | "image" | "workflow";
  badge?: string;
  description: string;
};

export const models: RavsModel[] = [
  { id: "kling-3", name: "Kling 3.0", provider: "Higgsfield", kind: "video", badge: "Шилдэг", description: "Cinematic video, multi-shot, audio" },
  { id: "seedance-2-5", name: "Seedance 2.5", provider: "Higgsfield", kind: "video", badge: "Pro", description: "Text, image, video reference" },
  { id: "wan-3-prime", name: "Wan 3 Prime", provider: "Higgsfield", kind: "video", badge: "Хурдан", description: "Хурдан, зардал багатай видео" },
  { id: "cinema-studio", name: "Cinema Studio", provider: "Higgsfield", kind: "workflow", badge: "Cinema", description: "Кино түвшний scene workflow" },
  { id: "genjutsu", name: "Genjutsu", provider: "Higgsfield", kind: "workflow", badge: "Edit", description: "Restyle, motion transfer, object swap" },
  { id: "marketing-studio", name: "Marketing Studio", provider: "Higgsfield", kind: "workflow", badge: "Ads", description: "Product ads ба campaign creative" },
  { id: "soul-2", name: "Soul 2", provider: "Higgsfield", kind: "image", badge: "Portrait", description: "Portrait, fashion, character зураг" },
  { id: "ideogram-4", name: "Ideogram 4", provider: "Higgsfield", kind: "image", badge: "Text", description: "Poster ба typography зураг" }
];
