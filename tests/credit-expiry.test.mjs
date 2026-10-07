import test from 'node:test';
import assert from 'node:assert/strict';
import {tsImport} from 'tsx/esm/api';
const {monthAfter,expireLocked}=await tsImport('../lib/credit-expiry.ts',{parentURL:import.meta.url});
const {db}=await tsImport('../lib/db.ts',{parentURL:import.meta.url});
const {reserveCredits,refundGeneration}=await tsImport('../lib/credits.ts',{parentURL:import.meta.url});
test('one calendar month clamps month end and preserves time',()=>{
 assert.equal(monthAfter(new Date('2026-01-31T09:30:00Z')).toISOString(),'2026-02-28T09:30:00.000Z');
 assert.equal(monthAfter(new Date('2026-10-07T09:30:00Z')).toISOString(),'2026-11-07T09:30:00.000Z');
});
function fixture(){
 const now=new Date();const grants=[{id:'expired',userId:'u',remaining:30,expiresAt:new Date(now-1000)},{id:'active',userId:'u',remaining:70,expiresAt:new Date(+now+86400000)}];
 const user={credits:120};const rows=[];const ledger=[];
 const mutate=(g,data)=>{for(const [k,v] of Object.entries(data))g[k]=typeof v==='object'&&v!==null?g[k]+(v.increment||0)-(v.decrement||0):v;return g;};
 const tx={user:{update:async({data})=>mutate(user,data),updateMany:async({where,data})=>{if(user.credits<where.credits.gte)return{count:0};mutate(user,data);return{count:1};}},creditGrant:{findMany:async({where})=>grants.filter(g=>g.remaining>0&&(where.expiresAt.lte?g.expiresAt<=where.expiresAt.lte:g.expiresAt>where.expiresAt.gt)),findUnique:async({where})=>grants.find(g=>g.id===where.id),update:async({where,data})=>mutate(grants.find(g=>g.id===where.id),data)},creditLedger:{create:async({data})=>{assert.ok(!ledger.some(l=>l.idempotencyKey===data.idempotencyKey));ledger.push(data);}},generation:{create:async({data})=>{const g={...data,id:'g',userId:'u',refunded:false};rows.push(g);return g;},findUnique:async()=>rows[0]||null,update:async({data})=>mutate(rows[0],data)}};
 return{tx,user,grants,rows,ledger};
}
test('expiry removes only unspent monthly allowance once, keeps legacy credits',async()=>{
 const f=fixture();await expireLocked(f.tx,'u',new Date());await expireLocked(f.tx,'u',new Date());assert.equal(f.user.credits,90);assert.equal(f.ledger.length,1);assert.equal(f.ledger[0].amount,-30);assert.equal(f.grants[1].remaining,70);
});
test('monthly credits spent first, refunds cannot revive expired allowances',async()=>{
 const original=db.$transaction;const f=fixture();db.$transaction=async fn=>fn(f.tx);
 try {
  await reserveCredits('u',80,{modelSlug:'test',modelId:'test',kind:'image',prompt:'x',input:{},costCredits:80});
  assert.equal(f.user.credits,10);assert.equal(f.grants[1].remaining,0);assert.equal(f.rows[0].creditAllocation.permanent,10);
  f.grants[1].expiresAt=new Date(Date.now()-1000);
  await refundGeneration('g','failed');await refundGeneration('g','failed');
  assert.equal(f.user.credits,20);assert.equal(f.ledger.filter(l=>l.type==='REFUND').length,1);assert.equal(f.ledger.find(l=>l.type==='REFUND').metadata.expiredRefund,70);
 }finally{db.$transaction=original;}
});
test('refund before expiry restores original grant without extending expiry',async()=>{
 const original=db.$transaction;const f=fixture();db.$transaction=async fn=>fn(f.tx);const expires=f.grants[1].expiresAt;
 try{await reserveCredits('u',40,{modelSlug:'test',modelId:'test',kind:'image',prompt:'x',input:{},costCredits:40});await refundGeneration('g','failed');assert.equal(f.user.credits,90);assert.equal(f.grants[1].remaining,70);assert.equal(f.grants[1].expiresAt,expires);}finally{db.$transaction=original;}
});
test('monthly payment grants once and starts expiry at settlement',async()=>{
 const {confirmWirePayment}=await tsImport('../lib/wire-payment.ts',{parentURL:import.meta.url});
 const original=db.$transaction;const f=fixture();let granted=0;let grantData;
 const payment={id:'p',userId:'u',status:'PENDING',amountMnt:90000,credits:10000,validityMonths:1,packageId:'creator',providerData:null};
 f.tx.payment={findUnique:async()=>payment,updateMany:async({data})=>{if(payment.status==='PAID')return{count:0};Object.assign(payment,data);return{count:1};}};
 f.tx.creditGrant.create=async({data})=>{granted++;grantData=data;return data;};db.$transaction=async fn=>fn(f.tx);
 try {const intent={id:'intent',status:'succeeded',currency:'MNT',amount:90000};await confirmWirePayment('p',intent);await confirmWirePayment('p',intent);assert.equal(granted,1);assert.equal(f.user.credits,10090);assert.equal(grantData.remaining,10000);assert.ok(grantData.expiresAt>Date.now());}finally{db.$transaction=original;}
});
