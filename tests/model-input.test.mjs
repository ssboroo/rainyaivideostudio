import test from 'node:test';
import assert from 'node:assert/strict';
import {models,getModel,buildProviderInput} from '../lib/models.ts';
test('Seedance exact documented payload and protected common fields',()=>{
 const m=getModel('seedance-2-5');
 const input=buildProviderInput(m,{prompt:'A cinematic scene at sunset',duration:5,resolution:'720p',aspectRatio:'16:9',generateAudio:true,modelOptions:{duration:30}});
 assert.deepEqual(input,{prompt:'A cinematic scene at sunset',duration:5,resolution:'720p',aspect_ratio:'16:9',output_format:'mp4',generate_audio:true});
 assert.throws(()=>buildProviderInput(m,{prompt:'',duration:5}));
 assert.throws(()=>buildProviderInput(m,{prompt:'x',duration:4.5}));
 assert.throws(()=>buildProviderInput(m,{prompt:'x',resolution:'4k'}));
});
test('catalog slugs and endpoints are unique and unverified docs block submission',()=>{
 assert.equal(new Set(models.map(m=>m.slug)).size,models.length);
 assert.equal(new Set(models.map(m=>m.modelId)).size,models.length);
 assert.ok(models.filter(m=>m.apiVerified).length>=57);
 for(const m of models.filter(m=>!m.apiVerified))assert.throws(()=>buildProviderInput(m,{prompt:'x'}));
});
test('image references and Genjutsu required inputs are enforced',()=>{
 assert.throws(()=>buildProviderInput(getModel('seedance-2-5-image'),{prompt:'x'}));
 assert.throws(()=>buildProviderInput(getModel('genjutsu-motion'),{videoUrl:'https://example.com/a.mp4'}));
 assert.equal(getModel('genjutsu-motion').modelId,'higgsfield/genjutsu/motion-transfer/v1.0');
});
test('LTX discrete duration values and Qwen dependency are validated',()=>{
 const ltx=models.find(m=>m.modelId==='lightricks/ltx-2.5/text-to-video/fast');
 assert.deepEqual(ltx.durationOptions,[6,8,10]);
 assert.throws(()=>buildProviderInput(ltx,{prompt:'A cinematic scene',duration:7}));
 assert.throws(()=>buildProviderInput(getModel('qwen-image-3'),{prompt:'A portrait',modelOptions:{enable_thinking:true,prompt_extend:false}}));
});
test('Restyle preserves documented default and valid tier',()=>{
 const m=getModel('genjutsu-restyle');assert.equal(m.resolutions[0],'720p');
 const input=buildProviderInput(m,{videoUrl:'https://example.com/v.mp4',presetId:'00000000-0000-4000-8000-000000000000'});
 assert.equal(input.resolution,'720p');
});
