import {createCipheriv,createDecipheriv,createHash,randomBytes} from 'node:crypto';
import {db} from './db.ts';
function cipherKey(){const secret=process.env.SESSION_SECRET||'';if(secret.length<32)throw new Error('Server credential encryption тохируулаагүй.');return createHash('sha256').update('studio-voice:'+secret).digest();}
function encrypt(value:string){const iv=randomBytes(12),c=createCipheriv('aes-256-gcm',cipherKey(),iv);const body=Buffer.concat([c.update(value,'utf8'),c.final()]);return Buffer.concat([iv,c.getAuthTag(),body]).toString('base64');}
function decrypt(value:string){const b=Buffer.from(value,'base64');const d=createDecipheriv('aes-256-gcm',cipherKey(),b.subarray(0,12));d.setAuthTag(b.subarray(12,28));return Buffer.concat([d.update(b.subarray(28)),d.final()]).toString('utf8');}
export async function voiceAccessToken(){
 const refresh=process.env.STUDIO_VOICE_REFRESH_TOKEN,client=process.env.STUDIO_VOICE_CLIENT_ID;
 if(!refresh||!client)throw new Error('Voice server OAuth тохируулаагүй.');
 await db.$executeRawUnsafe('INSERT INTO "StudioVoiceConnection"("id","refreshCipher","expiresAt") VALUES(\'merchant\',$1,to_timestamp(0)) ON CONFLICT("id") DO NOTHING',encrypt(refresh));
 return db.$transaction(async tx=>{
  const [row]=await tx.$queryRawUnsafe<{refreshCipher:string;accessCipher:string|null;expiresAt:Date}[]>('SELECT * FROM "StudioVoiceConnection" WHERE "id"=\'merchant\' FOR UPDATE');
  if(row.accessCipher&&row.expiresAt.getTime()>Date.now()+120000)return decrypt(row.accessCipher);
  const r=await fetch(voiceOrigin()+'/oauth/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({grant_type:'refresh_token',client_id:client,refresh_token:decrypt(row.refreshCipher),resource:voiceOrigin()+'/mcp'}),redirect:'error',cache:'no-store',signal:AbortSignal.timeout(15000)});
  if(!r.ok)throw new Error('Voice OAuth эрхийг дахин холбох шаардлагатай.');
  const value=await r.json();
  if(typeof value.access_token!=='string'||typeof value.refresh_token!=='string'||!Number.isFinite(value.expires_in)||value.expires_in<1)throw new Error('Voice OAuth хариу буруу.');
  await tx.$executeRawUnsafe('UPDATE "StudioVoiceConnection" SET "refreshCipher"=$1,"accessCipher"=$2,"expiresAt"=$3,"updatedAt"=now() WHERE "id"=\'merchant\'',encrypt(value.refresh_token),encrypt(value.access_token),new Date(Date.now()+Math.min(value.expires_in,3600)*1000));
  return value.access_token as string;
 },{timeout:25000});
}
/** Merchant-owned Voice connection. This token never enters a browser. */
export function voiceOrigin(){
 const url=new URL(process.env.STUDIO_VOICE_ORIGIN||'https://voice.rainy.studio');
 if(url.protocol!=='https:'||url.username||url.password||url.pathname!=='/')throw new Error('Voice origin тохиргоо буруу.');
 return url.origin;
}
export async function voiceTool(name:string,args:Record<string,unknown>={}){
 const token=await voiceAccessToken();
 const r=await fetch(voiceOrigin()+'/mcp',{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json',Accept:'application/json, text/event-stream','MCP-Protocol-Version':'2025-03-26'},body:JSON.stringify({jsonrpc:'2.0',id:crypto.randomUUID(),method:'tools/call',params:{name,arguments:args}}),redirect:'error',cache:'no-store',signal:AbortSignal.timeout(45000)});
 if(!r.ok)throw new Error(`Voice холболт боломжгүй (${r.status}).`);
 const reply=await r.json();
 if(reply.error||reply.result?.isError)throw new Error('Voice хүсэлт амжилтгүй. Холболт, үлдэгдэл, тохиргоог шалгана уу.');
 const block=reply.result?.content?.find((b:{type:string})=>b.type==='text');
 if(!block)throw new Error('Voice хариу буруу.');
 const value=JSON.parse(block.text);
 if(!value||typeof value!=='object')throw new Error('Voice өгөгдөл буруу.');
 return value as Record<string,any>;
}
export function artifactPath(url:string){
 const parsed=new URL(url);
 if(parsed.origin!==voiceOrigin()||!/^\/api\/artifacts\/[A-Za-z0-9_-]{1,100}$/.test(parsed.pathname)||parsed.search||parsed.hash)throw new Error('Бүтээлийн холбоос буруу.');
 return parsed.pathname;
}
