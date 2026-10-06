import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { createSession, hashPassword } from "@/lib/session";
import { env } from "@/lib/env";
import { jsonError } from "@/lib/http";
import { validateAuthInput, consumeAuthLimit } from "@/lib/auth-security";
export async function POST(req: Request) {
 const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
 const limit = consumeAuthLimit(`register:${ip}`, 5, 15 * 60000);
 if (!limit.allowed) return NextResponse.json({error:"Хэт олон оролдлого. Түр хүлээгээд дахин оролдоно уу."},{status:429,headers:{"Retry-After":String(limit.retryAfter)}});
 let input;
 try { input = validateAuthInput(await req.json(), true); } catch (e) { return jsonError(e instanceof SyntaxError ? "Мэдээлэл буруу байна." : e instanceof Error ? e.message : "Мэдээлэл буруу байна."); }
 if (env.sessionSecret().length < 32) return jsonError("Бүртгэлийн үйлчилгээ түр боломжгүй байна.",503);
 try {
  const {email,password,name} = input, welcome = Math.max(0,env.welcomeCredits());
  const user = await db.$transaction(async tx => {
   const u = await tx.user.create({data:{email,passwordHash:hashPassword(password),name:name||null,role:"USER",credits:welcome}});
   if(welcome>0) await tx.creditLedger.create({data:{userId:u.id,amount:welcome,type:"WELCOME",idempotencyKey:`welcome:${u.id}`}});
   return u;
  });
  await createSession(user.id);
  return NextResponse.json({user:{id:user.id,email:user.email,name:user.name,role:user.role,credits:user.credits}},{status:201});
 } catch(e) {
  if(e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") return jsonError("Энэ имэйл бүртгэлтэй байна. Нэвтэрнэ үү.",409);
  console.error("Registration failed", e instanceof Error ? e.name : "UnknownError");
  return jsonError("Бүртгэл үүсгэж чадсангүй. Түр хүлээгээд дахин оролдоно уу.",500);
 }
}
