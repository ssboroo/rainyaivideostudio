const mediaHosts=new Set(['cdn.higgsfield.ai','static-public-media.higgsfield.ai']);
export function sourceUrl(value:unknown,media=false){
 const u=new URL(String(value));
 if(u.protocol!=='https:'||u.username||u.password||u.port||(media?!mediaHosts.has(u.hostname):!['higgsfield.ai','www.higgsfield.ai','open.higgsfield.ai'].includes(u.hostname)))throw new Error('Зөвшөөрөгдсөн Higgsfield холбоос оруулна уу.');
 if(media&&!/\.(mp4|webm)$/i.test(u.pathname))throw new Error('Шууд MP4 эсвэл WebM холбоос шаардлагатай.');
 return u.toString();
}
export async function boundedFetch(url:string,max:number){
 const r=await fetch(url,{redirect:'error',cache:'no-store',signal:AbortSignal.timeout(20000)});
 if(!r.ok||Number(r.headers.get('content-length')||0)>max)throw new Error('Файл татаж чадсангүй эсвэл хэмжээ хэтэрсэн.');
 const reader=r.body?.getReader();if(!reader)throw new Error('Хоосон файл.');
 const chunks:Uint8Array[]=[];let size=0;
 try{while(true){const {value,done}=await reader.read();if(done)break;size+=value.length;if(size>max)throw new Error('Файлын хэмжээ хэтэрсэн.');chunks.push(value);}}finally{await reader.cancel();}
 return {bytes:Buffer.concat(chunks),contentType:r.headers.get('content-type')||''};
}
export function extractDemoVideos(html:string){
 const normalized=html.replace(/\\u002F/gi,'/').replace(/\\\//g,'/').replace(/\\u0026/gi,'&').replace(/&amp;/g,'&');
 return [...new Set((normalized.match(/https:\/\/[^"'<>\s\\]+?\.(?:mp4|webm)(?:\?[^"'<>\s\\]*)?/gi)||[]).flatMap(v=>{try{return [sourceUrl(v,true)];}catch{return [];}}))].slice(0,60);
}
