import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { lockCreditUser, expireLocked, monthAfter } from "@/lib/credit-expiry";
import { verifiedHipayState } from "@/lib/hipay";

/** Verifies settlement status and amount BEFORE an atomic, idempotent wallet credit grant. */
export async function confirmHipayPayment(paymentId:string, invoice:{
  status?:string; amount?:number; paymentId?:string; paymentType?:string;
}) {
  return db.$transaction(async tx => {
    const p = await tx.payment.findUnique({where:{id:paymentId}});
    if (!p || p.provider !== "hipay" || !p.invoiceId) throw new Error("HiPay order олдсонгүй.");
    if (verifiedHipayState(invoice,p.amountMnt) !== "PAID") return false;
    if(p.status==="PAID") return false;
    await lockCreditUser(tx,p.userId);
    const now=new Date();
    await expireLocked(tx,p.userId,now);
    const updated=await tx.payment.updateMany({
      where:{id:p.id,provider:"hipay",status:{not:"PAID"}},
      data:{status:"PAID",paidAt:now,paymentId:invoice.paymentId,
        providerData:{ verifiedAmount:invoice.amount, verifiedMethod:invoice.paymentType || null,
          verifiedTransactionId:invoice.paymentId, checkoutId:p.invoiceId } as Prisma.InputJsonValue}
    });
    if(updated.count!==1)return false;
    if(p.validityMonths===1){
      const periodEnd=monthAfter(now);
      await tx.creditGrant.create({data:{userId:p.userId,paymentId:p.id,packageId:p.packageId,remaining:p.credits,expiresAt:periodEnd}});
      await tx.subscriptionCycle.create({data:{
        userId:p.userId,paymentId:p.id,planId:p.packageId,amountMnt:p.amountMnt,credits:p.credits,periodStart:now,periodEnd
      }});
      await tx.subscription.upsert({
        where:{userId:p.userId},
        create:{userId:p.userId,planId:p.packageId,status:"ACTIVE",renewalMode:"MANUAL",
          startedAt:now,periodStart:now,periodEnd,lastPaymentId:p.id},
        update:{planId:p.packageId,status:"ACTIVE",renewalMode:"MANUAL",
          periodStart:now,periodEnd,lastPaymentId:p.id}
      });
    }
    await tx.user.update({where:{id:p.userId},data:{credits:{increment:p.credits}}});
    await tx.creditLedger.create({data:{
      userId:p.userId,amount:p.credits,type:"PURCHASE",
      idempotencyKey:"hipay:"+p.id+":credit",referenceId:p.id,
      metadata:{provider:"hipay",amountMnt:p.amountMnt,invoiceId:p.invoiceId,transactionId:invoice.paymentId}
    }});
    return true;
  });
}
