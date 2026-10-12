/** Optional server-only official Higgsfield tariff feed.
 *
 * Higgsfield does NOT currently document a stable public catalog/price feed in
 * the API references reviewed for this integration. Never guess its URL.
 * Enable only after Higgsfield issues a machine-readable account tariff endpoint
 * whose response conforms to the documented adapter contract below.
 *
 * When enabled, a missing/stale/malformed feed means NO PAID GENERATION.
 */
import {createHash} from "node:crypto";
export class LiveTariffError extends Error{}
export type TariffUnit="per_second"|"per_image"|"flat";
export type HfTariff={modelId:string;unit:TariffUnit;usdRate:number;parameters:Record<string,string|number|boolean>};
export type FeedSnapshot={revision:string;fetchedAt:number;tariffs:HfTariff[]};
let cached:FeedSnapshot|null=null;
let inFlight:Promise<FeedSnapshot>|null=null;
const TTL=5*60*1000;
const enabled=()=>process.env.HIGGSFIELD_LIVE_PRICING_ENABLED==="true";
function record(x:unknown):x is Record<string,unknown>{return typeof x==="object"&&x!==null&&!Array.isArray(x);}
export function validateTariffFeed(data:unknown,fetchedAt=Date.now()):FeedSnapshot{
 if(!record(data)||!Array.isArray(data.tariffs)||!data.tariffs.length||data.tariffs.length>10000)
  throw new LiveTariffError("Live provider тарифын жагсаалт буруу.");
 if(typeof data.revision!=="string"||!data.revision.trim()||data.revision.length>140)
  throw new LiveTariffError("Тарифын баталгаат revision байхгүй.");
 const tariffs:HfTariff[]=[],keys=new Set<string>();
 for(const row of data.tariffs){
  if(!record(row)||typeof row.modelId!=="string"||!(/^[A-Za-z0-9][\w./-]{3,180}$/.test(row.modelId)))
   throw new LiveTariffError("Model ID буруу.");
  if(row.unit!=="flat"&&row.unit!=="per_second"&&row.unit!=="per_image")
   throw new LiveTariffError("Тарифын нэгж тодорхойгүй.");
  if(typeof row.usdRate!=="number"||!Number.isFinite(row.usdRate)||row.usdRate<=0||row.usdRate>10000)
   throw new LiveTariffError("Provider USD үнэ буруу.");
  if(!record(row.parameters))throw new LiveTariffError("Тарифын тохиргоо байхгүй.");
  const parameters:Record<string,string|number|boolean>={};
  for(const [k,v] of Object.entries(row.parameters)){
   if(!/^[a-z_][a-z0-9_]*$/.test(k)||typeof v!=="string"&&typeof v!=="boolean"&&typeof v!=="number")
    throw new LiveTariffError("Тарифын параметр тодорхойгүй.");
   if(typeof v==="number"&&!Number.isFinite(v)||typeof v==="string"&&v.length>120)
    throw new LiveTariffError("Тарифын параметр буруу.");
   parameters[k]=v;
  }
  const signature=JSON.stringify([row.modelId,row.unit,Object.entries(parameters).sort()]);
  if(keys.has(signature))throw new LiveTariffError("Давхардсан тариф байна.");
  keys.add(signature);
  tariffs.push({modelId:row.modelId,unit:row.unit,usdRate:row.usdRate,parameters});
 }
 return {revision:data.revision,fetchedAt,tariffs};
}
export async function ensureLiveHiggsfieldTariffs():Promise<void>{
 if(!enabled())return;
 if(cached&&Date.now()-cached.fetchedAt<TTL)return;
 if(!inFlight){
  inFlight=(async()=>{
   const raw=process.env.HIGGSFIELD_TARIFF_FEED_URL;
   if(!raw)throw new LiveTariffError("HIGGSFIELD_TARIFF_FEED_URL тохируулаагүй.");
   let url:URL;
   try{url=new URL(raw);}catch{throw new LiveTariffError("Higgsfield feed URL буруу.");}
   if(url.protocol!=="https:"||url.hostname!=="api.higgsfield.ai"||url.port||url.username||url.password||url.search||url.hash)
    throw new LiveTariffError("Зөвхөн HTTPS api.higgsfield.ai албан endpoint зөвшөөрнө.");
   const credentials=(process.env.HF_CREDENTIALS||process.env.HIGGSFIELD_API_KEY||"").trim();
   if(!credentials)throw new LiveTariffError("Higgsfield API credential тохируулаагүй.");
   const r=await fetch(url.toString(),{method:"GET",headers:{"Authorization":`Key ${credentials}`,"Accept":"application/json"},
     redirect:"error",cache:"no-store",signal:AbortSignal.timeout(12000)});
   if(!r.ok)throw new LiveTariffError(`Provider catalog HTTP ${r.status}`);
   if(Number(r.headers.get("content-length")||0)>1000000)throw new LiveTariffError("Provider feed хэт том.");
   const body=await r.text();
   if(body.length>1000000)throw new LiveTariffError("Provider feed хэт том.");
   const next=validateTariffFeed(JSON.parse(body));
   // Bind published revision to the exact bytes; do not trust a repeated stale revision.
   next.revision=`${next.revision}:${createHash("sha256").update(body).digest("hex").slice(0,12)}`;
   cached=next;
   return next;
  })().finally(()=>{inFlight=null;});
 }
 try{await inFlight;}catch(e){
  cached=null;throw e instanceof LiveTariffError?e:new LiveTariffError("Higgsfield шинэ тариф татаж чадсангүй. Үүсгэлт түр хаалттай.");
 }
}
export function liveProviderCostUsd(modelId:string,input:Record<string,unknown>):number|null{
 if(!enabled())return null; // Existing reviewed price snapshot stays unchanged until the official feed is provisioned.
 if(!cached||Date.now()-cached.fetchedAt>=TTL)
  throw new LiveTariffError("Higgsfield тариф шинэчлэгдээгүй. Кредит суутгахгүй.");
 const candidates=cached.tariffs.filter(t=>t.modelId===modelId&&Object.entries(t.parameters).every(([k,v])=>input[k]===v));
 // A single exact tariff is required. An ambiguous resolution/audio variant is unsafe.
 if(candidates.length!==1)throw new LiveTariffError("Энэ моделийн сонголтын live үнэ тодорхойгүй.");
 const tariff=candidates[0];
 const seconds=Number(input.duration??input.__verifiedClipSeconds);
 const count=Number(input.batch_size??input.num_images??1);
 if(tariff.unit==="per_second"&&(!Number.isFinite(seconds)||seconds<=0||seconds>3600))
  throw new LiveTariffError("Хугацааг баталгаажуулах шаардлагатай.");
 if(tariff.unit==="per_image"&&(!Number.isInteger(count)||count<1||count>100))
  throw new LiveTariffError("Зургийн тоо буруу.");
 return tariff.usdRate*(tariff.unit==="per_second"?seconds:tariff.unit==="per_image"?count:1);
}
export function liveCatalogStatus(){
 return {enabled:enabled(),ready:!!cached&&Date.now()-cached.fetchedAt<TTL,revision:cached?.revision||null,
   fetchedAt:cached?new Date(cached.fetchedAt).toISOString():null,
   catalogCount:cached?.tariffs.length||0};
}
