import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(name)=>readFileSync(new URL("../"+name,import.meta.url),"utf8");
const library=read("lib/creative-demo-library.ts");
const gallery=read("components/creative-demo-gallery.tsx");
const player=read("components/demo-player.tsx");
const trend=read("components/trend-showcase.tsx");

test("official-source playable media library has category-specific original Mongolian prompts",()=>{
 for(const id of ["eyes-in","world-morphing","floating-fall","genjutsu-showcase","product-ad","ai-character","motion-transfer-1"])
  assert.ok(library.includes('"'+id+'":{modelSlug:'),id);
 assert.match(library,/trendDemos\.filter\(d=>d\.previewSrc\)/);
 assert.match(library,/videoShowcases\.filter\(item=>item\.previewSrc\)/);
 assert.match(library,/videoUrl:item\.previewSrc/);
 assert.match(library,/studioDemoHref/);
 assert.match(library,/encodeURIComponent\(item\.prompt\)/);
 assert.match(library,/NOT the unpublished\/exact Higgsfield source prompts/);
});
test("trends and five tool sections share a playable in-site video player with prompt copy",()=>{
 for(const path of ["app/cinema/page.tsx","app/marketing/page.tsx","app/influencer/page.tsx","app/apps/page.tsx","app/video-guide/page.tsx"]){
  const page=read(path);assert.match(page,/<CreativeDemoGallery surface=/,path);
 }
 assert.match(trend,/<CreativeDemoGallery surface=/);
 assert.match(gallery,/<DemoPlayer source=\{item\.sourceUrl\} src=\{item\.videoUrl\}/);
 assert.match(gallery,/navigator\.clipboard\.writeText\(item\.prompt\)/);
 assert.match(gallery,/studioDemoHref\(item\)/);
 assert.match(gallery,/aria-pressed=\{category===/);
 assert.match(gallery,/type="button"/);
 assert.match(gallery,/href=\{item\.sourceUrl\}/);
 assert.match(gallery,/return null/);
});
test("new trending official concepts are clearly distinct from verified playable clips",()=>{
 for(const id of ["bullet-time","fallen-angel","urban-cuts","product-asmr","recast"])
  assert.ok(library.includes('id:"'+id+'"'),id);
 assert.match(gallery,/Яг таарсан видео файл баталгаажаагүй/);
 assert.match(gallery,/Кредит зөвхөн Studio дээр баталсан генерацад/);
});
test("video playback only loads near viewport and respects phone controls",()=>{
 assert.match(player,/IntersectionObserver/);
 assert.match(player,/rootMargin:"450px"/);
 assert.match(player,/preload="metadata"/);
 assert.match(player,/playsInline/);
 assert.match(player,/onError=\{\(\)=>setState\("error"\)\}/);
 const css=read("components/creative-demo-gallery.css");
 assert.match(css,/@media\(max-width:570px\)/);
 assert.match(css,/:focus-visible/);
 assert.match(css,/min-height:44px/);
});
