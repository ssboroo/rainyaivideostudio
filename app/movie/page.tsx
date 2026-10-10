import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { UserActions } from "@/components/user-actions";
import { RavsWordmark } from "@/components/ravs-logo";
import { Clapperboard, ArrowRight, Film, Gauge, Mic2, Captions, CheckCircle2 } from "lucide-react";

const FEATURES=[
  {title:"Чат хаагдсан ч үргэлжлэх Video Scheduler",status:"Баталгаажуулалтын шат",detail:"Киноны scene бүр PostgreSQL-д хадгалагдаж, тусдаа worker ажиллуулна. Хэрэглэгчийн зөвшөөрсөн кредитийн хүрээнд ажиллана."},
  {title:"AI Director & Scene Quality Check",status:"Төлөвлөлт идэвхтэй",detail:"Кадрын үйл явдал, хэмнэл, camera angle, continuity, давхардлыг шалгана. Бодит кадрын AI Vision QA нь тусдаа зөвшөөрөл/нийлүүлэгч шаарддаг."},
  {title:"Монгол voice-over, хөгжим, хадмал mastering",status:"Voice Studio beta",detail:"ElevenLabs дуу, SRT burn-in, хөгжмийн mixing, loudness mastering Voice серверийн FFmpeg pipeline-д боловсруулагдана."},
  {title:"1080p болон 4K экспорт",status:"Нөөцөөс хамаарна",detail:"1080p export кодтой. 4K нь эх файл native 4K, dedicated render нөөцтэй үед л зөвшөөрөгдөнө. 720p upscale-ийг жинхэнэ 4K гэж сурталчлахгүй."},
  {title:"Face / lip-sync / scene retry",status:"Туршилт ба нэмэлт API шаардлагатай",detail:"Төгс face lock, lip-sync болон автомат дахин үүсгэлтийг ажиллаж байна гэж амлахгүй. Шалгалтад тэнцээгүй scene-ийг зөвшөөрсөн тусдаа төсвөөр нөхөн бүтээнэ."}
];
export default function MoviePage(){
 return <main className="shell"><Sidebar/><section className="content productHome">
  <header className="topbar"><div className="topBrand"><RavsWordmark/><span>Movie Producer</span></div><UserActions/></header>
  <section className="dashboardHero" style={{padding:"40px 28px",minHeight:310}}>
   <div className="hero-copy"><p className="kicker">RAINY AI VIDEO STUDIO · MOVIE PRODUCER</p>
    <h1>Нэг санаанаас <em>бүтэн кино.</em></h1>
    <p>ChatGPT эсвэл Claude-д хүссэн киноны санаа, хугацаагаа хэл. RAINY AI Director кадруудыг төлөвлөж, Video MCP-ээр үүсгээд, Voice MCP-ээр Монгол дуу ба MP4 mastering-ийг удирдах архитектур.</p>
    <p><strong>Beta:</strong> бүх үйлдэл бүрэн автомат, дурын урттай эсвэл 4K баталгаатай гэсэн үг биш. Үнийн дээд хязгаар, API quota, scene status, media CDN ба worker боломжийг шалгана.</p>
    <Link href="/integrations" className="primary large">MCP холбох заавар <ArrowRight size={18}/></Link>
   </div><Clapperboard size={116} strokeWidth={1.1} aria-hidden="true"/>
  </section>
  <section className="mcpWorkflow"><h2>Нэг prompt → олон scene → бэлэн бүтээл</h2>
   <p>Хэрэглэгч санаа, хугацаа, формат, хамгийн их кредитээ нэг удаа зөвшөөрнө. <strong>RAVS Movie Producer</strong> кадруудыг хадгалж, чатаас үл хамааран сервер дээр үргэлжлүүлнэ. Дараа нь тусдаа Voice Studio бүртгэлээрээ MP4, дуу ба хадмалыг зөвшөөрч экспортлоно.</p>
   <div className="mcpSteps">
    {[
      ["01","AI Director","Кино зохиол, continuity, shot planning"],
      ["02","Persistent Video Queue","Хаалттай чатнаас үл хамаарах, credit-capped, scene status"],
      ["03","Voice & Music","Монгол дуу, хөгжим, SRT болон audio mastering"],
      ["04","Quality Review","Storyboard, codec, FPS, duration; AI Vision QA opt-in"],
      ["05","Export","720p, 1080p; native 4K зөвхөн rendering gate амжилттай үед"]
    ].map(([no,t,d])=><article key={no}><span>{no}</span><h3>{t}</h3><p>{d}</p></article>)}
   </div>
  </section>
  <section className="mcpWorkflow"><h2>Боломжийн бодит төлөв</h2>
   <div style={{display:"grid",gap:14,gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))"}}>
    {FEATURES.map(f=><article key={f.title} style={{padding:18,border:"1px solid var(--line)",borderRadius:18}}>
      <h3>{f.title}</h3><small>{f.status}</small><p>{f.detail}</p></article>)}
   </div>
   <p>Эцсийн файлын бэлэн төлөвийг зөвхөн render болон QA амжилттай дууссаны дараа харуулна. Movie Producer нь видео, Voice нь тусдаа сайт, нэвтрэлт ба кредиттэй.</p>
  </section>
  <section className="bottomCta"><div><small>START IN YOUR AI ASSISTANT</small>
    <h2>“Монголын говийн тухай 8 минутын cinematic кино бүтээ.”</h2>
    <p>16:9, Монгол өгүүлэгч, subtitle, кадр бүр өөр үйл явдалтай. Бүх төлбөрийн дээд хязгаарыг үүсгэлтийн өмнө батлуул.</p>
    </div><Link href="/integrations" className="primary large">ChatGPT / Claude MCP <ArrowRight size={18}/></Link>
  </section>
 </section></main>
}
