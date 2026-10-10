import {NextResponse} from "next/server";
import {getCreditPackages} from "@/lib/billing";
import {getVideoCreditExamples} from "@/lib/package-video-examples";
export const dynamic="force-dynamic";
export async function GET(){
 const packs=getCreditPackages();
 return NextResponse.json({
  packages:getVideoCreditExamples(packs),
  note:"5 сек · 720p · 9:16 загвар жишээ. Аудио болон параметр өөрчлөгдвөл үүсгэхийн өмнө сервер бодит үнийг дахин тооцно.",
 },{headers:{"Cache-Control":"no-store"}});
}