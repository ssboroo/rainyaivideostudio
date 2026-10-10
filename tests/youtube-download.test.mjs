import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");

test("standalone YouTube downloads menu does not depend on Genjutsu or credit flow",()=>{
 const nav=read("components/sidebar.tsx"),page=read("app/youtube/page.tsx"),client=read("components/youtube-download-panel.tsx");
 assert.match(nav,/\["\/youtube", "YouTube видео татах", Film\]/);
 assert.match(page,/<YoutubeDownloadPanel\/>/);
 assert.doesNotMatch(page,/Genjutsu|generation|credit/);
 assert.doesNotMatch(client,/\/api\/generations|clipToken|providerCostUsd/);
 assert.match(client,/https:\/\/studio\.youtube\.com\//);
 assert.match(client,/YouTube Studio/);
});

test("official embed preview is not labelled an exported MP4",()=>{
 const page=read("components/youtube-download-panel.tsx");
 assert.match(page,/parseYouTubeVideo\(source\)/);
 assert.match(page,/youtubeClipEmbed\(video\.id,begin,end\)/);
 assert.match(page,/YouTube-ийн албан embed/);
 assert.match(page,/татсан MP4 файл биш/);
});

test("MP4 export requires a user-owned uploaded source, limited trim and consent",()=>{
 const client=read("components/youtube-download-panel.tsx");
 const api=read("app/api/clips/export/route.ts");
 assert.match(client,/type="file" accept="video\/mp4"/);
 assert.match(client,/data|FormData/);
 assert.match(client,/confirmRights/);
 assert.match(client,/fetch\("\/api\/clips\/export"/);
 assert.match(client,/el\.download=/);
 assert.match(client,/response\.blob\(\)/);
 assert.match(api,/confirmRights/);
 assert.match(api,/await request\.formData\(\)/);
 assert.match(api,/validClipWindow\(start,end\)/);
 assert.match(api,/ffprobe/);
 assert.match(api,/ffmpeg/);
 assert.match(api,/0:a:0\?/);
 assert.match(api,/Content-Disposition/);
 assert.match(api,/private, no-store/);
 assert.doesNotMatch(api,/yt-dlp|ytdl|youtube\.com|youtu\.be/);
});

test("mobile download layout and focus interaction",()=>{
 const css=read("app/youtube/youtube.css");
 for(const bp of [1120,680,380])assert.match(css,new RegExp('@media\\(max-width:'+bp+'px\\)'));
 assert.match(css,/:focus-visible/);
 assert.match(css,/min-height:52px/);
});
