import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {tsImport} from "tsx/esm/api";
const {higgsfieldKeyConfigured}=await tsImport("../lib/env.ts",{parentURL:import.meta.url});
const {inspectModelApi}=await tsImport("../lib/model-api-audit.ts",{parentURL:import.meta.url});
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("Higgsfield new whole-key and old key-id:key-secret work without allowing whitespace or header injection",()=>{
 assert.equal(higgsfieldKeyConfigured("hf_copied_long_api_token_1234"),true);
 assert.equal(higgsfieldKeyConfigured("my_key_id:my_long_secret_value"),true);
 for(const s of ["","short","Key wholekeywithprefix","my id:secret","abc\nAuthorization: Basic injected"]){
  assert.equal(higgsfieldKeyConfigured(s),false,s);
 }
 const provider=read("lib/higgsfield.ts");
 const generation=read("lib/generation-service.ts");
 assert.match(provider,/higgsfieldKeyConfigured\(credentials\)/);
 assert.match(provider,/if\(!credentials\.includes\(":"\)\)/);
 assert.match(provider,/return hfFetch\("\/"\+modelId/);
 assert.match(generation,/higgsfieldKeyConfigured\(deps\.env\.higgsfieldCredentials\(\)\)/);
});
test("full model catalog is audited honestly without charging credits or contacting provider",()=>{
 const entries=inspectModelApi();
 assert.ok(entries.length>=40);
 const expected=["unsupported_endpoint","source_clip_required","pricing_unavailable","quote_implemented"];
 for(const m of entries){assert.ok(expected.includes(m.pricing),m.slug);assert.ok(m.note);assert.ok(m.modelId);}
 const by=(slug)=>entries.find(m=>m.slug===slug);
 assert.equal(by("genjutsu-motion").pricing,"source_clip_required");
 assert.equal(by("genjutsu-restyle").pricing,"source_clip_required");
 assert.equal(by("genjutsu-object").pricing,"source_clip_required");
 assert.equal(by("seedance-2-5").pricing,"quote_implemented");
 assert.equal(by("marketing-studio").pricing,"pricing_unavailable");
});
test("admin can run an explicit upload-URL-only API connection probe, without spending credits or leaking URLs",()=>{
 const route=read("app/api/admin/model-api-audit/route.ts");
 const ui=read("components/admin-client.tsx");
 assert.match(route,/if\(!await requireAdmin\(\)\)/);
 assert.match(route,/await createSignedUpload\("image\/png"\)/);
 assert.match(route,/scope:"authenticated_upload_url_only"/);
 assert.doesNotMatch(route,/submitGeneration|reserveCredits|creditRate|createUserGeneration/);
 assert.match(ui,/Higgsfield холболт шалгах \(генерацгүй\)/);
 assert.match(ui,/model-api-audit/);
});
