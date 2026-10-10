import {NextResponse} from 'next/server';
import {requireAdmin,jsonError} from '@/lib/http';
import {db} from '@/lib/db';
import {sourceUrl,boundedFetch,extractDemoVideos} from '@/lib/demo-import';
import {createSignedUpload} from '@/lib/higgsfield';
export const dynamic='force-dynamic';
export async function GET(){if(!await requireAdmin())return jsonError('Admin эрх шаардлагатай.',403);return NextResponse.json({items:await db.demoVideo.findMany({orderBy:{createdAt:'desc'},take:200})});}
export async function POST(req:Request){
 if(!await requireAdmin())return jsonError('Admin эрх шаардлагатай.',403);
 try{
 const b=await req.json();
 if(b.action==='publish'){
 if(typeof b.id!=='string'||typeof b.published!=='boolean')return jsonError('Оролт буруу.');
 return NextResponse.json(await db.demoVideo.update({where:{id:b.id},data:{published:b.published}}));
 }
 const source=sourceUrl(b.sourceUrl);
 if(b.action==='discover'){
 const {bytes,contentType}=await boundedFetch(source,4*1024*1024);
 if(!contentType.includes('text/html'))return jsonError('Higgsfield хуудасны холбоос оруулна уу.');
 const videos=extractDemoVideos(bytes.toString('utf8'));
 const existing=await db.demoVideo.findMany({where:{sourceMediaUrl:{in:videos}},select:{sourceMediaUrl:true}});
 const imported=new Set(existing.map(v=>v.sourceMediaUrl));
 return NextResponse.json({videos:videos.filter(v=>!imported.has(v))});
 }
 if(b.action!=='import')return jsonError('Үйлдэл буруу.');
 const original=sourceUrl(b.videoUrl,true),title=String(b.title||'').trim().slice(0,160);
 if(!title||!['effects','genjutsu','marketing','influencer','cinema'].includes(b.category))return jsonError('Нэр, ангилал оруулна уу.');
 const exists=await db.demoVideo.findUnique({where:{sourceMediaUrl:original}});
 if(exists)return NextResponse.json({item:exists,duplicate:true});
 const {bytes,contentType}=await boundedFetch(original,30*1024*1024);
 const mime=contentType.split(';')[0];
 if(!['video/mp4','video/webm'].includes(mime))return jsonError('Видео файл биш байна.');
 const signed=await createSignedUpload(mime);
 const upload=new URL(String(signed.upload_url)),publicUrl=new URL(String(signed.public_url));
 if(upload.protocol!=='https:'||publicUrl.protocol!=='https:')throw new Error('Upload холбоос буруу.');
 const put=await fetch(upload,{method:'PUT',headers:(signed.upload_headers||{}) as Record<string,string>,body:new Uint8Array(bytes),redirect:'error',signal:AbortSignal.timeout(30000)});
 if(!put.ok)throw new Error('Видео хуулж хадгалж чадсангүй.');
 const item=await db.demoVideo.upsert({where:{sourceMediaUrl:original},update:{},create:{sourceMediaUrl:original,sourceUrl:source,videoUrl:publicUrl.toString(),title,category:b.category}});
 return NextResponse.json({item});
 }catch{return jsonError('Импорт амжилтгүй. Нийтийн холбоос, файлын хэмжээ (30MB хүртэл), Higgsfield upload холболтыг шалгана уу.',400);}
}
