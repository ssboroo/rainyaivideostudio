export type ModelKind = "video" | "image" | "workflow";

export type RavsModel = {
  slug: string;
  name: string;
  provider: string;
  maker?: string;
  modelId: string;
  kind: ModelKind;
  group: string;
  badge: string;
  description: string;
  pricingType: "second" | "flat";
  creditRate: number;
  minDuration?: number;
  maxDuration?: number;
  resolutions: string[];
  aspectRatios: string[];
  supportsAudio?: boolean;
  supportsImage?: boolean;
  supportsVideo?: boolean;
  supportsMultipleReferences?: boolean;
  maxReferences?: number;
  requiresPrompt?: boolean;
  capabilities?: string[];
  featured?: boolean;
  tone?: string;
};

export const models: RavsModel[] = [
  {
    slug: "seedance-2-5", name: "Seedance 2.5", provider: "Higgsfield API", maker: "ByteDance",
    modelId: "bytedance/seedance-2.5/text-to-video", kind: "video", group: "Видео", badge: "SOTA",
    description: "Тайлбараас 4–30 секундийн видео бүтээж, дуу нэмнэ.", pricingType: "second", creditRate: 42,
    minDuration: 4, maxDuration: 30, resolutions: ["480p","720p","1080p"], aspectRatios: ["16:9","4:3","1:1","3:4","9:16","21:9"],
    supportsAudio: true, capabilities: ["30 sec","1080p","Audio"], featured: true, tone: "violet",
  },
  {
    slug: "seedance-2-5-image", name: "Seedance 2.5 Image → Video", provider: "Higgsfield API", maker: "ByteDance",
    modelId: "bytedance/seedance-2.5/image-to-video", kind: "video", group: "Видео", badge: "IMAGE → VIDEO",
    description: "Жишиг зургийг хөдөлгөөн, дуутай видео болгоно.", pricingType: "second", creditRate: 42,
    minDuration: 4, maxDuration: 30, resolutions: ["480p","720p","1080p"], aspectRatios: ["16:9","4:3","1:1","3:4","9:16","21:9"],
    supportsAudio: true, supportsImage: true, capabilities: ["Image ref","1080p","Audio"], tone: "violet",
  },
  {
    slug: "seedance-reference", name: "Seedance 2.5 Reference", provider: "Higgsfield API", maker: "ByteDance",
    modelId: "bytedance/seedance-2.5/reference-to-video", kind: "video", group: "Видео", badge: "REFERENCE",
    description: "Зураг, видео, дууны жишиг материалаар шинэ видео бүтээнэ.", pricingType: "second", creditRate: 51,
    minDuration: 4, maxDuration: 30, resolutions: ["480p","720p","1080p"], aspectRatios: ["16:9","4:3","1:1","3:4","9:16","21:9"],
    supportsAudio: true, supportsImage: true, supportsVideo: true, supportsMultipleReferences: true, maxReferences: 8,
    capabilities: ["Multi ref","30 sec","Audio"], tone: "violet",
  },
  {
    slug: "kling-3-standard", name: "Kling 3.0 Standard", provider: "Higgsfield API", maker: "Kling",
    modelId: "kling-video/v3.0/std/text-to-video", kind: "video", group: "Видео", badge: "MULTI-SHOT",
    description: "Олон кадртай кино дүрслэл, дуутай видео бүтээнэ.", pricingType: "second", creditRate: 36,
    minDuration: 3, maxDuration: 15, resolutions: ["720p"], aspectRatios: ["16:9","9:16","1:1"],
    supportsAudio: true, capabilities: ["Multi-shot","Native audio","15 sec"], featured: true, tone: "blue",
  },
  {
    slug: "kling-3-turbo", name: "Kling 3.0 Turbo", provider: "Higgsfield API", maker: "Kling",
    modelId: "kling-video/v3.0-turbo/text-to-video", kind: "video", group: "Видео", badge: "FAST",
    description: "Тайлбараас 720p, 1080p видео хурдан бүтээнэ.", pricingType: "second", creditRate: 24,
    minDuration: 3, maxDuration: 15, resolutions: ["720p","1080p"], aspectRatios: ["16:9","9:16","1:1"],
    capabilities: ["Fast","1080p","15 sec"], tone: "blue",
  },
  {
    slug: "kling-3-image", name: "Kling 3.0 Image → Video", provider: "Higgsfield API", maker: "Kling",
    modelId: "kling-video/v3.0/pro/image-to-video", kind: "video", group: "Видео", badge: "PRO",
    description: "Жишиг зургийг хөдөлгөөнтэй болгож, камерын дүрслэлийг удирдана.", pricingType: "second", creditRate: 42,
    minDuration: 3, maxDuration: 15, resolutions: ["720p"], aspectRatios: ["16:9","9:16","1:1"],
    supportsAudio: true, supportsImage: true, capabilities: ["Image ref","Audio","Pro"], tone: "blue",
  },
  {
    slug: "wan-3-prime", name: "Wan 3.0 Prime", provider: "Higgsfield API", maker: "Alibaba",
    modelId: "alibaba/wan-3.0-prime/text-to-video", kind: "video", group: "Видео", badge: "VALUE",
    description: "Тайлбараас 2–30 секундийн видео бүтээнэ.", pricingType: "second", creditRate: 27,
    minDuration: 2, maxDuration: 30, resolutions: ["720p","1080p"], aspectRatios: ["16:9","9:16","1:1"],
    capabilities: ["30 sec","1080p","Value"], featured: true, tone: "amber",
  },
  {
    slug: "wan-3-prime-image", name: "Wan 3.0 Prime Image → Video", provider: "Higgsfield API", maker: "Alibaba",
    modelId: "alibaba/wan-3.0-prime/image-to-video", kind: "video", group: "Видео", badge: "IMAGE → VIDEO",
    description: "Эхний зургаас үргэлжилсэн видео бүтээнэ.", pricingType: "second", creditRate: 30,
    minDuration: 2, maxDuration: 30, resolutions: ["720p","1080p"], aspectRatios: ["adaptive","16:9","9:16","1:1"],
    supportsAudio: true, supportsImage: true, capabilities: ["Image ref","30 sec","1080p"], tone: "amber",
  },
  {
    slug: "cinema-studio-4", name: "Cinema Studio 4.0", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfield/cinema-studio/4.0", kind: "workflow", group: "Cinema", badge: "CINEMA",
    description: "Дүр, камер, орчныг төлөвлөж киноны хэсэг бүтээнэ.", pricingType: "second", creditRate: 84,
    minDuration: 4, maxDuration: 30, resolutions: ["480p","720p"], aspectRatios: ["16:9","9:16","1:1"],
    supportsAudio: true, supportsMultipleReferences: true, maxReferences: 30,
    capabilities: ["30 sec","30 API refs","Scene direction"], featured: true, tone: "amber",
  },
  {
    slug: "kling-motion", name: "Kling 3 Motion Control", provider: "Higgsfield API", maker: "Kling",
    modelId: "kling-video/v3/motion-control/std", kind: "workflow", group: "Motion", badge: "MOTION",
    description: "Жишиг видеоны хөдөлгөөнийг зурган дээрх дүрд шилжүүлнэ.", pricingType: "flat", creditRate: 660,
    resolutions: ["720p"], aspectRatios: ["auto"], supportsImage: true, supportsVideo: true, requiresPrompt: false,
    capabilities: ["Motion ref","Character","Audio keep"], tone: "cyan",
  },
  {
    slug: "genjutsu-motion", name: "Genjutsu Motion Transfer", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfiled/genjutsu/motion-transfer/v1.0", kind: "workflow", group: "Genjutsu", badge: "EXCLUSIVE",
    description: "Хөдөлгөөн, камерын хэмнэлийг хадгалж дүрслэлийг өөрчилнө.", pricingType: "flat", creditRate: 840,
    resolutions: ["480p","720p"], aspectRatios: ["auto"], supportsImage: true, supportsVideo: true, supportsMultipleReferences: true,
    maxReferences: 8, requiresPrompt: false, capabilities: ["Motion","8 refs","Transform"], featured: true, tone: "rose",
  },
  {
    slug: "genjutsu-object", name: "Genjutsu Object Swap", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfiled/genjutsu/object-swap/v1.0", kind: "workflow", group: "Genjutsu", badge: "OBJECT SWAP",
    description: "Видеоны дүр, хувцас, бүтээгдэхүүн зэрэг объектыг солино.", pricingType: "flat", creditRate: 840,
    resolutions: ["480p","720p"], aspectRatios: ["auto"], supportsImage: true, supportsVideo: true, supportsMultipleReferences: true,
    maxReferences: 8, requiresPrompt: false, capabilities: ["Swap","Video ref","Image refs"], tone: "rose",
  },
  {
    slug: "genjutsu-restyle", name: "Genjutsu Restyle", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfield/genjutsu/restyle/v1.0", kind: "workflow", group: "Genjutsu", badge: "RESTYLE",
    description: "Хөдөлгөөн, хэмнэлийг хадгалж видеоны хэв маягийг өөрчилнө.", pricingType: "flat", creditRate: 720,
    resolutions: ["720p"], aspectRatios: ["auto"], supportsImage: true, supportsVideo: true, supportsMultipleReferences: true,
    maxReferences: 5, requiresPrompt: false, capabilities: ["Style preset","Motion keep","Audio keep"], tone: "rose",
  },
  {
    slug: "seedance-edit", name: "Seedance 2.5 Video Edit", provider: "Higgsfield API", maker: "ByteDance",
    modelId: "bytedance/seedance-2.5/video-edit", kind: "workflow", group: "Видео засвар", badge: "EDIT",
    description: "Тайлбараар видеоны орчин, дүрслэл, нарийн хэсгийг өөрчилнө.", pricingType: "second", creditRate: 54,
    minDuration: 4, maxDuration: 30, resolutions: ["480p","720p","1080p"], aspectRatios: ["16:9","9:16","1:1"],
    supportsAudio: true, supportsVideo: true, capabilities: ["Video edit","Audio","1080p"], tone: "indigo",
  },
  {
    slug: "marketing-studio", name: "Marketing Studio Image", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "marketing-studio/image", kind: "image", group: "Ads", badge: "COMMERCE",
    description: "Бүтээгдэхүүний зураг, сурталчилгаа, дэлгүүрийн контент бүтээнэ.", pricingType: "flat", creditRate: 72,
    resolutions: ["1k","2k","4k"], aspectRatios: ["auto","1:1","3:2","2:3","4:3","3:4","16:9","9:16","21:9"],
    supportsImage: true, supportsMultipleReferences: true, maxReferences: 16,
    capabilities: ["16 refs","1K–4K","Presets"], featured: true, tone: "lime",
  },
  {
    slug: "ai-influencer", name: "AI Influencer", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfield/ai-influencer", kind: "image", group: "Influencer", badge: "NEW",
    description: "Нэг дүрийн олон өнцөг, төрх бүхий жишиг зураг бүтээнэ.", pricingType: "flat", creditRate: 75,
    resolutions: ["default"], aspectRatios: ["auto"], supportsImage: true, supportsMultipleReferences: true, maxReferences: 8,
    requiresPrompt: false, capabilities: ["Character sheet","Face ref","Items"], featured: true, tone: "cyan",
  },
  {
    slug: "soul-2", name: "Soul 2", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfield-ai/soul/v2/standard", kind: "image", group: "Зураг", badge: "PORTRAIT",
    description: "Бодит мэт хөрөг, амьдралын хэв маяг, загварын зураг бүтээнэ.", pricingType: "flat", creditRate: 24,
    resolutions: ["720p","1080p"], aspectRatios: ["9:16","16:9","4:3","3:4","1:1","2:3","3:2"],
    capabilities: ["Portrait","Fashion","1080p"], featured: true, tone: "indigo",
  },
  {
    slug: "soul-2-image", name: "Soul 2 Image → Image", provider: "Higgsfield API", maker: "Higgsfield",
    modelId: "higgsfield-ai/soul/v2/image-to-image", kind: "image", group: "Зураг", badge: "REFERENCE",
    description: "Жишиг зургаас хөрөг, амьдралын хэв маягийн шинэ зураг бүтээнэ.", pricingType: "flat", creditRate: 27,
    resolutions: ["720p","1080p"], aspectRatios: ["9:16","16:9","4:3","3:4","1:1","2:3","3:2"],
    supportsImage: true, capabilities: ["Image ref","Portrait","1080p"], tone: "indigo",
  },
  {
    slug: "ideogram-4", name: "Ideogram 4.0", provider: "Higgsfield API", maker: "Ideogram",
    modelId: "ideogram/v4.0", kind: "image", group: "Зураг", badge: "TEXT / POSTER",
    description: "Бичвэртэй постер, сав баглаа боодол, график дизайн бүтээнэ.", pricingType: "flat", creditRate: 42,
    resolutions: ["default"], aspectRatios: ["1:1","16:9","9:16","4:3","3:4"], supportsImage: true,
    capabilities: ["Typography","Poster","Image edit"], tone: "blue",
  },
  {
    slug: "recraft-4-1", name: "Recraft 4.1", provider: "Higgsfield API", maker: "Recraft",
    modelId: "recraft/v4.1/text-to-image", kind: "image", group: "Зураг", badge: "BRAND",
    description: "Брэндийн өнгөтэй график, дүрслэл, дизайны материал бүтээнэ.", pricingType: "flat", creditRate: 54,
    resolutions: ["1k"], aspectRatios: ["1:1","2:1","1:2","3:2","2:3","4:3","3:4","5:4","4:5","16:9","9:16"],
    capabilities: ["Palette","Brand","PNG/WebP"], featured: true, tone: "violet",
  },
  {
    slug: "qwen-image-3", name: "Qwen Image 3", provider: "Higgsfield API", maker: "Alibaba",
    modelId: "alibaba/qwen-image-3/text-to-image", kind: "image", group: "Зураг", badge: "2K",
    description: "Тайлбарыг баяжуулж өндөр чанартай зураг бүтээнэ.", pricingType: "flat", creditRate: 60,
    resolutions: ["1k","2k"], aspectRatios: ["1:1","2:3","3:2","3:4","4:3","7:9","9:7","9:16","16:9","21:9"],
    capabilities: ["2K","Prompt enhance","Seed"], tone: "amber",
  },
  {
    slug: "qwen-image-3-edit", name: "Qwen Image 3 Edit", provider: "Higgsfield API", maker: "Alibaba",
    modelId: "alibaba/qwen-image-3/edit", kind: "image", group: "Зураг", badge: "EDIT",
    description: "Заавар болон 1–3 жишиг зургаар зураг засварлана.", pricingType: "flat", creditRate: 60,
    resolutions: ["1k","2k"], aspectRatios: ["1:1","2:3","3:2","3:4","4:3","7:9","9:7","9:16","16:9","21:9"],
    supportsImage: true, supportsMultipleReferences: true, maxReferences: 3,
    capabilities: ["1–3 refs","2K","Edit"], tone: "amber",
  },
  {
    slug: "grok-image-2", name: "Grok Imagine 2.0", provider: "Higgsfield API", maker: "xAI",
    modelId: "xai/grok-imagine-image-2.0", kind: "image", group: "Зураг", badge: "PRECISE EDIT",
    description: "Нарийн хэсгийг хадгалж зураг үүсгэх, засварлах хэрэгсэл.", pricingType: "flat", creditRate: 60,
    resolutions: ["1k","2k"], aspectRatios: ["auto","1:1","16:9","9:16","4:3","3:4"], supportsImage: true,
    capabilities: ["2K","Precise edit","Consistency"], tone: "cyan",
  },
];

