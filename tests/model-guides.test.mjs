import test from 'node:test';
import assert from 'node:assert/strict';
import {models,getModel,buildProviderInput} from '../lib/models.ts';
import {modelGuide,durationLabel,modelMode,resolutionLabel,parameterLabels} from '../lib/model-guides.ts';
test('every catalog endpoint has a Mongolian guide and clean identifier',()=>{
 for(const m of models){
  assert.match(m.modelId,/^[a-zA-Z0-9./_-]+$/);
  const g=modelGuide(m);assert.ok(g.steps.length>=3);assert.ok(g.tips.length);assert.ok(g.prompt);
  assert.match(g.mode,/[А-Яа-яӨөҮү]/);assert.match(g.purpose,/[А-Яа-яӨөҮү]/);
  for(const f of m.parameters||[])assert.ok(parameterLabels[f.name],m.modelId+': untranslated '+f.name);
 }
 assert.equal(new Set(models.map(m=>m.modelId)).size,models.length);
});
test('guide duration and dimensions follow endpoint schema instead of marketing guesses',()=>{
 assert.equal(durationLabel(getModel('seedance-2-5')),'4–30 сек');
 const ltx=models.find(m=>m.modelId==='lightricks/ltx-2.5/image-to-video/pro');
 assert.equal(durationLabel(ltx),'6 / 8 / 10 сек');
 assert.equal(resolutionLabel(getModel('kling-3-standard')),'Загварын тогтмол хэмжээ');
 assert.equal(modelMode(ltx),'Зураг → Видео');
 const pending=models.find(m=>!m.apiVerified);
 assert.equal(resolutionLabel(pending),'Баталгаажаагүй');
 assert.deepEqual(modelGuide(pending).required,[]);
});
test('refreshed Wan image endpoint is usable and enforces its image',()=>{
 const m=getModel('wan-3-prime-image');assert.ok(m.apiVerified);
 assert.throws(()=>buildProviderInput(m,{prompt:'A scene',duration:5}));
 const input=buildProviderInput(m,{prompt:'A scene',duration:5,imageUrl:'https://example.com/a.jpg'});
 assert.equal(input.resolution,'1080p');assert.equal(input.aspect_ratio,'adaptive');
});
test('all marketing variants reject enhancement without product and preset',()=>{
 for(const m of models.filter(m=>m.modelId.startsWith('marketing-studio/image'))){
  assert.ok(m.apiVerified);assert.equal(m.maxReferences,16);
  assert.throws(()=>buildProviderInput(m,{prompt:'Product campaign',modelOptions:{enhance_prompt:true}}));
 }
});
