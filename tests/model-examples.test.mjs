import test from 'node:test';
import assert from 'node:assert/strict';
import {models,getModel} from '../lib/models.ts';
import {examplesForModel,inspirationDisclosure,modelExampleHref} from '../lib/model-examples.ts';

test('image endpoints always receive an image guide, never unrelated video',()=>{
 for(const model of models.filter(m=>m.kind==='image')) {
  const result=examplesForModel(model);
  assert.deepEqual(result.videos,[],model.slug);
  assert.ok(result.prompt); assert.match(result.mode,/Зураг|зураг/);
 }
});
test('Genjutsu operations receive their matching official preset examples only',()=>{
 assert.deepEqual(examplesForModel(getModel('genjutsu-motion')).videos.map(v=>v.id),['motion-transfer-1','motion-transfer-2']);
 assert.deepEqual(examplesForModel({...getModel('genjutsu-object'),apiVerified:true}).videos.map(v=>v.id),['object-swap-1','object-swap-2']);
 assert.deepEqual(examplesForModel(getModel('genjutsu-restyle')).videos,[]);
});
test('curated camera examples differ by family with explicit non-provenance disclosure',()=>{
 assert.notDeepEqual(examplesForModel(getModel('seedance-2-5')).videos.map(v=>v.id),examplesForModel(getModel('kling-3-standard')).videos.map(v=>v.id));
 assert.match(inspirationDisclosure,/батлахгүй/);
 for(const model of models) for(const video of examplesForModel(model).videos) {
  assert.match(video.previewSrc,/^https:\/\/.+\.mp4$/);
  assert.match(video.official,/^https:\/\/higgsfield\.ai\//);
  assert.match(video.description,/[А-Яа-яӨөҮү]/);
 }
});
test('unverified and video editing endpoints get targeted prompt guidance without generic cinema fallback',()=>{
 for(const model of models.filter(m=>!m.apiVerified||/video-edit|video-extend|restyle/.test(m.modelId))) {
  assert.deepEqual(examplesForModel(model).videos,[],model.slug);
  assert.ok(examplesForModel(model).prompt);
 }
 assert.deepEqual(examplesForModel(getModel('wan-3-prime')).videos,[]);
});
test('example actions retain selected endpoint and exact prompt',()=>{
 for(const model of models) {
  const prompt=examplesForModel(model).prompt;
  const url=new URL(modelExampleHref(model,prompt),'https://ravs.example');
  assert.equal(url.searchParams.get('model'),model.slug);
  assert.equal(url.searchParams.get('prompt'),prompt);
 }
});