export const getModel = (slug: string) => models.find((model) => model.slug === slug);

export function estimateCredits(model: RavsModel, duration?: number) {
  if (model.pricingType === "flat") return model.creditRate;
  const safeDuration = Math.max(
    model.minDuration || 1,
    Math.min(duration || model.minDuration || 5, model.maxDuration || 30),
  );
  return Math.max(model.creditRate, Math.ceil(model.creditRate * safeDuration));
}

function url(value: unknown) {
  if (typeof value !== "string") return undefined;
  try {
    const parsed = new URL(value);
    return ["http:", "https:"].includes(parsed.protocol) ? parsed.toString() : undefined;
  } catch {
    return undefined;
  }
}

function urls(value: unknown, max: number) {
  return Array.isArray(value)
    ? value.map(url).filter((item): item is string => Boolean(item)).slice(0, max)
    : [];
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function buildProviderInput(model: RavsModel, raw: Record<string, unknown>) {
  const prompt = typeof raw.prompt === "string" ? raw.prompt.trim().slice(0, 10000) : "";
  const duration = Math.max(
    model.minDuration || 1,
    Math.min(Number(raw.duration) || model.minDuration || 5, model.maxDuration || 30),
  );
  const resolution = model.resolutions.includes(String(raw.resolution))
    ? String(raw.resolution)
    : model.resolutions[0];
  const aspect = model.aspectRatios.includes(String(raw.aspectRatio))
    ? String(raw.aspectRatio)
    : model.aspectRatios[0];
  const imageUrl = url(raw.imageUrl);
  const videoUrl = url(raw.videoUrl);
  const refs = urls(raw.referenceUrls, model.maxReferences || 30);
  const requirePrompt = model.requiresPrompt !== false;
  if (requirePrompt && !prompt && !imageUrl && !videoUrl && refs.length === 0) {
    throw new Error("Prompt эсвэл reference шаардлагатай.");
  }

  switch (model.slug) {
    case "kling-3-standard":
      return { prompt, duration, aspect_ratio: aspect, sound: raw.generateAudio === false ? "off" : "on", cfg_scale: Math.max(0, Math.min(Number(raw.cfgScale) || 0.5, 1)), multi_shots: Boolean(raw.multiShots) };
    case "kling-3-turbo":
      return { prompt, duration, resolution, aspect_ratio: aspect };
    case "kling-3-image":
      if (!imageUrl) throw new Error("Reference зураг шаардлагатай.");
      return { prompt, image_url: imageUrl, duration, aspect_ratio: aspect, sound: raw.generateAudio === false ? "off" : "on" };
    case "seedance-2-5":
      return { prompt, duration, resolution, aspect_ratio: aspect, output_format: "mp4", generate_audio: raw.generateAudio !== false };
    case "seedance-2-5-image":
      if (!imageUrl) throw new Error("Reference зураг шаардлагатай.");
      return { prompt, image_url: imageUrl, duration, resolution, bitrate_mode: "high", generate_audio: raw.generateAudio !== false };
    case "seedance-reference":
      return {
        prompt: prompt || undefined,
        duration,
        resolution,
        aspect_ratio: aspect,
        output_format: "mp4",
        generate_audio: raw.generateAudio !== false,
        image_urls: urls(raw.imageUrls, 8).length ? urls(raw.imageUrls, 8) : [imageUrl, ...refs].filter((item): item is string => Boolean(item)).slice(0, 8),
        video_urls: urls(raw.videoUrls, 4).length ? urls(raw.videoUrls, 4) : [videoUrl].filter((item): item is string => Boolean(item)),
        audio_urls: urls(raw.audioUrls, 4),
      };
    case "seedance-edit":
      if (!videoUrl) throw new Error("Source video шаардлагатай.");
      return { prompt, video_url: videoUrl, resolution, bitrate_mode: "high", generate_audio: raw.generateAudio !== false };
    case "wan-3-prime":
      return { prompt, duration, resolution, aspect_ratio: aspect, generate_audio: raw.generateAudio !== false };
    case "wan-3-prime-image":
      if (!imageUrl) throw new Error("Эхний зураг шаардлагатай.");
      return { prompt, duration, image_url: imageUrl, resolution, aspect_ratio: aspect, generate_audio: raw.generateAudio !== false, enable_thinking: false };
    case "kling-motion":
      if (!imageUrl || !videoUrl) throw new Error("Image болон motion video шаардлагатай.");
      return { prompt, image_url: imageUrl, video_url: videoUrl, keep_original_sound: raw.generateAudio === false ? "no" : "yes", character_orientation: raw.characterOrientation === "image" ? "image" : "video" };
    case "cinema-studio-4":
      return { prompt, duration, resolution, aspect_ratio: aspect, reference_urls: refs.slice(0, 50), sound: raw.generateAudio === false ? "off" : "on" };
    case "genjutsu-motion":
    case "genjutsu-object":
      if (!videoUrl || !refs.length) throw new Error("Жишиг видео болон хамгийн багадаа нэг жишиг зураг шаардлагатай.");
      return { prompt, video_url: videoUrl, image_urls: refs.slice(0, 8), resolution };
    case "genjutsu-restyle":
      if (!videoUrl || typeof raw.presetId !== "string" || !raw.presetId) {
        throw new Error("Source video болон style preset шаардлагатай.");
      }
      return { prompt, preset_id: raw.presetId, video_url: videoUrl, image_urls: refs.slice(0, 5), resolution };
    case "marketing-studio":
      return {
        prompt,
        image_urls: [imageUrl, ...refs].filter((item): item is string => Boolean(item)).slice(0, 16),
        preset_id: typeof raw.presetId === "string" && raw.presetId ? raw.presetId : undefined,
        resolution,
        aspect_ratio: aspect,
        quality: typeof raw.quality === "string" ? raw.quality : "high",
        moderation: "auto",
        enhance_prompt: Boolean(raw.enhancePrompt),
      };
    case "ai-influencer":
      return {
        seed: null,
        tier: typeof raw.tier === "string" ? raw.tier : "normal",
        brief: prompt,
        image_url: imageUrl || null,
        selection: objectValue(raw.selection),
        trait_variants: raw.traitVariants ?? null,
        item_image_urls: refs.slice(0, 8),
        variation_index: Number.isFinite(Number(raw.variationIndex)) ? Number(raw.variationIndex) : 0,
      };
    case "soul-2":
      return { prompt, batch_size: raw.batchSize === 4 ? 4 : 1, resolution, aspect_ratio: aspect, enhance_prompt: raw.enhancePrompt !== false, custom_reference_id: typeof raw.customReferenceId === "string" ? raw.customReferenceId : undefined };
    case "soul-2-image":
      if (!imageUrl) throw new Error("Reference зураг шаардлагатай.");
      return { prompt, image_url: imageUrl, batch_size: raw.batchSize === 4 ? 4 : 1, resolution, aspect_ratio: aspect };
    case "ideogram-4":
      return { prompt, aspect_ratio: aspect, image_url: imageUrl, rendering_speed: typeof raw.renderingSpeed === "string" ? raw.renderingSpeed : "DEFAULT" };
    case "recraft-4-1":
      return { prompt, resolution, aspect_ratio: aspect, output_format: typeof raw.outputFormat === "string" ? raw.outputFormat : "jpg" };
    case "qwen-image-3":
      return { prompt, resolution, aspect_ratio: aspect, prompt_extend: raw.enhancePrompt !== false, enable_thinking: true, prompt_extend_mode: "direct" };
    case "qwen-image-3-edit": {
      const imageUrls = [imageUrl, ...refs].filter((item): item is string => Boolean(item)).slice(0, 3);
      if (!imageUrls.length) throw new Error("1–3 reference зураг шаардлагатай.");
      return { prompt, image_urls: imageUrls, resolution, aspect_ratio: aspect, prompt_extend: raw.enhancePrompt !== false, enable_thinking: true, prompt_extend_mode: "direct" };
    }
    case "grok-image-2":
      return { prompt, quality: typeof raw.quality === "string" ? raw.quality : "medium", resolution, aspect_ratio: aspect, image_url: imageUrl };
    default:
      throw new Error("Дэмжигдээгүй model.");
  }
}
