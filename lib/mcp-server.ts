import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { createLongMoviePlan } from './long-movie-plan.ts';
import { reviewStoryboard } from './storyboard-quality.ts';
import { createMovie, movieStatus, cancelMovie, movieEnabled } from './movie-producer.ts';
import { models, getModel, buildProviderInput, estimateCredits } from './models.ts';
import { modelGuide, parameterLabel, parameterHelp, durationLabel, resolutionLabel, aspectLabel } from './model-guides.ts';

export type McpIdentity = { userId: string; scopes: string[]; grantId: string };
export type McpServices = {
  createUserGeneration: (userId: string, raw: Record<string, unknown>, options: { idempotencyKey: string; maxCredits: number }) => Promise<unknown>;
  getUserGeneration: (userId: string, id: string) => Promise<unknown>;
  cancelUserGeneration: (userId: string, id: string) => Promise<unknown>;
  listUserGenerations: (userId: string) => Promise<unknown>;
  getUserAccount: (userId: string) => Promise<unknown>;
};
const readAnnotations = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: false };
const modelSlug = z.string().min(1).max(100).describe('ravs_list_models-оос сонгосон slug');
const generationId = z.string().min(1).max(100);
const generationInput = z.record(z.string().max(100), z.unknown()).describe('Studio оролт: prompt, duration, resolution, aspectRatio; файлын imageUrl/videoUrl; бусад албан параметр modelOptions объектод. base64 биш нийтийн HTTPS холбоос хэрэглэ.');
function result(value: unknown) { return { content: [{ type: 'text' as const, text: JSON.stringify(value) }] }; }
function error(message: string) { return { isError: true, content: [{ type: 'text' as const, text: message }] }; }
function describeModel(m: typeof models[number]) {
  return { slug: m.slug, name: m.name, maker: m.maker, kind: m.kind, mode: modelGuide(m).mode, description: m.description, ready: !!m.apiVerified, duration: durationLabel(m), resolution: resolutionLabel(m), aspectRatio: aspectLabel(m), pricing: { type: "configuration", quoteRequired: true }, guidePath: `/models/${m.slug}` };
}

