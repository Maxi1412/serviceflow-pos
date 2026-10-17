import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';

async function port(){return new Promise((resolve,reject)=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const p=s.address().port;s.close(()=>resolve(p))});s.on('error',reject)})}
async function ready(base){for(let n=0;n<50;n++){try{if((await fetch(base+'/api/health')).ok)return}catch{}await new Promise(r=>setTimeout(r,75))}throw Error('Server not ready')}
async function post(base,requestId,changes){const r=await fetch(base+'/api/patch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId,changes})});return {status:r.status,body:await r.json()}}
const change=(collection,previous,next)=>({collection,id:previous?.id||next?.id,previous,next});

test('Scoped concurrent updates, manager menu, kitchen routes and idempotency',async t=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'serviceflow-v03-'));const p=await port();const base=`http://127.0.0.1:${p}`;
 const proc=spawn(process.execPath,[new URL('../server/server.mjs',import.meta.url).pathname],{env:{...process.env,SERVICEFLOW_DATA_FILE:path.join(dir,'runtime.json'),SERVICEFLOW_PORT:String(p)},stdio:'ignore'});
 t.after(()=>{proc.kill();fs.rmSync(dir,{recursive:true,force:true})});await ready(base);
 const initial=(await (await fetch(base+'/api/state')).json()).state;
 const a=structuredClone(initial.tables.find(t=>t.id==='m1'));const b=structuredClone(initial.tables.find(t=>t.id==='t2'));
 const a2={...a,covers:2,openedAt:new Date().toISOString()};const b2={...b,covers:4,openedAt:new Date().toISOString()};
 let res=await post(base,'request-table-a-001',[change('tables',a,a2)]);assert.equal(res.status,200);
 res=await post(base,'request-table-b-001',[change('tables',b,b2)]);assert.equal(res.status,200,'unrelated terminal table edits must merge');
 res=await post(base,'request-table-duplicate',[change('tables',a,{...a,covers:7})]);assert.equal(res.status,409,'same table conflict must reject');
 let current=(await (await fetch(base+'/api/state')).json()).state;
 assert.equal(current.tables.find(t=>t.id==='m1').covers,2);assert.equal(current.tables.find(t=>t.id==='t2').covers,4);
 const steak=structuredClone(current.products.find(p=>p.id==='p4'));
 res=await post(base,'request-menu-price-001',[change('products',steak,{...steak,price:32.25,cost:14.2,subcategory:'Steaks'})]);assert.equal(res.status,200);
 const m1=structuredClone(current.tables.find(t=>t.id==='m1'));
 const sentLine=(id,productId,stationId,name,notes)=>({id,productId,productName:name,stationId,basePrice:9.0,qty:1,course:'Main',sent:true,ready:false,notes,options:[],at:Date.now()});
 const sent={...m1,items:[sentLine('sf-line-hot-001','p4','hot','Sirloin steak','Medium rare, chips'),sentLine('sf-line-bar-001','p9','bar','House wine','No ice')]};
 res=await post(base,'request-send-ticket-001',[change('tables',m1,sent)]);
 assert.equal(res.status,200);assert.equal(res.body.ticketsCreated,2);
 assert.deepEqual(new Set(res.body.state.printJobs.map(x=>x.stationId)),new Set(['hot','bar']));
 assert.equal(res.body.state.printJobs.find(x=>x.stationId==='hot').items[0].notes,'Medium rare, chips');
 assert.equal(res.body.state.products.find(p=>p.id==='p4').price,32.25,'menu edits and waiter edits should coexist');
 const replay=await post(base,'request-send-ticket-001',[change('tables',m1,sent)]);assert.equal(replay.status,200);assert.equal(replay.body.replayed,true);assert.equal(replay.body.state.printJobs.length,2);
 const evil=await post(base,'request-printer-mutation',[{collection:'printJobs',previous:[],next:[]}]);assert.equal(evil.status,422);
 const output=JSON.parse(fs.readFileSync(path.join(dir,'runtime.json'),'utf8'));
 assert.equal(output.state.tables.find(t=>t.id==='m1').items.length,2);assert.equal(output.state.printJobs.length,2);
 assert.equal((await fetch(base+'/data/runtime.json')).status,403);
});
