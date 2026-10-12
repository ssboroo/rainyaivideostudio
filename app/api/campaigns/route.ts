import {NextResponse} from 'next/server';
import {z} from 'zod';
import {requireUser} from '@/lib/http';
import {consumeAuthLimit} from '@/lib/auth-security';
import {campaignReadiness,createCampaignStoryboard} from '@/lib/studio-campaign';
export const dynamic='force-dynamic';
export async function GET(){return NextResponse.json({ready:campaignReadiness().ready,storyboardReady:campaignReadiness().storyboardReady,message:'Video + Voice холболт бэлтгэгдэж байна. Одоогоор төлбөр авахгүй.'},{headers:{'Cache-Control':'no-store'}});}
const schema=z.object({brief:z.string().trim().min(20).max(4000),seconds:z.union([z.literal(15),z.literal(30),z.literal(60)]),ratio:z.enum(['9:16','16:9','1:1'])}).strict();
export async function POST(req:Request){
 const user=await requireUser();if(!user)return NextResponse.json({error:'Нэвтэрнэ үү.'},{status:401});
 if(!consumeAuthLimit('campaign:'+user.id,5,60_000).allowed)return NextResponse.json({error:'Түр хүлээгээд дахин оролдоно уу.'},{status:429});
 const raw=await req.text();if(raw.length>20000)return NextResponse.json({error:'Хүсэлт хэт том.'},{status:413});
 let value;try{value=JSON.parse(raw);}catch{return NextResponse.json({error:'Хүсэлт буруу.'},{status:422});}
 const parsed=schema.safeParse(value);if(!parsed.success)return NextResponse.json({error:'Санаа, хугацаа, форматаа шалгана уу.'},{status:422});
 try{return NextResponse.json({project:await createCampaignStoryboard(user.id,parsed.data)},{headers:{'Cache-Control':'no-store'}});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Үнийн санал үүсгэж чадсангүй.'},{status:503});}
}
