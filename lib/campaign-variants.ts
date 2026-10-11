/**
 * Read-only standalone video campaign preproduction guidance. No LLM/provider
 * inference or credit purchase. Each variation is a creative brief, not a
 * finished or billable generation.
 */
export type CampaignChannel="Reels"|"TikTok"|"YouTube"|"Facebook"|"Website";
const formats=[
  {ratio:"9:16",width:1080,height:1920,usage:"Reels / TikTok / Shorts",overlay:"Хүрээн дээр caption, гарчиг давхарлаж болох тул гол бүтээгдэхүүн, лого, нүүрийг төвийн бүсэд байрлуул."},
  {ratio:"1:1",width:1080,height:1080,usage:"Facebook / Instagram feed",overlay:"Лого ба CTA-г кадрын захад шахахгүй, унших зай үлдээ."},
  {ratio:"16:9",width:1920,height:1080,usage:"YouTube / Website",overlay:"Дүр, текст, бүтээгдэхүүний үндсэн мэдээллийг хоёр захад хэт ойр бүү байрлуул."},
] as const;
export function videoCampaignVariants(input:{
  brand:string; product:string; audience:string; goal:string;
  channel:CampaignChannel; durationSeconds:number;
}){
  for(const [key,value] of Object.entries(input)){
    if(key==="durationSeconds"||key==="channel")continue;
    if(typeof value!=="string"||!value.trim()||value.length>500)
      throw new Error("Брэнд, бүтээгдэхүүн, зорилго, үзэгчийн мэдээллээ 1–500 тэмдэгтээр оруулна уу.");
  }
  if(!Number.isInteger(input.durationSeconds)||input.durationSeconds<12||input.durationSeconds>30)
    throw new Error("Рекламын хугацаа 12–30 секунд байна.");
  const d=input.durationSeconds;
  const segments=[
    {part:"hook",start:0,end:2,goal:"Эхний 2 секундэд үзэгчийн анхаарал татах, баталгаагүй баримт бичихгүй."},
    {part:"context",start:2,end:5,goal:"Бүтээгдэхүүнийг тод танилцуулах."},
    {part:"demonstration",start:5,end:d-4,goal:"Бодит батлагдсан онцлогийг нэг тод хөдөлгөөнөөр үзүүлэх."},
    {part:"call_to_action",start:d-4,end:d,goal:"Худалдан авах, холбогдох эсвэл дэлгэрэнгүй үзэх үйлдэлд урих."},
  ];
  const concepts=[
    {id:"problem-solution",label:"Асуудал → шийдэл",direction:"Өдөр тутмын бодит асуудал, хэрэглээний байдлыг харуул; бүтээгдэхүүнээр шийдэж буй үйл явцыг тайлбарла.",hook:"Үзэгчийн асуудалтай холбоотой богино асуулт."},
    {id:"product-demo",label:"Бүтээгдэхүүний demo",direction:"Нэг бүтээгдэхүүнийг хэд хэдэн ойр болон өргөн кадраар танилцуул. Бичвэр, лого, өнгийг тогтмол хадгал.",hook:"Бүтээгдэхүүний хамгийн ойлгомжтой бодит хэрэглээг эхэнд үзүүл."},
    {id:"storytelling",label:"Бяцхан түүх",direction:"Нэг дүр, нэг орчин, эхлэл-төгсгөлтэй жижиг түүх. Дүрийн нүүр, хувцас, бүтээгдэхүүнийг бүх кадрт тогтвортой байлга.",hook:"Сонирхолтой үйл явдлын дундаас эхлүүл."},
  ];
  return {
    project:{brand:input.brand.trim(),product:input.product.trim(),audience:input.audience.trim(),goal:input.goal.trim(),channel:input.channel,durationSeconds:d},
    visualBrief:"Бүтээгдэхүүний хэлбэр, шошго, лого, өнгө, хүний нүүрийг жишигтэй тулгаж хадгал. Баталгаагүй чанар, үнэ, үр дүн, зөвшөөрлийг зохиож болохгүй.",
    timeline:segments,
    variants:concepts.map(c=>({...c,formats:formats.map(f=>({
      ...f,planningOnly:true,
      promptDirection:`Brand: ${input.brand}. Product: ${input.product}. Audience: ${input.audience}. Creative: ${c.direction} Ratio: ${f.ratio}. Duration: ${d}s. Exact reference identity, logo and product shape must remain consistent. No made-up claims.`,
    }))})),
    estimatedCredits:null,
    next:"Сонгосон хувилбар, жинхэнэ загвар, кадр бүрийн параметрээ ravs_estimate эсвэл ravs_scene_batch_estimate-ээр шалгаж нийт кредитийг тусад нь батлуул.",
    warning:"Энэ нь төлбөргүй контентын төлөвлөгөө; AI-аар видео үүсгээгүй, хэрэглэгчийн видео болон credit ашиглаагүй. 9:16/1:1/16:9 бүх загварт зэрэг дэмжигдэнэ гэсэн баталгаа биш.",
  };
}
