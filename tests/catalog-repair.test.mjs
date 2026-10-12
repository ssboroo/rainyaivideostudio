import test from 'node:test';
import assert from 'node:assert/strict';
import {models,buildProviderInput} from '../lib/models.ts';
import {hfModelSpecs} from '../lib/hf-model-specs.ts';
import {quoteApiCredits} from '../lib/api-pricing.ts';
const repaired=['higgsfield/cinema-studio/4.0','alibaba/wan-3.0-prime/reference-to-video','wan/v2.7/reference-to-video','alibaba/happy-horse/v1.1/image-to-video','wan/v2.6/image-to-video','kling-video/v2.6/pro/text-to-video','kling-video/omni/first-last-frame','kling-video/v2.5-turbo/standard/image-to-video'];
for(const id of repaired)test(`documented payload and quote: ${id}`,()=>{
 const m=models.find(m=>m.modelId===id);assert.ok(m.apiVerified);assert.ok(m.parameters.length);
 const input=buildProviderInput(m,{prompt:'A cinematic scene at sunset',imageUrl:'https://example.com/input.jpg'});
 assert.ok(Number.isSafeInteger(quoteApiCredits(id,input)));
 assert.ok(quoteApiCredits(id,input)>0);
 if(m.parameters.some(f=>f.required&&['image_url','first_frame_url'].includes(f.name)))assert.throws(()=>buildProviderInput(m,{prompt:'A scene'}));
 if(m.durationOptions?.length)assert.throws(()=>buildProviderInput(m,{prompt:'A scene',imageUrl:'https://example.com/input.jpg',duration:7}));
});
test('scraped table placeholders never become provider defaults',()=>{
 for(const m of hfModelSpecs)for(const p of m.parameters){
  if(typeof p.default==='string')assert.doesNotMatch(p.default,/—|\|/,`${m.id}: ${p.name}`);
  if(p.type.includes('boolean')&&p.default!==undefined)assert.equal(typeof p.default,'boolean');
  if(p.type.includes('array')&&p.default!==undefined&&p.default!==null)assert.ok(Array.isArray(p.default),`${m.id}: ${p.name}`);
 }
});
test('Kling 2.6 quotes use the documented non-promotional bound',()=>{
 const id='kling-video/v2.6/pro/text-to-video';assert.ok(quoteApiCredits(id,{duration:10})>quoteApiCredits(id,{duration:5}));
 assert.throws(()=>quoteApiCredits(id,{duration:7}));
});
