import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';

async function unusedPort(){return await new Promise((resolve,reject)=>{const srv=net.createServer();srv.listen(0,'127.0.0.1',()=>{const port=srv.address().port;srv.close(()=>resolve(port))});srv.on('error',reject)})}
async function connect(base){for(let i=0;i<45;i++){try{const response=await fetch(base+'/api/health');if(response.ok)return}catch{}await new Promise(r=>setTimeout(r,60))}throw Error('server did not start')}
const seed=JSON.parse(fs.readFileSync(new URL('../data/seed.json',import.meta.url),'utf8'));
test('Shared data, conflict control and station print queue',async t=>{
 const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sf-pos-'));const port=await unusedPort();const base=`http://127.0.0.1:${port}`;
 const child=spawn(process.execPath,[new URL('../server/server.mjs',import.meta.url).pathname],{env:{...process.env,SERVICEFLOW_PORT:String(port),SERVICEFLOW_DATA_FILE:path.join(tmp,'runtime.json')},stdio:'ignore'});
 t.after(()=>{child.kill();fs.rmSync(tmp,{recursive:true,force:true})});
 await connect(base);
 const first=await (await fetch(base+'/api/state')).json();assert.equal(first.revision,0);assert.equal(first.state.products.length,seed.products.length);
 const next=structuredClone(first.state);const steak=next.products.find(p=>p.id==='p4');steak.price=25.75;steak.cost=9.85;
 let response=await fetch(base+'/api/commit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({revision:0,requestId:'update-menu',state:next})});
 assert.equal(response.status,200);let saved=await response.json();assert.equal(saved.revision,1);assert.equal(saved.ticketsCreated,0);
 response=await fetch(base+'/api/commit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({revision:0,requestId:'conflicting-write',state:next})});assert.equal(response.status,409);
 const after=structuredClone(saved.state);const table=after.tables.find(t=>t.id==='m1');table.covers=3;table.openedAt=new Date().toISOString();table.items.push({id:'unique-steak-ticket-01',productId:'p4',productName:steak.name,basePrice:steak.price,qty:2,stationId:'hot',course:'Main',options:[{group:'Side dish',label:'Chips instead',price:2}],notes:'Medium rare, no onions',sent:true,ready:false,at:Date.now()});
 response=await fetch(base+'/api/commit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({revision:1,requestId:'send-order-01',state:after})});assert.equal(response.status,200);
 saved=await response.json();assert.equal(saved.ticketsCreated,1);assert.equal(saved.state.printJobs.at(-1).stationId,'hot');assert.equal(saved.state.printJobs.at(-1).items[0].notes,'Medium rare, no onions');
 response=await fetch(base+'/api/commit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({revision:1,requestId:'send-order-01',state:after})});assert.equal(response.status,200);assert.equal((await response.json()).replayed,true);
 response=await fetch(base+'/data/runtime.json');assert.equal(response.status,403);
 assert.ok(fs.existsSync(path.join(tmp,'runtime.json')));
});
