import test from "node:test";
import assert from "node:assert/strict";
import {isTrustedClipRequest} from "../lib/clip-origin.ts";

const originRequest=(origin,fetchSite="same-origin")=>new Request("http://localhost:8080/api/clips/prepare",{method:"POST",headers:{origin,"sec-fetch-site":fetchSite}});
test("Railway reverse proxy recognizes public video domain instead of internal URL host",()=>{
 assert.equal(isTrustedClipRequest(originRequest("https://video.rainy.studio")),true);
 assert.equal(isTrustedClipRequest(originRequest("https://rainyaivideostudio-production.up.railway.app")),true);
});
test("Clip media upload rejects foreign and forged cross-site Origins",()=>{
 for(const address of ["https://evil.example","https://video.rainy.studio.evil.example","http://video.rainy.studio","https://video.rainy.studio:4443"]){
  assert.equal(isTrustedClipRequest(originRequest(address)),false,address);
 }
 assert.equal(isTrustedClipRequest(originRequest("https://video.rainy.studio","cross-site")),false);
 assert.equal(isTrustedClipRequest(new Request("http://localhost:8080/api/clips/prepare",{method:"POST",headers:{"sec-fetch-site":"cross-site"}})),false);
});
test("Accept same-origin browser upload when browser omits Origin",()=>{
 assert.equal(isTrustedClipRequest(new Request("http://localhost:8080/api/clips/prepare",{method:"POST",headers:{"sec-fetch-site":"same-origin"}})),true);
});
