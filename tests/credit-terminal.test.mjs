import test from 'node:test';
import assert from 'node:assert/strict';
import { tsImport } from 'tsx/esm/api';
const {db}=await tsImport('../lib/db.ts',{parentURL:import.meta.url});
const {markTerminalAndRefund}=await tsImport('../lib/credits.ts',{parentURL:import.meta.url});
test('late failed poll cannot replace a completed generation or refund its charge',async()=>{
 const originalUpdate=db.generation.updateMany,originalFind=db.generation.findUniqueOrThrow,originalTransaction=db.$transaction;
 const row={id:'g-complete',status:'COMPLETED',output:{video:{url:'https://example.com/video.mp4'}},refunded:false};let refunds=0;
 db.generation.updateMany=async({where,data})=>{if(where.status.notIn.includes(row.status))return{count:0};Object.assign(row,data);return{count:1}};
 db.generation.findUniqueOrThrow=async()=>row;db.$transaction=async()=>{refunds++;throw new Error('should not refund')};
 try{const result=await markTerminalAndRefund(row.id,'FAILED',{status:'failed'});assert.equal(result.status,'COMPLETED');assert.equal(result.output.video.url,'https://example.com/video.mp4');assert.equal(refunds,0);}finally{db.generation.updateMany=originalUpdate;db.generation.findUniqueOrThrow=originalFind;db.$transaction=originalTransaction}
});
