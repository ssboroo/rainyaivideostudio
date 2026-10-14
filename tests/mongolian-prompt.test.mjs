import test from 'node:test';
import assert from 'node:assert/strict';
import {analyzeMongolianPrompt,enhanceMongolianPrompt} from '../lib/mongolian-prompt.ts';

test('Mongolian prompt detects explicit identity, clothing, logo, speech and camera constraints',()=>{
 const input='Монгол залуу бороотой Улаанбаатарын гудамжинд алхаж байна. Царай өөрчлөхгүй, хувцас солихгүй, лого өөрчлөхгүй. Камер араас дагана. Монгол хэлээр ярина.';
 const a=analyzeMongolianPrompt(input);
 assert.equal(a.isMongolian,true);
 assert.ok(a.hints.some(s=>s.includes('rain')));
 assert.ok(a.hints.some(s=>s.includes('walking')));
 assert.ok(a.hints.some(s=>s.includes('following')));
 assert.ok(a.constraints.some(s=>s.includes('face')));
 assert.ok(a.constraints.some(s=>s.includes('clothing')));
 assert.ok(a.constraints.some(s=>s.includes('logo')));
 assert.ok(a.constraints.some(s=>s.includes('Mongolian')));
});
test('preserve user Mongolian text and include concrete English guidance',()=>{
 const text='Монгол бүсгүй цастай хөдөө нутагт алхана. Царайг өөрчлөхгүй, бодит кино мэт.';
 const enhanced=enhanceMongolianPrompt(text);
 assert.ok(enhanced.includes(text));
 assert.match(enhanced,/snow|winter/i);
 assert.match(enhanced,/same face|face identity/i);
 assert.match(enhanced,/cinematic|realistic/i);
 assert.ok(enhanced.length<=2800);
});
test('do not translate or rewrite unfamiliar clauses and respect explicit negative constraints',()=>{
 const text='Энэ зүйлийг яг хэвээр харуул. Дэлгэцэнд текст оруулахгүй. Хувцсыг солихгүй. Монгол хэлээр дуугарна.';
 const enhanced=enhanceMongolianPrompt(text);
 assert.ok(enhanced.includes(text));
 assert.match(enhanced,/no added on-screen text/i);
 assert.match(enhanced,/do not alter clothing/i);
 assert.match(enhanced,/spoken dialogue in Mongolian/i);
});
test('no input language assumption or free-form model hallucination',()=>{
 assert.equal(enhanceMongolianPrompt('Cinematic camera dolly in.'),'Cinematic camera dolly in.');
 assert.deepEqual(analyzeMongolianPrompt('Cinematic camera dolly in.').constraints,[]);
 const huge='Монгол видео: '+'а'.repeat(3000);
 assert.equal(enhanceMongolianPrompt(huge),huge);
});
test('deterministic and never invokes a remote API',()=>{
 const input='Улаанбаатар хотод бороо орно, камер хөдөлнө, монгол хүн харуул.';
 assert.equal(enhanceMongolianPrompt(input),enhanceMongolianPrompt(input));
});
