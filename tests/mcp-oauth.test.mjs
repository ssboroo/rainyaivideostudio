import test from 'node:test';
import assert from 'node:assert/strict';
import { tsImport } from 'tsx/esm/api';
const oauth = await tsImport('../lib/mcp-oauth.ts', import.meta.url);
const {db} = await tsImport('../lib/db.ts', import.meta.url);
const saved = { secret:process.env.SESSION_SECRET, url:process.env.APP_URL };
process.env.SESSION_SECRET = 'unit-test-secret-do-not-use-production'.repeat(2);
process.env.APP_URL = 'https://ravs.example';
test.after(()=>{if(saved.secret===undefined)delete process.env.SESSION_SECRET;else process.env.SESSION_SECRET=saved.secret;if(saved.url===undefined)delete process.env.APP_URL;else process.env.APP_URL=saved.url;});
test('redirect URIs reject nonsecure, credentials, fragments and javascript',()=>{
 for(const value of ['javascript:alert(1)','http://evil.example/cb','https://user:pass@example.com/cb','https://example.com/cb#fragment',null])assert.equal(oauth.validRedirect(value),false);
 for(const value of ['https://claude.ai/cb','http://localhost:7777/cb','http://127.0.0.1/cb'])assert.equal(oauth.validRedirect(value),true);
});
test('scope and consent enforce user, expiry and tamper protection',()=>{
 assert.deepEqual(oauth.parseScopes('ravs:read ravs:generate offline_access'),['ravs:read','ravs:generate','offline_access']);
 assert.throws(()=>oauth.parseScopes('ravs:read admin'));assert.throws(()=>oauth.parseScopes('ravs:generate'));
 const request={clientId:'unit',redirectUri:'https://claude.ai/cb',challenge:'x'.repeat(43),resource:'https://ravs.example/mcp',scope:'ravs:read',state:'unit'};
 const signed=oauth.signConsent('alice',request,1000);
 assert.deepEqual(oauth.readConsent(signed,'alice',1001),request);
 assert.throws(()=>oauth.readConsent(signed,'bob',1001));assert.throws(()=>oauth.readConsent(signed,'alice',601001));assert.throws(()=>oauth.readConsent(signed+'x','alice',1001));
});
test('PKCE uses RFC 7636 SHA-256 example and metadata advertises exact audience',()=>{
 assert.equal(oauth.pkceChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'),'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
 assert.equal(oauth.protectedResourceMetadata().resource,'https://ravs.example/mcp');
 assert.deepEqual(oauth.oauthMetadata().code_challenge_methods_supported,['S256']);
});
test('body limit rejects a streamed oversized payload',async()=>{
 const req=new Request('https://ravs.example',{method:'POST',body:'123456789'});
 await assert.rejects(oauth.boundedBody(req,4),error=>error.status===413);
});
test('bearer authentication rejects expired, revoked and wrong-audience grants',async()=>{
 const original=db.oAuthToken.findUnique;
 const token='a'.repeat(43);const request=new Request('https://ravs.example/mcp',{headers:{authorization:'Bearer '+token}});
 const row={accessExpiresAt:new Date(Date.now()+60000),revokedAt:null,grantId:'grant',grant:{userId:'alice',scope:'ravs:read',resource:'https://ravs.example/mcp',revokedAt:null}};
 try {
  db.oAuthToken.findUnique=async args=>{assert.equal(args.where.accessHash,oauth.tokenHash(token));return row;};
  assert.deepEqual(await oauth.authenticateMcp(request),{userId:'alice',scopes:['ravs:read'],grantId:'grant'});
  row.grant.resource='https://evil.example/mcp';assert.equal(await oauth.authenticateMcp(request),null);row.grant.resource='https://ravs.example/mcp';
  row.grant.revokedAt=new Date();assert.equal(await oauth.authenticateMcp(request),null);row.grant.revokedAt=null;
  row.accessExpiresAt=new Date(0);assert.equal(await oauth.authenticateMcp(request),null);
  assert.equal(await oauth.authenticateMcp(new Request('https://ravs.example/mcp')),null);
 }finally{db.oAuthToken.findUnique=original;}
});
test('authorization code validates PKCE, redirect and atomic single-use before token creation',async()=>{
 const original=db.$transaction;const verifier='v'.repeat(43);let used=false,stored;
 const code={id:'code',userId:'alice',clientId:'client',scope:'ravs:read offline_access',resource:'https://ravs.example/mcp',redirectUri:'https://claude.ai/cb',challenge:oauth.pkceChallenge(verifier),expiresAt:new Date(Date.now()+60000),usedAt:null};
 const tx={oAuthCode:{findUnique:async()=>({...code,usedAt:used?new Date():null}),updateMany:async()=>{if(used)return{count:0};used=true;return{count:1};}},oAuthGrant:{create:async()=>({id:'grant'})},oAuthToken:{create:async({data})=>{stored=data;}}};
 const params=new URLSearchParams({grant_type:'authorization_code',client_id:'client',resource:code.resource,redirect_uri:code.redirectUri,code:'fake-unit-code',code_verifier:verifier});
 try{db.$transaction=async fn=>fn(tx);
  const wrong=new URLSearchParams(params);wrong.set('code_verifier','w'.repeat(43));await assert.rejects(oauth.exchangeToken(wrong),e=>e.error==='invalid_grant');assert.equal(used,false);
  const result=await oauth.exchangeToken(params);assert.equal(result.token_type,'Bearer');assert.equal(stored.accessHash,oauth.tokenHash(result.access_token));assert.equal(stored.refreshHash,oauth.tokenHash(result.refresh_token));assert.notEqual(stored.accessHash,result.access_token);
  await assert.rejects(oauth.exchangeToken(params),e=>e.error==='invalid_grant');
 }finally{db.$transaction=original;}
});
test('refresh rotation invalidates the old token and preserves user-bound grant',async()=>{
 const original=db.$transaction;let used=false,created;
 const old={id:'old',grantId:'grant',revokedAt:null,refreshExpiresAt:new Date(Date.now()+60000),grant:{clientId:'client',resource:'https://ravs.example/mcp',scope:'ravs:read offline_access',revokedAt:null}};
 const tx={oAuthToken:{findUnique:async()=>({...old,revokedAt:used?new Date():null}),updateMany:async()=>{if(used)return{count:0};used=true;return{count:1};},create:async({data})=>{created=data;}}};
 const params=new URLSearchParams({grant_type:'refresh_token',client_id:'client',resource:old.grant.resource,refresh_token:'fake-unit-refresh'});
 try{db.$transaction=async fn=>fn(tx);const result=await oauth.exchangeToken(params);assert.equal(created.grantId,'grant');assert.equal(created.accessHash,oauth.tokenHash(result.access_token));assert.equal(used,true);await assert.rejects(oauth.exchangeToken(params),e=>e.error==='invalid_grant');}finally{db.$transaction=original;}
});
