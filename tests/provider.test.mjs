import test from 'node:test';
import assert from 'node:assert/strict';
process.env.HF_CREDENTIALS='unit-key:unit-secret';
const hf=await import('../lib/higgsfield.ts');
test('provider uses returned URLs without leaking credentials to a foreign host',async()=>{
 const original=global.fetch,calls=[];
 try{
  global.fetch=async(url,init)=>{calls.push({url,init});return Response.json({status:'in_progress'});};
  await hf.getGenerationStatus('job','https://api.higgsfield.ai/requests/job/status?version=2');
  assert.equal(calls[0].url,'https://api.higgsfield.ai/requests/job/status?version=2');
  await assert.rejects(()=>hf.getGenerationStatus('job','https://evil.example/status'));
  assert.equal(calls.length,1);
 }finally{global.fetch=original;}
});
test('submission uses stable idempotency and cancellation handles an empty 202 response',async()=>{
 const original=global.fetch,calls=[];
 try{
  global.fetch=async(url,init)=>{calls.push({url,init});return url.includes('/cancel')?new Response(null,{status:202}):Response.json({request_id:'job'});};
  await hf.submitGeneration('higgsfield-ai/soul/v2/standard',{prompt:'test'},'generation-a');
  assert.equal(calls[0].init.headers['Idempotency-Key'],'generation-a');
  assert.equal(calls[0].init.headers.Authorization,'Key unit-key:unit-secret');
  assert.deepEqual(await hf.cancelGeneration('job'),{});
 }finally{global.fetch=original;}
});
