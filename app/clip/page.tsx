import Link from "next/link";
import {Clapperboard, ArrowLeft, ShieldCheck} from "lucide-react";
import {youtubeClipEmbed} from "@/lib/youtube-clip";
import "./clip.css";

export const metadata={
 title:"YouTube клипийн хэсэг · RAINY Video Studio",
 description:"YouTube видеоны сонгосон хэсгийг албан ёсны тоглуулагчаар үзэх. MP4 татахгүй.",
 robots:{index:false,follow:false},
};
export default async function ClipPage({searchParams}:{searchParams:Promise<{v?:string;start?:string;end?:string}>}){
 const {v="",start="0",end="0"}=await searchParams;
 const startValue=Number(start),endValue=Number(end);
 let embed="";
 try {
  embed=youtubeClipEmbed(v,startValue,endValue);
 } catch {/* Empty state instead of malformed or unsafe iframe */ }
 const editor="/studio?model=genjutsu-motion&source=youtube&youtube="+encodeURIComponent(v)+
  "&start="+encodeURIComponent(String(startValue))+"&end="+encodeURIComponent(String(endValue));
 return <main className="shareClipShell">
   <header className="shareClipHeader">
     <Link href="/" className="shareClipLogo"><Clapperboard size={24}/> RAINY <span>VIDEO STUDIO</span></Link>
     <Link href="/studio?model=genjutsu-motion&source=youtube"><ArrowLeft size={16}/> Studio руу буцах</Link>
   </header>
   <div className="shareClipContent">
     <div className="shareClipEyebrow">YOUTUBE · CLIP PREVIEW</div>
     <h1>Сонгосон <em>видео хэсэг</em></h1>
     <p className="shareClipLead">Албан ёсны YouTube тоглуулагч дээр сонгосон эхлэл, төгсгөлийн хугацаагаар үзүүлнэ. Энэ нь татсан эсвэл тайрч экспортолсон MP4 файл биш.</p>
     {embed?<>
       <div className="shareClipPlayer">
         <iframe title="YouTube-ийн сонгосон хэсэг" src={embed} referrerPolicy="strict-origin-when-cross-origin"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen/>
       </div>
       <div className="shareClipDetails"><div><small>Эхлэх</small><strong>{startValue.toFixed(1)} сек</strong></div><div><small>Дуусах</small><strong>{endValue.toFixed(1)} сек</strong></div><div><small>Хугацаа</small><strong>{(endValue-startValue).toFixed(1)} сек</strong></div></div>
       <div className="shareClipActions">
         <Link className="shareClipPrimary" href={editor}>Клипийн хугацааг засах →</Link>
         <a href={"https://www.youtube.com/watch?v="+v} target="_blank" rel="noopener noreferrer">Эх видеог YouTube дээр нээх ↗</a>
       </div>
     </>:<div className="shareClipError"><p>Клипийн мэдээлэл буруу эсвэл дутуу байна. 1–30 секундийн хэсэг сонгоно уу.</p><Link href="/studio?model=genjutsu-motion&source=youtube">Видео сонгох →</Link></div>}
     <div className="shareClipNotice"><ShieldCheck size={19}/><p>Genjutsu-д бодит видео файл илгээхийн тулд өөрийн эсвэл ашиглах эрхтэй MP4-г Studio-д оруулж тайрна. Зөвхөн YouTube холбоосоос эх MP4 татахгүй.</p></div>
   </div>
 </main>;
}
