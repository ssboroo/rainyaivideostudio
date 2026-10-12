import test from 'node:test';
import assert from 'node:assert/strict';
import {issueAssetProof,verifyAssets,imageSignatureValid} from '../lib/campaign-assets.ts';
import {createLongMoviePlan} from '../lib/long-movie-plan.ts';
import {getModel,buildProviderInput} from '../lib/models.ts';
import {createSiteAllowed} from '../lib/create-site-routing.ts';
import {storyboardHash,approvedStoryboard} from '../lib/storyboard-policy.ts';
const secret='x'.repeat(40),data=Buffer.from([255,216,255,0]).toString('base64');
function asset(){const a={url:'https://cdn.example.com/product.jpg',name:'product.jpg',mimeType:'image/jpeg',kind:'product',data};return {...a,proof:issueAssetProof(a,'owner',secret,100)};}
test('assets bind authenticated owner, exact uploaded URL, kind and bytes',()=>{
 const a=asset();assert.equal(verifyAssets([a],'owner',secret,200).length,1);
 for(const changed of [{...a,url:'https://evil.example/a.jpg'},{...a,data:'AAAA'},{...a,kind:'frame'}])assert.throws(()=>verifyAssets([changed],'owner',secret,200));
 assert.throws(()=>verifyAssets([a],'other',secret,200));assert.throws(()=>verifyAssets([a],'owner',secret,100+3*86400000));assert.throws(()=>verifyAssets([a,a],'owner',secret,200));
});
test('image MIME must match actual signature',()=>{assert.equal(imageSignatureValid(Uint8Array.from([255,216,255,0]),'image/jpeg'),true);assert.equal(imageSignatureValid(Uint8Array.from([1,2,3]),'image/jpeg'),false);});
test('product image reaches every quoted image-to-video scene',()=>{
 const plan=createLongMoviePlan({prompt:'A product advertising film with coffee packaging.',targetSeconds:15,modelSlug:'wan-3-prime-image',aspectRatio:'9:16',resolution:'720p',generateAudio:false,imageUrl:'https://cdn.example.com/product.jpg'});
 const model=getModel('wan-3-prime-image');for(const s of plan.scenes){assert.equal(s.templateInput.imageUrl,'https://cdn.example.com/product.jpg');assert.ok(JSON.stringify(buildProviderInput(model,s.templateInput)).includes('https://cdn.example.com/product.jpg'));}assert.ok(plan.totalVideoCredits>0);
});
test('approved storyboard also binds reference material',()=>{const plan={scenes:[]},refs=[asset()];const hash=storyboardHash(plan,refs);assert.equal(approvedStoryboard(plan,hash,refs),true);assert.equal(approvedStoryboard(plan,hash,[{...refs[0],url:'https://cdn.example.com/other.jpg'}]),false);});
test('standalone Create serves its flow but excludes Video workspace and paid APIs',()=>{
 for(const path of ['/','/login','/register','/create','/api/health','/api/campaigns/uploads'])assert.equal(createSiteAllowed(path),true);
 for(const path of ['/studio','/admin','/mcp','/api/generations','/api/billing/wire/create'])assert.equal(createSiteAllowed(path),false);
});
