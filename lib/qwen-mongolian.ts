/**
 * RAINY Qwen image prompt bridge: one request, no translation/API call.
 * Preserves the exact user-written Mongolian text. English cues cover only
 * explicitly recognized phrases, so they are NOT a full semantic translation.
 */
type Purpose='create'|'edit';
export type QwenMongolianAdvice={isMongolian:boolean;recognized:string[];suggestions:string[];note:string};
type Cue={pattern:RegExp;english:string;mongolian:string;group:'subject'|'place'|'action'|'style'|'light'|'color'|'preserve'};
const cues:Cue[]=[
 {pattern:/монгол (бүсгүй|эмэгтэй|охин)|монголын (бүсгүй|эмэгтэй)/i,english:'a Mongolian woman',mongolian:'Монгол эмэгтэй дүр',group:'subject'},
 {pattern:/монгол (залуу|эрэгтэй|хүү)/i,english:'a Mongolian man',mongolian:'Монгол эрэгтэй дүр',group:'subject'},
 {pattern:/монгол (хүн|дүр|хүүхэд)/i,english:'an authentic Mongolian person',mongolian:'Монгол дүр',group:'subject'},
 {pattern:/бүтээгдэхүүн|сав баглаа|шошго|брэнд/i,english:'a product or its authentic packaging exactly as specified',mongolian:'Бүтээгдэхүүн, сав баглаа',group:'subject'},
 {pattern:/кофе|аяга кофе/i,english:'coffee or a coffee cup as specified',mongolian:'Кофе',group:'subject'},
 {pattern:/машин|автомашин|суудлын тэрэг/i,english:'a car as specified',mongolian:'Автомашин',group:'subject'},
 {pattern:/уул|уулс|уулын/i,english:'mountains',mongolian:'Уулс',group:'place'},
 {pattern:/улаанбаатар|уб хот/i,english:'Ulaanbaatar, Mongolia',mongolian:'Улаанбаатар',group:'place'},
 {pattern:/тал нутаг|хөдөө нутаг|говь|хээр/i,english:'Mongolian countryside or steppe as described',mongolian:'Монгол байгаль, хөдөө',group:'place'},
 {pattern:/гудамж|зам дээр|хотын төв/i,english:'urban street environment',mongolian:'Хотын гудамж',group:'place'},
 {pattern:/студи|studio/i,english:'studio setting',mongolian:'Студи орчин',group:'place'},
 {pattern:/өрөө|гэр дотор|тасалгаа/i,english:'interior room setting',mongolian:'Дотор орчин',group:'place'},
 {pattern:/ойд|ой мод|модтой ой/i,english:'forest',mongolian:'Ойн орчин',group:'place'},
 {pattern:/бороо|бороотой|шиврээ/i,english:'rainy weather and wet surfaces',mongolian:'Бороотой орчин',group:'place'},
 {pattern:/цас|цастай|өвөл/i,english:'snowy or winter environment',mongolian:'Цастай орчин',group:'place'},
 {pattern:/алх(аж|ана|ах|аад|саар|ж)|алхалт/i,english:'walking naturally',mongolian:'Алхах үйлдэл',group:'action'},
 {pattern:/инээ|инээмсэг/i,english:'smiling naturally',mongolian:'Инээмсэглэх үйлдэл',group:'action'},
 {pattern:/суу(ж|на|х)|сууж байна/i,english:'sitting naturally',mongolian:'Суух үйлдэл',group:'action'},
 {pattern:/бар(ьж|ина)|атгасан/i,english:'holding the specified object',mongolian:'Барьж байгаа үйлдэл',group:'action'},
 {pattern:/гүйж|гүйлд|гүйнэ|гүйх/i,english:'running naturally',mongolian:'Гүйх үйлдэл',group:'action'},
 {pattern:/дээл|монгол хувцас|үндэсний хувцас/i,english:'traditional Mongolian deel clothing if requested',mongolian:'Монгол дээл, хувцас',group:'style'},
 {pattern:/бодит|фотореал|realistic/i,english:'photorealistic textures and natural anatomy',mongolian:'Бодит дүрслэл',group:'style'},
 {pattern:/кино мэт|cinematic/i,english:'cinematic composition and photographic lighting',mongolian:'Киноны дүрслэл',group:'style'},
 {pattern:/аниме|anime/i,english:'anime illustration style',mongolian:'Аниме хэв маяг',group:'style'},
 {pattern:/минимал|minimal/i,english:'minimal composition',mongolian:'Минимал хэв маяг',group:'style'},
 {pattern:/зөөлөн гэрэл|зөөлөн (нарны|хажуугийн) гэрэл/i,english:'soft diffused lighting',mongolian:'Зөөлөн гэрэл',group:'light'},
 {pattern:/нар жаргах|үдшийн|оройн нар/i,english:'sunset or golden-hour lighting',mongolian:'Үдшийн гэрэл',group:'light'},
 {pattern:/өглөөний|өглөө эрт|нар мандах/i,english:'morning light',mongolian:'Өглөөний гэрэл',group:'light'},
 {pattern:/шөнө|шөнийн|харанхуй орчин/i,english:'nighttime lighting',mongolian:'Шөнийн гэрэл',group:'light'},
 {pattern:/цэнхэр/i,english:'blue as specified',mongolian:'Цэнхэр өнгө',group:'color'},
 {pattern:/хар (дээл|цамц|хувцас|өнгө|дэвсгэр)/i,english:'black as specified',mongolian:'Хар өнгө',group:'color'},
 {pattern:/цагаан/i,english:'white as specified',mongolian:'Цагаан өнгө',group:'color'},
 {pattern:/улаан/i,english:'red as specified',mongolian:'Улаан өнгө',group:'color'},
 {pattern:/шар(гал)?/i,english:'yellow or golden color as specified',mongolian:'Шар өнгө',group:'color'},
 {pattern:/(нүүр|нүүрийг|царай|царайг|төрх|төрхийг).{0,32}(өөрчлөхгүй|өөрчилж болохгүй|хэвээр|солихгүй|хадгал)/i,english:'Preserve the same face identity and facial features; do not alter the approved face.',mongolian:'Нүүр, царайг хадгалах',group:'preserve'},
 {pattern:/(хувцас|хувцсыг|дээл|өнгө).{0,32}(өөрчлөхгүй|солихгүй|хэвээр|хадгал)/i,english:'Do not change the specified clothing or colors.',mongolian:'Хувцас, өнгийг хадгалах',group:'preserve'},
 {pattern:/(лого|шошго|брэнд|бүтээгдэхүүн|сав баглаа).{0,36}(өөрчлөхгүй|хэвээр|ижил|хадгал)/i,english:'Preserve the provided logo, label, product shape and brand details; do not invent text.',mongolian:'Брэнд, бүтээгдэхүүнийг хадгалах',group:'preserve'},
 {pattern:/(зөвхөн|ганцхан).{0,38}(дэвсгэр|фон|арын)|(?:дэвсгэр|фон).{0,24}(л соль|л өөрчил)/i,english:'Edit the background only; preserve the foreground subject and its identity.',mongolian:'Зөвхөн арын дэвсгэрийг засах',group:'preserve'},
 {pattern:/(текст|бичиг|үсэг).{0,28}(оруулахгүй|нэмэхгүй|гаргахгүй|бичихгүй)/i,english:'Do not add on-image text or lettering.',mongolian:'Илүүдэл бичиг нэмэхгүй',group:'preserve'},
];
const mark='RAINY QWEN MONGOLIAN ORIGINAL';
function hits(input:string){return cues.filter(({pattern})=>pattern.test(input));}
export function getQwenMongolianAdvice(prompt:string,purpose:Purpose):QwenMongolianAdvice {
 const text=String(prompt||'').trim();
 if(!/[\u0400-\u04ff]/u.test(text))return {isMongolian:false,recognized:[],suggestions:[],note:'Тайлбартаа дүр, үйлдэл, орчин, гэрэл, хэв маяг, хадгалах нөхцөлөө тодорхой бичээрэй.'};
 const found=hits(text),recognized=[...new Set(found.map(c=>c.mongolian))];
 const groups=new Set(found.map(c=>c.group));
 const suggestions:string[]=[];
 if(!groups.has('subject'))suggestions.push('Гол дүр эсвэл бүтээгдэхүүнээ нэрлэж, ямар харагдахыг нь тодорхойлоорой.');
 if(!groups.has('place'))suggestions.push('Орчин, байршил, дэвсгэр ямар байхыг нэмж бичээрэй.');
 if(!groups.has('style'))suggestions.push('Бодит зураг, кино мэт, аниме зэрэг хүссэн хэв маягаа тодорхойлоорой.');
 if(!groups.has('light'))suggestions.push('Гэрлийн өнгө, чиглэл, өглөө эсвэл орой эсэхийг бичээрэй.');
 if(purpose==='edit'&&!groups.has('preserve'))suggestions.push('Зөвхөн өөрчлөх хэсэг болон заавал хэвээр үлдэх хэсгийг ялгаж бичээрэй.');
 if(!suggestions.length)suggestions.push('Эх зурагтай бол хавсаргаад нүүр, бүтээгдэхүүн, бичвэрийг өөрчлөх эсэхээ шалгаарай.');
 return {isMongolian:true,recognized,suggestions,
  note:'Монгол эх бичвэрийг хэвээр хадгалж, танигдсан утгад англи техникийн тайлбар нэмнэ. Энэ нь бүрэн машин орчуулга биш; Qwen-ийн албан Монгол хэлний дэмжлэг баталгаажаагүй тул үр дүнгээ нягтална уу.'};
}
export function prepareQwenMongolianPrompt(prompt:string,purpose:Purpose,maxLength=6000):string{
 const original=String(prompt||'').trim();
 if(!original||!/[\u0400-\u04ff]/u.test(original)||original.includes(mark))return original;
 const found=hits(original);
 const instructions=[
  mark+' (customer instructions; preserve exactly):',
  original,
  '',
  'Grounded image instructions (only details recognized explicitly in the Mongolian original, not a full translation):',
  ...[...new Set(found.map(c=>c.english))].map(c=>'- '+c),
  purpose==='edit'?'Edit ONLY what the original instruction requests. Use the uploaded reference images as ground truth.':'Create an image only from explicitly described subjects, actions and locations.',
  'Treat the original Mongolian instructions as authoritative. Do not add unrequested people, branding, captions, text, colors, claims or objects. Do not replace the exact Mongolian words intended to appear in the output.'
 ];
 const bridge=instructions.join('\n');
 // Never silently truncate the user's input or overflow the provider field.
 return bridge.length<=maxLength?bridge:original;
}
