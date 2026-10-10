import {type RavsModel, estimateCredits} from "./models.ts";
import {readClipProof} from "./clip-proof.ts";
import {PricingUnavailableError} from "./api-pricing.ts";

/**
 * Single authoritative quote for BOTH /api/pricing/quote and paid generations.
 * The provider input must have already passed buildProviderInput's validation.
 */
export function quoteValidatedGeneration(
 userId:string|null, model:RavsModel, providerInput:Record<string,unknown>, clipToken?:unknown
):{credits:number;verifiedSourceSeconds?:number}{
 if(!model.apiVerified)throw new PricingUnavailableError(model.apiReason||"Моделийн API бэлэн биш.");
 let verifiedSourceSeconds:number|undefined;
 if([
   "higgsfield/genjutsu/motion-transfer/v1.0",
   "higgsfield/genjutsu/restyle/v1.0",
   "higgsfield/genjutsu/object-swap/v1.0",
 ].includes(model.modelId)){
   const video=providerInput.video_url;
   if(typeof video!=="string"||!video)
     throw new PricingUnavailableError("Genjutsu-ийн эх MP4-г 1–30 секунд тайрч бэлтгэнэ үү.");
   if(!userId)throw new PricingUnavailableError("Эх клипийн үнийг баталгаажуулахын тулд нэвтэрнэ үү.");
   const verified=readClipProof(clipToken,userId,video);
   if(verified===null)throw new PricingUnavailableError("Энэ клипийн баталгаа хүчингүй эсвэл хугацаа дууссан. Эх MP4-г дахин бэлтгэнэ үү.");
   verifiedSourceSeconds=verified;
 }
 const ratedInput=verifiedSourceSeconds===undefined?providerInput:{...providerInput,__verifiedClipSeconds:verifiedSourceSeconds};
 const credits=estimateCredits(model,typeof providerInput.duration==="number"?providerInput.duration:undefined,ratedInput);
 if(!Number.isSafeInteger(credits)||credits<=0)
  throw new PricingUnavailableError("Энэ тохиргооны кредитийн үнэ баталгаажаагүй.");
 return {credits,verifiedSourceSeconds};
}
