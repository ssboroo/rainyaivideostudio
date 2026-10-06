import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, verifyPassword, hashPassword } from "@/lib/session";
import { jsonError } from "@/lib/http";
import { validateAuthInput, consumeAuthLimit } from "@/lib/auth-security";
const dummyHash = hashPassword("unusable-dummy-password");
export async function POST(req: Request) {
 let input;
 try { input = validateAuthInput(await req.json(), false); } catch { return jsonError("Имэйл, нууц үгээ зөв оруулна уу."); }
 const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
 const ipLimit = consumeAuthLimit(`login-ip:${ip}`, 30, 15*60000);
 const accountLimit = consumeAuthLimit(`login-account:${input.email}`, 10, 15*60000);
 if(!ipLimit.allowed || !accountLimit.allowed) return NextResponse.json({error:"Хэт олон оролдлого. 15 минутын дараа дахин оролдоно уу."},{status:429,headers:{"Retry-After":String(Math.max(ipLimit.retryAfter,accountLimit.retryAfter))}});
 try {
  const user = await db.user.findUnique({where:{email:input.email}});
  const valid = verifyPassword(input.password,user?.passwordHash || dummyHash);
  if(!user || !valid) return jsonError("Имэйл эсвэл нууц үг буруу.",401);
  await createSession(user.id);
  return NextResponse.json({user:{id:user.id,email:user.email,name:user.name,role:user.role,credits:user.credits}});
 } catch(e) {
  console.error("Login failed",e instanceof Error?e.name:"UnknownError");
  return jsonError("Нэвтрэх үйлчилгээ түр боломжгүй байна. Дахин оролдоно уу.",503);
 }
}
