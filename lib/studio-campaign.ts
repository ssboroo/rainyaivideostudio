import {CampaignAsset,verifyAssets} from './campaign-assets.ts';
import {randomUUID} from 'node:crypto';
import {db} from './db.ts';
import {createDirectorPlan,validateDirectorInput,DirectorProvider,DirectorPlan} from './creative-director.ts';
import {storyboardHash,approvedStoryboard,storyboardTimeline,storyboardNarrationSrt} from './storyboard-policy.ts';
import {createLongMoviePlan} from './long-movie-plan.ts';
import {getModel,buildProviderInput} from './models.ts';
import {ensureLiveHiggsfieldTariffs} from './higgsfield-live-feed.ts';
import {submitGeneration,getGenerationStatus,mapProviderStatus} from './higgsfield.ts';
import {estimateCredits} from './model-credit-estimate.ts';
import {mediaFrom} from './generation-media.ts';
import {env,higgsfieldKeyConfigured} from './env.ts';
import {voiceTool,artifactPath} from './studio-bridge.ts';
import {campaignPrice,canProduce,boundedVoiceQuote} from './campaign-policy.ts';
import {createPaymentIntent,createCheckoutSession,retrievePaymentIntent,mapIntentStatus} from './wire.ts';
import {confirmWirePayment,checkoutUrlFromProviderData} from './wire-payment.ts';

