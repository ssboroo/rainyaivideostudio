import { NextResponse } from "next/server";
import { consumeEmailToken } from "@/lib/email-auth";
import { createSession } from "@/lib/session";
import { jsonError } from "@/lib/http";
import { consumeAuthLimit, isSameOriginMutation } from "@/lib/auth-security";
import { env } from "@/lib/env";
export async function POST(req:Request){
 if(!isSameOriginMutation(req,process.env.EMAIL_PUBLIC_URL||env.appUrl()))return jsonError("Хүсэлтийн эх сурвалж буруу.",403);
 const limit=consumeAuthLimit("email-verify:"+(req.headers.get("x-forwarded-for")||"unknown"),15,3600000);
 if(!limit.allowed)return jsonError("Хэт олон оролдлого. Түр хүлээнэ үү.",429);
 let data;try{data=await req.json();}catch{return jsonError("Хүсэлт буруу.",400);}
 try{
  let authenticatedPasswordHash="";
  const userId=await consumeEmailToken(data?.token,"VERIFY",async(tx,id,now)=>{
   const user=await tx.user.update({where:{id},data:{emailVerifiedAt:now},select:{passwordHash:true}});
   authenticatedPasswordHash=user.passwordHash;
  });
  if(!userId)return jsonError("Баталгаажуулах холбоос хүчингүй эсвэл хугацаа дууссан.",400);
  await createSession(userId,authenticatedPasswordHash);
  return NextResponse.json({ok:true,message:"Имэйл хаяг баталгаажлаа."});
 }catch{return jsonError("Баталгаажуулах хүсэлт амжилтгүй.",503);}
}
