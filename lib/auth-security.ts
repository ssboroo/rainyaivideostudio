import { createHmac, timingSafeEqual } from "node:crypto";

export function validateAuthInput(value: unknown, registration: boolean) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Мэдээллээ зөв оруулна уу.");
  const body = value as Record<string, unknown>;
  if (typeof body.email !== "string" || typeof body.password !== "string") throw new Error("Имэйл, нууц үгээ оруулна уу.");
  const email = body.email.trim().toLowerCase(), password = body.password;
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Имэйл хаяг буруу байна.");
  if (password.length < (registration ? 8 : 1) || password.length > 128) throw new Error("Нууц үг 8–128 тэмдэгт байна.");
  if (body.name !== undefined && typeof body.name !== "string") throw new Error("Нэрээ зөв оруулна уу.");
  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (name.length > 80) throw new Error("Нэр 80 тэмдэгтээс хэтрэхгүй байна.");
  return { email, password, name };
}

function signature(payload: string, secret: string) {
  if (secret.length < 32) throw new Error("Session тохиргоо дутуу байна.");
  return createHmac("sha256", secret).update(payload).digest("base64url");
}
export function makeSessionToken(id: string, secret: string, now: number, age: number) {
  const payload = `${Buffer.from(id).toString("base64url")}.${now + age}`;
  return `${payload}.${signature(payload, secret)}`;
}
export function readSessionToken(token: string, secret: string, now: number) {
  if (token.length > 512 || secret.length < 32) return null;
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [id, expiration, mac] = parts;
  if (!/^[A-Za-z0-9_-]+$/.test(id) || !/^\d+$/.test(expiration)) return null;
  const exp = Number(expiration);
  if (!Number.isSafeInteger(exp) || exp <= now) return null;
  const expected = Buffer.from(signature(`${id}.${expiration}`, secret)), received = Buffer.from(mac);
  if (received.length !== expected.length || !timingSafeEqual(received, expected)) return null;
  return Buffer.from(id, "base64url").toString("utf8") || null;
}

// Per-process protection. Use a shared Redis limiter before scaling to multiple replicas.
const buckets = new Map<string, { count: number; expires: number }>();
export function consumeAuthLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  for (const [id, entry] of buckets) if (entry.expires <= now) buckets.delete(id);
  let entry = buckets.get(key);
  if (!entry) {
    if (buckets.size >= 10000) return { allowed: false, retryAfter: Math.ceil(windowMs / 1000) };
    entry = { count: 0, expires: now + windowMs }; buckets.set(key, entry);
  }
  entry.count++;
  return { allowed: entry.count <= limit, retryAfter: Math.max(1, Math.ceil((entry.expires - now) / 1000)) };
}

export function isSameOriginMutation(req: Request, publicUrl?: string) {
  if (req.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = req.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(publicUrl || req.url).origin; } catch { return false; }
}
