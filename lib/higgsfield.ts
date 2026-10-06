import { env } from "@/lib/env";
type HfJson = Record<string, unknown>;
function headers() {
  const credentials = env.higgsfieldCredentials();
  if (!credentials) throw new Error("HF_CREDENTIALS тохируулаагүй байна.");
  return { Authorization:`Key ${credentials}`, "Content-Type":"application/json" };
}
async function hfFetch(path:string, init?:RequestInit) {
  const response = await fetch(`${env.higgsfieldBaseUrl()}${path}`, { ...init, headers:{...headers(),...(init?.headers||{})}, cache:"no-store" });
  const payload = (await response.json().catch(()=>({}))) as HfJson;
  if (!response.ok) {
    const message = typeof payload.detail==="string" ? payload.detail : typeof payload.error==="string" ? payload.error : `Higgsfield API error (${response.status})`;
    const error = new Error(message) as Error & { status?:number; payload?:unknown };
    error.status=response.status; error.payload=payload; throw error;
  }
  return payload;
}
export const submitGeneration=(modelId:string,input:Record<string,unknown>)=>hfFetch(`/${modelId}`,{method:"POST",body:JSON.stringify(input)});
export const getGenerationStatus=(id:string)=>hfFetch(`/requests/${encodeURIComponent(id)}/status`,{method:"GET"});
export const cancelGeneration=(id:string)=>hfFetch(`/requests/${encodeURIComponent(id)}/cancel`,{method:"POST",body:"{}"});
export const createSignedUpload=(contentType:string)=>hfFetch("/files/generate-upload-url",{method:"POST",body:JSON.stringify({content_type:contentType})});
export const fetchPresetCatalog=(kind:"restyle"|"marketing")=>hfFetch(kind==="restyle"?"/models/higgsfield/genjutsu/restyle/v1.0/presets":"/marketing-studio/image/presets?size=50",{method:"GET"});
