import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmailToken } from "@/lib/email-auth";
import { mailEnabled } from "@/lib/transactional-email";
import { consumeAuthLimit,isSameOriginMutation } from "@/lib/auth-security";
import { env } from "@/lib/env";
import { jsonError } from "@/lib/http";
const GENERIC={ok:true,message:"Бүртгэлтэй имэйл бол 30 минут хүчинтэй сэргээх холбоос илгээгдэнэ."};
export async function POST(req:Request){
 if(!isSameOriginMutation(req,process.env.EMAIL_PUBLIC_URL||env.appUrl()))return jsonError("Хүсэлтийн эх сурвалж буруу.",403);
 if(!mailEnabled())return jsonError("Имэйл үйлчилгээ түр боломжгүй.",503);
 let body;try{body=await req.json();}catch{return jsonError("Хүсэлт буруу.",400);}
 const email=String(body?.email||"").trim().toLowerCase().slice(0,254);
 if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return jsonError("Имэйл буруу.",400);
 const ip=String(req.headers.get("x-forwarded-for")||"unknown").split(",")[0];
 if(!consumeAuthLimit("reset-ip:"+ip,5,3600000).allowed||!consumeAuthLimit("reset-account:"+email,3,3600000).allowed)return NextResponse.json(GENERIC);
 try{
  const user=await db.user.findUnique({where:{email}});
  if(user)await sendEmailToken(user.id,email,"RESET");
 }catch{console.warn("Password reset email delivery failed");}
 return NextResponse.json(GENERIC);
}
