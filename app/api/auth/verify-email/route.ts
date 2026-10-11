import { NextResponse } from "next/server";
import { db } from "@/lib/db";
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
  const userId=await consumeEmailToken(data?.token,"VERIFY");
  if(!userId)return jsonError("Баталгаажуулах холбоос хүчингүй эсвэл хугацаа дууссан.",400);
  const user=await db.user.update({where:{id:userId},data:{emailVerifiedAt:new Date()}});
  await createSession(user.id);
  return NextResponse.json({ok:true,message:"Имэйл хаяг баталгаажлаа."});
 }catch{return jsonError("Баталгаажуулах хүсэлт амжилтгүй.",503);}
}
