import {test} from 'node:test';
import assert from 'node:assert/strict';
import {trendDemos} from '../lib/trend-demos.ts';
import {tutorials} from '../lib/workflow-tutorials.ts';
test('creative examples have unique ids and playable HTTPS sources',()=>{assert.ok(trendDemos.length>=24);assert.equal(new Set(trendDemos.map(x=>x.id)).size,trendDemos.length);for(const x of trendDemos){assert.equal(new URL(x.previewSrc).protocol,'https:');assert.equal(new URL(x.official).hostname,'higgsfield.ai');assert.ok(x.title&&x.description&&x.use);}});
test('expanded tutorial bank has actionable steps and valid anchors',()=>{assert.equal(new Set(tutorials.map(x=>x.id)).size,tutorials.length);assert.ok(tutorials.length>=19);for(const t of tutorials){assert.ok(t.steps.length>=4);assert.ok(t.prompt.length>30);assert.ok(t.href.startsWith('/'));}assert.ok(tutorials.some(x=>x.id==='apps'));assert.ok(tutorials.some(x=>x.id==='genjutsu'));});
