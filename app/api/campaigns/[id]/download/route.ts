import {NextResponse} from 'next/server';
import {requireUser} from '@/lib/http';
import {ownCampaign} from '@/lib/studio-campaign';
import {voiceOrigin,artifactPath,voiceAccessToken} from '@/lib/studio-bridge';
export const dynamic='force-dynamic';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 const user=await requireUser();if(!user)return NextResponse.json({error:'Нэвтэрнэ үү.'},{status:401});
 try{
  const row=await ownCampaign(user.id,(await params).id);
  if(row.status!=='COMPLETED'||!row.payload.artifact)return NextResponse.json({error:'Бичлэг хараахан бэлэн биш.'},{status:409});
  const path=artifactPath(voiceOrigin()+row.payload.artifact);
  const r=await fetch(voiceOrigin()+path,{headers:{Authorization:`Bearer ${await voiceAccessToken()}`},redirect:'error',cache:'no-store',signal:AbortSignal.timeout(30000)});
  if(!r.ok||!r.body)throw new Error('Бүтээл татах боломжгүй.');
  return new Response(r.body,{headers:{'Content-Type':'video/mp4','Content-Disposition':'attachment; filename="rainy-video.mp4"','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
 }catch{return NextResponse.json({error:'Бүтээл татах боломжгүй.'},{status:502});}
}
