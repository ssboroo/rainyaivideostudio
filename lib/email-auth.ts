import { db } from "@/lib/db";
import { mailEnabled, mailOrigin, makeEmailToken, sendTransactionalMail, tokenHash } from "@/lib/transactional-email";
import { Prisma } from "@prisma/client";
export type TokenPurpose = "VERIFY"|"RESET";
const TTL:Record<TokenPurpose,number>={VERIFY:24*3600*1000,RESET:30*60*1000};
export const EMAIL_REQUIRED_MESSAGE="Имэйлээ баталгаажуулна уу. Захидал ирээгүй бол дахин илгээх хүсэлт гаргана уу.";

export async function createEmailToken(userId:string,kind:TokenPurpose) {
  const token=makeEmailToken();
  await db.$transaction(async tx=>{
    await tx.emailToken.deleteMany({where:{userId,kind}});
    await tx.emailToken.create({data:{userId,kind,tokenHash:token.tokenHash,expiresAt:new Date(Date.now()+TTL[kind])}});
  });
  return token.token;
}
export async function sendEmailToken(userId:string,email:string,kind:TokenPurpose){
  if(!mailEnabled()) throw new Error("Email provider is not configured");
  const token=await createEmailToken(userId,kind);
  const route=kind==="VERIFY"?"/verify-email?token=":"/reset-password?token=";
  const url=mailOrigin()+route+encodeURIComponent(token);
  await sendTransactionalMail(email,kind==="VERIFY"?"verify":"reset",url,process.env.STUDIO_ONLY==="true"?"create":"video");
}
export async function consumeEmailToken(raw:unknown,kind:TokenPurpose, apply?: (tx: Prisma.TransactionClient, userId: string, now: Date) => Promise<void>) {
  if(typeof raw!=="string"||raw.length<32||raw.length>180||!/^[A-Za-z0-9_-]+$/.test(raw))return null;
  const hash=tokenHash(raw),now=new Date();
  return db.$transaction(async tx=>{
    const prior=await tx.emailToken.findUnique({where:{tokenHash:hash}});
    if(!prior||prior.kind!==kind||prior.consumedAt||prior.expiresAt<=now)return null;
    const applied=await tx.emailToken.updateMany({where:{id:prior.id,consumedAt:null,expiresAt:{gt:now}},data:{consumedAt:now}});
    if(applied.count!==1)return null;
    if(apply)await apply(tx,prior.userId,now);
    return prior.userId;
  },{isolationLevel:Prisma.TransactionIsolationLevel.Serializable});
}
