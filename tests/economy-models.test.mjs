import test from "node:test";
import assert from "node:assert/strict";
import {tsImport} from "tsx/esm/api";
const {affordableVideoModels}=await tsImport("../lib/economy-models.ts",{parentURL:import.meta.url});

test("budget options are actual verified price quotes, no free guesses",()=>{
 const choices=affordableVideoModels({duration:6,resolution:"720p",aspectRatio:"16:9",generateAudio:false});
 assert.ok(choices.length>0,"At least one documented 720p text-to-video API must quote");
 assert.ok(choices.length<=5);
 for(let i=1;i<choices.length;i++)assert.ok(choices[i].credits>=choices[i-1].credits);
 for(const item of choices){
  assert.equal(item.duration,6);assert.equal(item.resolution,"720p");
  assert.ok(Number.isSafeInteger(item.credits)&&item.credits>0);
  assert.ok(item.modelId.endsWith("/text-to-video"));
 }
});
test("do not substitute lower resolution, shorter duration or missing audio for a cheaper quote",()=>{
 for(const invalid of [
  {duration:0,resolution:"720p",aspectRatio:"16:9",generateAudio:false},
  {duration:40,resolution:"720p",aspectRatio:"16:9",generateAudio:false},
  {duration:6,resolution:"480",aspectRatio:"16:9",generateAudio:false},
  {duration:6,resolution:"720p",aspectRatio:"200:1",generateAudio:false},
 ])assert.throws(()=>affordableVideoModels(invalid));
 const fourK=affordableVideoModels({duration:6,resolution:"1080p",aspectRatio:"16:9",generateAudio:true});
 for(const item of fourK){
  assert.equal(item.resolution,"1080p");
  assert.equal(item.duration,6);
 }
});
test("no full-auto provider generation or financial reservation happens for economy suggestions",()=>{
 const s=String(affordableVideoModels);
 assert.doesNotMatch(s,/submitGeneration|reserveCredits|\\$transaction|fetch\\(/);
 assert.ok(affordableVideoModels({duration:5,resolution:"720p",aspectRatio:"9:16",generateAudio:false}).length<=5);
});