type Scene={credits:number;duration:number;input:Record<string,unknown>;state:'pending'|'dispatching'|'submitted'|'done';requestId?:string;statusUrl?:string;url?:string};
type Payload={assets?:CampaignAsset[];productInfo?:string;brief:string;seconds:number;ratio:string;modelSlug:string;title:string;narration:string;scenes:Scene[];expiresAt:number;voiceCredits:number;assemblyCredits:number;price:ReturnType<typeof campaignPrice>|null;storyboard?:DirectorPlan;storyboardApproval?:string;voiceJob?:string;assemblyJob?:string;artifact?:string;error?:string};
type Row={id:string;userId:string;status:string;payload:Payload;paymentId:string|null;leaseToken:string|null;createdAt:Date};
const origin=()=>process.env.STUDIO_PUBLIC_ORIGIN||'https://create.rainy.studio';
function directorConfigured(){
 const provider=process.env.STUDIO_DIRECTOR_PROVIDER||'gemini';
 const pair=provider==='gpt'?['OPENAI_API_KEY','RAINY_OPENAI_MODEL']:provider==='claude'?['ANTHROPIC_API_KEY','RAINY_CLAUDE_MODEL']:['GEMINI_API_KEY','RAINY_GEMINI_MODEL'];
 return pair.every(key=>!!process.env[key]);
}
export function campaignReadiness(){
 const missing:string[]=[];
 for(const key of ['STUDIO_VOICE_REFRESH_TOKEN','STUDIO_VOICE_CLIENT_ID','STUDIO_VOICE_ID','STUDIO_VOICE_CREDIT_MNT','STUDIO_ASSEMBLY_CREDITS_PER_MIN'])if(!process.env[key])missing.push(key);
 const provider=process.env.STUDIO_DIRECTOR_PROVIDER||'gemini';
 const pair=provider==='gpt'?['OPENAI_API_KEY','RAINY_OPENAI_MODEL']:provider==='claude'?['ANTHROPIC_API_KEY','RAINY_CLAUDE_MODEL']:['GEMINI_API_KEY','RAINY_GEMINI_MODEL'];
 for(const key of pair)if(!process.env[key])missing.push(key);
 if(!higgsfieldKeyConfigured(env.higgsfieldCredentials()))missing.push('HF_CREDENTIALS');
 if(!env.wireApiKey())missing.push('WIRE_MN_API_KEY');
 if(!env.wireWebhookSecret())missing.push('WIRE_MN_WEBHOOK_SECRET');
 if(process.env.STUDIO_CAMPAIGNS_ENABLED!=='true')missing.push('STUDIO_CAMPAIGNS_ENABLED');
 return {ready:missing.length===0,storyboardReady:directorConfigured(),missing};
}
function requireReady(){if(!campaignReadiness().ready)throw new Error('Нэгдсэн үүсгэлт, төлбөрийн холболтыг бэлтгэж байна. Одоогоор төлбөр авахгүй.');}
export async function ownCampaign(userId:string,id:string){
 const rows=await db.$queryRawUnsafe<Row[]>('SELECT * FROM "StudioCampaign" WHERE "id"=$1 AND "userId"=$2',id,userId);
 if(!rows[0])throw new Error('Төсөл олдсонгүй.');return rows[0];
}
export function publicCampaign(row:Row){const p=row.payload;return {id:row.id,status:row.status,title:p.title,seconds:p.seconds,ratio:p.ratio,narration:p.narration,assets:(p.assets||[]).filter(a=>a.kind!=='frame').map(({name,url,mimeType,kind})=>({name,url,mimeType,kind})),productInfo:p.productInfo||'',storyboard:p.storyboard?{logline:p.storyboard.logline,styleBible:p.storyboard.styleBible,characters:p.storyboard.characters,scenes:storyboardTimeline(p.storyboard)}:null,storyboardApproved:approvedStoryboard(p.storyboard,p.storyboardApproval,p.assets),price:p.price,expiresAt:p.expiresAt,completedScenes:p.scenes.filter(s=>s.state==='done').length,sceneCount:p.scenes.length,error:p.error,downloadUrl:row.status==='COMPLETED'?`/api/campaigns/${row.id}/download`:null};}
export async function createCampaignStoryboard(userId:string,input:{brief:string;seconds:number;ratio:string;productInfo?:string;assets?:unknown}){
 if(!directorConfigured())throw new Error('AI storyboard найруулагчийн API тохиргоо дутуу байна. Одоогоор storyboard үүсгэх боломжгүй.');
 const assets=verifyAssets(input.assets,userId,env.sessionSecret());
 const brief=input.brief+(input.productInfo?'\nБүтээгдэхүүний мэдээлэл: '+input.productInfo:'');
 if(brief.length>4000)throw new Error('Санаа болон бүтээгдэхүүний мэдээлэл нийлээд 4000 тэмдэгтээс хэтрэхгүй байна.');
 const plan=await createDirectorPlan(validateDirectorInput({provider:(process.env.STUDIO_DIRECTOR_PROVIDER||'gemini') as DirectorProvider,brief,durationSeconds:input.seconds,aspectRatio:input.ratio}),assets.filter(a=>a.kind!=='video').map(a=>({mimeType:a.mimeType,data:a.data!,label:a.kind==='product'?'Product reference photo':'Sampled video frame: '+a.name})));
 storyboardNarrationSrt(plan);
 const payload:Payload={assets,productInfo:input.productInfo||'',brief:input.brief,seconds:input.seconds,ratio:input.ratio,modelSlug:process.env.STUDIO_VIDEO_MODEL||'kling-3-turbo',title:plan.title,narration:plan.scenes.map(s=>s.voiceover).filter(Boolean).join(' '),scenes:[],storyboard:plan,price:null,expiresAt:0,voiceCredits:0,assemblyCredits:0};
 const id=randomUUID();
 await db.$executeRawUnsafe('INSERT INTO "StudioCampaign"("id","userId","status","payload") VALUES($1,$2,\'STORYBOARD\',$3::jsonb)',id,userId,JSON.stringify(payload));
 return publicCampaign(await ownCampaign(userId,id));
}
export async function quoteCampaign(userId:string,id:string,confirmStoryboard:boolean){
 if(confirmStoryboard!==true)throw new Error('Эхлээд storyboard-оо батална уу.');
 requireReady();const row=await ownCampaign(userId,id);
 if(row.status==='QUOTED'&&approvedStoryboard(row.payload.storyboard,row.payload.storyboardApproval,row.payload.assets))return publicCampaign(row);
 if(row.status!=='STORYBOARD'||!row.payload.storyboard)throw new Error('Батлах storyboard олдсонгүй. Санаагаа дахин боловсруулна уу.');
 await ensureLiveHiggsfieldTariffs();
 const plan=row.payload.storyboard,input={brief:row.payload.brief,seconds:row.payload.seconds,ratio:row.payload.ratio};
 const image=(row.payload.assets||[]).find(a=>a.kind==='product')||(row.payload.assets||[]).find(a=>a.kind==='frame');
 const modelSlug=image?(process.env.STUDIO_IMAGE_VIDEO_MODEL||'wan-3-prime-image'):(process.env.STUDIO_VIDEO_MODEL||'kling-3-turbo');
 let videoCredits=0;const scenes:Scene[]=[];
 for(const shot of plan.scenes){
  const q=createLongMoviePlan({prompt:shot.videoPrompt,targetSeconds:shot.durationSeconds,modelSlug,aspectRatio:input.ratio,resolution:'720p',generateAudio:false,qualityProfile:'balanced',styleBible:plan.styleBible,imageUrl:image?.url});
  videoCredits+=q.totalVideoCredits;
  scenes.push(...q.scenes.map(s=>({credits:s.credits,duration:s.duration,input:s.templateInput as Record<string,unknown>,state:'pending' as const})));
 }
 const narration=plan.scenes.map(s=>s.voiceover).filter(Boolean).join(' ');
 if(!narration||narration.length>6000)throw new Error('Уншлагын текст буруу.');
 const voice=await voiceTool('rainy_voice_quote_tts',{voice_id:process.env.STUDIO_VOICE_ID,srt:storyboardNarrationSrt(plan),model_id:process.env.STUDIO_VOICE_MODEL||'eleven_v4_turbo'});
 const voiceCredits=boundedVoiceQuote(voice.credits);
 const assemblyCredits=boundedVoiceQuote(Math.ceil(input.seconds/60)*Number(process.env.STUDIO_ASSEMBLY_CREDITS_PER_MIN));
 const price=campaignPrice(videoCredits,voiceCredits,assemblyCredits,{video:10,voice:Number(process.env.STUDIO_VOICE_CREDIT_MNT)});
 const wallet=await voiceTool('rainy_voice_wallet');
 if(Number(wallet.balance)<voiceCredits+assemblyCredits)throw new Error('Үүсгэх үйлчилгээний нөөц хүрэлцэхгүй. Одоогоор төлбөр авахгүй.');
 const payload:Payload={...row.payload,modelSlug,narration,scenes,expiresAt:Date.now()+15*60_000,voiceCredits,assemblyCredits,price,storyboardApproval:storyboardHash(plan,row.payload.assets)};
 const changed=await db.$executeRawUnsafe('UPDATE "StudioCampaign" SET "status"=\'QUOTED\',"payload"=$1::jsonb,"updatedAt"=now() WHERE "id"=$2 AND "userId"=$3 AND "status"=\'STORYBOARD\' AND "payload"=$4::jsonb',JSON.stringify(payload),id,userId,JSON.stringify(row.payload));
 if(changed!==1)throw new Error('Storyboard-ийн төлөв өөрчлөгдсөн. Шинээр ачаална уу.');
 return publicCampaign(await ownCampaign(userId,id));
}