/** Each request gets an independent server and a validated account identity. */
export function createRavsMcpServer(identity: McpIdentity, services: McpServices) {
  const server = new McpServer({ name: 'RAVS Монгол бүтээлч студи', version: '1.0.0' }, {
    instructions: 'Монгол хэлээр тусал. Эхлээд хэрэглэгчийн зорилгыг тодруулж, тохирох загварын албан тохиргоог шалга. Нэг хүсэлтэд санаа, storyboard, prompt, Монгол caption, hashtag, нийтлэх төлөвлөгөө бэлдэж болно. ravs_content_brief нь ажлын чиглэл өгдөг; бүтээлч бичвэрийг та өөрөө боловсруул. Үүсгэхийн өмнө ravs_estimate ашиглаад загвар, тохиргоо, кредитийг хэрэглэгчид харуулж тодорхой зөвшөөрөл ав. Зөвшөөрөлгүй confirmGeneration=true бүү өг. Үүсгэх нь төлбөртэй; эхэлсэн хүсэлт амжилттай дууссан гэсэн үг биш. COMPLETED ба media URL гарсан үед л бэлэн гэж хэл. FAILED/NSFW/CANCELED төлөвийг үнэн зөв мэдээл. HF түлхүүр хэзээ ч бүү хүс. Өөр хэрэглэгчийн мэдээлэлд хандах боломжгүй.',
    maxToolInputElements: 300,
  });
  const guarded = async (scope: string, operation: () => Promise<unknown>) => {
    if (!identity.scopes.includes(scope)) return error('Энэ холболтод шаардлагатай эрх алга. RAVS дээр дахин зөвшөөрөл өгнө үү.');
    try { return result(await operation()); } catch (e) {
      // Only service errors with a deliberate public status may cross the boundary.
      return error(e instanceof Error && 'status' in e ? e.message : 'Хүсэлтийг гүйцэтгэж чадсангүй. Дахин оролдоно уу.');
    }
  };
  server.registerTool('ravs_list_models', { title: 'Загвар сонгох', description: 'Зургийн, видеоны, засварлах загваруудын Монгол тайлбар ба зөвшөөрсөн хэмжээг харуулна. Баримт баталгаажаагүй загвараар үүсгэх боломжгүй.', inputSchema: { query: z.string().max(100).optional(), kind: z.enum(['video', 'image', 'workflow']).optional(), readyOnly: z.boolean().default(true) }, annotations: readAnnotations }, async ({ query, kind, readyOnly }) => guarded('ravs:read', async () => ({ models: models.filter(m => (!readyOnly || m.apiVerified) && (!kind || m.kind === kind) && (!query || `${m.name} ${m.maker} ${m.description}`.toLowerCase().includes(query.toLowerCase()))).map(describeModel) })));
  server.registerTool('ravs_model_guide', { title: 'Загварын Монгол заавар', description: 'Тухайн хувилбарын алхам, хязгаар, шаардлагатай файлууд, prompt ба бүх API параметрийг шалгана.', inputSchema: { modelSlug }, annotations: readAnnotations }, async ({ modelSlug }) => guarded('ravs:read', async () => {
    const m = getModel(modelSlug); if (!m) return { error: 'Загвар олдсонгүй.' };
    return { ...describeModel(m), modelId: m.modelId, ...modelGuide(m), parameters: m.parameters?.map(p => ({ ...p, label: parameterLabel(p.name), help: parameterHelp(p) })), inputFormat: 'Үндсэн талбар: prompt, duration, resolution, aspectRatio, generateAudio, imageUrl, imageUrls, videoUrl. Бусад API параметрийг modelOptions объектод өгнө.' };
  }));
  server.registerTool('ravs_content_brief', { title: 'Монгол контентын ажлын чиглэл', description: 'Брэндийн Монгол кампанит ажлын бүтцийг өгнө. Энэ нь бэлэн AI бичвэр биш; туслах санаа, storyboard, caption болон prompt-ыг бүтэц дээр тулгуурлан бичнэ. Кредит зарцуулахгүй.', inputSchema: { brand: z.string().min(1).max(150), goal: z.string().min(1).max(1000), audience: z.string().min(1).max(500), channel: z.enum(['Reels', 'TikTok', 'YouTube', 'Facebook', 'Website']), modelSlug }, annotations: readAnnotations }, async (brief) => guarded('ravs:read', async () => {
    const m = getModel(brief.modelSlug); if (!m) return { error: 'Загвар олдсонгүй.' };
    return { brief, language: 'Монгол', model: describeModel(m), guide: modelGuide(m), deliverables: ['3 өөр санаа, тус бүр зорилго ба гол өгүүлбэр', 'Сонгосон санааны кадр бүрийн үйлдэл, камер, гэрэлтэй storyboard', 'Кадр тус бүрийн үүсгэх prompt ба албан тохиргоо', 'Монгол caption, эхний 2 секундийн hook, CTA ба hashtag', 'Нийтлэх хуваарь ба хувилбар харьцуулах шалгуур'], aspectRatioSuggestion: ['Reels', 'TikTok'].includes(brief.channel) ? '9:16' : brief.channel === 'YouTube' || brief.channel === 'Website' ? '16:9' : '1:1', checks: ['Брэндийн бүтээгдэхүүн, үнэ, амлалтыг хэрэглэгчийн өгсөн бодит мэдээллээр бич.', 'Тухайн загвар дэмждэг харьцаа, хугацааг л сонго.', 'Зураг шаардлагатай бол хэрэглэгчээс жишиг файлын холбоос ав.', 'Нэг үүсгэлт нэг хэсэг гаргана; олон хэсэгтэй нийт контентын эвлүүлгийг тусад нь төлөвлө.', 'Кредитийг тооцоолж хэрэглэгчийн зөвшөөрөл авах хүртэл үүсгэхгүй.'] };
  }));
  server.registerTool('ravs_estimate', { title: 'Кредит ба тохиргоо шалгах', description: 'Бодит үүсгэлт хийхгүйгээр оролтыг шалгаж RAVS кредитийг тооцоолно. Файлын MB хэмжээг нягтаршилаас таамаглахгүй.', inputSchema: { modelSlug, input: generationInput }, annotations: readAnnotations }, async ({ modelSlug, input }) => guarded('ravs:read', async () => {
    const m = getModel(modelSlug); if (!m) return { error: 'Загвар олдсонгүй.' };
    try { const payload = buildProviderInput(m, input); return { model: m.name, validatedInput: payload, credits: estimateCredits(m, Number(payload.duration), payload), billable: true, next: 'Хэрэглэгчид тохиргоо, кредитийг харуул. Зөвшөөрсөн бол шинэ idempotencyKey ба maxCredits-тай ravs_create_generation дууд.' }; }
    catch (e) { return { error: e instanceof Error ? e.message : 'Оролт буруу байна.' }; }
  }));
  server.registerTool('ravs_account', { title: 'Миний кредит', description: 'Холболтыг зөвшөөрсөн хэрэглэгчийн кредитийг харуулна.', inputSchema: {}, annotations: readAnnotations }, async () => guarded('ravs:read', () => services.getUserAccount(identity.userId)));
  server.registerTool('ravs_list_generations', { title: 'Миний бүтээлүүд', description: 'Зөвхөн өөрийн сүүлийн бүтээлүүдийг харуулна.', inputSchema: {}, annotations: readAnnotations }, async () => guarded('ravs:read', () => services.listUserGenerations(identity.userId)));
  server.registerTool('ravs_generation_status', { title: 'Үүсгэлтийн төлөв', description: 'Өөрийн хүсэлтийн төлөвийг шалгаж дууссан үед медиа холбоосыг авна. Алдаатай/хориглогдсон/цуцлагдсан хүсэлтийг амжилт гэж хэлж болохгүй.', inputSchema: { generationId }, annotations: { ...readAnnotations, openWorldHint: true } }, async ({ generationId }) => guarded('ravs:read', () => services.getUserGeneration(identity.userId, generationId)));
  if (identity.scopes.includes('ravs:generate')) {
    server.registerTool('ravs_create_generation', { title: 'Төлбөртэй бүтээл үүсгэх', description: 'Кредит зарцуулна. ravs_estimate дараа хэрэглэгч тодорхой зөвшөөрсөн үед л дууд. Нэг үйлдлийн дахин оролдлогод ижил idempotencyKey хэрэглэ. maxCredits нь хэрэглэгчийн зөвшөөрсөн дээд кредит. SUBMITTED бол бэлэн видео биш.', inputSchema: { modelSlug, input: generationInput, confirmGeneration: z.literal(true), maxCredits: z.number().int().min(1).max(1000000), idempotencyKey: z.string().min(16).max(128).regex(/^[A-Za-z0-9_-]+$/) }, annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: true, openWorldHint: true } }, async ({ modelSlug, input, maxCredits, idempotencyKey }) => guarded('ravs:generate', () => services.createUserGeneration(identity.userId, { ...input, modelSlug }, { maxCredits, idempotencyKey })));
    server.registerTool('ravs_cancel_generation', { title: 'Үүсгэлт цуцлах', description: 'Хэрэглэгч хүссэн үед өөрийн эхэлж амжаагүй үүсгэлтийг цуцална. Боловсруулж эхэлсэн хүсэлт цуцлагдахгүй.', inputSchema: { generationId, confirmCancel: z.literal(true) }, annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true, openWorldHint: true } }, async ({ generationId }) => guarded('ravs:generate', () => services.cancelUserGeneration(identity.userId, generationId)));
  }
  server.registerPrompt('mongolian_campaign', { title: 'Монгол кампанит ажил', description: 'RAVS хэрэгслээр санаанаас нийтлэх контент хүртэл төлөвлөх', argsSchema: { brand: z.string().max(150), goal: z.string().max(1000), audience: z.string().max(500) } }, async ({ brand, goal, audience }) => ({ messages: [{ role: 'user', content: { type: 'text', text: `${brand} брэндэд Монгол хэлээр бүтэн контент бэлд. Зорилго: ${goal}. Үзэгчид: ${audience}. Эхлээд ravs_list_models, сонгосон ravs_model_guide ашигла. 3 санаа, storyboard, кадр бүрийн prompt/тохиргоо, caption, hook, CTA, нийтлэх төлөвлөгөө гарга. ravs_estimate ашиглаж кредитийг харуул. Миний тусдаа зөвшөөрөлгүйгээр төлбөртэй үүсгэлт бүү хий. Хүсэлт эхэлсэн бол ravs_generation_status-аар шалгаж, зөвхөн COMPLETED ба URL байвал бэлэн гэж хэл.` } }] }));
  // This tool and prompt coordinate two independently authorized MCP servers.
  // No Voice credentials, accounts, audio, or payment operations cross this boundary.
  server.registerTool('ravs_movie_status',{
    title:'Кино үйлдвэрлэлийн бодит төлөв',
    description:'ChatGPT хаагдсан ч PostgreSQL-д ажиллаж буй movie scheduler scene бүрийн төлөв, кредит, медиа холбоосыг өгнө.',
    inputSchema:{movieId:z.string().regex(/^[a-f0-9]{40}$/)},annotations:readAnnotations
  },async ({movieId})=>guarded('ravs:read',async()=>movieEnabled()?movieStatus(identity.userId,movieId):{enabled:false,message:'Movie Producer production flag унтраалттай.'}));
  if(identity.scopes.includes('ravs:generate')){
    server.registerTool('ravs_create_movie',{
      title:'Нэг зөвшөөрөлтэй урт кино эхлүүлэх',
      description:'Зөвшөөрсөн нийт видео кредитийн хүрээнд scene-үүдийг сервер дээр дарааллуулж эхлүүлнэ. Асинхрон; Voice үнэ ба MP4 export ТУСДАА.',
      inputSchema:{
        prompt:z.string().min(12).max(6000),
        targetSeconds:z.number().int().min(4).max(3600),
        modelSlug:z.string().min(1).max(100),
        aspectRatio:z.enum(['9:16','16:9','1:1']),
        resolution:z.enum(['480p','720p','1080p']),
        generateAudio:z.boolean(),
        qualityProfile:z.enum(['cinematic','balanced','fast']).default('cinematic'),
        styleBible:z.string().max(2000).optional(),
        confirmGeneration:z.literal(true),
        maxVideoCredits:z.number().int().min(1).max(1000000),
        idempotencyKey:z.string().min(16).max(128).regex(/^[A-Za-z0-9_-]+$/)
      },annotations:{readOnlyHint:false,destructiveHint:false,idempotentHint:true,openWorldHint:true}
    },async (input)=>guarded('ravs:generate',async()=>movieEnabled()?createMovie(identity.userId,input):{enabled:false,message:'Movie Producer production flag унтраалттай.'}));
    server.registerTool('ravs_cancel_movie',{
      title:'Дараагийн кадруудыг зогсоох',
      description:'Хүлээгдэж буй movie scheduler ажлыг зогсооно. Эхэлсэн paid provider generation-ийг хүчингүй болгохгүй.',
      inputSchema:{movieId:z.string().regex(/^[a-f0-9]{40}$/),confirmCancel:z.literal(true)},
      annotations:{readOnlyHint:false,destructiveHint:true,idempotentHint:true,openWorldHint:true}
    },async({movieId})=>guarded('ravs:generate',async()=>movieEnabled()?cancelMovie(identity.userId,movieId):{enabled:false,message:'Producer идэвхгүй.'}));
  }
  server.registerTool('ravs_storyboard_quality_check',{
    title:'Сторибордын чанарын шалгалт',
    description:'Кадр давтагдсан, хугацаа зөрсөн, дүр continuity reference дутуу зэрэг алдааг төлбөргүй шалгана. Текстийн QA болохоос AI видеоны дүрсний чанарын баталгаа биш.',
    inputSchema:{
      targetSeconds:z.number().int().min(4).max(3600),
      styleBible:z.string().max(2000).optional(),
      scenes:z.array(z.object({
        number:z.number().int().min(1).max(120),
        duration:z.number().min(0).max(120),
        prompt:z.string().max(6000),
        beat:z.string().max(100).optional(),
        shotType:z.string().max(150).optional(),
        continuityReference:z.string().max(2000).optional()
      })).min(1).max(120)
    },annotations:readAnnotations
  },async({targetSeconds,styleBible,scenes})=>guarded('ravs:read',
    async()=>reviewStoryboard(scenes,targetSeconds,styleBible)));
  server.registerTool('ravs_long_movie_plan', {
    title:'Ганц санаанаас урт кино төлөвлөх',
    description:'4 секундээс 60 минут хүртэл урт кинонд API хязгаарын дагуу scene хувааж, видео кредитийг автоматаар нэгтгэх. Энэ нь 100% үнэгүй, зөвхөн төлөвлөлт бөгөөд видео/voice/MP4 экспорт эхлүүлэхгүй.',
    inputSchema:{
      prompt:z.string().min(12).max(6000),
      targetSeconds:z.number().int().min(4).max(3600),
      modelSlug:z.string().min(1).max(100).default('seedance-2-5'),
      aspectRatio:z.enum(['9:16','16:9','1:1']).default('9:16'),
      resolution:z.enum(['480p','720p','1080p']).default('720p'),
      generateAudio:z.boolean().default(true),
      qualityProfile:z.enum(['cinematic','balanced','fast']).default('cinematic'),
      styleBible:z.string().max(2000).optional()
    },annotations:readAnnotations
  },async (input)=>guarded('ravs:read',async()=>createLongMoviePlan(input)));
  server.registerTool('ravs_scene_batch_estimate', {
    title: 'Олон кадрын нийт өртөг',
    description: 'Хамгийн ихдээ 20 кадрын загвар, оролт бүрийг тус тусад нь шалгаж кредитийг нэгтгэнэ. Ямар ч төлбөртэй generation эхлүүлэхгүй.',
    inputSchema: {
      scenes: z.array(z.object({
        scene: z.string().min(1).max(100),
        modelSlug,
        input: generationInput
      })).min(1).max(20)
    },
    annotations: readAnnotations
  }, async ({ scenes }) => guarded('ravs:read', async () => {
    let totalCredits = 0;
    const estimates = scenes.map(({scene,modelSlug,input}) => {
      const m = getModel(modelSlug);
      if (!m || !m.apiVerified) return {scene,modelSlug,error:'Энэ загвар API-аар баталгаажаагүй эсвэл олдсонгүй.'};
      try {
        const providerInput = buildProviderInput(m,input);
        const credits = estimateCredits(m,Number(providerInput.duration),providerInput);
        if (!Number.isSafeInteger(credits) || credits < 0) throw new Error('Тооцоо хүчингүй.');
        totalCredits += credits;
        if (!Number.isSafeInteger(totalCredits)) throw new Error('Нийт кредитийн хэмжээ хэтэрлээ.');
        return {scene,modelSlug,modelName:m.name,credits,validatedInput:providerInput};
      } catch(e) { return {scene,modelSlug,error:e instanceof Error?e.message:'Тооцоолол амжилтгүй.'}; }
    });
    const valid=estimates.every(x=>!('error' in x));
    return {
      status:valid?'quoted':'invalid',
      scenes:estimates,
      totalCredits:valid?totalCredits:null,
      billable:false,
      priceGuarantee:false,
      voiceCreditsIncluded:false,
      note:'Энэ нь зөвхөн видеоны кредитийн тооцоо. Voice студийн TTS кредитийг rainy_voice_quote_tts хэрэгслээр тусад нь шалга. Кадр бүрд төлбөртэй generation хийхээс өмнө хэрэглэгчийн зөвшөөрөл ав.',
    };
  }));
  server.registerTool('ravs_voice_workflow_plan', {
    title: 'RAINY Video + Voice ажлын урсгал',
    description: 'Хоёр тусдаа сайт (RAVS Video болон RAINY Voice)-ын MCP хэрэгслээр видео, Монгол voice-over төлөвлөх үнэ төлбөргүй handoff. Voice сайтыг автоматаар дуудахгүй.',
    inputSchema: {
      project: z.string().min(1).max(1000),
      channel: z.enum(['Reels','TikTok','YouTube','Facebook','Website']).default('Reels'),
      scenes: z.number().int().min(1).max(20).default(3),
    }, annotations: readAnnotations
  }, async ({project,channel,scenes}) => guarded('ravs:read', async () => ({
    project, channel, scenes, videoService: 'RAINY AI Video Studio',
    voiceService: 'RAINY Voice Studio (independent account and credits)',
    orchestration: [
      'ravs_list_models + ravs_model_guide: загвар, reference, хугацааг сонгох',
      'ravs_content_brief: Монгол зохиол, hook, CTA, storyboard, scene-by-scene prompt болон voice-over текст бэлтгэх',
      'ravs_estimate: видео кредитийг төлбөргүй урьдчилан тооцох',
      'Voice connector холбогдсон тохиолдолд rainy_voice_voices + rainy_voice_quote_tts: Монгол хоолой ба TTS кредитийг тусад нь тооцох',
      'Хэрэглэгчээс хоёр үйлчилгээний кредитийг ТУС ТУСАД НЬ баталгаажуулсны дараа ravs_create_generation, rainy_voice_create_tts дууд',
      'ravs_generation_status болон rainy_voice_job_status-аар гүйцэтгэлийг шалгах',
      'Видео COMPLETED + медиа URL, Voice done + аудио болсон үед хоёр материалыг тусад нь гаргах',
    ],
    caution: 'Хоёр MCP нь нэг хэрэглэгчийн нэвтрэлтийг хуваалцдаггүй. Нэгтгэсэн media mux/редактор/нийтлэлт одоогоор суулгагдаагүй. Хоёул амжилттай болсон гэсэн баталгаа өгч болохгүй.',
    requirements: ['ChatGPT эсвэл Claude-д RAVS Video болон RAINY Voice хоёр custom MCP connector-ийг хэрэглэгч тус тусад нь холбосон байх', 'Хэрэглэгч төлбөртэй generation бүрийг зөвшөөрөх'],
  })));
  server.registerPrompt('rainy_one_prompt_movie', {
    title:'RAINY One Prompt Movie — бүтэн кино',
    description:'Нэг Монгол prompt-оос олон кадрын видео, Voice TTS, эцсийн MP4 (хэрэглэгчийн нэг багц зөвшөөрөлтэй).',
    argsSchema:{
      prompt:z.string().min(12).max(5000),
      seconds:z.string().max(12),
      aspectRatio:z.string().max(10),
    }
  },async ({prompt,seconds,aspectRatio})=>({messages:[{role:'user',content:{type:'text',text:
    'RAINY Video болон RAINY Voice MCP хоёрыг хэрэглэ. Миний НЭГ санаа: '+prompt+
    '. Хүссэн хугацаа (сек): '+seconds+', харьцаа: '+aspectRatio+
    '. Эхлээд ravs_long_movie_plan qualityProfile=cinematic, scene бүрийн бие даасан кино зохиол, дүр, камер, continuity bible, narrative beat-ийг боловсруул. '+
     'ravs_storyboard_quality_check-ээр кадрын давхардал, хугацаа, continuity шалга, өндөр давхардалтай prompt-ыг зас. RAVS видео болон Voice TTS/MP4 эвлүүлгийн кредитийг тус тусад нь quote хий. Бүх ажлын дээд төсөв, үнэ болон эрсдэлийг надад НЭГ удаа танилцуулж зөвшөөрөл ав. '+
    'Миний зөвшөөрөлгүйгээр нэг ч төлбөртэй хүсэлт бүү үүсгэ. Зөвшөөрсөн бол баталсан storyboard болон төсөвт багтах бүх scene-ийг ravs_create_generation-аар, '+
    'өөр өөр scene-д ялгаатай idempotencyKey хэрэглэн эхлүүл. Retry-д анхны key-г хадгал. scene бүрийн ravs_generation_status COMPLETED ба медиа URL-ийг шалга. '+
    'Монгол дуу хэрэгтэй бол rainy_voice_prepare_script, rainy_voice_quote_tts / rainy_voice_create_tts / rainy_voice_job_status-аар хийнэ. '+
    'Кадр бүрийн duration/frame integrity болон төлөвийг шалга. Дүр ба бүтээгдэхүүний үнэн зөв байдлын QA-г AI үнэлсэн гэж 100% баталж болохгүй. '+
    'Бүх scene бэлэн болмогц Voice-д movie tools байгаа эсэхийг шалга. Байхгүй бол бодит CDN host/холболт баталгаажаагүй гэсэн үг: MP4 бэлэн гэж бүү мэдэгд, Video болон Voice-ийн тусдаа үр дүн, job ID-г үзүүл. Tool байвал rainy_voice_movie_quote-аар CDN ба кредитийг шалгаж, зөвхөн баталсан төсвийн хүрээнд rainy_voice_create_movie, '+
    'rainy_voice_movie_status дуудан эцсийн MP4 татах холбоосыг өг. Төлөв queued/running бол бэлэн гэж бүү хэл. '+
    'Хэрэв ravs_create_movie идэвхтэй бол нийт төсвөө батлуулж durable scheduler эхлүүл, movie_status-аар төлөв шалга. Movie Producer flag унтраалттай бол ChatGPT/Claude клиент нээлттэй байх шаардлагатай, бүрэн автоном гэж бүү амла. '+
    'Хэрэв хэт олон генерац, төсөв, серверийн лимитээс болж дуусахгүй бол төлөвийг үнэн зөв мэдээл, бүх сцен ба output-ыг алдахгүй хадгал.'}}]}));
  server.registerPrompt('rainy_video_voice_campaign', {
    title: 'RAINY хоёр студи: видео + Монгол дуу',
    description: 'Тусдаа RAVS ба Voice MCP-ээр баталгаатай, хоёр талын кредиттэй бүтээл төлөвлөх',
    argsSchema: {brand: z.string().min(1).max(150), goal: z.string().min(1).max(1000), channel: z.string().max(100)},
  }, async ({brand,goal,channel}) => ({messages:[{role:'user',content:{type:'text',text:
    'RAINY Video болон RAINY Voice хоёр өөр сайт, хоёр өөр MCP OAuth холболттой. '+
    'Энэ хоёр MCP холбогдсон бол хамтад нь хэрэглэ. Брэнд: '+brand+'. Зорилго: '+goal+'. Суваг: '+channel+'. '+
    'Эхлээд ravs_voice_workflow_plan, ravs_list_models, ravs_model_guide, ravs_content_brief ашиглан Монгол hook, кадр бүрийн storyboard, prompt, '+
    'voice-over script, CTA боловсруул. Видео талд ravs_estimate; Voice талд rainy_voice_voices ба rainy_voice_quote_tts хэрэглэ. '+
    'Хоёр кредитийг салгаж танилцуул; миний илэрхий зөвшөөрөлгүйгээр ravs_create_generation, rainy_voice_create_tts бүү дууд. '+
    'Зөвшөөрсөн бол idempotencyKey-г давталтад хадгал; төлөвийг тус тусад нь шалга. '+
    'RAVS COMPLETED ба видео URL, Voice done болсны дараа тус тусын материалыг үзүүл. '+
    'Медиа автоматаар эвлүүлсэн, нийтэлсэн эсвэл сайтуудыг шууд интеграцчилсан гэж бүү хэл.'}}]}));
  return server;
}
