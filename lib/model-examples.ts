import type { RavsModel } from './models.ts';
import { modelGuide } from './model-guides.ts';
import { trendDemos } from './trend-demos.ts';

export const inspirationDisclosure = 'Зориулалтын жишээ — энэ загвараар үүсгэсэн гэдгийг батлахгүй';

// Explicit editorial matches by operation/family. Never infer provenance from
// community recreation recommendations, rotate examples, or fall back to cinema.
const purposeExamples: Record<string, {ids: string[]; reason: string}> = {
  seedance: {ids:['act-natural','studio-slide'],reason:'Дүрийн байгалийн хөдөлгөөн, бүтээгдэхүүний камерын шилжилтийг тайлбарлах санаа.'},
  kling: {ids:['eyes-in','floating-fall'],reason:'Камерын ойртолт болон дүрийн нэг тодорхой үйлдлийг төлөвлөх санаа.'},
  ltx: {ids:['studio-slide'],reason:'Бүтээгдэхүүний кадрт камерын чиглэл, шилжилтийн хэмнэлийг төлөвлөх санаа.'},
  happy: {ids:['act-natural'],reason:'Нэг дүрийн энгийн, байгалийн хөдөлгөөнийг төлөвлөх санаа.'},
  minimax: {ids:['eyes-in'],reason:'Ойрын кадр, тайван камерын хөдөлгөөнийг төлөвлөх санаа.'},
};

export function examplesForModel(model: RavsModel) {
  const guide = modelGuide(model);
  const id = model.modelId;
  let selection: {ids:string[];reason:string} | undefined;
  // Image generation and restyling/editing need their own material and guide.
  if (model.apiVerified && model.kind !== 'image') {
    if (/genjutsu\/motion-transfer\//.test(id)) selection={ids:['motion-transfer-1','motion-transfer-2'],reason:'Эх видеоны хөдөлгөөнийг шинэ дүрд шилжүүлэх Genjutsu-ийн албан жишээ. Таны сонгосон API хувилбарын үр дүнг батлахгүй.'};
    else if (/genjutsu\/object-swap\//.test(id)) selection={ids:['object-swap-1','object-swap-2'],reason:'Хөдөлгөөнийг хадгалж объект солих Genjutsu-ийн албан жишээ. Таны сонгосон API хувилбарын үр дүнг батлахгүй.'};
    else if (!model.supportsVideo && /text-to-video|image-to-video|first-last-frame/.test(id)) {
      const family = /seedance/.test(id)?'seedance':/kling/.test(id)?'kling':/ltx/.test(id)?'ltx':/happy-horse/.test(id)?'happy':/minimax/.test(id)?'minimax':undefined;
      if (family) selection=purposeExamples[family];
    }
  }
  const videos=(selection?.ids || []).map(exampleId=>trendDemos.find(d=>d.id===exampleId)).filter((d):d is NonNullable<typeof d>=>!!d);
  return {videos, reason:selection?.reason, prompt:guide.prompt, translation:guide.promptTranslation, mode:guide.mode, purpose:guide.purpose, source:guide.source};
}

export function modelExampleHref(model:RavsModel,prompt:string) {
  return '/studio?'+new URLSearchParams({model:model.slug,prompt}).toString();
}
