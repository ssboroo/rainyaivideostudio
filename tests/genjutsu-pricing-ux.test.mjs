import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {getModel,estimateCredits,buildProviderInput} from "../lib/models.ts";

const studio=readFileSync(new URL("../components/studio-client.tsx",import.meta.url),"utf8");

test("all three Genjutsu IDs map to documented provider endpoints",()=>{
 const motion=getModel("genjutsu-motion");
 const restyle=getModel("genjutsu-restyle");
 const object=getModel("genjutsu-object");
 assert.equal(motion?.modelId,"higgsfield/genjutsu/motion-transfer/v1.0");
 assert.equal(restyle?.modelId,"higgsfield/genjutsu/restyle/v1.0");
 assert.equal(object?.modelId,"higgsfield/genjutsu/object-swap/v1.0");
 assert.equal(motion?.apiVerified,true);
 assert.equal(restyle?.apiVerified,true);
 assert.equal(object?.apiVerified,true);
 assert.ok(object?.parameters?.some(f=>f.name==="image_urls"&&f.required));
});
test("verified Genjutsu Motion quotes after preparing a signed 1-30 second clip",()=>{
 const model=getModel("genjutsu-motion");
 const input={resolution:"720p",video_url:"https://provider.example/verified.mp4",__verifiedClipSeconds:8};
 assert.ok(estimateCredits(model,5,input)>0);
 assert.throws(()=>estimateCredits(model,5,{resolution:"720p"}),/эх MP4 клип шаардлагатай/);
 assert.throws(()=>estimateCredits(model,5,{resolution:"720p",video_url:input.video_url}),/хугацаа баталгаажаагүй/);
});
test("Studio does not quote unsupported models or present a clipped-video prerequisite as an API outage",()=>{
 assert.match(studio,/const apiNotReady = !model\.apiVerified/);
 assert.match(studio,/if\(!apiNotReady && !clipPending\)/);
 assert.match(studio,/apiNotReady \? "API бэлэн биш"/);
 assert.match(studio,/clipPending \? "Клип бэлтгэнэ үү"/);
 assert.match(studio,/Genjutsu Motion Transfer сонгох/);
 assert.match(studio,/model\.name\+" \("\+resolution/);
 assert.match(studio,/!clipPending && !!model\.apiVerified/);
});

test("Kling Turbo text and AI Influencer are selectable with official parameter mapping",()=>{
 const turbo=getModel("kling-3-turbo"),influencer=getModel("ai-influencer");
 assert.equal(turbo?.apiVerified,true);
 assert.equal(influencer?.apiVerified,true);
 const kling=buildProviderInput(turbo,{prompt:"Монгол уулын кадр",duration:5,resolution:"720p",aspectRatio:"16:9"});
 assert.equal(kling.prompt,"Монгол уулын кадр");
 assert.ok(estimateCredits(turbo,5,{resolution:"720p"})>0);
 const sheet=buildProviderInput(influencer,{
  prompt:"Монгол модель, студийн гэрэл",imageUrl:"https://cdn.example.com/person.jpg",
  referenceUrls:["https://cdn.example.com/jacket.jpg"],modelOptions:{tier:"normal"}
 });
 assert.equal(sheet.brief,"Монгол модель, студийн гэрэл");
 assert.equal(sheet.image_url,"https://cdn.example.com/person.jpg");
 assert.deepEqual(sheet.item_image_urls,["https://cdn.example.com/jacket.jpg"]);
 assert.equal(influencer.maxReferences,3);
 assert.ok(estimateCredits(influencer,5,{})>0);
});
