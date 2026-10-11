import { createHash, randomBytes } from "node:crypto";

/** Branded account emails. Provider secrets are only read server-side. */
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const defaults = {
  video: { name: "RAINY Video Studio", accent: "#E9F35B", heading: "Бүтээх шинэ боломж нээгдлээ.", emoji: "🎬" },
  voice: { name: "RAINY Voice Studio", accent: "#8AFFC1", heading: "Таны дуу хоолой. Таны бүтээл.", emoji: "🎙️" },
};
export type BrandKey = keyof typeof defaults;

export function mailEnabled() {
  return !!(process.env.RESEND_API_KEY?.trim() && process.env.EMAIL_FROM?.trim() &&
    process.env.EMAIL_PUBLIC_URL?.startsWith("https://"));
}
export function verificationEnabled() { return process.env.EMAIL_VERIFICATION_REQUIRED === "true"; }
export function mailOrigin() {
  const origin = process.env.EMAIL_PUBLIC_URL?.trim() || "";
  const url = new URL(origin);
  if(url.protocol !== "https:" || url.username || url.password || url.search || url.hash) throw new Error("Mail public URL must be HTTPS origin");
  return url.origin;
}
export function makeEmailToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: createHash("sha256").update(token).digest("hex") };
}
export function tokenHash(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
function escapeHtml(v: string) {
  return v.replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[c] || c);
}
export function makeBrandedEmail(brand:BrandKey, kind:"verify"|"reset"|"welcome", actionUrl?:string){
  const b=defaults[brand];
  const verify=kind==="verify", reset=kind==="reset";
  const title=verify ? "Имэйл хаягаа баталгаажуулна уу" : reset ? "Нууц үгээ сэргээх хүсэлт" : "RAINY Studio-д тавтай морил";
  const subtitle=verify ? "RAINY-д бүртгэлээ баталгаажуулахад нэг алхам үлдлээ." :
    reset ? "Та шинэ нууц үг тохируулах хүсэлт илгээсэн байна." : "Таны бүтээлч орон зай нээгдлээ.";
  const button=verify?"Имэйлээ баталгаажуулах":reset?"Нууц үгээ сэргээх":"Студи рүү орох";
  const from=escapeHtml(b.name), color=b.accent, safeUrl=actionUrl?escapeHtml(actionUrl):"";
  const preheader=escapeHtml(title+" · "+b.name);
  const text=[title,subtitle,actionUrl?"Нээх холбоос: "+actionUrl:"",kind==="verify"?"Холбоос 24 цаг хүчинтэй.":reset?"Холбоос 30 минут хүчинтэй.":"", "Та энэ хүсэлтийг гаргаагүй бол үл тооно уу."].filter(Boolean).join("\n\n");
  const html=`<!doctype html><html lang="mn"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#090b0c;font-family:Arial,Helvetica,sans-serif;color:#fff;">
<div style="display:none;font-size:1px;color:#090b0c;max-height:0;overflow:hidden;opacity:0;">${preheader}</div>
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:#090b0c;padding:46px 16px;"><tr><td align="center">
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="max-width:580px;background:#14171a;border:1px solid #31383b;border-radius:22px;overflow:hidden">
<tr><td style="height:6px;background:${color}"></td></tr>
<tr><td style="padding:40px 38px 18px;"><span style="display:inline-block;background:${color};color:#101410;border-radius:10px;padding:9px 11px;font-weight:900;font-size:17px;">R</span><span style="font-size:16px;font-weight:700;letter-spacing:1px;margin-left:12px;color:#fff;">${from}</span></td></tr>
<tr><td style="padding:0 38px 8px;"><div style="font-size:12px;color:${color};font-weight:700;letter-spacing:2px;">YOUR CREATIVE STUDIO</div>
<h1 style="font-size:31px;letter-spacing:-1px;line-height:1.24;margin:17px 0 16px;color:#fff;">${escapeHtml(title)}</h1>
<p style="font-size:16px;line-height:1.8;color:#cbd0d1;margin:0 0 22px;">${escapeHtml(subtitle)}</p></td></tr>
${safeUrl?`<tr><td style="padding:4px 38px 27px;"><a href="${safeUrl}" style="background:${color};border-radius:12px;color:#131713;font-size:16px;text-decoration:none;font-weight:800;display:inline-block;padding:17px 24px;">${escapeHtml(button)} →</a></td></tr>`:""}
<tr><td style="padding:0 38px 30px;"><p style="color:#9ea8ad;line-height:1.7;font-size:13px;">${verify?"Энэ баталгаажуулах холбоос 24 цаг хүчинтэй.":reset?"Энэ сэргээх холбоос 30 минут хүчинтэй.":"RAINY-г сонгосонд баярлалаа."} Та хүсэлт гаргаагүй бол имэйлийг үл тооно уу.</p>
${safeUrl?`<p style="word-break:break-all;font-size:12px;color:#a7b3b6;line-height:1.6;">Товч ажиллахгүй бол холбоосыг хөтөчдөө хуулна уу:<br><a href="${safeUrl}" style="color:${color}">${safeUrl}</a></p>`:""}</td></tr>
<tr><td style="background:#0e1012;border-top:1px solid #303437;padding:22px 38px;color:#7e888a;font-size:12px;line-height:1.65;">© 2026 RAINY Studio · Энэхүү имэйл автомат мэдэгдэл тул хариу бичих шаардлагагүй.<br>Зөвхөн RAINY Studio үйлчилгээний бүртгэлтэй холбоотой захидал.</td></tr>
</table></td></tr></table></body></html>`;
  return { subject:`${title} · ${b.name}`, text, html };
}
export async function sendTransactionalMail(to:string,kind:"verify"|"reset"|"welcome",actionUrl?:string,brand:BrandKey="video") {
  if(!mailEnabled())throw new Error("Email provider not configured");
  const message=makeBrandedEmail(brand,kind,actionUrl);
  const controller = new AbortController();
  const timeout=setTimeout(()=>controller.abort(),12000);
  try {
    const response=await fetch(RESEND_ENDPOINT,{method:"POST",signal:controller.signal,headers:{
      Authorization:`Bearer ${process.env.RESEND_API_KEY}`, "Content-Type":"application/json"},
      body:JSON.stringify({from:process.env.EMAIL_FROM,to:[to],subject:message.subject,html:message.html,text:message.text})});
    if(!response.ok)throw new Error("Mail provider rejected delivery");
    return true;
  } finally {clearTimeout(timeout);}
}
