import { NextResponse } from "next/server";import { Prisma } from "@prisma/client";import { db } from "@/lib/db";import { requireUser,jsonError } from "@/lib/http";import { getModel,estimateCredits,buildProviderInput } from "@/lib/models";import { reserveCredits,refundGeneration } from "@/lib/credits";import { submitGeneration } from "@/lib/higgsfield";import { env } from "@/lib/env";
export const dynamic="force-dynamic";
export async function GET(){const user=await requireUser();if(!user)return jsonError("Нэвтэрнэ үү.",401);const rows=await db.generation.findMany({where:{userId:user.id},orderBy:{createdAt:"desc"},take:50});return NextResponse.json({generations:rows,user:{credits:user.credits}})}
export async function POST(req:Request){
 const user=await requireUser();if(!user)return jsonError("Нэвтэрнэ үү.",401);
 try{
  const raw=await req.json();const model=getModel(String(raw.modelSlug||""));if(!model)return jsonError("Model олдсонгүй.",404);
  const since=new Date(Date.now()-60000);const recent=await db.generation.count({where:{userId:user.id,createdAt:{gte:since}}});if(recent>=env.generationRateLimit())return jsonError("Хэт олон хүсэлт. 1 минутын дараа дахин оролдоно уу.",429);
  const input=buildProviderInput(model,raw);const cost=estimateCredits(model,Number(raw.duration));
  const prompt=typeof raw.prompt==="string"?raw.prompt.trim().slice(0,6000):"";
  const generation=await reserveCredits(user.id,cost,{modelSlug:model.slug,modelId:model.modelId,kind:model.kind,prompt,input:input as Prisma.InputJsonValue,status:"PENDING",costCredits:cost});
  try{
   const provider=await submitGeneration(model.modelId,input);const requestId=typeof provider.request_id==="string"?provider.request_id:"";
   if(!requestId)throw new Error("Higgsfield request_id буцаасангүй.");
   const updated=await db.generation.update({where:{id:generation.id},data:{providerRequestId:requestId,providerStatusUrl:typeof provider.status_url==="string"?provider.status_url:null,providerCancelUrl:typeof provider.cancel_url==="string"?provider.cancel_url:null,status:"SUBMITTED"}});
   const fresh=await db.user.findUnique({where:{id:user.id},select:{credits:true}});return NextResponse.json({generation:updated,credits:fresh?.credits??0},{status:202});
  }catch(e){await db.generation.update({where:{id:generation.id},data:{status:"FAILED",error:{message:e instanceof Error?e.message:"Provider error"},completedAt:new Date()}});await refundGeneration(generation.id,"submit_failed").catch(()=>null);throw e}
 }catch(e){return jsonError(e instanceof Error?e.message:"Generation эхлүүлж чадсангүй.",e instanceof Error&&e.message.includes("Credit")?402:500)}
}
