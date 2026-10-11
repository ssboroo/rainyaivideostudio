import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmailToken } from "@/lib/email-auth";
import { mailEnabled } from "@/lib/transactional-email";
import { consumeAuthLimit,isSameOriginMutation } from "@/lib/auth-security";
import { env } from "@/lib/env";
import { jsonError } from "@/lib/http";
const GENERIC={ok:true,message:"Бүртгэл баталгаажуулах шаардлагатай имэйл бол шинэ захидал илгээнэ."};
export async function POST(req:Request){
 if(!isSameOriginMutation(req,env.appUrl()))return jsonError("Хүсэлтийн эх сурвалж буруу.",403);
 if(!mailEnabled())return jsonError("Имэйл үйлчилгээ тохируулагдаагүй.",503);
 let body;try{body=await req.json();}catch{return jsonError("Имэйл буруу.",400);}
 const email=String(body?.email||"").trim().toLowerCase().slice(0,254);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return jsonError("Имэйл буруу.",400);
 const ip=String(req.headers.get("x-forwarded-for")||"unknown").split(",")[0];
 const limiter=consumeAuthLimit("resend-verify-ip:"+ip,5,3600000);
 const account=consumeAuthLimit("resend-verify-user:"+email,3,3600000);
 if(!limiter.allowed||!account.allowed)return NextResponse.json(GENERIC);
 try{
  const user=await db.user.findUnique({where:{email}});
  if(user&&!user.emailVerifiedAt)await sendEmailToken(user.id,email,"VERIFY");
 }catch{console.warn("Verification email delivery failed");}
 return NextResponse.json(GENERIC);
}
