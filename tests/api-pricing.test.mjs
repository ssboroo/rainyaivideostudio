import test from 'node:test';
import assert from 'node:assert/strict';
import {quoteApiCredits, providerCostUsd, pricingPolicy} from '../lib/api-pricing.ts';
import {getCreditPackages} from '../lib/billing.ts';
test('all sold packages cover 100% markup even at the cheapest credit price',()=>{
 for(const input of [{resolution:'480p',duration:5,aspect_ratio:'16:9'},{resolution:'720p',duration:10,aspect_ratio:'9:16'},{resolution:'1080p',duration:30,aspect_ratio:'21:9'}]) {
  const usd=providerCostUsd('bytedance/seedance-2.5/text-to-video',input);
  const credits=quoteApiCredits('bytedance/seedance-2.5/text-to-video',input);
  for(const p of getCreditPackages()) assert.ok(credits*p.priceMnt/p.credits >= usd*pricingPolicy.usdMnt*2);
 }
});
test('resolution and image batch affect price',()=>{
 assert.equal(providerCostUsd('higgsfield-ai/soul/v2/standard',{resolution:'1080p',batch_size:4}),.0057*4);
 assert.ok(quoteApiCredits('alibaba/wan-3.0-prime/text-to-video',{resolution:'1080p',duration:5}) > quoteApiCredits('alibaba/wan-3.0-prime/text-to-video',{resolution:'720p',duration:5}));
});
test('unknown metering is rejected before spending provider funds',()=>{
 for(const [id,input] of [['unknown',{}],['marketing-studio/image/sunburst',{}],['higgsfield/genjutsu/motion-transfer/v1.0',{video_url:'https://example.com/v.mp4'}],['bytedance/seedance-2.5/reference-to-video',{video_urls:['https://example.com/v.mp4']}],['recraft/v4.1/text-to-image',{resolution:'4k'}]]) assert.throws(()=>quoteApiCredits(id,input));
});
test('unsafe environment packages cannot undercut minimum credit value',()=>{
 const previous=process.env.CREDIT_PACKAGES_JSON;
 try {
  process.env.CREDIT_PACKAGES_JSON=JSON.stringify([{id:'sale',name:'Sale',priceMnt:1000,credits:10000}]);assert.throws(()=>getCreditPackages());
  process.env.CREDIT_PACKAGES_JSON='[]';assert.throws(()=>getCreditPackages());
  process.env.CREDIT_PACKAGES_JSON=JSON.stringify([{id:'ok',name:'OK',priceMnt:10000,credits:1000,validityMonths:1}]);assert.equal(getCreditPackages()[0].credits,1000);
 } finally {if(previous===undefined)delete process.env.CREDIT_PACKAGES_JSON;else process.env.CREDIT_PACKAGES_JSON=previous;}
});
