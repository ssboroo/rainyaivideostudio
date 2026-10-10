import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const home=readFileSync(new URL("../app/page.tsx",import.meta.url),"utf8");
const css=readFileSync(new URL("../app/home-studio.css",import.meta.url),"utf8");
const pictograms=readFileSync(new URL("../components/home-iconography.tsx",import.meta.url),"utf8");
const product=readFileSync(new URL("../lib/product.ts",import.meta.url),"utf8");

test("homepage has purposeful workflow art and functional two-link actions",()=>{
  assert.match(home,/workflows\.map\(\(item, index\)/);
  assert.match(home,/<WorkflowArtwork id=\{item\.id\}/);
  assert.match(home,/href=\{item\.href\}/);
  assert.match(home,/href=\{"\/video-guide#" \+ item\.id\}/);
  assert.match(home,/aria-label=\{item\.title \+ " — бүтээж эхлэх"\}/);
  assert.doesNotMatch(home,/className="workflowIconStage"/);
  for(const id of ["video","image","cinema","genjutsu","marketing","influencer","apps"]){
    assert.match(product,new RegExp('id: "'+id+'"'));
    assert.match(pictograms,new RegExp('^  '+id+':', "m"));
  }
});

test("model links still target the original studio with differentiable engine symbols",()=>{
  assert.match(home,/featured\.map\(\(model\)/);
  assert.match(home,/href=\{"\/studio\?model=" \+ encodeURIComponent\(model\.slug\)\}/);
  assert.match(home,/<EngineMark slug=\{model\.slug\} kind=\{model\.kind\}/);
  for(const family of ["seedance","kling","wan","cinema","genjutsu","marketing","soul","ideogram","recraft"]){
    assert.ok(pictograms.includes('slug.startsWith("'+family+'")'),family);
  }
  assert.match(home,/model\.capabilities/);
  assert.match(home,/model\.maker \|\| model\.provider/);
});

test("home-only CSS keeps mobile cards readable and keyboard focus visible",()=>{
  assert.match(home,/import "\.\/home-studio\.css"/);
  assert.match(css,/\.productHome \.homeWorkflowGrid/);
  assert.match(css,/\.productHome \.homeEngineGrid/);
  for(const size of [1250,1020,760,570,360])assert.ok(css.includes("@media(max-width:"+size+"px)"));
  assert.match(css,/grid-template-columns:minmax\(0,1fr\)/);
  assert.match(css,/min-height:44px/);
  assert.match(css,/:focus-visible/);
  assert.match(css,/@media\(prefers-reduced-motion:reduce\)/);
  assert.match(pictograms,/aria-hidden="true"/);
});
