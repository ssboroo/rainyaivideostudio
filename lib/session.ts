import { expireUserCredits } from "@/lib/credit-expiry";
import { cookies } from "next/headers";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
const COOKIE = "ravs_session";
const MAX_AGE = 60 * 60 * 24 * 30;
import { makeSessionToken, readSessionToken } from "@/lib/auth-security";
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const key = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${key}`;
}
export function verifyPassword(password: string, stored: string) {
  const [algorithm,salt,key] = stored.split("$");
  if (algorithm !== "scrypt" || !salt || !key) return false;
  const candidate = scryptSync(password, salt, 64);
  const expected = Buffer.from(key, "hex");
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}
export async function createSession(userId: string) {
  const token = makeSessionToken(userId, env.sessionSecret(), Math.floor(Date.now()/1000), MAX_AGE);
  (await cookies()).set(COOKIE, token, { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"lax", path:"/", maxAge:MAX_AGE });
}
export async function clearSession() { (await cookies()).set(COOKIE, "", { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"lax", path:"/", maxAge:0 }); }
export async function getSessionUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const userId = readSessionToken(token, env.sessionSecret(), Math.floor(Date.now()/1000));
  if (!userId) return null;
  await expireUserCredits(userId);
  return db.user.findUnique({ where:{id:userId}, select:{id:true,email:true,name:true,role:true,credits:true,createdAt:true} });
}
