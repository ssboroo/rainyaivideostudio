import {models,buildProviderInput,type RavsModel} from "./models.ts";
import {quoteValidatedGeneration} from "./generation-credit-quote.ts";

/**
 * Apples-to-apples budget suggestions: only documented text-to-video API
 * endpoints with the SAME duration, resolution, aspect and audio requirement.
 * No input media or provider generation. Never present a 480p or shorter
 * clip as if it were equivalent to 1080p at the requested duration.
 */
export function affordableVideoModels(input:{
 duration:number;resolution:string;aspectRatio:string;generateAudio:boolean;prompt?:string;
},limit=5){
 if(!Number.isSafeInteger(input.duration)||input.duration<1||input.duration>30||
    !["480p","720p","1080p"].includes(input.resolution)||
    !["16:9","9:16","1:1","4:3","3:4","21:9"].includes(input.aspectRatio))
  throw new Error("Үнийн харьцуулалтын тохиргоо буруу.");
 const prompt=String(input.prompt||"Cinematic camera tracking along a lively city street, natural daylight").slice(0,4000);
 const results:Array<{slug:string;name:string;credits:number;duration:number;resolution:string;modelId:string}>=[];
 for(const model of models){
  if(!model.apiVerified||model.kind!=="video"||!model.modelId.endsWith("/text-to-video"))continue;
  if(!model.resolutions.includes(input.resolution))continue;
  if(!model.aspectRatios.includes(input.aspectRatio)&&!model.aspectRatios.includes("auto"))continue;
  if(input.generateAudio&&!model.supportsAudio)continue;
  if(model.minDuration!==undefined&&input.duration<model.minDuration||model.maxDuration!==undefined&&input.duration>model.maxDuration)continue;
  if(model.durationOptions?.length&&!model.durationOptions.includes(input.duration))continue;
  try{
   const raw={prompt,duration:input.duration,resolution:input.resolution,aspectRatio:input.aspectRatio,
     generateAudio:input.generateAudio};
   const providerInput=buildProviderInput(model,raw);
   const quote=quoteValidatedGeneration(null,model,providerInput);
   if(quote.credits>0)results.push({slug:model.slug,name:model.name,credits:quote.credits,
     duration:input.duration,resolution:input.resolution,modelId:model.modelId});
  }catch{/* Missing config or price: omit, never guess. */}
 }
 const seen=new Set<string>();
 return results.sort((a,b)=>a.credits-b.credits||a.name.localeCompare(b.name)).filter(row=>{
   if(seen.has(row.modelId))return false;seen.add(row.modelId);return true;
 }).slice(0,Math.min(8,Math.max(1,limit)));
}
