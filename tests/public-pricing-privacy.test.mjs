import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read = (name) => readFileSync(new URL("../"+name,import.meta.url),"utf8");

test("public billing UI only advertises packages, credits and consumer conditions",()=>{
 const billing=read("components/billing-client.tsx");
 const calculator=read("components/model-pricing-simulator.tsx");
 for(const s of [billing,calculator]){
  assert.doesNotMatch(s,/net.cost.markup|contribution.margin|(?:fx.?stress)|apiCostUsd|apiCostMntScenario|minimumNetCostMarkup/i);
  assert.doesNotMatch(s,/дотоод ханш|валютын зөрүү|татвар болон сервер|нөөц зардал|provider-ийн токен/i);
 }
 assert.match(billing,/₮/);
 assert.match(billing,/Эцсийн|шаардагдах кредит|Кредит/);
 assert.match(calculator,/quote\.credits/);
});

test("public API never serializes provider USD cost or internal pricing policy",()=>{
 const route=read("app/api/billing/quote/route.ts");
 assert.doesNotMatch(route,/apiCostUsd|apiCostMntScenario|customerMntByPlan|providerDiscountExcluded|usdMntAssumption|fxStress/);
 assert.doesNotMatch(route,/policy:\{/);
 assert.match(route,/credits,approximate:true/);
 assert.match(route,/estimateCredits\(model,duration,input\)/);
});

test("pricing engine cannot be imported by browser-visible model catalog",()=>{
 const catalog=read("lib/models.ts");
 const engine=read("lib/model-credit-estimate.ts");
 const studio=read("components/studio-client.tsx");
 assert.doesNotMatch(catalog,/api-pricing|providerCostUsd|quoteApiCredits|estimateCredits/);
 assert.match(engine,/quoteApiCredits/);
 assert.doesNotMatch(studio,/api-pricing|model-credit-estimate/);
});

test("profitability analysis and detailed provider tariffs remain admin guarded",()=>{
 const admin=read("app/api/admin/pricing-economics/route.ts");
 const page=read("app/admin/page.tsx");
 assert.match(admin,/requireAdmin\(\)/);
 assert.match(admin,/getPricingScenario\(\)/);
 assert.match(admin,/providerUsd/);
 assert.match(page,/user.role !== "ADMIN"/);
});
