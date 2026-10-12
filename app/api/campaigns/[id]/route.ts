import {NextResponse} from 'next/server';
import {requireUser} from '@/lib/http';
import {ownCampaign,publicCampaign,reconcileCampaign} from '@/lib/studio-campaign';
export const dynamic='force-dynamic';
export async function GET(req:Request,{params}:{params:Promise<{id:string}>}){
 const user=await requireUser();if(!user)return NextResponse.json({error:'Нэвтэрнэ үү.'},{status:401});
 try{const {id}=await params;const row=await ownCampaign(user.id,id);
 await reconcileCampaign(row).catch(()=>null);
 return NextResponse.json({project:publicCampaign(await ownCampaign(user.id,id))},{headers:{'Cache-Control':'private, no-store'}});
 }catch{return NextResponse.json({error:'Төсөл олдсонгүй.'},{status:404});}
}
