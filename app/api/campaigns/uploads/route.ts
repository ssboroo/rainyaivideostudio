import {NextResponse} from 'next/server';
import {requireUser} from '@/lib/http';
import {env} from '@/lib/env';
import {createSignedUpload} from '@/lib/higgsfield';
import {consumeAuthLimit} from '@/lib/auth-security';
import {CampaignAsset,issueAssetProof,imageSignatureValid} from '@/lib/campaign-assets';
export const runtime='nodejs';
export async function POST(req:Request){
 const user=await requireUser();if(!user)return NextResponse.json({error:'Файл оруулахын өмнө нэвтэрнэ үү.'},{status:401});
 if(!consumeAuthLimit('campaign-upload:'+user.id,12,60000).allowed)return NextResponse.json({error:'Түр хүлээгээд дахин оролдоно уу.'},{status:429});
 const maximum=102*1024*1024;
 try{
  if(Number(req.headers.get('content-length')||0)>maximum)throw new Error('Видео 100MB-аас бага байна.');
  const reader=req.body?.getReader();if(!reader)throw new Error('Файл байхгүй.');
  const chunks:Uint8Array[]=[];let size=0;
  while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>maximum){await reader.cancel();throw new Error('Файл хэт том.');}chunks.push(value);}
  const body=new Uint8Array(Buffer.concat(chunks));
  const form=await new Response(body,{headers:{'Content-Type':req.headers.get('content-type')||''}}).formData();
  const file=form.get('file'),kind=form.get('kind');
  if(!(file instanceof File)||!['product','video','frame'].includes(String(kind)))throw new Error('Файл болон төрөл буруу.');
  const video=kind==='video',limit=(video?100:2)*1024*1024;
  if(!file.size||file.size>limit)throw new Error(video?'Видео 100MB-аас бага байна.':'Зураг 2MB-аас бага байна.');
  const bytes=new Uint8Array(await file.arrayBuffer());
  if(video){if(file.type!=='video/mp4'||Buffer.from(bytes.subarray(4,8)).toString()!=='ftyp')throw new Error('MP4 видео оруулна уу.');}
  else if(!imageSignatureValid(bytes,file.type))throw new Error('JPG, PNG, WebP зураг оруулна уу.');
  const signed=await createSignedUpload(file.type);
  if(typeof signed.upload_url!=='string'||typeof signed.public_url!=='string')throw new Error('Upload холболт буруу.');
  const url=new URL(signed.upload_url);if(url.protocol!=='https:'||url.username||url.password)throw new Error('Upload URL буруу.');
  const r=await fetch(url,{method:'PUT',headers:{...(signed.upload_headers as Record<string,string>||{}),'Content-Type':file.type},body:bytes,redirect:'error',signal:AbortSignal.timeout(60000)});
  if(!r.ok)throw new Error('Файл байршуулах ажил амжилтгүй.');
  const asset:Omit<CampaignAsset,'proof'>={name:file.name.slice(0,160),url:signed.public_url,mimeType:file.type,kind:kind as CampaignAsset['kind'],...(!video?{data:Buffer.from(bytes).toString('base64')}:{})};
  return NextResponse.json({asset:{...asset,proof:issueAssetProof(asset,user.id,env.sessionSecret())}},{headers:{'Cache-Control':'private, no-store'}});
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:'Upload амжилтгүй.'},{status:400});}
}
