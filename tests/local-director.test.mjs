import test from 'node:test';
import assert from 'node:assert/strict';
import {createLocalDirectorPlan} from '../lib/local-director.ts';

const brief = 'Монгол кофены шинэ бүтээгдэхүүнийг залуучуудад зориулж танилцуулах дулаан уур амьсгалтай реклам бүтээх';

for (const seconds of [6, 10, 15, 30, 45, 60, 90, 120]) {
  test('local storyboard builds exactly '+seconds+' seconds without external API', () => {
    const plan=createLocalDirectorPlan({provider:'local',brief,seconds,ratio:'9:16'});
    assert.equal(plan.provider,'local');
    assert.equal(plan.model,'rainy-local-template-v1');
    assert.equal(plan.estimatedOnly,true);
    assert.ok(plan.scenes.length>=2 && plan.scenes.length<=12);
    assert.deepEqual(plan.scenes.map(s=>s.number),plan.scenes.map((_,i)=>i+1));
    assert.equal(plan.scenes.reduce((sum,scene)=>sum+scene.durationSeconds,0),seconds);
    assert.ok(plan.scenes.every(s=>s.durationSeconds>=2&&s.durationSeconds<=30));
    assert.ok(plan.scenes.every(s=>s.videoPrompt.length>=30));
    assert.ok(plan.scenes.every(s=>s.videoPrompt.includes(brief)));
  });
}
test('local planner does not invent narration or subtitles',()=>{
  const plan=createLocalDirectorPlan({provider:'local',brief,seconds:20,ratio:'1:1'});
  assert.match(plan.styleBible,/1:1/);
  assert.ok(plan.scenes.every(s=>s.voiceover===''&&s.subtitle===''));
  assert.equal(plan.subtitlesSrt,'');
});
test('local planner rejects invalid requests',()=>{
  assert.throws(()=>createLocalDirectorPlan({provider:'local',brief,seconds:121,ratio:'9:16'}));
  assert.throws(()=>createLocalDirectorPlan({provider:'local',brief:'x'.repeat(4001),seconds:20,ratio:'9:16'}));
  assert.throws(()=>createLocalDirectorPlan({provider:'local',brief,seconds:20,ratio:'2:3'}));
});
test('local planner uses bounded source context for long briefs',()=>{
  const longBrief='Монгол зар сурталчилгааны эх санаа. '+'г'.repeat(3800);
  const plan=createLocalDirectorPlan({provider:'local',brief:longBrief,seconds:120,ratio:'16:9'});
  assert.ok(plan.scenes.every(s=>s.videoPrompt.length<3000));
  assert.ok(plan.styleBible.length<1200);
});