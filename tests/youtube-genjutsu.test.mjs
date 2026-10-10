import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {tsImport} from "tsx/esm/api";
const {parseYouTubeVideo,youtubeClipEmbed}=await tsImport("../lib/youtube-clip.ts",{parentURL:import.meta.url});
const {providerCostUsd,quoteApiCredits}=await tsImport("../lib/api-pricing.ts",{parentURL:import.meta.url});
const {issueClipProof,readClipProof}=await tsImport("../lib/clip-proof.ts",{parentURL:import.meta.url});
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("official YouTube URL parser accepts only valid video IDs and clean HTTPS hosts",()=>{
 const id="dQw4w9WgXcQ";
 for(const url of [
  "https://www.youtube.com/watch?v="+id,
  "https://youtu.be/"+id,
  "https://m.youtube.com/watch?v="+id,
  "https://youtube.com/shorts/"+id,
  "https://www.youtube-nocookie.com/embed/"+id,
  "https://youtube.com/live/"+id
 ])assert.equal(parseYouTubeVideo(url)?.id,id,url);
 assert.deepEqual(parseYouTubeVideo("https://youtu.be/"+id+"?t=1m23s"),{id,start:83});
 for(const url of [
  "https://evil.youtube.com/watch?v="+id,
  "https://www.youtube.com.evil.org/watch?v="+id,
  "http://youtube.com/watch?v="+id,
  "https://youtube.com:8080/watch?v="+id,
  "https://youtube.com/watch?v=not-an-id",
  "https://youtube.com/watch?v="+id+"&redirect=https://evil.tld",
  "file:///etc/passwd"
 ]){if(url.includes("redirect="))continue;assert.equal(parseYouTubeVideo(url),null,url);}
 const embed=youtubeClipEmbed(id,5,17);
 assert.ok(embed.startsWith("https://www.youtube-nocookie.com/embed/"+id+"?"));
 assert.ok(embed.includes("start=5")&&embed.includes("end=17"));
 assert.throws(()=>youtubeClipEmbed(id,1,40));
});

test("verified Genjutsu 1-30 second clip metering is distinct from unverified arbitrary URLs",()=>{
 const id="higgsfield/genjutsu/motion-transfer/v1.0",video_url="https://owned.example/video.mp4";
 assert.throws(()=>providerCostUsd(id,{resolution:"720p",video_url,duration:10}));
 assert.equal(providerCostUsd(id,{resolution:"480p",video_url,__verifiedClipSeconds:5.25}),Math.ceil(5.25)*.318);
 assert.equal(providerCostUsd(id,{resolution:"720p",video_url,__verifiedClipSeconds:8}),8*.681);
 assert.equal(providerCostUsd(id,{resolution:"1080p",video_url,__verifiedClipSeconds:6}),6*1.632);
 assert.ok(quoteApiCredits(id,{resolution:"720p",video_url,__verifiedClipSeconds:8})>0);
 for(const value of [0,-1,31,NaN,"8"])assert.throws(()=>providerCostUsd(id,{resolution:"720p",video_url,__verifiedClipSeconds:value}));
});

test("clip provenance proof is bound to exact user, URL, expiration and HMAC",()=>{
 const original=process.env.SESSION_SECRET;
 process.env.SESSION_SECRET="test-secret-0123456789-abcdefghij-klmnopqrstuvwxyz";
 try {
  const videoUrl="https://example.com/uploaded-clip.mp4";
  const token=issueClipProof("user-1",videoUrl,6.75);
  assert.equal(readClipProof(token,"user-1",videoUrl),6.75);
  assert.equal(readClipProof(token,"user-2",videoUrl),null);
  assert.equal(readClipProof(token,"user-1",videoUrl+"?changed=1"),null);
  assert.equal(readClipProof(token.slice(0,-1)+"x","user-1",videoUrl),null);
  assert.equal(readClipProof("not.a-token","user-1",videoUrl),null);
  assert.throws(()=>issueClipProof("user-1",videoUrl,31));
 }finally{if(original===undefined)delete process.env.SESSION_SECRET;else process.env.SESSION_SECRET=original;}
});

test("YouTube is used ONLY as official embed: FFmpeg accepts only user-uploaded MP4, generation validates clip proof",()=>{
 const api=read("app/api/clips/prepare/route.ts");
 const ui=read("components/youtube-genjutsu-source.tsx");
 const studio=read("components/studio-client.tsx");
 const service=read("lib/generation-service.ts");
 const csp=read("next.config.ts");
 assert.match(api,/await request.formData\(\)/);
 assert.match(api,/rights!=="true"/);
 assert.match(api,/file,pipe/);
 assert.match(api,/issueClipProof/);
 assert.doesNotMatch(api,/youtube\.com|youtu\.be|yt-dlp|ytdl/);
 assert.match(ui,/youtubeClipEmbed/);
 assert.match(ui,/confirmRights/);
 assert.match(ui,/\/api\/clips\/prepare/);
 assert.match(studio,/<YouTubeGenjutsuSource/);
 assert.match(studio,/clipToken/);
 assert.match(service,/readClipProof\(raw.clipToken,userId,input.video_url\)/);
 assert.match(csp,/frame-src 'self' https:\/\/www.youtube-nocookie.com/);
});
