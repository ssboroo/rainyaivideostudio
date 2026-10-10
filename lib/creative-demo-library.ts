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
 {id:"agamemnon",title:"Agamemnon",category:"cinema" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Кино театрын том дэлгэцнээс эртний домгийн дайчин орчин үеийн бодит ертөнцөд алхаж гарч ирнэ. Epic cinematic theater reveal, dramatic low-angle tracking, realistic light spill, 16:9.",
  desc:"2026 оны албан ёсны шинэ viral preset: epic theater reveal."},
 {id:"cyclope",title:"Cyclope",category:"cinema" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Сонгодог сюрреал уран зургийн анхны бүтэц хадгалагдана. Дэлгэц хуваагдаж, дээд хэсэгт зураг доторх домгийн аварга дүр зөөлөн амилна. Living painting, realistic gallery texture, 9:16.",
  desc:"2026 оны албан ёсны living-painting preset."},
 {id:"pearl-earring",title:"Pearl Earring",category:"influencer" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Сувдан ээмэгтэй сонгодог хөргийн уур амьсгалыг хүндэтгэсэн редакцын видео. Доод талд уран зургийн жишиг, дээд талд Монгол модель зөөлөн эргэн харах, Renaissance studio lighting, split screen 9:16.",
  desc:"Сонгодог хөрөг зургийг амьдруулсан split-screen шинэ viral preset."},
 {id:"monet-muse",title:"Monet Muse",category:"cinema" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Импрессионист цэцэрлэгийн зургийн доор анхны зураг байрлана. Дээд хэсэгт цэцэг, усан мандал, хувцас аажмаар бодит видео болон амилна. Painterly cinematic transition, two-panel 9:16.",
  desc:"Living-painting төрлийн шинэ preset; хөдөлгөөнт жишээ баталгаажаагүй."},
 {id:"argus",title:"Argus",category:"cinema" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Грекийн домгийн дүрийг уран зургийн үзэсгэлэнгийн хэв маягаар, нэгэн жигд хөдөлгөөнтэй cinematic scene болгож харуул. Ancient myth inspired gallery, careful character framing, dramatic light, 16:9.",
  desc:"2026 оны домог ба сонгодог дүрслэл хосолсон шинэ preset."},
 {id:"lost-in-a-book",title:"Lost in a Book",category:"effects" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Номын хуудсыг эргүүлэхэд цаасны зургууд гурван хэмжээст ертөнц болж амилна. Монгол дүр номын ертөнц рүү алхаж орно. Paper-to-reality transition, cinematic detail, 9:16.",
  desc:"Шинэ viral preset-ийн нэр, албан эх сурвалжид тулгуурласан өөрийн зохиосон prompt."},
 {id:"dolphin-ride",title:"Dolphin Ride",category:"effects" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Нарлаг далайн мандал дээр уран зөгнөлт боловч гэрэл, усны хөдөлгөөн бодит мэт харагдах хөгжилтэй аялал. Дүр далайн гахайтай хамт аялах мэт кадр. Whimsical summer reel, 9:16.",
  desc:"2026 оны боломжгүй аялал/хошин видео чиглэлийн шинэ preset."},
 {id:"penguin-ride",title:"Penguin Ride",category:"effects" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Мөсөн талбай, цасан шуурга, хөгжилтэй сюрреал аялал. Монгол дүр аварга оцон шувуутай хамт мөсөн дээгүүр хөдлөнө. Playful surreal winter reel, consistent character, 9:16.",
  desc:"Шинэ impossible-rides вируслэг богино видео preset."},
 {id:"puffin-ride",title:"Puffin Ride",category:"effects" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Далайн эргийн хадан дээр өнгөлөг бахлуур шувуутай хамт үлгэрийн мэт аялж буй дүр. Камер хажуугаас motion tracking, бодит далайн манан, хошин cinematic Reel, 9:16.",
  desc:"2026 оны шинэ impossible-rides төрлийн албан preset."},
 {id:"skatedog",title:"Skatedog",category:"effects" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Хотын цэцэрлэгт хүрээлэнд дугуйт тэшүүрийн хошин аялал хийж буй нохой ба найзууд. Low tracking shot, crisp daylight, upbeat playful motion, 9:16.",
  desc:"Шинэ хошин хөдөлгөөнтэй viral preset."},
 {id:"pigeons",title:"Pigeons",category:"effects" as DemoCategory,official:"https://higgsfield.ai/effects",
  prompt:"Хотын талбайд эргэн тойронд нисэж буй тагтаануудын хөдөлгөөнтэй хосолсон загварын cinematic Reel. Камер моделийг тойрч, шувуудын нисэлтийн зам жигд, 9:16.",
  desc:"2026 оны шинэ viral preset; жишиг prompt нь RAINY-ийн өөрийн санаа."},
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
