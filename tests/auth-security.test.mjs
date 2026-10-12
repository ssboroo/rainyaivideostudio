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
test('password reset revokes earlier sessions including legacy cookies',()=>{
 const secret='test-secret-'.repeat(4), age=2592000;
 const before=makeSessionToken('u',secret,1000,age,1000123);
 const after=makeSessionToken('u',secret,1000,age,1000789);
 const options={passwordChangedAt:new Date(1000456),maxAge:age};
 assert.equal(readSessionToken(before,secret,1000,options),null);
 assert.equal(readSessionToken(after,secret,1000,options),'u');
 const legacy=makeSessionToken('u',secret,999,age);
 assert.equal(readSessionToken(legacy,secret,1000,options),null);
 assert.equal(readSessionToken(legacy,secret,1000),'u');
 assert.equal(readSessionToken(makeSessionToken('u',secret,1001,age),secret,1001,options),'u');
 assert.equal(readSessionToken(makeSessionToken('u',secret,1000,age,1000456),secret,1000,options),null);
 assert.equal(readSessionToken(makeSessionToken('u',secret,1000,age,NaN),secret,1000,options),null);
});
test('mutation guard blocks foreign origins and allows same-origin JSON clients',()=>{
 assert.equal(isSameOriginMutation(new Request('https://ravs.example/api/auth/login',{method:'POST',headers:{origin:'https://evil.example'}})),false);
 assert.equal(isSameOriginMutation(new Request('https://ravs.example/api/auth/login',{method:'POST',headers:{origin:'https://ravs.example'}})),true);
 assert.equal(isSameOriginMutation(new Request('https://ravs.example/api/auth/login',{method:'POST',headers:{'sec-fetch-site':'cross-site'}})),false);
});
test('a login paused across reset cannot mint an accepted session from the old password proof',()=>{
 const secret='test-secret-'.repeat(4),age=2592000;
 const oldProof='scrypt$old-salt$old-key', newProof='scrypt$new-salt$new-key';
 const resetAt=new Date(1000456);
 const stale=makeSessionToken('u',secret,1001,age,1001789,oldProof);
 const current={passwordChangedAt:resetAt,maxAge:age,passwordHash:newProof};
 assert.equal(readSessionToken(stale,secret,1002,current),null);
 const fresh=makeSessionToken('u',secret,1001,age,1001789,newProof);
 assert.equal(readSessionToken(fresh,secret,1002,current),'u');
 assert.ok(!fresh.includes(newProof));
});
