import {trendDemos} from "./trend-demos";
import {videoShowcases} from "./video-showcase";

/**
 * Mongolian ORIGINAL example prompts inspired by public official example
 * descriptions. They are NOT the unpublished/exact Higgsfield source prompts,
 * and copying them into RAVS does not reproduce a provider-only template.
 */
export type DemoCategory="effects"|"genjutsu"|"cinema"|"marketing"|"influencer";
export type CreativeDemo={
 id:string;title:string;description:string;category:DemoCategory;badge:string;
 videoUrl:string;poster:string;sourceUrl:string;modelSlug:string;prompt:string;
 use:string;isImported?:boolean;
};
const creativePrompts:Record<string,{prompt:string;modelSlug:string;category:DemoCategory}>={
 "eyes-in":{modelSlug:"seedance-2-5-image",category:"effects",prompt:"Монгол төрхтэй хүний нүүрний дунд кадраас эхэл. Камер нүдний хүүхэн хараа руу тасралтгүй, зөөлөн macro push-in хийнэ. Нүдний гэрэл, арьсны бодит бүтэц, харцын сэтгэл хөдлөл тодорно. Vertical 9:16, cinematic macro, smooth motion, нэг дүрийн төрхийг хадгал."},
 "world-morphing":{modelSlug:"seedance-2-5",category:"cinema",prompt:"Борооны дараах Улаанбаатарын гудамжаар камер урагш хөдөлнө. Замын нойтон асфальт аажмаар хөвдтэй ой болж хувирч, хөдөлгөөний хурд, харах өнцөг нэгэн жигд үргэлжилнэ. Seamless environment morph, volumetric light, cinematic 16:9."},
 "floating-fall":{modelSlug:"seedance-2-5-image",category:"cinema",prompt:"Монгол модель тайван зогсоно. Цаг хугацаа удааширч, дүр агаарт жингүй мэт хөвөн эргэлдэнэ. Хувцас, үс, гэрэлтүүлгийн физик хөдөлгөөн үнэмшилтэй, камер түүнийг зөөлөн дагана. Dreamy fashion film, 9:16, consistent face."},
 "studio-slide":{modelSlug:"kling-3-standard",category:"marketing",prompt:"Минимал хар студид байрлах бүтээгдэхүүнтэй кадр эхэлнэ. Камер огцом боловч цэвэр lateral slide хийнэ. Төгсгөлийн кадрт бүтээгдэхүүний хэлбэр, шошго, тусгал хэвээр үлдэнэ. Premium commercial, controlled motion, seamless transition, 9:16."},
 "high-flip":{modelSlug:"kling-3-standard",category:"effects",prompt:"Спортын хувцастай Монгол залуу дээвэр дээрээс акробатын үсрэлт хийнэ. Камер динамик доод өнцгөөс дагаж, агаарт эргэх хөдөлгөөнийг богино slow motion-оор харуулна. Realistic physics, stable anatomy, dynamic tracking, 9:16."},
 "cutout":{modelSlug:"seedance-edit",category:"effects",prompt:"Эх видеоны хөдөлгөөн, дүрийн хэмжээ, камерын чиглэлийг хадгал. Гол дүрийг цаасан коллаж маягаар тод ирмэгтэй салгаж, олон давхар өнгөт плакат давхарга руу хэмнэлтэй шилжүүл. Editorial cutout aesthetic, crisp graphic shapes."},
 "incline":{modelSlug:"seedance-2-5",category:"effects",prompt:"Хотын урт хонгилын камер жигд урагшилна. Орчны бүх шугам 30 градусаар налж, харин гол дүр тэнцвэрээ хадгалан алхана. Architecture perspective tilt, dramatic lens, seamless cinematic motion."},
 "act-natural":{modelSlug:"seedance-2-5-image",category:"influencer",prompt:"Нэг Монгол дүрийн нүүр, хувцас, арьсны бүтэц өөрчлөгдөхгүй. Кофе шопт найзтайгаа инээж ярин, гараараа жижиг хөдөлгөөн хийнэ. Natural handheld documentary movement, believable reactions, realistic daylight, 9:16."},
 "lacewalker":{modelSlug:"seedance-2-5-image",category:"effects",prompt:"Загварын тайзан дээр алхаж буй Монгол моделийн хөдөлгөөн даавууны торон хээ мэт уран дүрслэлд хувирна. Камер нэг тасралтгүй tracking shot, хувцас ба нүүрний тогтвортой байдал, art-fashion editorial, 9:16."},
 "street-colossus":{modelSlug:"seedance-2-5",category:"cinema",prompt:"Улаанбаатарын орчин үеийн өндөр барилгуудын дунд аварга хэмжээтэй фантастик дүр зогсоно. Хүмүүс алсаас харна. Камер доороос удаанаар дээш tilt хийнэ. Realistic city scale, correct perspective, cinematic wide shot, no text."},
 "selfception":{modelSlug:"seedance-2-5-image",category:"effects",prompt:"Гэрлийн студид нэг дүр өөрийнхөө ижил дүртэй зэрэгцэн гарч ирнэ. Камер дугуй замаар тойрч, бодит дүр ба тусгалуудтай давхар орон зайн дүрслэл үүсгэнэ. Surreal mirror recursion, stable face, one continuous shot."},
 "wild-ride":{modelSlug:"kling-3-standard",category:"cinema",prompt:"Монголын өргөн тал дээгүүр хурдан хөдөлж буй машин, камер түүний хажуугаас тогтвортой tracking хийнэ. Гэнэт overhead drone shot руу зөөлөн шилжинэ. Realistic dust, dynamic but readable action, 9:16 cinematic."},
 "smash-and-grab":{modelSlug:"seedance-2-5",category:"marketing",prompt:"Хар студид байрлах бүтээгдэхүүний савлагааны эргэн тойронд тунгалаг шил мэт график давхарга задран, камер бүтээгдэхүүн рүү хурдан ойртоно. Бүтээгдэхүүний шошго, хэлбэрийг өөрчлөхгүй. Impactful product reveal, 9:16."},
 "object-swap-1":{modelSlug:"genjutsu-object",category:"genjutsu",prompt:"Эх видеоны хөдөлгөөн, байрлал, камер болон хугацааг хадгал. Гол объектын материалыг минимал металл хувилбараар солиж, сүүдэр, тусгал, орчны гэрэлтэй тааруул. Бусад хэсгийг өөрчлөхгүй."},
 "object-swap-2":{modelSlug:"genjutsu-object",category:"genjutsu",prompt:"Бүжгийн хөдөлгөөнийг хэвээр хадгал. Дүрийн хувцсыг орчин үеийн Монгол загвартай editorial хувцсаар солино. Нүүр, гар, камерын хэмнэл, орчны гэрэлтүүлгийг өөрчлөхгүй."},
 "object-swap-3":{modelSlug:"genjutsu-object",category:"genjutsu",prompt:"Бүтээгдэхүүний бичлэгийн хөдөлгөөн, камер, арын дэвсгэрийг хадгал. Төвд байрлах бүтээгдэхүүнийг өөрийн жишиг зурган дахь бүтээгдэхүүнээр солих. Жинхэнэ шошгыг зохиомлоор бүү өөрчил."},
 "object-swap-4":{modelSlug:"genjutsu-object",category:"genjutsu",prompt:"Эх видеоны дүрийн хөдөлгөөн, гар болон орчны физикийг хадгалж, зөвхөн сонгосон объектыг шинэ төрхөөр солих. Realistic compositing, accurate occlusion, unchanged timing."},
 "object-swap-5":{modelSlug:"genjutsu-object",category:"genjutsu",prompt:"Нэг кадрт буй объектыг жишиг зургаар солих, камерын хөдөлгөөн, гэрэлтүүлэг, зургийн гүнийг хэвээр үлдээ. Объектын эргэн тойрны харагдах ирмэг цэвэр байх."},
 "motion-transfer-1":{modelSlug:"genjutsu-motion",category:"genjutsu",prompt:"Жишиг видеоны бүжгийн хэмнэл, хөдөлгөөний чиглэл, камерын замыг хадгал. Шинэ Монгол төрхтэй дүр дээр хөдөлгөөнийг шилжүүл. Дүрийн нүүр, биеийн харьцаа, гарын хөдөлгөөнийг бодитой хадгал."},
 "motion-transfer-2":{modelSlug:"genjutsu-motion",category:"genjutsu",prompt:"Эх клипийн динамик гар, биеийн хөдөлгөөнийг хадгалан шинэ орчин дахь дүр рүү motion transfer хий. Камерын хугацаа, хөдөлгөөний beat болон дүрийн байрлал тогтвортой байна."},
 "motion-transfer-3":{modelSlug:"genjutsu-motion",category:"genjutsu",prompt:"Эх хөдөлгөөнийг шинэ дүрд шилжүүлж, хөлийн хүрэлт, биеийн эргэлт, үсний инерцийг бодит мэт гарга. Original camera timing and clean cinematic tracking."},
 "genjutsu-showcase":{modelSlug:"genjutsu-motion",category:"genjutsu",prompt:"Эх видеоны хөдөлгөөн, камерын зам, хугацааг хадгал. Хөдөлгөөн шилжүүлэх жишиг дүрийн зураг нэмээд шинэ орчин, гэрэлтүүлэгт нэгэн жигд хувирга. Consistent character reference."},
 "product-ad":{modelSlug:"marketing-studio",category:"marketing",prompt:"Өөрийн бүтээгдэхүүний бодит жишиг зургаас premium хар студийн постер бэлтгэ. Бүтээгдэхүүний материал, лого, шошгыг өөрчлөхгүй. Нарийн rim light, цэвэр reflection, 9:16 social product ad composition."},
 "ai-character":{modelSlug:"ai-influencer",category:"influencer",prompt:"Монгол төрхтэй нэг AI дүрийн нүүрний харьцаа, үс, хувцас, арьсны бүтэц тогтвортой. Цэвэр студийн гэрэлтэй close-up болон full-body жишиг зураг, realistic editorial styling."},
};
const showcaseLinks:Record<string,{modelSlug:string;prompt:string;category:DemoCategory}>={
 marketing:{modelSlug:"marketing-studio",category:"marketing",prompt:creativePrompts["product-ad"].prompt},
 influencer:{modelSlug:"ai-influencer",category:"influencer",prompt:creativePrompts["ai-character"].prompt},
 genjutsu:{modelSlug:"genjutsu-motion",category:"genjutsu",prompt:creativePrompts["genjutsu-showcase"].prompt},
 effects:{modelSlug:"seedance-2-5-image",category:"effects",prompt:creativePrompts["world-morphing"].prompt},
};
export function getCreativePrompt(id:string){return creativePrompts[id]||showcaseLinks[id]||{modelSlug:"seedance-2-5",category:"effects" as DemoCategory,prompt:"Өөрийн зураг эсвэл видеоны гол дүр, орчин, гэрэлтүүлэг, хөдөлгөөн, камерын замыг тодорхойлж, cinematic богино видео бүтээ. Stable identity, smooth transitions, 9:16."};}
const normalizedCategory=(c:string|undefined):DemoCategory=>{
 if(c==="genjutsu"||c==="marketing"||c==="influencer"||c==="cinema")return c;
 return "effects";
};
export const curatedCreativeDemos:CreativeDemo[]=[
 ...trendDemos.filter(d=>d.previewSrc).map(item=>{
   const info=getCreativePrompt(item.id);
   return{id:item.id,title:item.title,description:item.description,badge:item.badge,
    videoUrl:item.previewSrc,poster:item.poster,sourceUrl:item.official,category:info.category,
    modelSlug:info.modelSlug,prompt:info.prompt,use:item.use};
 }),
 ...videoShowcases.filter(item=>item.previewSrc).filter(item=>!trendDemos.some(trend=>trend.previewSrc===item.previewSrc)).map(item=>{
   const info=getCreativePrompt(item.id);
   return{id:"workflow-"+item.id,title:item.title,description:item.description,badge:item.subtitle,
    videoUrl:item.previewSrc!,poster:"",sourceUrl:item.officialHref,category:info.category,
    modelSlug:info.modelSlug,prompt:info.prompt,use:item.useCases.join(" · ")};
 })
];
export function studioDemoHref(item:Pick<CreativeDemo,"modelSlug"|"prompt">) {
 return "/studio?model="+encodeURIComponent(item.modelSlug)+"&prompt="+encodeURIComponent(item.prompt);
}
export const recentHiggsfieldIdeas=[
 {id:"bullet-time",title:"Bullet Time",category:"effects" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Монгол модель агаарт хөдөлгөөнгүй мэт үсрэнэ. Камер дүрийн эргэн тойронд 180 градус хурдтай эргэж, үсний ширхэг, хувцас, орчны гэрэл нь бодит харагдана. Bullet-time fashion commercial, 9:16.",
  desc:"Higgsfield-ийн 2026 оны шинэ viral preset. RAVS дээр яг ижил эффект баталгаатай биш."},
 {id:"fallen-angel",title:"Fallen Angel",category:"cinema" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Манантай уулын оройд далавчтай уран зөгнөлт дүр зөөлөн газардана. Low-angle dolly-in, dramatic clouds, volumetric sunbeams, slow-motion cinematic look, 16:9.",
  desc:"2026 оны шинэ viral preset-ийн санаа. Жишээ бичлэгийг админ албан эх сурвалжаас зөвшөөрөлтэй импортолсны дараа тоглуулна."},
 {id:"urban-cuts",title:"Urban Cuts",category:"effects" as DemoCategory,official:"https://higgsfield.ai/apps/video-editing",
  prompt:"Хотын гудамжинд алхаж буй Монгол модель 4 өөр хувцастай beat-синхрон хурдан кадруудад солигдоно. Camera framing remains consistent, rhythmic transitions, editorial streetwear Reel.",
  desc:"Higgsfield Video Editing-ийн одоогийн бүтээгдэхүүний чиглэл."},
 {id:"product-asmr",title:"Product ASMR",category:"marketing" as DemoCategory,official:"https://higgsfield.ai/apps/ads-products",
  prompt:"Шилэн сүрчигний савны ultra macro кадр, усны дусал, тусгал, савлагааны материалын деталь. Slow controlled dolly, premium studio product ASMR visuals, 9:16.",
  desc:"Higgsfield Ads & Products-ийн бүтээгдэхүүний ASMR чиглэл."},
 {id:"recast",title:"Character Recast",category:"influencer" as DemoCategory,official:"https://higgsfield.ai/apps/camera-motion",
  prompt:"Эх видеоны хөдөлгөөн, камер, хэмнэлийг хадгалж шинэ Монгол төрхтэй дүрийн жишиг зураг ашиглан дүр соль. Stable face, correct hands and clean clothing.",
  desc:"Higgsfield Professional-ийн дүр солих workflow-ийн санаа."},
] as const;
