import { Prisma, GenerationStatus } from "@prisma/client";
import { db } from "@/lib/db";
export async function reserveCredits(userId:string,amount:number,data:Omit<Prisma.GenerationCreateInput,"user">){
  return db.$transaction(async tx=>{
    const updated=await tx.user.updateMany({where:{id:userId,credits:{gte:amount}},data:{credits:{decrement:amount}}});
    if(updated.count!==1)throw new Error("Credit хүрэлцэхгүй байна.");
    const generation=await tx.generation.create({data:{...data,user:{connect:{id:userId}}}});
    await tx.creditLedger.create({data:{userId,amount:-amount,type:"GENERATION",idempotencyKey:`generation:${generation.id}:charge`,referenceId:generation.id}});
    return generation;
  });
}
export async function refundGeneration(id:string,reason:string){
  return db.$transaction(async tx=>{
    const g=await tx.generation.findUnique({where:{id}});
    if(!g||g.refunded||g.costCredits<=0)return g;
    await tx.user.update({where:{id:g.userId},data:{credits:{increment:g.costCredits}}});
    await tx.creditLedger.create({data:{userId:g.userId,amount:g.costCredits,type:"REFUND",idempotencyKey:`generation:${g.id}:refund`,referenceId:g.id,metadata:{reason}}});
    return tx.generation.update({where:{id:g.id},data:{refunded:true}});
  });
}
export async function markTerminalAndRefund(id:string,status:GenerationStatus,output?:unknown,error?:unknown){
  await db.generation.updateMany({where:{id,status:{notIn:["COMPLETED","FAILED","NSFW","CANCELED"]}},data:{status,output:output===undefined?undefined:(output as Prisma.InputJsonValue),error:error===undefined?undefined:(error as Prisma.InputJsonValue),completedAt:new Date()}});
  const g=await db.generation.findUniqueOrThrow({where:{id}});
  if(g.status!=="COMPLETED")return (await refundGeneration(id,g.status.toLowerCase())) || g;
  return g;
}
