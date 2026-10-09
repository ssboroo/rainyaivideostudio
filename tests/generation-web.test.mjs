import test from 'node:test';
import assert from 'node:assert/strict';
import { tsImport } from 'tsx/esm/api';
const {createGenerationHandlers} = await tsImport('../lib/generation-http.ts',{parentURL:import.meta.url});
const {generationAttempt,clearGenerationAttempt} = await tsImport('../lib/generation-attempt.ts',{parentURL:import.meta.url});
const {env} = await tsImport('../lib/env.ts',{parentURL:import.meta.url});
function fixture(user={id:'owner'}) {
 const calls=[];
 const handlers=createGenerationHandlers({user:async()=>user,create:async(...args)=>{calls.push(args);return{generation:{id:'g'}};},list:async(id)=>{calls.push(id);return{generations:[],credits:42};},get:async(...args)=>{calls.push(args);return{generation:{id:'g'}};},cancel:async(...args)=>{calls.push(args);return{generation:{id:'g'}};}});
 return{handlers,calls};
}
const request=body=>new Request('https://example.test/api/generations',{method:'POST',body:typeof body==='string'?body:JSON.stringify(body)});
test('web endpoints require authentication before touching account or provider',async()=>{
 const f=fixture(null);
 for(const response of [await f.handlers.list(),await f.handlers.create(request({})),await f.handlers.detail('g'),await f.handlers.detail('g',true)])assert.equal(response.status,401);
 assert.equal(f.calls.length,0);
});
test('web creation passes authenticated ownership, retry ID and approved ceiling to shared service',async()=>{
 const f=fixture();const response=await f.handlers.create(request({modelSlug:'model',prompt:'test',userId:'attacker',idempotencyKey:'attempt-123',maxCredits:500}));
 assert.equal(response.status,202);assert.equal(response.headers.get('cache-control'),'no-store');
 assert.equal(f.calls[0][0],'owner');assert.deepEqual(f.calls[0][2],{idempotencyKey:'attempt-123',maxCredits:500});
 assert.equal('idempotencyKey' in f.calls[0][1],false);
});
test('malformed, oversized and missing approval requests cannot reach billable creation',async()=>{
 const f=fixture();
 for(const body of ['{','null','[]',{}, {idempotencyKey:'attempt-123',maxCredits:'500'}])assert.equal((await f.handlers.create(request(body))).status,400);
 assert.equal((await f.handlers.create(request('x'.repeat(65537)))).status,413);assert.equal(f.calls.length,0);
});
test('history preserves credit compatibility and uses authenticated detail and cancellation',async()=>{
 const f=fixture();const response=await f.handlers.list();assert.deepEqual((await response.json()).user,{credits:42});
 await f.handlers.detail('g');await f.handlers.detail('g',true);assert.deepEqual(f.calls,['owner',['owner','g'],['owner','g']]);
});
test('private service errors never leak through web adapter',async()=>{
 const handlers=createGenerationHandlers({user:async()=>{throw new Error('provider-secret');}});
 const response=await handlers.list();assert.equal(response.status,503);assert.equal((await response.text()).includes('provider-secret'),false);
});
test('ambiguous retries survive refresh without storing prompts and remain scoped to account',async()=>{
 const values=new Map();const storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
 const first=await generationAttempt('owner','private prompt',null,storage);
 assert.equal((await generationAttempt('owner','private prompt',null,storage)).key,first.key);
 assert.notEqual((await generationAttempt('other','private prompt',null,storage)).key,first.key);
 assert.notEqual((await generationAttempt('owner','changed prompt',first,storage)).key,first.key);
 assert.equal([...values.values()].join('').includes('private prompt'),false);
 clearGenerationAttempt('owner',storage);assert.equal(values.has('ravs-attempt:owner'),false);
});
test('signup credits require an explicit valid funded promotion',()=>{
 const original=process.env.WELCOME_CREDITS;
 try {
  for(const value of [undefined,'-1','1.5','invalid','2147483648']){if(value===undefined)delete process.env.WELCOME_CREDITS;else process.env.WELCOME_CREDITS=value;assert.equal(env.welcomeCredits(),0);}
  process.env.WELCOME_CREDITS='100';assert.equal(env.welcomeCredits(),100);
 }finally{if(original===undefined)delete process.env.WELCOME_CREDITS;else process.env.WELCOME_CREDITS=original;}
});
