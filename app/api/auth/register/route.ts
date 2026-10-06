import { NextResponse } from "next/server";
import { db } from "@/lib/db";import { createSession,hashPassword } from "@/lib/session";import { env } from "@/lib/env";import { jsonError } from "@/lib/http";
export async function POST(req:Request){
 try{
  const b=await req.json();const email=String(b.email||"").trim().toLowerCase(),password=String(b.password||""),name=String(b.name||"").trim().slice(0,80);
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))return jsonError("Имэйл буруу байна.");
  if(password.length<8||password.length>128)return jsonError("Нууц үг 8–128 тэмдэгт байна.");
  const role=env.adminEmails().includes(email)?"ADMIN":"USER",welcome=Math.max(0,env.welcomeCredits());
  const user=await db.$transaction(async tx=>{const u=await tx.user.create({data:{email,passwordHash:hashPassword(password),name:name||null,role,credits:welcome}});if(welcome>0)await tx.creditLedger.create({data:{userId:u.id,amount:welcome,type:"WELCOME",idempotencyKey:`welcome:${u.id}`}});return u;});
  await createSession(user.id);return NextResponse.json({user:{id:user.id,email:user.email,name:user.name,role:user.role,credits:user.credits}},{status:201});
 }catch(e){if(e instanceof Error&&e.message.includes("Unique constraint"))return jsonError("Энэ имэйл бүртгэлтэй байна.",409);return jsonError(e instanceof Error?e.message:"Бүртгэл амжилтгүй.",500)}
}
