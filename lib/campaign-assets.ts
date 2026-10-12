import {createHash,createHmac,timingSafeEqual} from 'node:crypto';
export type CampaignAsset={url:string;name:string;mimeType:string;kind:'product'|'video'|'frame';proof:string;data?:string};
const limits={product:2*1024*1024,frame:2*1024*1024,video:100*1024*1024};
function mac(body:string,secret:string){if(secret.length<32)throw new Error('Upload тохиргоо дутуу.');return createHmac('sha256',secret).update('campaign-asset-v1:'+body).digest('base64url');}
export function issueAssetProof(asset:Omit<CampaignAsset,'proof'>,userId:string,secret:string,now=Date.now()){
 const url=new URL(asset.url);if(url.protocol!=='https:'||url.username||url.password)throw new Error('Upload URL буруу.');
 const body=Buffer.from(JSON.stringify({userId,url:asset.url,mimeType:asset.mimeType,kind:asset.kind,sha256:asset.data?createHash('sha256').update(asset.data).digest('hex'):null,expires:now+2*86400000})).toString('base64url');return body+'.'+mac(body,secret);
}
export function verifyAssets(value:unknown,userId:string,secret:string,now=Date.now()):CampaignAsset[]{
 if(value===undefined)return [];
 if(!Array.isArray(value)||value.length>5)throw new Error('Нэг бүтээгдэхүүний зураг, нэг видео, 3 жишиг кадр оруулна.');
 const assets:CampaignAsset[]=value.map(raw=>{
  if(!raw||typeof raw!=='object'||typeof raw.proof!=='string'||raw.proof.length>8000)throw new Error('Upload баталгаа буруу.');
  const [body,sig,...rest]=raw.proof.split('.');if(rest.length||!body||!sig)throw new Error('Upload баталгаа буруу.');
  const expected=Buffer.from(mac(body,secret)),received=Buffer.from(sig);if(expected.length!==received.length||!timingSafeEqual(expected,received))throw new Error('Upload баталгаа хүчингүй.');
  const proof=JSON.parse(Buffer.from(body,'base64url').toString('utf8'));
  if(proof.userId!==userId||proof.url!==raw.url||proof.mimeType!==raw.mimeType||proof.kind!==raw.kind||!Number.isFinite(proof.expires)||proof.expires<now)throw new Error('Файлын эзэмшил эсвэл хугацаа буруу.');
  if(!['product','video','frame'].includes(raw.kind)||typeof raw.name!=='string'||raw.name.length>160)throw new Error('Файлын мэдээлэл буруу.');
  if(raw.kind!=='video'){
   if(typeof raw.data!=='string'||raw.data.length>Math.ceil(limits[raw.kind as 'product'|'frame']*4/3)+4||!/^[A-Za-z0-9+/]+={0,2}$/.test(raw.data)||createHash('sha256').update(raw.data).digest('hex')!==proof.sha256)throw new Error('Зургийн өгөгдөл upload-тай таарахгүй.');
  }else if(raw.data!==undefined)throw new Error('Видео base64 дамжуулахгүй.');
  return {url:raw.url,name:raw.name,mimeType:raw.mimeType,kind:raw.kind,proof:raw.proof,...(raw.data?{data:raw.data}:{})};
 });
 if(assets.filter(a=>a.kind==='product').length>1||assets.filter(a=>a.kind==='video').length>1||assets.filter(a=>a.kind==='frame').length>3)throw new Error('Жишиг файлын тоо хэтэрсэн.');
 if(assets.some(a=>a.kind==='frame')&&!assets.some(a=>a.kind==='video'))throw new Error('Жишиг кадрын эх видео шаардлагатай.');
 if(assets.some(a=>a.kind==='video')&&!assets.some(a=>a.kind==='frame'))throw new Error('Видеоноос жишиг кадр бэлтгэнэ үү.');
 return assets;
}
export function imageSignatureValid(bytes:Uint8Array,mime:string){return mime==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:mime==='image/png'?Buffer.from(bytes.subarray(0,8)).equals(Buffer.from([137,80,78,71,13,10,26,10])):mime==='image/webp'?Buffer.from(bytes.subarray(0,4)).toString()==='RIFF'&&Buffer.from(bytes.subarray(8,12)).toString()==='WEBP':false;}
