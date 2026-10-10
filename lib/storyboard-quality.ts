/** Fast, deterministic preflight of AI-generated shot lists (not an aesthetic vision model). */
export type ShotReview = {
  number:number; duration:number; prompt:string; beat?:string; shotType?:string;
  continuityReference?:string;
};
export type StoryboardReview = { status:"pass"|"review"; score:number; passed:boolean;
  totalSeconds:number; shotCount:number; issues:{scene:number|null;severity:"error"|"warning";message:string}[];
  guidelines:string[]; assessment:"text_preflight_only"; };

function wordSet(value:string) {
  return new Set((value.toLowerCase().match(/[\p{L}\p{N}]{3,}/gu)||[])
    .filter(w=>!["with","from","into","this","that","scene","shot","the","and","болон","гэсэн"].includes(w)));
}
function similarity(a:string,b:string) {
  const left=wordSet(a),right=wordSet(b);
  const intersection=[...left].filter(x=>right.has(x)).length;
  const union=new Set([...left,...right]).size;
  return union?intersection/union:1;
}
export function reviewStoryboard(shots:ShotReview[], targetSeconds:number, styleBible?:string):StoryboardReview {
  if(!Array.isArray(shots)||shots.length<1||shots.length>120)
    throw new Error("Storyboard 1–120 кадртай байна.");
  if(!Number.isInteger(targetSeconds)||targetSeconds<4||targetSeconds>3600)
    throw new Error("Хугацаа 4–3600 секунд байх ёстой.");
  const issues:StoryboardReview["issues"]=[];
  let duration=0;
  let previous:ShotReview|undefined;
  shots.forEach((shot,i)=>{
    if(!Number.isInteger(shot.number)||shot.number!==i+1)
      issues.push({scene:i+1,severity:"error",message:"Кадрын дугаар дараалсан байх ёстой."});
    if(!Number.isFinite(shot.duration)||shot.duration<2||shot.duration>60)
      issues.push({scene:i+1,severity:"error",message:"Кадрын хугацаа 2–60 секунд байх ёстой."});
    else duration+=shot.duration;
    if(typeof shot.prompt!=="string"||shot.prompt.trim().length<50||shot.prompt.length>6000)
      issues.push({scene:i+1,severity:"error",message:"Кадр бүр өөрийн дүрслэл, үйл явдалтай, 50–6000 тэмдэгт prompt-тай байна."});
    const words=wordSet(String(shot.prompt||""));
    if(words.size<10)
      issues.push({scene:i+1,severity:"warning",message:"Prompt-д хангалттай олон ялгарах дүрслэл/үйл явдал алга."});
    if(!shot.beat||!shot.shotType)
      issues.push({scene:i+1,severity:"warning",message:"Найруулгын beat болон shot type-ыг тодорхойлоорой."});
    if(styleBible && (!shot.continuityReference||shot.continuityReference.length<12))
      issues.push({scene:i+1,severity:"warning",message:"Дүр, хувцас, өнгө, бүтээгдэхүүний continuity reference тодорхойгүй."});
    if(previous && typeof previous.prompt==="string" && typeof shot.prompt==="string" &&
       similarity(previous.prompt,shot.prompt)>0.84)
      issues.push({scene:i+1,severity:"error",message:"Өмнөх кадртай хэт адилхан prompt. Давтагдсан клип үүсгэж кредит үрэх эрсдэлтэй."});
    previous=shot;
  });
  if(Math.abs(duration-targetSeconds)>1)
    issues.push({scene:null,severity:"error",message:"Нийт кадрын хугацаа захиалсан киноны урттай таарахгүй."});
  const errors=issues.filter(i=>i.severity==="error").length;
  const warnings=issues.length-errors;
  const score=Math.max(0,100-errors*19-warnings*5);
  return {
    status:errors?"review":"pass",
    passed:!errors,
    score,totalSeconds:duration,shotCount:shots.length,issues,
    assessment:"text_preflight_only",
    guidelines:[
      "Нэг санааг хуулбарлан давтахгүй; scene бүр өөр үйл явдал, операторын хөдөлгөөн, драматургийн үүрэгтэй.",
      "Тогтмол дүр, хувцас, брэнд лого, орчны reference-үүдийг scene бүрт дамжуул.",
      "Уран сайхны бодит чанар, хүний нүүр, Монгол дуудлага, липсинкийг текстийн шалгалтаар батлах боломжгүй.",
      "Текстийн preflight амжилттай байсан ч AI видео загварын бодит output-г тусад нь QA хий.",
    ],
  };
}
