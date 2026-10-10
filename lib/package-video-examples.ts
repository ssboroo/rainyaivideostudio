import {getModel,buildProviderInput,estimateCredits} from "./models.ts";
import type {CreditPackage} from "./billing.ts";

/** Informational ONLY: same model parameters and API credit estimator as Studio.
 * These are 5-second 720p example prices, NOT guaranteed output counts.
 * Final quote is confirmed server-side immediately before a paid generation.
 */
const sampleVideoModels=[
 {slug:"kling-3-standard",label:"Kling 3.0 Standard"},
 {slug:"wan-3-prime",label:"Wan 3.0 Prime"},
 {slug:"seedance-2-5",label:"Seedance 2.5"},
];
export function getVideoCreditExamples(packs:CreditPackage[]) {
 const examples=sampleVideoModels.flatMap(sample=>{
  const model=getModel(sample.slug);
  if(!model?.apiVerified||!model.resolutions.some(r=>r==="720p"||r==="auto"))return [];
  const duration=5,resolution="720p",aspectRatio="9:16";
  const displayResolution=model.resolutions.includes("720p")?"720p":"Стандарт";
  try{
   const actual=buildProviderInput(model,{prompt:"A short cinematic product scene",duration,resolution,aspectRatio});
   const credits=estimateCredits(model,duration,actual);
   if(!Number.isSafeInteger(credits)||credits<=0)return [];
   return [{modelSlug:sample.slug,name:sample.label,duration,resolution:displayResolution,creditsPerVideo:credits}];
  }catch{return [];}
 });
 return packs.map(pack=>({
  ...pack,
  examples:examples.map(x=>({...x,approxVideos:Math.floor(pack.credits/x.creditsPerVideo)}))
 }));
}
