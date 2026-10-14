/** Deterministic Mongolian phrase hints. No translation model, external API or paid network calls.
 * Original Mongolian text remains authoritative; English hints NEVER replace user content.
 */
export type MongolianPromptAnalysis={isMongolian:boolean;hints:string[];constraints:string[]};
const HINTS:[RegExp,string][]=[
 [/бороотой|бороо ор|бороо шивэр|бороон/g,'rainy weather and wet surfaces'],
 [/цастай|цас ор|цасан/g,'snowy environment'],
 [/шөнө|шөнийн|шөнийн гудамж/g,'nighttime atmosphere'],
 [/өдрийн гэрэл|өдөр тутам|өглөөний|өглөө/g,'natural daylight or morning as specified'],
 [/алх(аж|ана|саар|ан|ах|аж байна)|алхах/g,'walking action'],
 [/гүйл(дэх|т)|гүйж|гүйх/g,'running action'],
 [/инээ(мсэгл|д)|инээх/g,'natural smile or laughter'],
 [/бүжигл|бүжих/g,'dancing action'],
 [/араас.{0,20}дага|дагах камер/g,'following camera behind the subject'],
 [/камер.{0,28}ойрт|дөтлөх камер/g,'slow camera push-in'],
 [/дроноор|дрон камер|drone/gi,'aerial drone camera view'],
 [/кино мэт|синематик|cinematic/gi,'cinematic lighting and framing'],
 [/бодит мэт|бодитой|фотореал|realistic/gi,'photorealistic natural appearance'],
 [/аниме|anime/gi,'anime visual style'],
 [/монгол дээл|үндэсний дээл|дээл өмс/gi,'traditional Mongolian deel clothing'],
 [/монгол (залуу|бүсгүй|хүн|эмэгтэй|эрэгтэй|хүүхэд|дүр)/gi,'authentic Mongolian human appearance where explicitly requested'],
];
const CONSTRAINTS:[RegExp,string][]=[
 [/(царай|нүүр|төрх).{0,35}(өөрчл(өхгүй|игдөхгүй|ж болохгүй)|солихгүй|хэвээр|адил|ижил)/i,'Keep the same face identity and facial features as the approved reference; no face swap.'],
 [/(хувцас|хувцсыг|хувцсыг|хувцасны|өмсгөл|дээл).{0,30}(солихгүй|өөрчлөхгүй|хэвээр|ижил)/i,'Do not alter clothing, outfit colors or garments from the approved reference.'],
 [/(лого|брэндийн тэмдэг|сав баглаа|бүтээгдэхүүн).{0,35}(өөрчлөхгүй|хэвээр|ижил|эвдэхгүй)/i,'Preserve the exact approved product and logo reference; do not invent or redraw labels.'],
 [/текст (оруулахгүй|бичихгүй)|үсэг (гаргахгүй|оруулахгүй)|бичиг (гаргахгүй|оруулахгүй)/i,'No added on-screen text, captions or logos unless the user explicitly changes this instruction.'],
 [/монгол хэлээр|монголоор (ярих|ярь|дуугарах|унших|хэлэх)/i,'Spoken dialogue in Mongolian (mn-MN); preserve the exact approved words and natural Mongolian pronunciation.'],
 [/(дүр|царай|нүүр|хувцас|бүтээгдэхүүн).{0,35}(тогтвортой|нэг хэвээр|ижил бай|хадгал)/i,'Maintain the specified subject and approved visual identity across all shots.'],
];
export function analyzeMongolianPrompt(value:string):MongolianPromptAnalysis{
 const original=typeof value==='string'?value:'';
 if(!/[\u0400-\u04ff]/u.test(original))return {isMongolian:false,hints:[],constraints:[]};
 const hints=HINTS.filter(([pattern])=>new RegExp(pattern.source,pattern.flags.replace('g','')).test(original)).map(([,message])=>message);
 const constraints=CONSTRAINTS.filter(([pattern])=>pattern.test(original)).map(([,message])=>message);
 return {isMongolian:true,hints,constraints};
}
/** Max 2800 default: protects model prompt limits and avoids hidden provider token inflation.
 * If original cannot fit with the English checklist, preserve it unchanged.
 */
export function enhanceMongolianPrompt(value:string,maxLength=2800):string{
 const original=typeof value==='string'?value.trim():'';
 if(!original||original.includes('MONGOLIAN PROMPT FIDELITY NOTES'))return original;
 const analysis=analyzeMongolianPrompt(original);
 if(!analysis.isMongolian)return original;
 const checklist=[
  'MONGOLIAN PROMPT FIDELITY NOTES (original Mongolian text above is authoritative):',
  'Do not replace or omit any named subject, action, location, event, camera direction, clothing, visual reference, product property, spoken line or negative requirement.',
  ...analysis.hints.map(s=>'- Observable cue: '+s+'.'),
  ...analysis.constraints.map(s=>'- REQUIRED: '+s),
  'If a detail is absent, do not invent it. Use approved reference media as the source of truth.',
 ].join('\n');
 const output=original+'\n\n'+checklist;
 if(original.length>maxLength||output.length>maxLength)return original;
 return output;
}