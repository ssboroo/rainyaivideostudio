import { Prisma } from '@prisma/client';
import { db } from '@/lib/db';
export function monthAfter(date: Date): Date {
 const next = new Date(date);
 const day = next.getUTCDate(); next.setUTCDate(1); next.setUTCMonth(next.getUTCMonth()+1);
 const last = new Date(Date.UTC(next.getUTCFullYear(), next.getUTCMonth()+1, 0)).getUTCDate();
 next.setUTCDate(Math.min(day,last)); return next;
}
export async function expireLocked(tx: Prisma.TransactionClient, userId: string, now: Date) {
 const expired = await tx.creditGrant.findMany({where:{userId,expiresAt:{lte:now},remaining:{gt:0}}});
 for(const grant of expired) {
  const amount = grant.remaining;
  await tx.creditGrant.update({where:{id:grant.id},data:{remaining:0}});
  await tx.user.update({where:{id:userId},data:{credits:{decrement:amount}}});
  await tx.creditLedger.create({data:{userId,amount:-amount,type:'EXPIRY',idempotencyKey:`expiry:${grant.id}`,referenceId:grant.id}});
 }
}
export async function lockCreditUser(tx: Prisma.TransactionClient, userId: string) {
 await tx.user.update({where:{id:userId},data:{credits:{increment:0}}});
}
export async function expireUserCredits(userId:string) {
 await db.$transaction(async tx=>{await lockCreditUser(tx,userId);await expireLocked(tx,userId,new Date());});
}
