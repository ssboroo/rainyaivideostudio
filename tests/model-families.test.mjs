import test from 'node:test';
import assert from 'node:assert/strict';
import {models} from '../lib/models.ts';
import {groupModelFamilies, modelVariantLabel} from '../lib/model-families.ts';

test('families preserve all endpoints once and keep Kling generations distinct',()=>{
 const groups=groupModelFamilies(models);
 assert.deepEqual(groups.flatMap(g=>g.models.map(m=>m.slug)).sort(),models.map(m=>m.slug).sort());
 for(const [name,count] of [['Seedance 2.5',5],['Seedance 2.0',3],['Kling 3.0',10],['Kling 2.6',4],['Kling 2.5',3],['Kling O3',4],['Kling O1 (Omni)',4],['Marketing Studio Image',3],['Genjutsu',3]]){
  assert.equal(groups.find(g=>g.name===name)?.models.length,count,name);
 }
});
test('filtered families count only visible modes and variant names distinguish quality',()=>{
 const input=models.filter(m=>m.modelId.startsWith('kling-video/v3.0/')&&m.modelId.endsWith('text-to-video'));
 const groups=groupModelFamilies(input);assert.equal(groups.length,1);assert.equal(groups[0].models.length,3);
 const labels=groups[0].models.map(modelVariantLabel);assert.equal(new Set(labels).size,3);
 assert.ok(labels.some(x=>x.includes('4K')));assert.ok(labels.some(x=>x.includes('Pro')));
 assert.deepEqual(groupModelFamilies([]),[]);
});
