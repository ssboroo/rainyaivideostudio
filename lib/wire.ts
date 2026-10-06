import crypto from "node:crypto";
import { env } from "@/lib/env";

export interface WirePaymentIntent {
  id: string;
  object?: string;
  amount: number;
  currency: string;
  status: string;
  client_secret?: string;
}
export interface WireCheckoutSession {
  id: string;
  object?: string;
  url: string;
  payment_intent: string;
  status?: string;
}
export class WireApiError extends Error {
  status: number;
  code?: string;
  requestId?: string;
  constructor(message:string,status:number,code?:string,requestId?:string){
    super(message);this.name="WireApiError";this.status=status;this.code=code;this.requestId=requestId;
  }
}
function getApiKey(){
  const key=env.wireApiKey();
  if(!key||key==="your_wire_mn_api_key")throw new Error("WIRE_MN_API_KEY тохируулаагүй байна.");
  return key;
}
export function toMinorUnits(mnt:number){return Math.round(mnt)}
function getAllowedOperators():string[]|undefined{
  const key=getApiKey();
  const live=key.startsWith("sk_live_");
  const ops=env.wireAllowedOperators();
  if(live){
    const liveOps=ops.filter(op=>op!=="sandbox");
    return liveOps.length?liveOps:undefined;
  }
  if(ops.some(op=>op!=="sandbox"))throw new WireApiError("Туршилтын түлхүүрт WIRE_MN_ALLOWED_OPERATORS=sandbox тохируулна уу.",503,"operator_configuration");
  return ops.length?ops:["sandbox"];
}
function wireError(action:string,status:number,body:string){
  let error:{code?:string;request_id?:string;message?:string;param?:string}={};
  try{error=JSON.parse(body)?.error||{}}catch{}
  const messages:Record<string,string>={
    operator_unknown:"Wire операторын ID буруу байна. Live үед идэвхтэй operator ID ашиглах эсвэл WIRE_MN_ALLOWED_OPERATORS-г хоосон үлдээнэ үү.",
    connector_required:"Wire dashboard дээр төлбөрийн оператор/суваг холбоно уу.",
    settlement_account_required:"Wire dashboard дээр орлого хүлээн авах дансаа тохируулна уу.",
    dan_verification_required:"Wire бүртгэлийн ДАН баталгаажуулалтыг гүйцээнэ үү.",
    operator_not_allowed:"Wire API key-ийн горим болон allowed operator тохиргоо зөрж байна.",
    idempotency_in_flight:"Төлбөрийн хүсэлт боловсруулагдаж байна. Хэдэн секундын дараа дахин оролдоно уу.",
    payment_intent_unexpected_state:"Төлбөрийн нэхэмжлэлийн төлөв өөрчлөгдсөн байна.",
    checkout_url_invalid:"APP_URL-д сайтын бүтэн HTTPS хаягийг тохируулна уу."
  };
  const providerMessage=typeof error.message==="string"&&error.message.trim()&&error.message.length<=500?error.message.trim():undefined;
  const message=(error.code&&messages[error.code])||(status===401?"Wire API түлхүүр хүчингүй байна.":undefined)||providerMessage||`${action}ад алдаа гарлаа (HTTP ${status}).`;
  console.error("Wire API request failed",{action,status,code:error.code||"unknown",param:error.param,requestId:error.request_id});
  return new WireApiError(message,status,error.code,error.request_id);
}
function idem(scope:string,id:string){return `${scope}-${id}`}
export async function createPaymentIntent(opts:{paymentId:string;amount:number;description?:string}):Promise<WirePaymentIntent>{
  const body={amount:toMinorUnits(opts.amount),currency:"MNT",description:opts.description,allowed_operators:getAllowedOperators()};
  const res=await fetch(`${env.wireApiUrl()}/payment_intents`,{
    method:"POST",signal:AbortSignal.timeout(15000),
    headers:{Authorization:`Bearer ${getApiKey()}`,"Content-Type":"application/json","Idempotency-Key":idem("pi",opts.paymentId)},
    body:JSON.stringify(body),cache:"no-store"
  });
  if(!res.ok)throw wireError("PaymentIntent үүсгэх",res.status,await res.text().catch(()=>""));
  return res.json();
}
export async function createCheckoutSession(opts:{paymentIntentId:string;paymentId:string;successUrl?:string}):Promise<WireCheckoutSession>{
  const checkoutUrl=`${env.wireApiUrl()}/checkout/sessions`;
  const key=getApiKey(), idemKey=idem("cs",opts.paymentIntentId);
  const payload:{payment_intent:string;success_url?:string}={payment_intent:opts.paymentIntentId};
  if(opts.successUrl)payload.success_url=opts.successUrl;
  const form=new URLSearchParams();form.set("payment_intent",payload.payment_intent);if(payload.success_url)form.set("success_url",payload.success_url);
  let res=await fetch(checkoutUrl,{method:"POST",signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/x-www-form-urlencoded","Idempotency-Key":idemKey},body:form.toString(),cache:"no-store"});
  if(!res.ok){
    const first=await res.text().catch(()=>"");let msg="";
    try{const parsed=JSON.parse(first);msg=String(parsed?.error?.message||parsed?.message||"")}catch{}
    const wantsJson=res.status===400&&/(?:request body|body).*(?:not valid|invalid).*json|json.*(?:not valid|invalid)/i.test(msg||first);
    if(!wantsJson)throw wireError("Checkout session үүсгэх",res.status,first);
    res=await fetch(checkoutUrl,{method:"POST",signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json","Idempotency-Key":idemKey},body:JSON.stringify(payload),cache:"no-store"});
    if(!res.ok)throw wireError("Checkout session үүсгэх",res.status,await res.text().catch(()=>""));
  }
  return res.json();
}
export async function retrievePaymentIntent(id:string):Promise<WirePaymentIntent>{
  const res=await fetch(`${env.wireApiUrl()}/payment_intents/${encodeURIComponent(id)}`,{method:"GET",signal:AbortSignal.timeout(15000),headers:{Authorization:`Bearer ${getApiKey()}`},cache:"no-store"});
  if(!res.ok)throw wireError("PaymentIntent татах",res.status,await res.text().catch(()=>""));
  return res.json();
}
export function verifyWebhookSignature(rawBody:string,signature:string){
  const secret=env.wireWebhookSecret();
  if(!secret||secret==="whsec_REPLACE_ME")return false;
  const parts=signature.split(",").map(x=>x.trim());
  const timestamps=parts.filter(x=>x.startsWith("t="));
  if(timestamps.length!==1)return false;
  const timestamp=timestamps[0].slice(2);
  if(!/^\d+$/.test(timestamp))return false;
  const seconds=Number(timestamp);
  if(!Number.isSafeInteger(seconds)||Math.abs(Date.now()/1000-seconds)>300)return false;
  const expected=crypto.createHmac("sha256",secret).update(`${timestamp}.${rawBody}`).digest();
  return parts.filter(x=>x.startsWith("v1=")).some(part=>{const hex=part.slice(3);return /^[a-f0-9]{64}$/i.test(hex)&&crypto.timingSafeEqual(expected,Buffer.from(hex,"hex"))});
}
export function mapIntentStatus(status:string):"PENDING"|"PAID"|"FAILED"|"CANCELED"{
  const s=(status||"").toLowerCase();
  if(s==="succeeded"||s==="paid")return"PAID";
  if(s==="failed")return"FAILED";
  if(s==="canceled"||s==="cancelled"||s==="expired")return"CANCELED";
  return"PENDING";
}
export function webhookSourceAllowed(req:Request){
  const allow=env.wireWebhookAllowedIps();
  if(!allow.length)return true;
  const forwarded=req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const direct=req.headers.get("x-real-ip")?.trim();
  return Boolean((forwarded&&allow.includes(forwarded))||(direct&&allow.includes(direct)));
}
