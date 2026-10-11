/**
 * Mongolia HiPay (hipay.mn) hosted checkout — not HiPay Europe.
 * Card details stay on HiPay; every credit grant requires server-side invoice verification.
 * Live mode deliberately requires a merchant-confirmed API base URL and explicit enablement.
 * Docs: https://developers.hipay.mn/en/checkout/ , /checkout-get/ , /payment/
 */
type InvoiceData = { code?: string | number; description?: string; checkoutId?: string; amount?: number; status?: string; paymentId?: string; paymentType?: string };
export class HipayError extends Error { constructor(message: string, public readonly status = 502) { super(message); this.name = "HipayError"; } }
function endpoint() {
  const mode = process.env.HIPAY_MODE?.trim().toLowerCase();
  if (mode !== "live" && mode !== "test") throw new HipayError("HiPay горим тохируулаагүй.", 503);
  if (process.env.NODE_ENV === "production" && mode !== "live")
    throw new HipayError("Production орчинд HiPay test төлбөр идэвхгүй.", 503);
  if (mode === "live" && process.env.HIPAY_LIVE_ENABLED !== "true")
    throw new HipayError("HiPay live merchant төлбөр хараахан нээгдээгүй.", 503);
  const raw = mode === "test" ? "https://test.hipay.mn" : process.env.HIPAY_LIVE_BASE_URL;
  if (!raw) throw new HipayError("HiPay live API endpoint тохируулаагүй.", 503);
  let u: URL;
  try { u = new URL(raw); } catch { throw new HipayError("HiPay API URL буруу.", 503); }
  if (u.protocol !== "https:" || u.username || u.password || u.search || u.hash || u.port || u.pathname !== "/" ||
    !(u.hostname === "hipay.mn" || u.hostname.endsWith(".hipay.mn")) ||
    (mode === "live" && u.hostname === "test.hipay.mn") ||
    (mode === "test" && u.hostname !== "test.hipay.mn"))
      throw new HipayError("HiPay зөвшөөрөгдөөгүй API origin.", 503);
  return u.origin;
}
function credentials() {
  const entityId = process.env.HIPAY_ENTITY_ID?.trim();
  const secret = process.env.HIPAY_CLIENT_SECRET?.trim();
  if (!entityId || !secret) throw new HipayError("HiPay merchant API эрх тохируулаагүй.", 503);
  return { entityId, secret };
}
export function hipayEnabled() {
  try { endpoint(); credentials(); return true; } catch { return false; }
}
function normalize(value: unknown): InvoiceData {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || typeof raw !== "object") throw new HipayError("HiPay буруу өгөгдөл буцаалаа.");
  return raw as InvoiceData;
}
async function api(path: string, init?: RequestInit) {
  const { secret } = credentials();
  const response = await fetch(endpoint() + path, {
    ...init, cache:"no-store", signal:AbortSignal.timeout(15000),
    headers: { "Authorization": "Bearer " + secret, "Accept":"application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}) }
  });
  if (!response.ok) throw new HipayError("HiPay API хариу амжилтгүй (HTTP " + response.status + ").", 502);
  let value: unknown;
  try { value = await response.json(); } catch { throw new HipayError("HiPay JSON хариу буруу."); }
  const data = normalize(value);
  if (String(data.code) !== "0" || String(data.description || "").toUpperCase() !== "SUCCESS")
    throw new HipayError("HiPay хүсэлтийг зөвшөөрсөнгүй.");
  return data;
}
export async function createHipayInvoice(args:{ amountMnt:number; callbackUrl:string; webhookUrl:string; }): Promise<string> {
  const { entityId } = credentials();
  if (!Number.isSafeInteger(args.amountMnt) || args.amountMnt <= 0) throw new HipayError("HiPay төлбөрийн дүн буруу.",400);
  for (const url of [args.callbackUrl,args.webhookUrl]) {
    const u = new URL(url);
    if (u.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && u.hostname === "localhost"))
      throw new HipayError("HTTPS callback шаардлагатай.", 503);
  }
  const data = await api("/checkout", { method:"POST", body:JSON.stringify({
    entityId, redirect_uri:args.callbackUrl, webhook_url:args.webhookUrl,
    amount: args.amountMnt, qrData:false
  })});
  if (typeof data.checkoutId !== "string" || !/^[A-Za-z0-9_-]{5,48}$/.test(data.checkoutId))
    throw new HipayError("HiPay нэхэмжлэлийн ID буруу.");
  return data.checkoutId;
}
export function hipayCheckoutUrl(checkoutId:string, email?:string) {
  if (!/^[A-Za-z0-9_-]{5,48}$/.test(checkoutId)) throw new HipayError("Нэхэмжлэлийн ID буруу.");
  const url = new URL(endpoint() + "/payment/");
  url.searchParams.set("checkoutId", checkoutId);
  url.searchParams.set("lang","mn");
  if(email) url.searchParams.set("email",email);
  return url.toString();
}
export async function verifyHipayInvoice(checkoutId:string) {
  if (!/^[A-Za-z0-9_-]{5,48}$/.test(checkoutId)) throw new HipayError("Нэхэмжлэлийн ID буруу.",400);
  const {entityId} = credentials();
  return api("/checkout/get/" + encodeURIComponent(checkoutId) + "?entityId=" + encodeURIComponent(entityId));
}
export function verifiedHipayState(data:InvoiceData, amountMnt:number) {
  const status=String(data.status||"").toLowerCase().split(" ")[0];
  if (status === "paid") {
    if (typeof data.amount !== "number" || !Number.isFinite(data.amount) || data.amount !== amountMnt ||
      typeof data.paymentId !== "string" || !data.paymentId.trim())
      throw new HipayError("HiPay төлбөрийн дүн эсвэл гүйлгээний дугаар зөрсөн.");
    return "PAID" as const;
  }
  if (status === "canceled" || status === "expired" || status === "invalid") return "CANCELED" as const;
  return "PENDING" as const;
}