export async function checkoutCampaign(userId:string,id:string){
 requireReady();let row=await ownCampaign(userId,id);
 if(row.status==='QUOTED'&&row.payload.expiresAt<Date.now())throw new Error('Үнийн саналын хугацаа дууссан. Шинээр тооцоолно уу.');
 if(!['QUOTED','AWAITING_PAYMENT'].includes(row.status))throw new Error('Энэ төслийн төлбөр аль хэдийн хийгдсэн.');
 // Row lock ensures simultaneous button taps bind exactly one payment to this job.
 const paymentId=await db.$transaction(async tx=>{
  const [locked]=await tx.$queryRawUnsafe<Row[]>('SELECT * FROM "StudioCampaign" WHERE "id"=$1 AND "userId"=$2 FOR UPDATE',id,userId);
  if(!locked)throw new Error('Төсөл олдсонгүй.');
  if(!locked.payload.price||!approvedStoryboard(locked.payload.storyboard,locked.payload.storyboardApproval,locked.payload.assets))throw new Error('Storyboard баталгаажаагүй. Эхлээд төлөвлөгөөгөө батална уу.');
  if(locked.paymentId)return locked.paymentId;
  if(locked.status!=='QUOTED'||locked.payload.expiresAt<Date.now())throw new Error('Үнийн саналын хугацаа дууссан.');
  const p=await tx.payment.create({data:{userId,provider:'wire',packageId:'campaign:'+id,amountMnt:locked.payload.price.totalMnt,credits:0}});
  await tx.$executeRawUnsafe('UPDATE "StudioCampaign" SET "paymentId"=$1,"status"=\'AWAITING_PAYMENT\',"updatedAt"=now() WHERE "id"=$2',p.id,id);
  return p.id;
 });
 let payment=await db.payment.findUniqueOrThrow({where:{id:paymentId}});
 if(payment.status==='PAID')return {paid:true};
 if(payment.status!=='PENDING')throw new Error('Төлбөрийн нэхэмжлэл хүчингүй болсон. Шинэ төсөл үүсгэнэ үү.');
 const existing=checkoutUrlFromProviderData(payment.providerData);
 if(existing)return {payUrl:existing};
 if(!payment.invoiceId){
  const intent=await createPaymentIntent({paymentId,amount:payment.amountMnt,description:'RAINY Video + Voice — нэг бичлэг'});
  payment=await db.payment.update({where:{id:paymentId},data:{invoiceId:intent.id}});
 }
 const session=await createCheckoutSession({paymentId,paymentIntentId:payment.invoiceId!,successUrl:new URL('/create?project='+id,origin()).toString()});
 const safe=new URL(session.url);if(safe.protocol!=='https:'||safe.username||safe.password)throw new Error('Төлбөрийн холбоос буруу.');
 await db.payment.update({where:{id:paymentId},data:{providerData:{checkoutUrl:session.url}}});
 return {payUrl:session.url};
}
export async function reconcileCampaign(row:Row){
 if(row.status!=='AWAITING_PAYMENT'||!row.paymentId)return;
 const payment=await db.payment.findUnique({where:{id:row.paymentId}});
 if(payment?.status==='PENDING'&&payment.invoiceId){const intent=await retrievePaymentIntent(payment.invoiceId);if(mapIntentStatus(intent.status)==='PAID')await confirmWirePayment(payment.id,intent);}
}
async function persist(row:Row,status:string){
 const changed=await db.$executeRawUnsafe('UPDATE "StudioCampaign" SET "payload"=$1::jsonb,"status"=$2,"updatedAt"=now() WHERE "id"=$3 AND "leaseToken"=$4',JSON.stringify(row.payload),status,row.id,row.leaseToken);
 if(changed!==1)throw new Error('Төслийн ажлын эрх өөрчлөгдсөн.');row.status=status;
}
export async function tickCampaign(){
 if(process.env.STUDIO_CAMPAIGNS_ENABLED!=='true')return;
 const token=randomUUID();
 const rows=await db.$queryRawUnsafe<Row[]>(`UPDATE "StudioCampaign" c SET "leaseUntil"=now()+interval '90 seconds',"leaseToken"=$1 WHERE c."id"=(SELECT c2."id" FROM "StudioCampaign" c2 JOIN "Payment" p ON c2."paymentId"=p."id" WHERE p."status"='PAID' AND c2."status" IN ('AWAITING_PAYMENT','VIDEO','VOICE','ASSEMBLY','DISPATCH_VIDEO','DISPATCH_VOICE','DISPATCH_ASSEMBLY') AND (c2."leaseUntil" IS NULL OR c2."leaseUntil"<now()) ORDER BY c2."updatedAt" FOR UPDATE OF c2 SKIP LOCKED LIMIT 1) RETURNING c.*`,token);
 const row=rows[0];if(!row)return;
 const p=row.payload;
 try{
  if(!approvedStoryboard(p.storyboard,p.storyboardApproval,p.assets))throw new Error('Баталгаажсан storyboard шаардлагатай.');
  if(row.status.startsWith('DISPATCH_'))throw new Error('Provider хүсэлтийн хүлээн авалт тодорхойгүй. Давхар төлбөр гаргахгүйгээр админ нягтална.');
  if(!canProduce(row.status,'PAID'))return;
  if(row.status==='AWAITING_PAYMENT')await persist(row,'VIDEO');
  if(row.status==='VIDEO'){
   const scene=p.scenes.find(s=>s.state!=='done');
   if(!scene){await persist(row,'VOICE');return;}
   if(scene.state==='pending'){
    scene.state='dispatching';await persist(row,'DISPATCH_VIDEO');
    const model=getModel(p.modelSlug);if(!model)throw new Error('Видео загвар олдсонгүй.');
    const providerInput=buildProviderInput(model,scene.input);
    await ensureLiveHiggsfieldTariffs();
    if(estimateCredits(model,scene.duration,providerInput)>scene.credits)throw new Error('Видео үнэ баталсан төсвөөс хэтэрсэн.');
    const reply=await submitGeneration(model.modelId,providerInput,'campaign-'+row.id+'-'+p.scenes.indexOf(scene));
    const id=String(reply.request_id||reply.id||'');if(!id)throw new Error('Provider ажлын дугаар буцаасангүй.');
    scene.requestId=id;scene.statusUrl=typeof reply.status_url==='string'?reply.status_url:undefined;scene.state='submitted';await persist(row,'VIDEO');return;
   }
   let reply:Record<string,unknown>;try{reply=await getGenerationStatus(scene.requestId!,scene.statusUrl);}catch{return;}
   const status=mapProviderStatus(reply.status);
   if(['FAILED','NSFW','CANCELED'].includes(status))throw new Error('Видео кадр амжилтгүй. Админ төлбөр, буцаалтыг шалгана.');
   if(status==='COMPLETED'){const media=mediaFrom(reply);if(media?.type!=='video'||!media.url.startsWith('https://'))throw new Error('Видео файл буруу.');scene.url=media.url;scene.state='done';await persist(row,'VIDEO');}
   return;
  }
  if(row.status==='VOICE'){
   if(!p.voiceJob){
    await persist(row,'DISPATCH_VOICE');
    const result=await voiceTool('rainy_voice_create_tts',{voice_id:process.env.STUDIO_VOICE_ID,srt:storyboardNarrationSrt(p.storyboard!),model_id:process.env.STUDIO_VOICE_MODEL||'eleven_v4_turbo',title:p.title.slice(0,100),maxCredits:p.voiceCredits,confirmGeneration:true,idempotencyKey:'campaign_voice_'+row.id.replaceAll('-','')});
    if(typeof result.id!=='string')throw new Error('Дууны ажлын дугаар буруу.');p.voiceJob=result.id;await persist(row,'VOICE');return;
   }
   const result=await voiceTool('rainy_voice_job_status',{job_id:p.voiceJob});
   if(result.status==='done')await persist(row,'ASSEMBLY');else if(['error','failed','canceled'].includes(result.status))throw new Error('Дуу үүсгэх ажил амжилтгүй.');return;
  }
  if(row.status==='ASSEMBLY'){
   if(!p.assemblyJob){
    const args={video_urls:p.scenes.map(s=>s.url!),target_seconds:p.seconds,aspect_ratio:p.ratio,voice_job_id:p.voiceJob,output_quality:'720p',master_audio:true};
    const q=await voiceTool('rainy_voice_movie_quote',args);
    if(boundedVoiceQuote(q.credits)>p.assemblyCredits)throw new Error('Эвлүүлгийн үнэ баталсан төсвөөс хэтэрсэн.');
    await persist(row,'DISPATCH_ASSEMBLY');
    const result=await voiceTool('rainy_voice_create_movie',{...args,maxCredits:p.assemblyCredits,confirmGeneration:true,idempotencyKey:'campaign_movie_'+row.id.replaceAll('-','')});
    const job=result.job_id||result.id;if(typeof job!=='string')throw new Error('Эвлүүлгийн ажлын дугаар буруу.');p.assemblyJob=job;await persist(row,'ASSEMBLY');return;
   }
   const result=await voiceTool('rainy_voice_movie_status',{job_id:p.assemblyJob});
   if(result.status==='done'&&result.ready&&typeof result.movie_url==='string'){p.artifact=artifactPath(result.movie_url);await persist(row,'COMPLETED');}
   else if(['error','failed','canceled'].includes(result.status))throw new Error('Эвлүүлэх ажил амжилтгүй.');
  }
 }catch(error){
  // Polling GETs are safe to repeat; ambiguous paid POSTs require reconciliation.
  p.error=error instanceof Error?error.message.slice(0,250):'Ажил зогссон.';
  await persist(row,'REVIEW_REQUIRED');
 }finally{await db.$executeRawUnsafe('UPDATE "StudioCampaign" SET "leaseUntil"=NULL,"leaseToken"=NULL WHERE "id"=$1 AND "leaseToken"=$2',row.id,token);}
}
