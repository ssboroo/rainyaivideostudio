import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const axios=createRequire(import.meta.url)('axios');
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
test('SDK submission uses stable idempotency and cancellation handles empty 202',async()=>{
 const originalFetch=global.fetch,originalAdapter=axios.defaults.adapter,calls=[];
 try{
  axios.defaults.adapter=async config=>{calls.push(config);return {data:{request_id:'job',status:'queued'},status:200,statusText:'OK',headers:{},config};};
  await hf.submitGeneration('bytedance/seedance-2.5/text-to-video',{prompt:'test'},'generation-a');
  assert.equal(calls[0].headers.get('Idempotency-Key'),'generation-a');
  assert.equal(calls[0].headers.get('Authorization'),'Key unit-key:unit-secret');
  assert.equal(calls[0].url,'/bytedance/seedance-2.5/text-to-video');
  global.fetch=async()=>new Response(null,{status:202});
  assert.deepEqual(await hf.cancelGeneration('job'),{});
 }finally{axios.defaults.adapter=originalAdapter;global.fetch=originalFetch;}
});
test('SDK failures never include raw request headers or provider payload',async()=>{
 const original=axios.defaults.adapter;
 try{axios.defaults.adapter=async()=>{throw new Error('private provider exception');};await assert.rejects(()=>hf.submitGeneration('model',{prompt:'test'}),e=>!e.message.includes('private'));}
 finally{axios.defaults.adapter=original;}
});
