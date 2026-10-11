import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getCreditPackages} from "../lib/billing.ts";
import {estimatePackContribution,quoteApiCredits,providerCostUsd,pricingPolicy} from "../lib/api-pricing.ts";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("every monthly subscription tier is solvent in conservative FX, provider, fee and infrastructure stress",()=>{
 const plans=getCreditPackages();
 assert.ok(plans.length>=5);
 const seen=new Set();
 for(const plan of plans){
  assert.ok(plan.validityMonths===1);
  assert.ok(!seen.has(plan.id));seen.add(plan.id);
  const check=estimatePackContribution(plan.priceMnt,plan.credits);
  assert.ok(check.guardPassed,"plan not solvent: "+plan.id);
  assert.ok(check.estimatedContributionMargin>=pricingPolicy.minContribution,plan.id);
 }
});
test("all subscription tiers use one canonical credit value and no unlimited model bypass",()=>{
 const names=getCreditPackages().map(p=>p.id);
 for(const id of ["starter","creator","pro","studio","agency"])assert.ok(names.includes(id));
 const provider=providerCostUsd("kling-video/v3.0/std/text-to-video",{duration:5,resolution:"720p"});
 const credits=quoteApiCredits("kling-video/v3.0/std/text-to-video",{duration:5,resolution:"720p"});
 assert.ok(provider>0&&credits>0);
 for(const plan of getCreditPackages()){
  const effectivePrice=credits*plan.priceMnt/plan.credits;
  assert.ok(effectivePrice>provider*pricingPolicy.usdMnt);
 }
 assert.throws(()=>quoteApiCredits("marketing-studio/image/flare",{resolution:"4k"}));
});
test("Wire verifies paid intent before granting one monthly subscription cycle",()=>{
 const wire=read("lib/wire-payment.ts");
 assert.match(wire,/mapIntentStatus\(intent.status\)!=="PAID"/);
 assert.match(wire,/paymentMatches\(intent,payment\)/);
 assert.match(wire,/payment.status==="PAID"\)return false/);
 assert.match(wire,/status:\{not:"PAID"\}/);
 assert.match(wire,/subscriptionCycle.create/);
 assert.match(wire,/subscription.upsert/);
 assert.match(wire,/creditGrant.create/);
 assert.match(wire,/monthAfter\(now\)/);
 assert.match(wire,/idempotencyKey:\x60wire:/);
 assert.doesNotMatch(wire,/auto.?charge|recurring\.charge|card\.token/i);
});
test("subscription records are private, have unique payment-cycle protection, and backfill never modifies credits",()=>{
 const prisma=read("prisma/schema.prisma");
 const sql=read("prisma/migrations/20261011120000_prepaid_subscription/migration.sql");
 const backfill=read("prisma/migrations/20261011120100_backfill_prepaid_cycles/migration.sql");
 const route=read("app/api/billing/subscription/route.ts");
 assert.match(prisma,/model SubscriptionCycle/);
 assert.match(prisma,/paymentId String @unique/);
 assert.match(prisma,/model Subscription/);
 assert.match(prisma,/userId String @unique/);
 assert.match(sql,/SubscriptionCycle_paymentId_key/);
 assert.match(backfill,/ON CONFLICT \("paymentId"\) DO NOTHING/);
 assert.doesNotMatch(backfill,/UPDATE "User"|UPDATE "CreditGrant"/);
 assert.match(route,/await requireUser\(\)/);
 assert.match(route,/where:\{userId:user.id\}/);
 assert.match(route,/autoRenew:false/);
});
test("unpriced API token/source-dependent variants fail closed and a public quote never starts generation",()=>{
 const route=read("app/api/billing/quote/route.ts");
 assert.match(route,/estimateCredits\(model,duration,input\)/);
 assert.match(route,/providerCostUsd\(model.modelId,input\)/);
 assert.match(route,/model.apiVerified/);
 assert.match(route,/customerMntByPlan/);
 assert.doesNotMatch(route,/createGeneration|reserveCredits|createPaymentIntent/);
});
