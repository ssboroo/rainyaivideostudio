import test from 'node:test';
import assert from 'node:assert/strict';
const {mediaFrom}=await import('../lib/generation-media.ts');
test('completed media covers direct and nested responses without executable URLs',()=>{
 assert.deepEqual(mediaFrom({video:{url:'https://cdn.example/result.mp4'}}),{type:'video',url:'https://cdn.example/result.mp4'});
 assert.deepEqual(mediaFrom({output:{images:[{url:'https://cdn.example/result.png'}]}}),{type:'image',url:'https://cdn.example/result.png'});
 assert.equal(mediaFrom({video:{url:'javascript:alert(1)'}}),null);
});
