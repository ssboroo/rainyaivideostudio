import test from 'node:test';
import assert from 'node:assert/strict';
import {campaignPrice,canProduce,boundedVoiceQuote} from '../lib/campaign-policy.ts';
test('one final price includes video, voice and assembly without mixing wallet units',()=>{
 assert.deepEqual(campaignPrice(400,30,20,{video:10,voice:25}),{videoMnt:4000,voiceMnt:750,assemblyMnt:500,totalMnt:5250,videoCreateCredits:400,voiceCreateCredits:75,assemblyCreateCredits:50,totalCredits:525,creditMnt:10});
});
test('no generation before verified payment or while ambiguous dispatch is unresolved',()=>{
 for(const state of ['QUOTED','AWAITING_PAYMENT','VIDEO','VOICE','ASSEMBLY','COMPLETED','REVIEW_REQUIRED','DISPATCH_VIDEO'])assert.equal(canProduce(state,'PENDING'),false);
 assert.equal(canProduce('AWAITING_PAYMENT','PAID'),true);assert.equal(canProduce('DISPATCH_VIDEO','PAID'),false);
});
test('unpriced voice and unsafe amounts fail closed',()=>{
 for(const bad of [NaN,Infinity,-1,1.5,'30',null])assert.throws(()=>boundedVoiceQuote(bad));
 assert.throws(()=>campaignPrice(100,1,1,{video:10,voice:NaN}));
 assert.throws(()=>campaignPrice(10000000,1,1,{video:100000,voice:20}));
});

test('Create credits round each component and exactly match one-time payment',()=>{
 const price=campaignPrice(100,3,1,{video:10,voice:25});
 assert.equal(price.totalCredits,111);assert.equal(price.totalMnt,price.totalCredits*price.creditMnt);
 assert.equal(price.totalMnt,price.videoMnt+price.voiceMnt+price.assemblyMnt);
});
