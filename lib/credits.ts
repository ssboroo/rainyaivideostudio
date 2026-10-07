import { Prisma, GenerationStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { lockCreditUser, expireLocked } from "@/lib/credit-expiry";
type Allocation = { grantId:string; amount:number };
export async function reserveCredits(userId:string,amount:number,data:Omit<Prisma.GenerationCreateInput,"user">){
 if(!Number.isSafeInteger(amount)||amount<=0)throw new Error('Credit amount must be positive');
 return db.$transaction(async tx=>{
  await lockCreditUser(tx,userId); const now=new Date();await expireLocked(tx,userId,now);
  const updated=await tx.user.updateMany({where:{id:userId,credits:{gte:amount}},data:{credits:{decrement:amount}}});
  if(updated.count!==1)throw new Error("Credit хүрэлцэхгүй байна.");
  const grants=await tx.creditGrant.findMany({where:{userId,expiresAt:{gt:now},remaining:{gt:0}},orderBy:[{expiresAt:'asc'},{id:'asc'}]});
  const allocation:Allocation[]=[];let left=amount;
  for(const grant of grants){const used=Math.min(left,grant.remaining);if(!used)break;await tx.creditGrant.update({where:{id:grant.id},data:{remaining:{decrement:used}}});allocation.push({grantId:grant.id,amount:used});left-=used;}
  const generation=await tx.generation.create({data:{...data,creditAllocation:{grants:allocation,permanent:left},user:{connect:{id:userId}}}});
  await tx.creditLedger.create({data:{userId,amount:-amount,type:"GENERATION",idempotencyKey:`generation:${generation.id}:charge`,referenceId:generation.id}});
  return generation;
 });
}
export async function refundGeneration(id:string,reason:string){
 return db.$transaction(async tx=>{
  const first=await tx.generation.findUnique({where:{id}});if(!first)return null;
  await lockCreditUser(tx,first.userId);const now=new Date();await expireLocked(tx,first.userId,now);
  const g=await tx.generation.findUnique({where:{id}});
  if(!g||g.refunded||g.costCredits<=0)return g;
  const allocation=g.creditAllocation as {grants?:Allocation[];permanent?:number}|null;
  let refundable=allocation ? allocation.permanent||0 : g.costCredits;
  for(const entry of allocation?.grants||[]){
   const grant=await tx.creditGrant.findUnique({where:{id:entry.grantId}});
   if(grant && grant.expiresAt>now){await tx.creditGrant.update({where:{id:grant.id},data:{remaining:{increment:entry.amount}}});refundable+=entry.amount;}
  }
  if(refundable>0)await tx.user.update({where:{id:g.userId},data:{credits:{increment:refundable}}});
  await tx.creditLedger.create({data:{userId:g.userId,amount:refundable,type:"REFUND",idempotencyKey:`generation:${g.id}:refund`,referenceId:g.id,metadata:{reason,expiredRefund:g.costCredits-refundable}}});
  return tx.generation.update({where:{id:g.id},data:{refunded:true}});
 });
}
export async function markTerminalAndRefund(id:string,status:GenerationStatus,output?:unknown,error?:unknown){
 await db.generation.updateMany({where:{id,status:{notIn:["COMPLETED","FAILED","NSFW","CANCELED"]}},data:{status,output:output===undefined?undefined:(output as Prisma.InputJsonValue),error:error===undefined?undefined:(error as Prisma.InputJsonValue),completedAt:new Date()}});
 const g=await db.generation.findUniqueOrThrow({where:{id}});
 if(g.status!=="COMPLETED")return (await refundGeneration(id,g.status.toLowerCase())) || g;
 return g;
}
