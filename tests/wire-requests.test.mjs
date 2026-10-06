import test from "node:test";
import assert from "node:assert/strict";
process.env.WIRE_MN_API_KEY="sk_live_local_mock_only";
process.env.WIRE_MN_API_URL="https://api.wire.mn/v1";
delete process.env.WIRE_MN_ALLOWED_OPERATORS;
const {createPaymentIntent,createCheckoutSession}=await import("../lib/wire.ts");
test("Wire requests use whole MNT, bearer auth and stable idempotency keys",async()=>{
 const original=global.fetch,calls=[];
 try{
  global.fetch=async(url,opts)=>{calls.push({url,...opts});return Response.json(url.toString().includes("checkout")?{id:"cs_mock",url:"https://pay.wire.mn/c/mock",payment_intent:"pi_mock"}:{id:"pi_mock",amount:500,currency:"MNT",status:"requires_payment_method"})};
  await createPaymentIntent({paymentId:"pay-a",amount:500});await createPaymentIntent({paymentId:"pay-a",amount:500});
  const a=JSON.parse(calls[0].body);assert.equal(a.amount,500);assert.equal(a.currency,"MNT");assert.equal(a.allowed_operators,undefined);assert.equal(calls[0].headers.Authorization,"Bearer sk_live_local_mock_only");assert.equal(calls[0].headers["Idempotency-Key"],calls[1].headers["Idempotency-Key"]);
  await createCheckoutSession({paymentId:"pay-a",paymentIntentId:"pi_mock",successUrl:"https://ravs.example/billing"});
  assert.equal(new URLSearchParams(calls[2].body).get("payment_intent"),"pi_mock");
 }finally{global.fetch=original}
});
