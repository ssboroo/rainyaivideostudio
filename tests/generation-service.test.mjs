import test from 'node:test';
import assert from 'node:assert/strict';
import { tsImport } from 'tsx/esm/api';
const { createGenerationService, publicGeneration } = await tsImport('../lib/generation-service.ts', {parentURL:import.meta.url});
const input = { modelSlug: 'seedance-2-5', prompt: 'A cinematic scene at sunset', duration: 5, resolution: '720p', aspectRatio: '16:9' };
function fixture() {
 const rows = []; const calls = { submits: 0, reserves: 0, refunds: 0 }; let credits = 10000;
 const db = { user: { findUnique: async()=>({id:'user-a',name:'User',credits}) }, generation: {
  findFirst: async({where})=>rows.find(row=>Object.entries(where).every(([key,value])=>row[key]===value))??null,
  updateMany:async({where,data})=>{const row=rows.find(row=>row.id===where.id&&row.userId===where.userId&&!where.status.notIn.includes(row.status));if(!row)return{count:0};Object.assign(row,data);return{count:1};},
  count: async()=>0, findMany:async({where})=>rows.filter(row=>row.userId===where.userId),
  update:async({where,data})=>{const row=rows.find(row=>row.id===where.id);Object.assign(row,data);return row;}
 }};
 const deps = { db, expireUserCredits:async()=>{}, env: { higgsfieldCredentials:()=> 'test-id:test-secret', generationRateLimit:()=>6 },
 reserveCredits:async(userId,cost,data)=>{calls.reserves++;credits-=cost;const row={...data,id:'g-'+rows.length,userId,createdAt:new Date(),completedAt:null,refunded:false,output:null};rows.push(row);return row;},
 refundGeneration:async(id)=>{calls.refunds++;const row=rows.find(row=>row.id===id);if(!row.refunded){credits+=row.costCredits;row.refunded=true;}return row;},
 markTerminalAndRefund:async(id,status,output)=>{const row=rows.find(row=>row.id===id);Object.assign(row,{status,output,completedAt:new Date()});if(status!=='COMPLETED')await deps.refundGeneration(id);return row;},
 submitGeneration:async()=>{calls.submits++;return {request_id:'provider-1',status_url:'https://api.higgsfield.ai/private-status'};},
 getGenerationStatus:async()=>({status:'completed',video:{url:'https://cdn.example/video.mp4'}}),cancelGeneration:async()=>({}) };
 return {service:createGenerationService(deps),deps,rows,calls};
}
test('creation retries reuse the same own request and do not submit or bill twice',async()=>{
 const f=fixture();const opts={idempotencyKey:'request-123',maxCredits:10000};
 const first=await f.service.create('user-a',input,opts);const second=await f.service.create('user-a',input,opts);
 assert.equal(first.generation.id,second.generation.id);assert.equal(second.reused,true);assert.equal(f.calls.submits,1);assert.equal(f.calls.reserves,1);
 assert.equal('providerStatusUrl' in first.generation,false);
 await assert.rejects(f.service.create('user-a',{...input,prompt:'Different'},opts),error=>error.status===409);
});
test('credit ceiling and unavailable provider fail before reservation',async()=>{
 const f=fixture();await assert.rejects(f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:0}),error=>error.status===409);
 f.deps.env.higgsfieldCredentials=()=>'';
 await assert.rejects(f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000}),error=>error.status===503);
 assert.equal(f.calls.reserves,0);assert.equal(f.calls.submits,0);
});
test('status and cancellation are scoped to the authenticated user',async()=>{
 const f=fixture();const result=await f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000});
 await assert.rejects(f.service.get('user-b',result.generation.id),error=>error.status===404);
 await assert.rejects(f.service.cancel('user-b',result.generation.id),error=>error.status===404);
 const completed=await f.service.get('user-a',result.generation.id);assert.equal(completed.generation.status,'COMPLETED');assert.equal(completed.generation.media.url,'https://cdn.example/video.mp4');
});
test('provider failures settle and refund without exposing provider errors',async()=>{
 const f=fixture();f.deps.submitGeneration=async()=>{throw Object.assign(new Error('private credentials'),{status:422});};
 await assert.rejects(f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000}),error=>error.status===502&&!error.message.includes('private'));
 assert.equal(f.rows[0].status,'FAILED');assert.equal(f.rows[0].refunded,true);assert.equal(f.calls.refunds,1);
});
test('accepted submissions with persistence failures retain the charge and block resubmission',async()=>{
 const f=fixture();f.deps.db.generation.update=async()=>{throw new Error('Database offline');};
 await assert.rejects(f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000}),error=>error.status===503);
 assert.equal(f.calls.refunds,0);assert.equal(f.calls.submits,1);
 const retry=await f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000});assert.equal(retry.reused,true);assert.equal(f.calls.submits,1);
});
test('public failure summaries never expose credentials, unverified media, or success',()=>{
 const value=publicGeneration({id:'g',modelSlug:'seedance-2-5',kind:'video',status:'NSFW',costCredits:210,refunded:true,createdAt:new Date(),completedAt:null,output:{video:{url:'https://cdn.example/v.mp4'}},providerStatusUrl:'secret',error:{private:'secret'}});
 assert.equal(value.media,null);assert.equal(value.status,'NSFW');assert.equal(JSON.stringify(value).includes('secret'),false);
});
test('moderated and canceled provider states refund and never return a successful video',async()=>{
 for(const providerStatus of ['moderated','canceled']) {
  const f=fixture();const created=await f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000});
  f.deps.getGenerationStatus=async()=>({status:providerStatus,video:{url:'https://cdn.example/unapproved.mp4'}});
  const result=await f.service.get('user-a',created.generation.id);
  assert.equal(result.generation.status,providerStatus==='moderated'?'NSFW':'CANCELED');
  assert.equal(result.generation.refunded,true);assert.equal(result.generation.media,null);assert.equal(f.calls.refunds,1);
 }
});
test('pending submissions cannot be canceled and refunded while submit is in flight',async()=>{
 const f=fixture();const created=await f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000});
 f.rows[0].status='PENDING';f.rows[0].providerRequestId=null;
 await assert.rejects(f.service.cancel('user-a',created.generation.id),error=>error.status===409);
 assert.equal(f.calls.refunds,0);
});
test('timeouts, retryable server failures and missing IDs keep the charge without resubmission',async()=>{
 for(const status of [undefined,408,425,500,502]) {
  const f=fixture();f.deps.submitGeneration=async()=>{f.calls.submits++;throw Object.assign(new Error('private'),{status});};
  await assert.rejects(f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000}),error=>error.status===503);
  assert.equal(f.rows[0].status,'PENDING');assert.equal(f.calls.refunds,0);
  const retry=await f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000});assert.equal(retry.reused,true);assert.equal(f.calls.submits,1);assert.ok(retry.generation.warning);
 }
});
test('transient persistence failures retry only local writes, not the billable submission',async()=>{
 const f=fixture();const update=f.deps.db.generation.update;let attempts=0;
 f.deps.db.generation.update=async(args)=>{attempts++;if(attempts<3)throw new Error('temporary');return update(args);};
 const result=await f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000});
 assert.equal(attempts,3);assert.equal(f.calls.submits,1);assert.equal(f.calls.refunds,0);assert.equal(result.generation.status,'SUBMITTED');
});
test('old pending requests without a provider ID visibly require administrative reconciliation',()=>{
 const g={id:'g',modelSlug:'seedance-2-5',kind:'video',status:'PENDING',costCredits:210,refunded:false,createdAt:new Date(Date.now()-121000),completedAt:null,output:null,providerRequestId:null};
 assert.ok(publicGeneration(g).warning);assert.equal(publicGeneration({...g,providerRequestId:'known'}).warning,undefined);
});
test('a stale processing poll cannot overwrite a concurrently completed result',async()=>{
 const f=fixture();const created=await f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000});
 f.deps.getGenerationStatus=async()=>{Object.assign(f.rows[0],{status:'COMPLETED',output:{video:{url:'https://cdn.example/final.mp4'}},completedAt:new Date()});return{status:'processing'};};
 const result=await f.service.get('user-a',created.generation.id);
 assert.equal(result.generation.status,'COMPLETED');assert.equal(result.generation.media.url,'https://cdn.example/final.mp4');
});
test('definitive rejection retries only local settlement and failed refund recovers on status',async()=>{
 const f=fixture();f.deps.submitGeneration=async()=>{f.calls.submits++;throw Object.assign(new Error('rejected'),{status:422});};
 const update=f.deps.db.generation.update;let writes=0;
 f.deps.db.generation.update=async(args)=>{writes++;if(writes<3)throw new Error('temporary database failure');return update(args);};
 const refund=f.deps.refundGeneration;let refunds=0;
 f.deps.refundGeneration=async(id)=>{refunds++;if(refunds<=3)throw new Error('temporary refund failure');return refund(id);};
 await assert.rejects(f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000}),error=>error.status===503);
 assert.equal(writes,3);assert.equal(refunds,3);assert.equal(f.rows[0].status,'FAILED');assert.equal(f.rows[0].refunded,false);assert.equal(f.calls.submits,1);
 const result=await f.service.get('user-a',f.rows[0].id);assert.equal(result.generation.refunded,true);assert.equal(result.generation.status,'FAILED');assert.equal(f.calls.submits,1);
});
test('permanent refund failure reports pending settlement without claiming credits returned',async()=>{
 const f=fixture();const result=await f.service.create('user-a',input,{idempotencyKey:'request-123',maxCredits:10000});
 f.rows[0].status='FAILED';f.deps.refundGeneration=async()=>{throw new Error('offline');};
 const status=await f.service.get('user-a',result.generation.id);assert.equal(status.generation.refunded,false);assert.ok(status.warning);assert.equal(status.generation.media,null);
});
