import test from 'node:test';
import assert from 'node:assert/strict';
import {campaignProviderCost} from '../lib/campaign-cost.ts';
test('separate supplier tariffs from retail credits and exclude expired discounts',()=>{
 const q=campaignProviderCost(3.36,{model_id:'eleven_v4_turbo',billableCharacters:500,voice_multiplier:1},3900);
 assert.equal(q.voiceUsd,.02);assert.equal(q.videoMnt,13104);assert.equal(q.voiceMnt,78);assert.equal(q.basis,'standard_list_tariff_estimate');
});
test('unknown model and missing voice meter cannot be called real costs',()=>{
 assert.throws(()=>campaignProviderCost(1,{model_id:'unknown',billableCharacters:500,voice_multiplier:1},3900));
 assert.throws(()=>campaignProviderCost(1,{model_id:'eleven_v4_turbo',billableCharacters:undefined,voice_multiplier:1},3900));
});
