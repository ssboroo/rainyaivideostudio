import test from 'node:test';
import assert from 'node:assert/strict';
import {getQwenMongolianAdvice,prepareQwenMongolianPrompt} from '../lib/qwen-mongolian.ts';
import {getModel,buildProviderInput} from '../lib/models.ts';
import {modelGuide} from '../lib/model-guides.ts';
import {examplesForModel} from '../lib/model-examples.ts';

const sample='Монгол бүсгүй Улаанбаатарын бороотой гудамжинд алхаж байна. Царайг өөрчлөхгүй. Хар дээлтэй. Бодит кино мэт, зөөлөн гэрэл.';
test('Qwen has Mongolian prompt examples and advice, not Chinese/English-only instructions',()=>{
 for(const slug of ['qwen-image-3','qwen-image-3-edit']){
  const guide=modelGuide(getModel(slug));
  assert.match(guide.prompt,/[А-ЯӨҮа-яөү]/u);
  assert.doesNotMatch(guide.tips.join(' '),/Англи эсвэл Хятад тайлбар зөвлөсөн/);
  assert.ok(guide.tips.some(t=>t.includes('Монгол')));
  assert.match(examplesForModel(getModel(slug)).prompt,/[А-ЯӨҮа-яөү]/u);
 }
});
test('Qwen advice is in Mongolian and matches requested subject, setting, style and constraints',()=>{
 const feedback=getQwenMongolianAdvice(sample,'create');
 assert.equal(feedback.isMongolian,true);
 assert.ok(feedback.recognized.some(x=>x.includes('Монгол')));
 assert.ok(feedback.recognized.some(x=>x.includes('Бороо')));
 assert.ok(feedback.recognized.some(x=>x.includes('Нүүр')));
 assert.ok(feedback.suggestions.every(x=>/[А-ЯӨҮа-яөү]/u.test(x)));
 assert.ok(feedback.suggestions.length>0);
});
test('One Qwen request includes source Mongolian text and grounded English image cues',()=>{
 const prepared=prepareQwenMongolianPrompt(sample,'create');
 assert.ok(prepared.includes(sample));
 assert.match(prepared,/MONGOLIAN ORIGINAL/i);
 assert.match(prepared,/rainy|rain/i);
 assert.match(prepared,/same face|face identity/i);
 assert.match(prepared,/Mongolian/i);
 assert.equal(prepareQwenMongolianPrompt(prepared,'create'),prepared);
});
test('No hallucinated claim of complete translation for unknown Mongolian phrase',()=>{
 const unknown='Хосгүй торгон манан дунд гэнэт цагаан сүлд од тодров.';
 const prepared=prepareQwenMongolianPrompt(unknown,'create');
 assert.ok(prepared.includes(unknown));
 assert.match(prepared,/original/i);
 assert.doesNotMatch(prepared,/translated completely/i);
});
test('Provider payload for create and edit uses same no-extra-call Mongolian prompt bridge',()=>{
 const creation=buildProviderInput(getModel('qwen-image-3'),{prompt:sample});
 assert.ok(creation.prompt.includes(sample));
 assert.match(creation.prompt,/MONGOLIAN ORIGINAL/i);
 assert.equal(creation.prompt_extend,true);
 assert.equal(creation.enable_thinking,true);
 const editing=buildProviderInput(getModel('qwen-image-3-edit'),{
  prompt:'Зөвхөн арын дэвсгэрийг цэнхэр болго. Царайг өөрчлөхгүй.',
  imageUrl:'https://example.com/photo.png'
 });
 assert.match(editing.prompt,/background only|background/i);
 assert.match(editing.prompt,/same face|face identity/i);
 assert.deepEqual(editing.image_urls,['https://example.com/photo.png']);
});
test('English input is passed unchanged; long Mongolian source never truncated; no price or reference mutation',()=>{
 const english='A woman in studio lighting';
 assert.equal(prepareQwenMongolianPrompt(english,'create'),english);
 const long='Цэнхэр уулс ' + 'а'.repeat(6600);
 assert.equal(prepareQwenMongolianPrompt(long,'create'),long);
 const input=buildProviderInput(getModel('qwen-image-3'),{prompt:english,resolution:'2k',aspectRatio:'1:1'});
 assert.equal(input.prompt,english);
 assert.equal(input.resolution,'2k');
 assert.equal(input.aspect_ratio,'1:1');
});

test('Ulaanbaatar does not accidentally imply the color red',()=>{
 const result=getQwenMongolianAdvice('Монгол хүн Улаанбаатарын гудамжинд зогсоно.','create');
 assert.ok(result.recognized.includes('Улаанбаатар'));
 assert.ok(!result.recognized.includes('Улаан өнгө'));
});
