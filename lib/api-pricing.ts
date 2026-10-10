// Higgsfield API list-price estimates (NOT Higgsfield's website subscription).
// 3,900 MNT/USD is a CONSERVATIVE INTERNAL PLANNING RATE, not a claimed live FX quote.
// Reviewed against official provider catalog 2026-10-11; no promotional prices assumed.
export const pricingPolicy = {
 usdMnt: 3900, markup: .90, minCreditMnt: 100000 / 12000,
 // Lower RAINY API price ~11.6%; retain >=50% stress-tested net cost markup.
 // A 70% cost markup is not a 70% sales margin.
 minimumNetCostMarkup: .50,
 reviewedAt: '2026-10-11',
 // Cost-reserve assumptions for scenario stress tests; not published Wire fees or tax advice.
 fxStress: .10, paymentFeeReserve: .04, taxReserve: .10,
 infrastructureReserve: .07, minContribution: .27,
 minimumPackMntPerCredit: 9.25,
} as const;
/**
 * Conservative contribution AFTER estimated provider, FX stress, payment,
 * potential VAT/tax reserve, and platform operations.
 * This is NOT net profit, guaranteed margin or a binding merchant fee rate.
 */
export function estimatePackContribution(priceMnt:number,credits:number) {
 if(!Number.isSafeInteger(priceMnt)||!Number.isSafeInteger(credits)||priceMnt<=0||credits<=0)
   throw new Error("Багцын үнэ эсвэл кредит буруу байна.");
 const unit=priceMnt/credits;
 const providerCostPerCredit=pricingPolicy.minCreditMnt*(1+pricingPolicy.fxStress)/(1+pricingPolicy.markup);
 const reserves=pricingPolicy.paymentFeeReserve+pricingPolicy.taxReserve+pricingPolicy.infrastructureReserve;
 const netSalesPerCredit=unit*(1-reserves);
 const margin=(netSalesPerCredit-providerCostPerCredit)/unit;
 const netCostMarkup=(netSalesPerCredit/providerCostPerCredit)-1;
 return {unitMnt:unit,providerCostPerCredit,netSalesPerCredit,
   netCostMarkup,minimumNetCostMarkup:pricingPolicy.minimumNetCostMarkup,
   estimatedContributionMargin:margin,
   guardPassed:unit>=pricingPolicy.minimumPackMntPerCredit &&
     margin>=pricingPolicy.minContribution &&
     netCostMarkup+1e-10>=pricingPolicy.minimumNetCostMarkup};
}
export class PricingUnavailableError extends Error {}
const unavailable = () => { throw new PricingUnavailableError('Энэ тохиргооны API өртгийг баталгаажуулж байна. Өөр загвар сонгоно уу.'); };
export function providerCostUsd(id: string, input: Record<string, unknown>): number {
  const resolution = String(input.resolution || '720p').toLowerCase();
  // A missing duration can produce a silent undercharge on usage-metered
  // video requests. Images do not use duration.
  const seconds = input.duration === undefined ? NaN : Number(input.duration);
  const batch = Number(input.batch_size ?? input.num_images ?? 1);
  if (!Number.isSafeInteger(batch) || batch < 1 || batch > 100) return unavailable();
  // The official Higgsfield pages publish the SAME list rates for the
  // three documented Genjutsu endpoints. Billing uses source video duration,
  // rounded UP to a whole second. The duration is authenticated against a
  // server-probed user-owned clip before credit reservation.
  // Sources:
  // https://open.higgsfield.ai/models/higgsfield/genjutsu/motion-transfer/v1.0/playground
  // https://open.higgsfield.ai/models/higgsfield/genjutsu/restyle/v1.0/api-reference
  // https://open.higgsfield.ai/models/higgsfield/genjutsu/object-swap/v1.0/api-reference
  const genjutsuSourceModel = [
    "higgsfield/genjutsu/motion-transfer/v1.0",
    "higgsfield/genjutsu/restyle/v1.0",
    "higgsfield/genjutsu/object-swap/v1.0",
  ].includes(id);
  if(genjutsuSourceModel && !input.video_url)
    throw new PricingUnavailableError("Genjutsu-ийн эх MP4 клип шаардлагатай. 1–30 секундын хэсгийг бэлтгэнэ үү.");
  if (input.video_url || (Array.isArray(input.video_urls) && input.video_urls.length)) {
    if(genjutsuSourceModel){
      const verified = input.__verifiedClipSeconds;
      if(typeof verified !== "number" || !Number.isFinite(verified) || verified < 1 || verified > 30)
        throw new PricingUnavailableError("Клипийн хугацаа баталгаажаагүй. Эх MP4-г серверийн тайрах хэрэгслээр бэлтгэнэ үү.");
      if(id!=="higgsfield/genjutsu/motion-transfer/v1.0" && verified < 4)
        throw new PricingUnavailableError("Object Swap / Restyle-д хамгийн багадаа 4 секундын видео шаардлагатай.");
      const rate=({"480p":.318,"720p":.681,"1080p":1.632} as Record<string,number>)[resolution];
      if(rate===undefined)return unavailable();
      return Math.ceil(verified)*rate;
    }
    return unavailable();
  }
  const perSecond = (rates: Record<string, number>) => {
    const rate = rates[resolution]; if (rate === undefined || !Number.isFinite(seconds) || seconds <= 0 || seconds > 3600) return unavailable();
    return rate * seconds;
  };
  const perImage = (rates: Record<string, number>) => {
    const rate = rates[resolution]; if (rate === undefined) return unavailable();
    return rate * batch;
  };
  if (/^bytedance\/seedance-2\.[05]\//.test(id) || id === 'higgsfield/cinema-studio/4.0') {
    if (!Number.isFinite(seconds) || seconds <= 0 || seconds > 30) return unavailable();
    if (/video-edit|video-extend/.test(id)) return unavailable();
    const shortEdge = ({'480p':480,'720p':720,'1080p':1080,'4k':2160} as Record<string, number>)[resolution];
    if (!shortEdge || resolution === '4k' && !id.includes('2.0')) return unavailable();
    // Conservative bound for provider padding and auto aspect ratios. Explicit
    // ratios use a 64-pixel aligned frame, rounded upwards on both dimensions.
    const match = /^(\d+):(\d+)$/.exec(String(input.aspect_ratio));
    const ratio = match ? Math.max(Number(match[1])/Number(match[2]), Number(match[2])/Number(match[1])) : 21/9;
    if (!Number.isFinite(ratio) || ratio < 1 || ratio > 21/9) return unavailable();
    const align = (n:number) => Math.ceil(n/64)*64;
    const pixels = align(shortEdge)*align(shortEdge*ratio);
    const tokens = Math.ceil(pixels * seconds * 24 / 1024);
    const rate = id.includes('2.0') ? (resolution === '4k' ? 0.008 : 0.014) : (resolution === '1080p' ? 0.0234 : 0.0214);
    return tokens / 1000 * rate;
  }
  if (id.startsWith('alibaba/wan-3.0-prime/')) return perSecond({'480p':.068,'720p':.14,'1080p':.28});
  if (id.startsWith('alibaba/wan-3.0/')) return perSecond({'480p':.05,'720p':.10,'1080p':.20});
  if (/^wan\/v2\.[67]\//.test(id)) return perSecond({'720p':.10,'1080p':.15});
  if (id.startsWith('alibaba/happy-horse/') && !id.includes('/v1.1/')) return perSecond({'720p':.14,'1080p':.28});
  if (id.startsWith('minimax/h3/')) return perSecond({'2k':.13});
  if (id.startsWith('minimax/hailuo-2.3/standard/')) {
    if (![6,10].includes(seconds)) return unavailable();
    return seconds * (seconds === 6 ? .0467 : .056);
  }
  if (id.startsWith('alibaba/happy-horse/v1.1/')) return perSecond({'720p':.14,'1080p':.18});
  if (id.startsWith('xai/grok-imagine-video/v1.5/')) return perSecond({'480p':.08,'720p':.14,'1080p':.25});
  if (id.startsWith('lightricks/ltx-2.5/')) return perSecond(id.endsWith('/fast') ? {'720p':.09,'1080p':.13,'2k':.19,'4k':.30} : {'720p':.12,'1080p':.17});
  if (id.startsWith('kling-video/v3.0/4k/')) return perSecond({ '720p': .42, '1080p': .42, '4k': .42 });
  // Upper rate covers sound-on/off variants; discounts are deliberately ignored.
  if (id.startsWith('kling-video/v3.0/pro/')) return .168 * seconds;
  if (id.startsWith('kling-video/v3.0/std/')) return (id.endsWith('image-to-video') ? .126 : .084) * seconds;
  if (id.startsWith('kling-video/v3.0-turbo/')) return perSecond({'720p':.112,'1080p':.14});
  // Conservative non-discounted rate caps from official Kling playgrounds;
  // do not assume temporary 2026 launch promotions or account discounts.
  if (id === 'kling-video/o3/first-last-frame') {
    if(input.mode === '4k')return unavailable(); // 4K mode has a distinct undisclosed price
    return .112 * seconds;
  }
  if (id === 'kling-video/o3/image-reference') {
    if(input.mode !== undefined && input.mode !== 'std')return unavailable();
    return .084 * seconds;
  }
  if (id === 'kling-video/o3/video-reference') return .168 * seconds;
  if (id === 'kling-video/omni/image-reference' || id === 'kling-video/omni/first-last-frame') return .112 * seconds;
  if (id === 'kling-video/omni/video-reference') return .168 * seconds;
  if (/^kling-video\/v2\.5-turbo\/pro\/(text-to-video|image-to-video)$/.test(id)) return .07 * seconds;
  if (id === 'kling-video/v2.5-turbo/standard/image-to-video') return .042 * seconds;
  if (id === 'higgsfield/ai-influencer') return .05 * batch;
  if (id.startsWith('higgsfield-ai/soul/v2/')) return perImage({'720p':.0032,'1080p':.0057});
  if (id === 'higgsfield-ai/soul/standard') return perImage({'720p':.0938,'1080p':.1875});
  if (id.startsWith('alibaba/qwen-image-3/')) return perImage({'1k':.04,'2k':.075});
  if (id === 'z-image/turbo') return perImage({'1k':.015,'2k':.015});
  if (id === 'ideogram/v4.0') return .03 * batch;
  if (id === 'recraft/v4.1/text-to-image') return perImage({'1k':.035});
  if (id === 'xai/grok-imagine-image-2.0') return perImage({'1k':.04,'2k':.08});
  // Token-metered Marketing Studio, unverified families, and source-duration
  // workflows remain unavailable until their complete metering is supported.
  return unavailable();
}
export function quoteApiCredits(id:string, input:Record<string,unknown>) {
  // Emergency kill switch if Higgsfield changes pricing faster than an audit.
  if(process.env.RAVS_PRICING_HOLD==="true")
    throw new PricingUnavailableError("Үнэ шинэчлэгдэж байна. Кредит зарцуулах генерац түр зогссон.");
  const usd = providerCostUsd(id,input);
  if(!Number.isFinite(usd) || usd <= 0) return unavailable();
  // Single source for Studio preview, MCP, REST, and the credit reservation.
  // Use ceil so even very small image prices never round below provider cost.
  const credits = Math.ceil(usd * pricingPolicy.usdMnt * (1 + pricingPolicy.markup) / pricingPolicy.minCreditMnt);
  if (!Number.isSafeInteger(credits) || credits <= 0) return unavailable();
  return credits;
}
