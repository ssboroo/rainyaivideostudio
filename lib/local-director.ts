/** Free, deterministic shot planning. No provider request or generation charges. */
export type LocalDirectorInput={
  provider:'local';brief:string;seconds:number;ratio:'9:16'|'16:9'|'1:1';
};
export type LocalDirectorPlan={
  title:string;logline:string;styleBible:string;characters:string[];
  scenes:{number:number;durationSeconds:number;shot:string;videoPrompt:string;voiceover:string;subtitle:string}[];
  subtitlesSrt:string;provider:'local';model:'rainy-local-template-v1';estimatedOnly:true;
};
const SHOTS=[
  {name:'Нээлтийн зураг',camera:'Wide establishing shot; gentle dolly-in; establish the setting and mood.'},
  {name:'Бүтээгдэхүүний танилцуулга',camera:'Hero medium shot; reveal the subject clearly with a slow camera arc.'},
  {name:'Ойрын деталь',camera:'Close-up of real textures and materials; shallow depth of field; precise focus pull.'},
  {name:'Хэрэглээний нөхцөл',camera:'Natural context shot; show a credible everyday use case without inventing claims.'},
  {name:'Хөдөлгөөний кадр',camera:'Tracking shot with deliberate motion; maintain exact subject continuity.'},
  {name:'Сэтгэл хөдлөлийн өнгө',camera:'Intimate medium close-up; authentic ambient light and restrained acting.'},
  {name:'Орчны деталь',camera:'Macro environment insert; grounded physical details and textures.'},
  {name:'Өөр өнцөг',camera:'Over-the-shoulder composition; camera movement with clear visual purpose.'},
  {name:'Өөрчлөлтийн мөч',camera:'Match-cut friendly composition; show visual progression without claims.'},
  {name:'Гол санааны тодруулга',camera:'Centered hero composition; consistent silhouette and brand appearance.'},
  {name:'Төгсгөлийн шилжилт',camera:'Slow pullback to a wider environment, preserving spatial continuity.'},
  {name:'Сүүлийн кадр',camera:'Clean closing frame with empty safe area for a manually verified CTA.'},
] as const;
export function createLocalDirectorPlan(input:LocalDirectorInput):LocalDirectorPlan {
  const {brief,seconds,ratio}=input;
  if(typeof brief!=='string'||brief.trim().length<20||brief.length>4000)throw new Error('Санаа 20–4000 тэмдэгттэй байна.');
  if(!Number.isInteger(seconds)||seconds<6||seconds>120)throw new Error('6–120 секунд сонгоно уу.');
  if(!(['9:16','16:9','1:1'] as string[]).includes(ratio))throw new Error('Формат буруу байна.');
  const clean=brief.trim().replace(/\s+/g,' ');
  const context=clean.slice(0,1400);
  const count=Math.min(12,Math.max(2,Math.ceil(seconds/10)));
  const base=Math.floor(seconds/count),remainder=seconds%count;
  const scenes=Array.from({length:count},(_,i)=>{
    const shot=i===count-1?SHOTS[11]:SHOTS[Math.min(i,10)];
    return {
      number:i+1,durationSeconds:base+(i<remainder?1:0),shot:shot.name,
      videoPrompt:'Format '+ratio+'. Shot '+(i+1)+'/'+count+': '+shot.camera+" Client's original creative brief (review before use): "+context+'. Preserve the real product shape, permitted logos, character identity, clothing, palette, and lighting from approved references across shots. Do not add invented on-screen text, celebrity likeness, or unverified product claims.',
      voiceover:'',subtitle:'',
    };
  });
  return {
    title:'Storyboard · '+clean.slice(0,70),
    logline:'Үнэгүй template: эх санааг хугацаа, camera shot болгон хуваасан ноорог. Хэрэглэгч өөрөө дуу, хадмал, дүрслэлийг батална.',
    styleBible:'Format '+ratio+'. Story source: '+context.slice(0,800)+'. Keep product, visible logo, lighting, style and character references consistent. This is an editable shot template, not AI-generated footage.',
    characters:[],scenes,subtitlesSrt:'',provider:'local',model:'rainy-local-template-v1',estimatedOnly:true,
  };
}