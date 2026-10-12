import test from 'node:test';
import assert from 'node:assert/strict';
import {tsImport} from 'tsx/esm/api';
const {consumeEmailToken}=await tsImport('../lib/email-auth.ts',{parentURL:import.meta.url});
const {db}=await tsImport('../lib/db.ts',{parentURL:import.meta.url});
const {POST:resetPassword}=await tsImport('../app/api/auth/reset-password/route.ts',{parentURL:import.meta.url});
const oauth=await tsImport('../lib/mcp-oauth.ts',{parentURL:import.meta.url});

test('token use rolls back when account update fails and succeeds only once',async()=>{
 const original=db.$transaction;
 let consumedAt=null, password='old';
 const tx={emailToken:{findUnique:async()=>({id:'token',userId:'u',kind:'RESET',consumedAt,expiresAt:new Date(Date.now()+60000)}),updateMany:async()=>{if(consumedAt)return{count:0};consumedAt=new Date();return{count:1};}},user:{update:async({data})=>{password=data.passwordHash;}}};
 db.$transaction=async fn=>{const snapshot={consumedAt,password};try{return await fn(tx);}catch(error){({consumedAt,password}=snapshot);throw error;}};
 try {
  await assert.rejects(consumeEmailToken('a'.repeat(40),'RESET',async client=>{await client.user.update({data:{passwordHash:'new'}});throw new Error('update failed');}),/update failed/);
  assert.equal(consumedAt,null);assert.equal(password,'old');
  assert.equal(await consumeEmailToken('a'.repeat(40),'RESET',async client=>{await client.user.update({data:{passwordHash:'new'}});}), 'u');
  assert.equal(password,'new');
  assert.equal(await consumeEmailToken('a'.repeat(40),'RESET',async()=>{throw new Error('must not run');}),null);
 } finally {db.$transaction=original;}
});

test('password reset revokes only its user OAuth access, refresh and unused codes atomically',async()=>{
 const original=db.$transaction, originalFind=db.oAuthToken.findUnique;
 let fail=true;
 let state={passwordHash:'old',consumedAt:null,deleted:false,grants:[{id:'mine',userId:'u',revokedAt:null},{id:'other',userId:'v',revokedAt:null}],codes:[{id:'mine',userId:'u',usedAt:null},{id:'other',userId:'v',usedAt:null}]};
 const updateRows=(rows,where,data)=>{let count=0;for(const row of rows)if(Object.entries(where).every(([key,value])=>row[key]===value)){Object.assign(row,data);count++;}return{count};};
 const tx={user:{update:async({data})=>Object.assign(state,data)},emailToken:{findUnique:async()=>state.deleted?null:({id:'reset',userId:'u',kind:'RESET',consumedAt:state.consumedAt,expiresAt:new Date(Date.now()+60000)}),updateMany:async({data})=>{state.consumedAt=data.consumedAt;return{count:1};},deleteMany:async()=>{if(fail)throw new Error('database unavailable');state.deleted=true;return{count:1};}},oAuthGrant:{updateMany:async({where,data})=>updateRows(state.grants,where,data)},oAuthCode:{updateMany:async({where,data})=>updateRows(state.codes,where,data)}};
 db.$transaction=async fn=>{const snapshot=structuredClone(state);try{return await fn(tx);}catch(error){state=snapshot;throw error;}};
 const request=()=>new Request('http://localhost:3000/api/auth/reset-password',{method:'POST',headers:{'content-type':'application/json','x-forwarded-for':'reset-oauth-test'},body:JSON.stringify({token:'a'.repeat(40),password:'new-password-123'})});
 const bearer='b'.repeat(43), resource=oauth.mcpResourceUrl();
 db.oAuthToken.findUnique=async()=>({id:'access',grantId:'mine',accessExpiresAt:new Date(Date.now()+60000),refreshExpiresAt:new Date(Date.now()+60000),revokedAt:null,grant:{...state.grants[0],clientId:'client',resource,scope:'ravs:read offline_access'}});
 try {
  assert.equal((await resetPassword(request())).status,503);
  assert.equal(state.passwordHash,'old');assert.equal(state.consumedAt,null);assert.equal(state.grants[0].revokedAt,null);assert.equal(state.codes[0].usedAt,null);
  fail=false;assert.equal((await resetPassword(request())).status,200);
  assert.ok(state.grants[0].revokedAt instanceof Date);assert.ok(state.codes[0].usedAt instanceof Date);
  assert.equal(state.grants[1].revokedAt,null);assert.equal(state.codes[1].usedAt,null);
  assert.equal(await oauth.authenticateMcp(new Request(resource,{headers:{authorization:'Bearer '+bearer}})),null);
  const refreshTx={oAuthToken:{findUnique:db.oAuthToken.findUnique}};
  db.$transaction=async fn=>fn(refreshTx);
  await assert.rejects(oauth.exchangeToken(new URLSearchParams({grant_type:'refresh_token',client_id:'client',refresh_token:bearer})),error=>error.error==='invalid_grant');
  const codeTx={oAuthCode:{findUnique:async()=>state.codes[0]}};
  db.$transaction=async fn=>fn(codeTx);
  await assert.rejects(oauth.exchangeToken(new URLSearchParams({grant_type:'authorization_code',client_id:'client',code:'old',code_verifier:'v'.repeat(43)})),error=>error.error==='invalid_grant');
 }finally{db.$transaction=original;db.oAuthToken.findUnique=originalFind;}
});
