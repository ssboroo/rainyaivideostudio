export function campaignPrice(videoCredits:number,voiceCredits:number,assemblyCredits:number,rates:{video:number;voice:number}){
 for(const n of [videoCredits,voiceCredits,assemblyCredits])if(!Number.isSafeInteger(n)||n<0||n>10_000_000)throw new Error('Кредитийн тооцоо буруу.');
 for(const n of [rates.video,rates.voice])if(!Number.isFinite(n)||n<1||n>100000)throw new Error('Нэгдсэн тариф тохируулаагүй.');
 const creditMnt=10;
 const videoCreateCredits=Math.ceil(videoCredits*rates.video/creditMnt),voiceCreateCredits=Math.ceil(voiceCredits*rates.voice/creditMnt),assemblyCreateCredits=Math.ceil(assemblyCredits*rates.voice/creditMnt);
 const totalCredits=videoCreateCredits+voiceCreateCredits+assemblyCreateCredits;
 const videoMnt=videoCreateCredits*creditMnt,voiceMnt=voiceCreateCredits*creditMnt,assemblyMnt=assemblyCreateCredits*creditMnt;
 const totalMnt=videoMnt+voiceMnt+assemblyMnt;
 if(!Number.isSafeInteger(totalMnt)||totalMnt<1000||totalMnt>100_000_000)throw new Error('Нийт үнийн хэмжээ буруу.');
 return {videoMnt,voiceMnt,assemblyMnt,totalMnt,videoCreateCredits,voiceCreateCredits,assemblyCreateCredits,totalCredits,creditMnt};
}
export function canProduce(status:string,paymentStatus:string){return paymentStatus==='PAID'&&['AWAITING_PAYMENT','VIDEO','VOICE','ASSEMBLY'].includes(status);}
export function boundedVoiceQuote(value:unknown){if(typeof value!=='number'||!Number.isSafeInteger(value)||value<0||value>1_000_000)throw new Error('Voice үнийн санал буруу.');return value;}
