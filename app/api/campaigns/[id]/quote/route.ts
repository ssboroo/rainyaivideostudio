import {NextResponse} from 'next/server';
import {requireUser} from '@/lib/http';
import {quoteCampaign} from '@/lib/studio-campaign';
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const user=await requireUser();if(!user)return NextResponse.json({error:'Нэвтэрнэ үү.'},{status:401});
 const body=await req.json().catch(()=>null);
 if(body?.confirmStoryboard!==true)return NextResponse.json({error:'Storyboard-оо батална уу.'},{status:422});
 try{return NextResponse.json({project:await quoteCampaign(user.id,(await params).id,true)},{headers:{'Cache-Control':'no-store'}});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Үнийн санал үүсгэж чадсангүй.'},{status:503});}
}
