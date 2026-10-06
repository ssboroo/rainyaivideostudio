import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { mapIntentStatus, WirePaymentIntent } from "@/lib/wire";

export function paymentMatches(intent:WirePaymentIntent,payment:{amountMnt:number}){
  return intent.currency==="MNT"&&intent.amount===payment.amountMnt;
}
function jsonObject(value:Prisma.JsonValue|null):Record<string,unknown>{
  return value&&typeof value==="object"&&!Array.isArray(value)?value as Record<string,unknown>:{};
}
function jsonSafe(value:unknown):Prisma.InputJsonValue{
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
export async function confirmWirePayment(paymentId:string,intent:WirePaymentIntent,transactionId?:string){
  if(mapIntentStatus(intent.status)!=="PAID")throw new Error("Wire төлбөр амжилттай төлөвт биш байна.");
  return db.$transaction(async tx=>{
    const payment=await tx.payment.findUnique({where:{id:paymentId}});
    if(!payment)throw new Error("Payment олдсонгүй.");
    if(!paymentMatches(intent,payment))throw new Error("Төлбөрийн дүн эсвэл валют зөрж байна.");
    if(payment.status==="PAID")return false;
    const providerData=jsonSafe({...jsonObject(payment.providerData),verifiedIntent:intent});
    const changed=await tx.payment.updateMany({
      where:{id:payment.id,status:{not:"PAID"}},
      data:{status:"PAID",paidAt:new Date(),paymentId:transactionId||payment.paymentId,providerData}
    });
    if(changed.count!==1)return false;
    await tx.user.update({where:{id:payment.userId},data:{credits:{increment:payment.credits}}});
    await tx.creditLedger.create({
      data:{
        userId:payment.userId,amount:payment.credits,type:"PURCHASE",
        idempotencyKey:`wire:${payment.id}:credit`,referenceId:payment.id,
        metadata:{amountMnt:payment.amountMnt,paymentIntentId:intent.id,transactionId:transactionId||null}
      }
    });
    return true;
  });
}
export async function markWirePaymentState(paymentId:string,status:"FAILED"|"CANCELED"){
  await db.payment.updateMany({where:{id:paymentId,status:{not:"PAID"}},data:{status}});
}
export function checkoutUrlFromProviderData(data:Prisma.JsonValue|null){
  if(!data||typeof data!=="object"||Array.isArray(data))return null;
  const value=(data as Record<string,unknown>).checkoutUrl;
  return typeof value==="string"?value:null;
}
