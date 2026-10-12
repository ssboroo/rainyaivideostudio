import test from "node:test";
import assert from "node:assert/strict";
import {validateDirectorPlan,validateDirectorInput,DirectorError} from "../lib/creative-director.ts";
const valid=JSON.stringify({title:"Говийн өглөө",logline:"Монголын өглөө",styleBible:"Soft sunrise",
 characters:["Original traveler with consistent blue coat"],
 scenes:[{durationSeconds:5,shot:"wide",videoPrompt:"An original Mongolian steppe at sunrise, a slow cinematic camera move, no text.",voiceover:"Өглөө ирлээ.",subtitle:"Өглөө ирлээ."},
 {durationSeconds:5,shot:"detail",videoPrompt:"Close-up of grass moving in the Mongolian breeze, sunlight, cinematic 35mm lens.",voiceover:"Шинэ аялал.",subtitle:"Шинэ аялал."}]});
test("strict creative director input",()=>{
 assert.equal(validateDirectorInput({provider:"gpt",brief:"Монгол хэлээр 10 секундийн богино өгүүлэмж",durationSeconds:10,aspectRatio:"9:16"}).seconds,10);
 assert.throws(()=>validateDirectorInput({provider:"gpt",brief:"tiny",durationSeconds:10,aspectRatio:"9:16"}),DirectorError);
 assert.throws(()=>validateDirectorInput({provider:"claude",brief:"Монгол хэлээр 10 секундийн богино өгүүлэмж",durationSeconds:200,aspectRatio:"9:16"}),/6–120/);
});
test("structured scene validation and draft SRT with exact timeline",()=>{
 const plan=validateDirectorPlan(valid,"gemini","model",10);
 assert.equal(plan.scenes.length,2);
 assert.ok(plan.subtitlesSrt.includes("00:00:05,000 --> 00:00:10,000"));
 assert.ok(plan.estimatedOnly);
 assert.equal(plan.provider,"gemini");
});
test("fail closed for hallucinated durations and malformed output",()=>{
 assert.throws(()=>validateDirectorPlan(valid,"gpt","model",15),/хугацаа/);
 assert.throws(()=>validateDirectorPlan('{"title":"empty","scenes":[]}',"gpt","model",10),/1–12/);
 assert.throws(()=>validateDirectorPlan("<not JSON>","claude","model",10),/JSON/);
});
