import test from 'node:test';
import assert from 'node:assert/strict';
import {draftSubtitleSrt} from '../lib/director-timeline.ts';
test('draft subtitle timeline skips empty cues but preserves scene times',()=>{
 const text=draftSubtitleSrt([{durationSeconds:5,subtitle:'Нээлт'},{durationSeconds:10,subtitle:' '},{durationSeconds:5,subtitle:'Төгсгөл'}]);
 assert.match(text,/1\n00:00:00,000 --> 00:00:05,000\nНээлт/);
 assert.match(text,/2\n00:00:15,000 --> 00:00:20,000\nТөгсгөл/);
 assert.ok(!text.includes('\n3\n'));
});
test('draft captions reject timing injection and invalid durations',()=>{
 assert.throws(()=>draftSubtitleSrt([{durationSeconds:3,subtitle:'00:00 --> hacked'}]));
 assert.throws(()=>draftSubtitleSrt([{durationSeconds:0,subtitle:'x'}]));
});
