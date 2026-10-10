import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getCreditPackages,getPricingScenario} from "../lib/billing.ts";
import {pricingPolicy,estimatePackContribution,quoteApiCredits} from "../lib/api-pricing.ts";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("all five video-ready monthly packs meet the 70% net cost markup floor",()=>{
 const packages=getCreditPackages();
 assert.deepEqual(packages.map(x=>x.priceMnt),[29900,69900,179000,449000,899000]);
 assert.deepEqual(packages.map(x=>x.credits),[3000,7400,19000,48000,95000]);
 for(const pack of packages){
  const audit=estimatePackContribution(pack.priceMnt,pack.credits);
  assert.ok(audit.guardPassed,pack.name);
  assert.ok(audit.estimatedContributionMargin>=pricingPolicy.minContribution);
   assert.ok(audit.netCostMarkup>=pricingPolicy.minimumNetCostMarkup);
  assert.ok(audit.unitMnt>=pricingPolicy.minimumPackMntPerCredit);
  assert.equal(pack.validityMonths,1);
 }
 assert.equal(pricingPolicy.reviewedAt,"2026-10-11");
 assert.equal(pricingPolicy.usdMnt,3900);
 assert.equal(pricingPolicy.markup,1.15);
});

test("external pricing overrides must not silently destroy margins",()=>{
 const initial=process.env.CREDIT_PACKAGES_JSON;
 try{
  for(const entry of [
   [{id:"cheap",name:"Too cheap",priceMnt:10000,credits:1500,validityMonths:1}],
   [{id:"micro",name:"Below floor",priceMnt:24900,credits:2900,validityMonths:1}],
   [{id:"invalid",name:"Broken",priceMnt:24900,credits:2500,validityMonths:2}],
   [{id:"ok",name:"First",priceMnt:24900,credits:2500,validityMonths:1},{id:"ok",name:"Second",priceMnt:24900,credits:2500,validityMonths:1}],
   [{id:"bad/../",name:"Bad",priceMnt:24900,credits:2500,validityMonths:1}]
  ]){
   process.env.CREDIT_PACKAGES_JSON=JSON.stringify(entry);assert.throws(()=>getCreditPackages());
  }
  process.env.CREDIT_PACKAGES_JSON=JSON.stringify([{id:"sale-ok",name:"Limited",priceMnt:30000,credits:3000,validityMonths:1}]);
  assert.equal(getCreditPackages()[0].id,"sale-ok");
 }finally{
  if(initial===undefined)delete process.env.CREDIT_PACKAGES_JSON;
  else process.env.CREDIT_PACKAGES_JSON=initial;
 }
});

test("emergency API pricing hold disables new credits but does not disable billing or history",()=>{
 const prior=process.env.RAVS_PRICING_HOLD;
 try{
  process.env.RAVS_PRICING_HOLD="true";
  assert.throws(()=>quoteApiCredits("kling-video/v3.0/std/text-to-video",{duration:5,resolution:"720p"}),/түр зогссон/);
  assert.equal(getCreditPackages().length,5);
 }finally{
  if(prior===undefined)delete process.env.RAVS_PRICING_HOLD;else process.env.RAVS_PRICING_HOLD=prior;
 }
});

test("admin-only scenario shows reservations, no automatic recurring payments",()=>{
 const scenario=getPricingScenario();
 assert.equal(scenario.apiMarkupMultiplier,2.15);
 assert.equal(scenario.packages.length,5);
 assert.ok(scenario.assumptions.includes("баталгаат net profit биш"));
 const page=read("components/billing-client.tsx");
 const admin=read("components/admin-client.tsx");
 const server=read("app/api/admin/pricing-economics/route.ts");
 assert.match(page,/Автомат renewal/);
 assert.match(page,/Нэг удаа төлж идэвхжүүлэх/);
 assert.match(page,/subscription биш/);
 assert.match(page,/toFixed\(2\)/);
 assert.match(admin,/Сценарийн үлдэх хувь/);
 assert.match(server,/requireAdmin/);
 assert.match(server,/Cache-Control/);
 assert.match(server,/models\.map\(model=>/);
 assert.match(server,/apiVerified/);
 assert.match(server,/sample_quoted/);
 assert.match(server,/quote_unavailable/);
 assert.match(admin,/economics\.modelCatalog/);

 assert.doesNotMatch(server,/wireApiKey|higgsfieldCredentials/);
});
