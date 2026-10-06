import test from 'node:test';
import assert from 'node:assert/strict';
const { validateAuthInput, readSessionToken, makeSessionToken, consumeAuthLimit, isSameOriginMutation } = await import('../lib/auth-security.ts');
test('registration rejects non-string credentials and oversized email',()=>{
 assert.throws(()=>validateAuthInput({email:['a@b.co'],password:'12345678'},true));
 assert.throws(()=>validateAuthInput({email:'a'.repeat(250)+'@b.co',password:'12345678'},true));
 assert.equal(validateAuthInput({email:' User@Example.com ',password:'12345678',name:' Бороо '},true).email,'user@example.com');
});
test('signed sessions reject malformed expiry, expired values and extra segments',()=>{
 const secret='test-secret-'.repeat(4),token=makeSessionToken('user-id',secret,1000,100);
 assert.equal(readSessionToken(token,secret,1001),'user-id');
 assert.equal(readSessionToken(token,secret,1100),null);
 assert.equal(readSessionToken(token+'.extra',secret,1001),null);
 assert.equal(readSessionToken(makeSessionToken('user-id',secret,1000,NaN),secret,1001),null);
 assert.equal(readSessionToken(token.replace('dXNlci1pZA','dXNlci1peA'),secret,1001),null);
});
test('auth attempts are limited and become available after the window',()=>{
 const key='unit-limit';
 for(let i=0;i<3;i++)assert.equal(consumeAuthLimit(key,3,60000,1000).allowed,true);
 assert.equal(consumeAuthLimit(key,3,60000,1001).allowed,false);
 assert.equal(consumeAuthLimit(key,3,60000,61001).allowed,true);
});
test('mutation guard blocks foreign origins and allows same-origin JSON clients',()=>{
 assert.equal(isSameOriginMutation(new Request('https://ravs.example/api/auth/login',{method:'POST',headers:{origin:'https://evil.example'}})),false);
 assert.equal(isSameOriginMutation(new Request('https://ravs.example/api/auth/login',{method:'POST',headers:{origin:'https://ravs.example'}})),true);
 assert.equal(isSameOriginMutation(new Request('https://ravs.example/api/auth/login',{method:'POST',headers:{'sec-fetch-site':'cross-site'}})),false);
});
