import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(p)=>readFileSync(new URL("../"+p,import.meta.url),"utf8");
test("navigation keeps distinct workflow destinations without duplicate Genjutsu entries",()=>{
 const sidebar=read("components/sidebar.tsx");
 const hrefs=[...sidebar.matchAll(/\["(\/[^"]+)",/g)].map(m=>m[1]);
 assert.equal(hrefs.length,new Set(hrefs).size);
 assert.equal(hrefs.filter(h=>h.includes("genjutsu")).length,0);
 assert.equal(hrefs.filter(h=>h.includes("Genjutsu")).length,1);
 for(const path of ["/director","/movie-producer","/studio","/explore"])assert.ok(hrefs.includes(path),path);
 assert.equal(hrefs.filter(h=>h==="/apps").length,0);
});
test("legacy duplicate Movie page redirects to the canonical explanation",()=>{
 const old=read("app/movie/page.tsx");
 assert.match(old,/redirect\("\/movie-producer"\)/);
 const canonical=read("app/movie-producer/page.tsx");
 assert.match(canonical,/href="\/director"/);
 assert.match(canonical,/href="\/studio"/);
 assert.match(canonical,/нэг товчоор бүх шатыг автомат гүйцэтгэхгүй/);
});
test("home opens actual AI Director and routes Movie Producer to one canonical URL",()=>{
 const home=read("app/page.tsx");
 assert.match(home,/href="\/director" className="moviePromoHome"/);
 assert.match(home,/href="\/movie-producer" className="primary large"/);
 assert.doesNotMatch(home,/href="\/movie"/);
 assert.match(read("app/explore/page.tsx"),/href="\/apps"/);
 assert.match(read("app/apps/page.tsx"),/href="\/studio\?model=genjutsu-motion&source=youtube"/);
});
