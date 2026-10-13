/** Provider list tariffs, not measured invoices. Promotions are excluded. */
const voiceRates:Record<string,number>={eleven_v4:.08,eleven_v4_turbo:.04,eleven_v3:.08,eleven_v3_conversational:.04,eleven_multilingual_v2:.08,eleven_flash_v2_5:.04,eleven_turbo_v2_5:.04};
export function campaignProviderCost(videoUsd:number,voice:{model_id:unknown;billableCharacters:unknown;voice_multiplier:unknown},usdMnt:number){
 const rate=voiceRates[String(voice.model_id)],characters=voice.billableCharacters,multiplier=voice.voice_multiplier;
 if(!rate||typeof characters!=='number'||!Number.isSafeInteger(characters)||characters<1||characters>12000||typeof multiplier!=='number'||!Number.isFinite(multiplier)||multiplier<1||multiplier>100||!Number.isFinite(videoUsd)||videoUsd<=0||!Number.isFinite(usdMnt)||usdMnt<1000||usdMnt>10000)throw new Error('Нийлүүлэгчийн өртгийг баталгаажуулж чадсангүй.');
 const voiceUsd=characters*rate/1000*multiplier;
 return {videoUsd,voiceUsd,totalUsd:videoUsd+voiceUsd,usdMnt,videoMnt:Math.ceil(videoUsd*usdMnt),voiceMnt:Math.ceil(voiceUsd*usdMnt),billableCharacters:characters,voiceRatePer1000:rate,voiceMultiplier:multiplier,basis:'standard_list_tariff_estimate' as const,reviewedAt:'2026-10-13'};
}
