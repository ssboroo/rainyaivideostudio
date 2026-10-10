import test from 'node:test';
import assert from 'node:assert/strict';
import {quoteApiCredits, providerCostUsd, pricingPolicy} from '../lib/api-pricing.ts';
import {getCreditPackages} from '../lib/billing.ts';
import {estimatePackContribution} from '../lib/api-pricing.ts';
test('lower 2026 video prices remain protected by FX, fees, tax and infrastructure stress reserves',()=>{
 for(const input of [{resolution:'480p',duration:5,aspect_ratio:'16:9'},{resolution:'720p',duration:10,aspect_ratio:'9:16'},{resolution:'1080p',duration:30,aspect_ratio:'21:9'}]) {
  const usd=providerCostUsd('bytedance/seedance-2.5/text-to-video',input);
  const credits=quoteApiCredits('bytedance/seedance-2.5/text-to-video',input);
  for(const p of getCreditPackages()){
    const unit=p.priceMnt/p.credits;
    const provider=usd*pricingPolicy.usdMnt;
    assert.ok(credits*unit>=provider*1.9,"RAINY price must cover provider cost");
    const netRevenue=credits*unit*(1-pricingPolicy.paymentFeeReserve-pricingPolicy.taxReserve-pricingPolicy.infrastructureReserve);
    assert.ok(netRevenue>=provider*(1+pricingPolicy.fxStress)*1.27, "Maintain >=27% stressed cost premium on every provider quote");
  }
 }
});
test('new prices are lower while current packages remain profitable in configured stress scenario',()=>{
  assert.equal(pricingPolicy.markup,.90);
  assert.ok((1+pricingPolicy.markup)/(1+1.15)<.89);
  
  for(const pack of getCreditPackages()){
    const audit=estimatePackContribution(pack.priceMnt,pack.credits);
    assert.ok(audit.guardPassed,pack.id);
    assert.ok(audit.estimatedContributionMargin>=.27,pack.id);
    assert.ok(audit.netCostMarkup>=.50-1e-10,pack.id);
  }
  for(const [id,rate] of [
    ['alibaba/wan-3.0/text-to-video',.10],
    ['kling-video/v3.0-turbo/text-to-video',.112],
  ]){
    const credits=quoteApiCredits(id,{duration:10,resolution:'720p'});
    assert.ok(credits>0);
    assert.ok(credits<=Math.ceil(rate*10*3900*2.15/(100000/12000)),id);
  }
});

test('missing duration and unsupported Hailuo duration cannot be silently priced as 5 sec',()=>{
  assert.throws(()=>quoteApiCredits('alibaba/wan-3.0/text-to-video',{resolution:'720p'}));
  assert.throws(()=>quoteApiCredits('minimax/hailuo-2.3/standard/text-to-video',{resolution:'720p',duration:5}));
  assert.equal(providerCostUsd('minimax/hailuo-2.3/standard/text-to-video',{resolution:'720p',duration:6}),6*.0467);
  assert.throws(()=>quoteApiCredits('minimax/hailuo-2.3/standard/text-to-video',{resolution:'720p',duration:11}));
});
test('resolution and image batch affect price',()=>{
 assert.equal(providerCostUsd('higgsfield-ai/soul/v2/standard',{resolution:'1080p',batch_size:4}),.0057*4);
 assert.ok(quoteApiCredits('alibaba/wan-3.0-prime/text-to-video',{resolution:'1080p',duration:5}) > quoteApiCredits('alibaba/wan-3.0-prime/text-to-video',{resolution:'720p',duration:5}));
});
test('unknown metering is rejected before spending provider funds',()=>{
 for(const [id,input] of [['unknown',{}],['marketing-studio/image/sunburst',{}],['higgsfield/genjutsu/motion-transfer/v1.0',{video_url:'https://example.com/v.mp4'}],['bytedance/seedance-2.5/reference-to-video',{video_urls:['https://example.com/v.mp4']}],['recraft/v4.1/text-to-image',{resolution:'4k'}]]) assert.throws(()=>quoteApiCredits(id,input));
});
test('all three Genjutsu providers quote only verified source media and supported resolutions',()=>{
 for(const id of ['higgsfield/genjutsu/motion-transfer/v1.0','higgsfield/genjutsu/object-swap/v1.0','higgsfield/genjutsu/restyle/v1.0']){
  assert.throws(()=>quoteApiCredits(id,{resolution:'720p'}),/эх MP4/);
  assert.throws(()=>quoteApiCredits(id,{resolution:'720p',video_url:'https://example.com/x.mp4'}),/баталгаажаагүй/);
  const clip={video_url:'https://example.com/clip.mp4',__verifiedClipSeconds:7.05};
  assert.equal(providerCostUsd(id,{...clip,resolution:'480p'}),8*.318);
  assert.equal(providerCostUsd(id,{...clip,resolution:'720p'}),8*.681);
  assert.equal(providerCostUsd(id,{...clip,resolution:'1080p'}),8*1.632);
  assert.ok(quoteApiCredits(id,{...clip,resolution:'720p'})>0);
  for(const invalid of [0,31,NaN,undefined,'9'])assert.throws(()=>quoteApiCredits(id,{...clip,__verifiedClipSeconds:invalid,resolution:'720p'}));
  if(!id.includes('motion-transfer')) assert.throws(()=>quoteApiCredits(id,{...clip,__verifiedClipSeconds:3,resolution:'720p'}),/4 секунд/);
 }
});

test('unsafe environment packages cannot undercut minimum credit value',()=>{
 const previous=process.env.CREDIT_PACKAGES_JSON;
 try {
  process.env.CREDIT_PACKAGES_JSON=JSON.stringify([{id:'sale',name:'Sale',priceMnt:1000,credits:10000}]);assert.throws(()=>getCreditPackages());
  process.env.CREDIT_PACKAGES_JSON='[]';assert.throws(()=>getCreditPackages());
  process.env.CREDIT_PACKAGES_JSON=JSON.stringify([{id:'ok',name:'OK',priceMnt:10000,credits:1000,validityMonths:1}]);assert.equal(getCreditPackages()[0].credits,1000);
 } finally {if(previous===undefined)delete process.env.CREDIT_PACKAGES_JSON;else process.env.CREDIT_PACKAGES_JSON=previous;}
});

test('published standard-rate Kling families quote only documented modes',()=>{
 const base={duration:5};
 assert.equal(providerCostUsd('kling-video/o3/first-last-frame',{...base,mode:'pro'}),.112*5);
 assert.equal(providerCostUsd('kling-video/o3/image-reference',{...base,mode:'std'}),.084*5);
 assert.equal(providerCostUsd('kling-video/o3/video-reference',{...base,mode:'pro'}),.168*5);
 assert.equal(providerCostUsd('kling-video/omni/video-reference',{...base,mode:'pro'}),.168*5);
 assert.equal(providerCostUsd('kling-video/v2.5-turbo/pro/text-to-video',base),.07*5);
 assert.equal(providerCostUsd('kling-video/v2.5-turbo/pro/image-to-video',base),.07*5);
 assert.throws(()=>providerCostUsd('kling-video/o3/first-last-frame',{...base,mode:'4k'}));
 assert.throws(()=>providerCostUsd('kling-video/o3/image-reference',{...base,mode:'pro'}));
});
