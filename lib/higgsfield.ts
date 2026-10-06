import { env } from "./env.ts";
type HfJson = Record<string, unknown>;
function headers() {
 const credentials = env.higgsfieldCredentials().trim();
 if (!credentials || !credentials.includes(":")) throw new Error("Үүсгэх үйлчилгээ түр бэлтгэгдэж байна. Дараа дахин оролдоно уу.");
 return { Authorization:`Key ${credentials}`, "Content-Type":"application/json" };
}
async function hfFetch(path: string, init?: RequestInit) {
 const base = new URL(env.higgsfieldBaseUrl());
 const target = new URL(path, base);
 if(target.origin !== base.origin || target.username || target.password) throw new Error("Provider URL зөвшөөрөгдөөгүй байна.");
 const response = await fetch(target.toString(), {...init,headers:{...headers(),...(init?.headers||{})},signal:AbortSignal.timeout(45000),cache:"no-store",redirect:"error"});
 const payload = (await response.json().catch(()=>({}))) as HfJson;
 if(!response.ok) {
  const messages: Record<number,string> = {400:"Оролтын мэдээлэл шаардлага хангахгүй байна.",401:"Үүсгэх үйлчилгээний холболт түр боломжгүй байна.",402:"Үүсгэх үйлчилгээ түр боломжгүй байна.",404:"Энэ загвар түр ашиглах боломжгүй байна.",422:"Зураг, видео болон тохиргоогоо шалгана уу.",429:"Үйлчилгээ ачаалалтай байна. Түр хүлээгээд дахин оролдоно уу."};
  const error = new Error(messages[response.status] || "Үүсгэх үйлчилгээ алдаа буцаалаа. Дахин оролдоно уу.") as Error & {status?:number};
  error.status=response.status;throw error;
 }
 return payload;
}
export const submitGeneration=(modelId:string,input:Record<string,unknown>,idempotencyKey?:string)=>hfFetch(`/${modelId}`,{method:"POST",headers:idempotencyKey?{"Idempotency-Key":idempotencyKey}:{},body:JSON.stringify(input)});
export const getGenerationStatus=(id:string,statusUrl?:string|null)=>hfFetch(statusUrl||`/requests/${encodeURIComponent(id)}/status`,{method:"GET"});
export const cancelGeneration=(id:string,cancelUrl?:string|null)=>hfFetch(cancelUrl||`/requests/${encodeURIComponent(id)}/cancel`,{method:"POST"});
export const createSignedUpload=(contentType:string)=>hfFetch("/files/generate-upload-url",{method:"POST",body:JSON.stringify({content_type:contentType})});
export const fetchPresetCatalog=(kind:"restyle"|"marketing")=>hfFetch(kind==="restyle"?"/models/higgsfield/genjutsu/restyle/v1.0/presets":"/marketing-studio/image/presets?size=50",{method:"GET"});
export function mapProviderStatus(value: unknown) {
 const status=String(value||"").toLowerCase();
 if(status==="completed")return "COMPLETED";
 if(status==="failed")return "FAILED";
 if(status==="nsfw")return "NSFW";
 if(status==="canceled"||status==="cancelled")return "CANCELED";
 if(["in_progress","processing","running"].includes(status))return "PROCESSING";
 return "SUBMITTED";
}
