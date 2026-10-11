import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { consumeEmailToken } from "@/lib/email-auth";
import { hashPassword } from "@/lib/session";
import { consumeAuthLimit,isSameOriginMutation } from "@/lib/auth-security";
import { env } from "@/lib/env";
import { jsonError } from "@/lib/http";
export async function POST(req:Request){
 if(!isSameOriginMutation(req,env.appUrl()))return jsonError("Хүсэлтийн эх сурвалж буруу.",403);
 const ip=String(req.headers.get("x-forwarded-for")||"unknown").split(",")[0];
 if(!consumeAuthLimit("reset-confirm:"+ip,10,3600000).allowed)return jsonError("Түр хүлээгээд дахин оролдоно уу.",429);
 let data;try{data=await req.json();}catch{return jsonError("Хүсэлт буруу.",400);}
 if(typeof data?.password!=="string"||data.password.length<12||data.password.length>128)return jsonError("Нууц үг 12–128 тэмдэгт байна.",422);
 try{
  const userId=await consumeEmailToken(data.token,"RESET");
  if(!userId)return jsonError("Сэргээх холбоос хүчингүй эсвэл хугацаа дууссан.",400);
  await db.user.update({where:{id:userId},data:{passwordHash:hashPassword(data.password),passwordChangedAt:new Date()}});
  await db.emailToken.deleteMany({where:{userId}});
  return NextResponse.json({ok:true,message:"Нууц үг шинэчлэгдлээ. Дахин нэвтэрнэ үү."});
 }catch{return jsonError("Нууц үг шинэчлэх хүсэлт амжилтгүй.",503);}
}
