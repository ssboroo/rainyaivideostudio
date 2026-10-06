import { cookies } from "next/headers";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { db } from "@/lib/db";
import { env } from "@/lib/env";
const COOKIE = "ravs_session";
const MAX_AGE = 60 * 60 * 24 * 30;
function b64url(input: string | Buffer) { return Buffer.from(input).toString("base64url"); }
function sign(payload: string) {
  const secret = env.sessionSecret();
  if (secret.length < 32) throw new Error("SESSION_SECRET тохируулаагүй эсвэл хэт богино байна.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
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
  const exp = Math.floor(Date.now()/1000) + MAX_AGE;
  const payload = `${b64url(userId)}.${exp}`;
  const token = `${payload}.${sign(payload)}`;
  (await cookies()).set(COOKIE, token, { httpOnly:true, secure:process.env.NODE_ENV==="production", sameSite:"lax", path:"/", maxAge:MAX_AGE });
}
export async function clearSession() { (await cookies()).set(COOKIE, "", { httpOnly:true, path:"/", maxAge:0 }); }
export async function getSessionUser() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const [encodedId,expText,signature] = token.split(".");
  if (!encodedId || !expText || !signature) return null;
  const payload = `${encodedId}.${expText}`;
  const expected = sign(payload);
  const a = Buffer.from(signature), b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a,b) || Number(expText) < Math.floor(Date.now()/1000)) return null;
  const userId = Buffer.from(encodedId,"base64url").toString("utf8");
  return db.user.findUnique({ where:{id:userId}, select:{id:true,email:true,name:true,role:true,credits:true,createdAt:true} });
}
