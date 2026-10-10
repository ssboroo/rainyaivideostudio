import Link from "next/link";
import { Sidebar } from "@/components/sidebar";
import { YoutubeDownloadPanel } from "@/components/youtube-download-panel";
import "./youtube.css";
export const metadata={
 title:"YouTube видео татах · RAINY Studio",
 description:"Өөрийн YouTube видеог албан ёсоор татах, эрхтэй MP4-гээ RAINY-д тайрч экспортлох.",
};
export default function YoutubeDownloadPage(){
 return <main className="shell"><Sidebar/>
  <section className="content"><header className="topbar">
    <div><b>YouTube видео татах</b><span>Өөрийн бичлэг · MP4 боловсруулах</span></div>
    <Link className="ghost" href="/studio">Studio руу буцах ↗</Link>
  </header>
  <div className="ytDownloadPage"><YoutubeDownloadPanel/></div>
 </section></main>;
}
