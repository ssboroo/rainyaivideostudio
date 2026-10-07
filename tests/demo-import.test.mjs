import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceUrl,extractDemoVideos,boundedFetch} from '../lib/demo-import.ts';
test('demo imports reject private, credential and foreign URLs',()=>{
 for(const u of ['http://higgsfield.ai/x','https://127.0.0.1/a.mp4','https://cdn.higgsfield.ai.evil.test/a.mp4','https://u:p@cdn.higgsfield.ai/a.mp4','https://cdn.higgsfield.ai:444/a.mp4','https://cdn.higgsfield.ai/a.html'])assert.throws(()=>sourceUrl(u,true));
 assert.equal(sourceUrl('https://cdn.higgsfield.ai/a.mp4',true),'https://cdn.higgsfield.ai/a.mp4');
});
test('discovery deduplicates escaped video links and rejects foreign media',()=>{
 const html='<video src="https://cdn.higgsfield.ai/a.mp4"></video> "https:\\/\\/cdn.higgsfield.ai\\/a.mp4" "https://evil.test/v.mp4" "https://static-public-media.higgsfield.ai/b.webm"';
 assert.deepEqual(extractDemoVideos(html),['https://cdn.higgsfield.ai/a.mp4','https://static-public-media.higgsfield.ai/b.webm']);
});
test('download enforces byte limit even without Content-Length and forbids redirects',async()=>{
 const original=globalThis.fetch;
 try{globalThis.fetch=async(url,init)=>{assert.equal(init.redirect,'error');return new Response(new Uint8Array(10));};await assert.rejects(boundedFetch('https://cdn.higgsfield.ai/a.mp4',5));}finally{globalThis.fetch=original;}
});
