import test from 'node:test';
import assert from 'node:assert/strict';
import {storyboardHash,approvedStoryboard,storyboardTimeline,storyboardNarrationSrt} from '../lib/storyboard-policy.ts';
const plan={title:'Кофе',scenes:[{number:1,durationSeconds:5,videoPrompt:'Morning coffee',voiceover:'Өглөөний мэнд',shot:'Кофе аягалах',subtitle:'Өглөөний мэнд'},{number:2,durationSeconds:10,videoPrompt:'Steam rising',voiceover:'Шинэ өдөр',shot:'Уур',subtitle:'Шинэ өдөр'}]};
test('approval binds exact storyboard including narration and shot order',()=>{
 const hash=storyboardHash(plan);assert.equal(approvedStoryboard(plan,hash),true);
 for(const changed of [{...plan,title:'Other'},{...plan,scenes:[...plan.scenes].reverse()},{...plan,scenes:[{...plan.scenes[0],voiceover:'Өөр текст'},plan.scenes[1]]}])assert.equal(approvedStoryboard(changed,hash),false);
 assert.equal(approvedStoryboard(undefined,hash),false);assert.equal(approvedStoryboard(plan,undefined),false);
});
test('storyboard timing preserves each approved scene and total duration',()=>{
 const scenes=storyboardTimeline(plan);assert.deepEqual(scenes.map(s=>[s.startSeconds,s.endSeconds]),[[0,5],[5,15]]);assert.equal(scenes[0].videoPrompt,plan.scenes[0].videoPrompt);
});

test('voice uses the approved per-scene timeline, preserving silent scene gaps',()=>{
 const srt=storyboardNarrationSrt(plan);assert.ok(srt.includes('00:00:00,000 --> 00:00:05,000'));assert.ok(srt.includes('00:00:05,000 --> 00:00:15,000'));assert.ok(srt.includes('Шинэ өдөр'));
 const gap=storyboardNarrationSrt({...plan,scenes:[{...plan.scenes[0],voiceover:''},plan.scenes[1]]});assert.ok(gap.startsWith('1\n00:00:05,000'));assert.throws(()=>storyboardNarrationSrt({...plan,scenes:[{...plan.scenes[0],voiceover:'x'.repeat(241)}]}));
});
