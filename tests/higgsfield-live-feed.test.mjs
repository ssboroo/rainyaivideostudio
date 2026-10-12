import test from "node:test";
import assert from "node:assert/strict";
import {validateTariffFeed,liveProviderCostUsd,quoteFromTariffs} from "../lib/higgsfield-live-feed.ts";
const id="bytedance/seedance-2.5/text-to-video";
test("strict official feed contract prevents imaginary or duplicate provider USD prices",()=>{
 const feed={revision:"v2026-10-12",tariffs:[{modelId:id,unit:"per_second",usdRate:0.3,parameters:{resolution:"720p",generate_audio:true}}]};
 const parsed=validateTariffFeed(feed);
 assert.equal(parsed.tariffs[0].usdRate,.3);
 assert.throws(()=>validateTariffFeed({...feed,tariffs:[...feed.tariffs,...feed.tariffs]}),/Давхардсан/);
 assert.throws(()=>validateTariffFeed({...feed,tariffs:[{...feed.tariffs[0],usdRate:-1}]}),/үнэ/);
 assert.throws(()=>validateTariffFeed({...feed,tariffs:[{...feed.tariffs[0],unit:"tokens"}]}),/нэгж/);
});
test("reviewed old rates are not replaced before provider feed is activated",()=>{
 const output=liveProviderCostUsd(id,{resolution:"720p",duration:5});
 assert.equal(output,null);
});

test("fresh exact tariffs quote selected seconds but refuse ambiguous or unpriced variants",()=>{
 const list=[{modelId:id,unit:"per_second",usdRate:0.3,parameters:{resolution:"720p",generate_audio:true}}];
 assert.equal(quoteFromTariffs(list,id,{duration:8,resolution:"720p",generate_audio:true}),2.4);
 assert.throws(()=>quoteFromTariffs(list,id,{duration:8,resolution:"1080p",generate_audio:true}),/live үнэ/);
 assert.throws(()=>quoteFromTariffs([{...list[0],parameters:{}}],id,{duration:8,resolution:"720p",generate_audio:true}),/live үнэ/);
 assert.throws(()=>quoteFromTariffs(list,id,{duration:0,resolution:"720p",generate_audio:true}),/Хугацаа/);
});
