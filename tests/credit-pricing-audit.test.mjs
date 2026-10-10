import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getCreditPackages,getPricingScenario} from "../lib/billing.ts";
import {estimatePackContribution,pricingPolicy} from "../lib/api-pricing.ts";
import {getVideoCreditExamples} from "../lib/package-video-examples.ts";
import {getModel,buildProviderInput,estimateCredits} from "../lib/models.ts";
import {tsImport} from "tsx/esm/api";
const {quoteValidatedGeneration}=await tsImport("../lib/generation-credit-quote.ts",{parentURL:import.meta.url});
const read=p=>readFileSync(new URL("../"+p,import.meta.url),"utf8");

test("every real package clears 70% markup on provider cost AFTER 10% FX stress and 21% fee/tax/platform reserves",()=>{
 const packages=getCreditPackages();
 assert.ok(packages.length>=5);
 for(const p of packages){
  const a=estimatePackContribution(p.priceMnt,p.credits);
  assert.ok(a.guardPassed,p.name);
  assert.ok(a.netCostMarkup>=.70,p.name+" has only "+(a.netCostMarkup*100)+"% net cost markup");
  assert.ok(a.estimatedContributionMargin>=pricingPolicy.minContribution,p.name);
  assert.ok(a.unitMnt>=pricingPolicy.minimumPackMntPerCredit,p.name);
 }
 assert.equal(getPricingScenario().minimumNetCostMarkup,.70);
 assert.equal(packages.find(p=>p.id==="starter")?.credits,3000);
 assert.equal(packages.find(p=>p.id==="agency")?.credits,95000);
});

test("underpriced credit pack is rejected even if valid JSON",()=>{
 const old=process.env.CREDIT_PACKAGES_JSON;
 try{
  process.env.CREDIT_PACKAGES_JSON=JSON.stringify([{id:"unsafe",name:"Unsafe",priceMnt:100000,credits:12000,validityMonths:1}]);
  assert.throws(()=>getCreditPackages(),/Ашгийн хамгаалалт/);
 }finally{if(old===undefined)delete process.env.CREDIT_PACKAGES_JSON;else process.env.CREDIT_PACKAGES_JSON=old;}
});

test("all published packages show non-fictional video counts from verified provider parameters",()=>{
 const packs=getCreditPackages(), examples=getVideoCreditExamples(packs);
 assert.equal(examples.length,packs.length);
 for(const p of examples){
  assert.ok(p.examples.length>=2,p.name+" has no real samples");
  for(const e of p.examples){
   assert.ok(Number.isSafeInteger(e.creditsPerVideo)&&e.creditsPerVideo>0);
   assert.equal(e.approxVideos,Math.floor(p.credits/e.creditsPerVideo));
   assert.equal(e.duration,5);
  }
  assert.ok(p.examples.some(e=>e.approxVideos>=1),p.name+" does not allow a single video");
 }
});

test("paid generation and no-charge endpoint reuse same server quote function",()=>{
 const m=getModel("seedance-2-5");
 assert.ok(m?.apiVerified);
 const input=buildProviderInput(m,{prompt:"Rainy studio five second video",duration:5,resolution:"720p",aspectRatio:"9:16"});
 assert.equal(quoteValidatedGeneration(null,m,input).credits,estimateCredits(m,5,input));
 const route=read("app/api/pricing/quote/route.ts");
 const service=read("lib/generation-service.ts");
 const ui=read("components/studio-client.tsx");
 assert.match(route,/quoteValidatedGeneration\(user\?\.id\|\|null,model,input,raw\.clipToken\)/);
 assert.match(service,/quoteValidatedGeneration\(userId,model,input,raw\.clipToken\)/);
 assert.match(service,/const replay = await existing\(\);[\s\S]*?if \(replay\) return replay;[\s\S]*?quoteValidatedGeneration/);
 assert.match(ui,/fetch\("\/api\/pricing\/quote"/);
 assert.match(ui,/!pricingPending && !pricingError && cost>0/);
 assert.match(ui,/maxCredits: cost/);
 assert.match(read("components/billing-client.tsx"),/approxVideos/);
});
