import test from 'node:test';
import assert from 'node:assert/strict';
import { tsImport } from 'tsx/esm/api';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { WebStandardStreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js';
const {createRavsMcpServer}=await tsImport('../lib/mcp-server.ts',import.meta.url);
function fixture(scopes=['ravs:read','ravs:generate']) {
 const calls=[];const services=Object.fromEntries(['createUserGeneration','getUserGeneration','cancelUserGeneration','listUserGenerations','getUserAccount'].map(name=>[name,async(...args)=>{calls.push([name,...args]);return{name,status:'SUBMITTED'}}]));
 const server=createRavsMcpServer({userId:'own-user',grantId:'test-grant',scopes},services);
 return{server,calls};
}
async function connected(scopes){const f=fixture(scopes);const [clientTransport,serverTransport]=InMemoryTransport.createLinkedPair();const client=new Client({name:'test-client',version:'1.0.0'});await f.server.connect(serverTransport);await client.connect(clientTransport);return{...f,client,close:async()=>{await client.close();await f.server.close()}};}
test('SDK advertises all nine tools and a Mongolian campaign prompt',async()=>{
 const f=await connected();try{const tools=await f.client.listTools();assert.equal(tools.tools.length,9);assert.ok(tools.tools.every(t=>t.description));assert.equal((await f.client.listPrompts()).prompts[0].name,'mongolian_campaign');const res=await f.client.callTool({name:'ravs_model_guide',arguments:{modelSlug:'seedance-2-5'}});const guide=JSON.parse(res.content[0].text);assert.equal(guide.name,'Seedance 2.5');assert.ok(guide.parameters.some(p=>p.name==='duration'));}finally{await f.close()}
});
test('read-only grant hides mutations and own account identity is server controlled',async()=>{
 const f=await connected(['ravs:read']);try{const names=(await f.client.listTools()).tools.map(t=>t.name);assert.equal(names.length,7);assert.ok(!names.includes('ravs_create_generation'));await f.client.callTool({name:'ravs_account',arguments:{userId:'another-user'}});assert.equal(f.calls[0][1],'own-user');const r=await f.client.callTool({name:'ravs_create_generation',arguments:{}});assert.equal(r.isError,true);assert.equal(f.calls.length,1);}finally{await f.close()}
});
test('create requires explicit confirmation and routes fixed user, max credits and idempotency',async()=>{
 const f=await connected();try{const args={modelSlug:'seedance-2-5',input:{prompt:'A cinematic scene at sunset',duration:5,resolution:'720p',aspectRatio:'16:9'},maxCredits:210,idempotencyKey:'request-1234567890'};const no=await f.client.callTool({name:'ravs_create_generation',arguments:args});assert.equal(no.isError,true);assert.equal(f.calls.length,0);await f.client.callTool({name:'ravs_create_generation',arguments:{...args,confirmGeneration:true}});assert.equal(f.calls[0][1],'own-user');assert.deepEqual(f.calls[0][3],{maxCredits:210,idempotencyKey:args.idempotencyKey});}finally{await f.close()}
});
test('estimate validates real model schema and does not call a paid provider',async()=>{
 const f=await connected();try{const response=await f.client.callTool({name:'ravs_estimate',arguments:{modelSlug:'seedance-2-5',input:{prompt:'A cinematic scene at sunset',duration:5,resolution:'720p',aspectRatio:'16:9'}}});assert.equal(JSON.parse(response.content[0].text).credits,2190);const bad=await f.client.callTool({name:'ravs_estimate',arguments:{modelSlug:'seedance-2-5',input:{prompt:'a',duration:5,resolution:'4k'}}});assert.ok(JSON.parse(bad.content[0].text).error);assert.equal(f.calls.length,0);}finally{await f.close()}
});
test('WebStandard stateless transport handles initialize and tools/list in independent requests',async()=>{
 for(const message of [{jsonrpc:'2.0',id:1,method:'initialize',params:{protocolVersion:'2025-11-25',capabilities:{},clientInfo:{name:'test',version:'1'}}},{jsonrpc:'2.0',id:2,method:'tools/list',params:{}}]){
 const {server}=fixture();const transport=new WebStandardStreamableHTTPServerTransport({enableJsonResponse:true,maxRequestBodySize:131072});await server.connect(transport);try{const r=await transport.handleRequest(new Request('https://example.com/mcp',{method:'POST',headers:{'content-type':'application/json',accept:'application/json, text/event-stream','mcp-protocol-version':'2025-11-25'},body:JSON.stringify(message)}));assert.equal(r.status,200);const data=await r.json();assert.ok(data.result);if(message.method==='tools/list')assert.equal(data.result.tools.length,9);}finally{await server.close()}
 }
});
