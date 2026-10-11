import test from "node:test";
import assert from "node:assert/strict";
import {getModel,buildProviderInput,estimateCredits} from "../lib/models.ts";
import {quoteApiCredits} from "../lib/api-pricing.ts";

test("cannot invent five seconds to price durationless self-timed video workflows",()=>{
  const cinema=getModel("cinema-studio-4");
  assert.ok(cinema);
  assert.equal(cinema.parameters.some(p=>p.name==="duration"),false);
  assert.throws(()=>estimateCredits(cinema,5,{resolution:"720p",aspect_ratio:"16:9"}),/API өртгийг баталгаажуулж байна/);
});
test("declared generated durations and image batch still quote consistently",()=>{
  const video=getModel("seedance-2-5");
  const input=buildProviderInput(video,{prompt:"A cinematic shot",duration:8,resolution:"720p",aspectRatio:"9:16"});
  assert.equal(estimateCredits(video,8,input),quoteApiCredits(video.modelId,input));
  const image=getModel("soul-2");
  const inputs=buildProviderInput(image,{prompt:"Cinematic portrait",modelOptions:{batch_size:4},resolution:"1080p"});
  assert.equal(inputs.batch_size,4);
  assert.equal(estimateCredits(image,undefined,inputs),quoteApiCredits(image.modelId,inputs));
  assert.ok(estimateCredits(image,undefined,inputs)>quoteApiCredits(image.modelId,{resolution:"1080p",batch_size:1}));
});
test("source-video pricing cannot be inferred from output duration",()=>{
  const ref=getModel("seedance-reference");
  const input=buildProviderInput(ref,{prompt:"A cinematic change",duration:8,resolution:"720p",videoUrl:"https://example.com/source.mp4"});
  assert.throws(()=>estimateCredits(ref,8,input));
});
