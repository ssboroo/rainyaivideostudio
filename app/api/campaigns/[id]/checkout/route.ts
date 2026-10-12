import {NextResponse} from 'next/server';
import {requireUser} from '@/lib/http';
import {checkoutCampaign} from '@/lib/studio-campaign';
export async function POST(req:Request,{params}:{params:Promise<{id:string}>}){
 const user=await requireUser();if(!user)return NextResponse.json({error:'Нэвтэрнэ үү.'},{status:401});
 try{return NextResponse.json(await checkoutCampaign(user.id,(await params).id),{headers:{'Cache-Control':'no-store'}});}
 catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Төлбөр үүсгэж чадсангүй.'},{status:503});}
}
