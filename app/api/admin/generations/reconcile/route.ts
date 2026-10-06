import { requireAdmin, jsonError } from '@/lib/http';
import { db } from '@/lib/db';
import { getGenerationStatus } from '@/lib/higgsfield';
import { boundedBody } from '@/lib/mcp-oauth';
import { markTerminalAndRefund } from '@/lib/credits';
export const dynamic='force-dynamic';
export async function GET(){
  if(!await requireAdmin())return jsonError('Админ эрх шаардлагатай.',403);
  const generations=await db.generation.findMany({where:{status:'PENDING',providerRequestId:null,createdAt:{lt:new Date(Date.now()-120000)}},select:{id:true,modelSlug:true,prompt:true,input:true,createdAt:true,costCredits:true,userId:true},orderBy:{createdAt:'asc'},take:50});
  return Response.json({generations},{headers:{'Cache-Control':'no-store'}});
}
export async function POST(request:Request){
  if(!await requireAdmin())return jsonError('Админ эрх шаардлагатай.',403);
  try{
    const raw=JSON.parse(await boundedBody(request));
    if(typeof raw.generationId!=='string'||raw.generationId.length>100)return jsonError('Хүсэлтийн ID буруу байна.',400);
    const generation=await db.generation.findUnique({where:{id:raw.generationId}});
    if(!generation||generation.status!=='PENDING'||generation.providerRequestId||generation.createdAt>new Date(Date.now()-120000))return jsonError('Энэ хүсэлт сэргээх төлөвт биш байна.',409);
    if(raw.confirmNotAccepted===true){
      await markTerminalAndRefund(generation.id,'FAILED',undefined,{message:'Админ provider хүсэлт хүлээн аваагүйг шалгаж кредит буцаасан.'});
      return Response.json({settled:true,generationId:generation.id});
    }
    if(typeof raw.providerRequestId!=='string'||!/^[A-Za-z0-9_-]{8,128}$/.test(raw.providerRequestId)||raw.confirmMatch!==true)return jsonError('Console дээрх хүсэлттэй тааруулж баталгаажуулна уу.',400);
    // Only fetch an existing provider job. No generation POST and no new charge.
    await getGenerationStatus(raw.providerRequestId);
    const changed=await db.generation.updateMany({where:{id:generation.id,status:'PENDING',providerRequestId:null},data:{providerRequestId:raw.providerRequestId,status:'SUBMITTED',error:{message:'Админ Console дээрх хүсэлттэй тааруулж төлөвийг сэргээсэн.'}}});
    if(changed.count!==1)return jsonError('Хүсэлтийн төлөв өөрчлөгдсөн. Дахин шалгана уу.',409);
    return Response.json({reconciled:true,generationId:generation.id});
  }catch{return jsonError('Хүсэлтийг сэргээж чадсангүй. Provider ID болон Console мэдээллийг шалгана уу.',502);}
}
