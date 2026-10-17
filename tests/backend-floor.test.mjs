import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtempSync,rmSync,readFileSync} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
const port=()=>new Promise((resolve,reject)=>{const s=net.createServer();s.listen(0,'127.0.0.1',()=>{const port=s.address().port;s.close(()=>resolve(port))});s.on('error',reject)});
async function ready(base){for(let i=0;i<45;i++){try{if((await fetch(base+'/api/health')).ok)return}catch{}await new Promise(r=>setTimeout(r,70))}throw Error('Server not ready')}
async function read(base){return (await (await fetch(base+'/api/state')).json()).state}
async function patch(base,requestId,changes){const r=await fetch(base+'/api/patch',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({requestId,changes})});return {status:r.status,body:await r.json()}}
test('Floor designer tables and areas persist and synchronize through the patch API',async t=>{
 const dir=mkdtempSync(path.join(os.tmpdir(),'serviceflow-v04-'));const p=await port(),base=`http://127.0.0.1:${p}`,pathfile=path.join(dir,'runtime.json');
 const proc=spawn(process.execPath,[new URL('../server/server.mjs',import.meta.url).pathname],{env:{...process.env,SERVICEFLOW_DATA_FILE:pathfile,SERVICEFLOW_PORT:String(p)},stdio:'ignore'});
 t.after(()=>{proc.kill();rmSync(dir,{recursive:true,force:true})});await ready(base);
 const original=await read(base);
 assert.deepEqual(original.areas,['Main room','Terrace','Bar']);
 const m1=original.tables.find(x=>x.id==='m1');assert.equal(m1.x,17);assert.equal(m1.y,25);
 const next={...m1,name:'Table 11',x:56.8,y:43.4,shape:'round',seats:6};
 let r=await patch(base,'move-001',[{collection:'tables',id:m1.id,previous:m1,next}]);assert.equal(r.status,200);
 r=await patch(base,'area-001',[{collection:'areas',previous:original.areas,next:[...original.areas,'Garden']}]);assert.equal(r.status,200);
 const current=await read(base);assert.equal(current.tables.find(x=>x.id==='m1').x,56.8);assert.equal(current.tables.find(x=>x.id==='m1').name,'Table 11');assert.equal(current.tables.find(x=>x.id==='m1').seats,6);assert(current.areas.includes('Garden'));
 r=await patch(base,'invalid-pos-001',[{collection:'tables',id:next.id,previous:next,next:{...next,x:600}}]);assert.equal(r.status,422,'invalid floor coordinates must be rejected');
 const persisted=JSON.parse(readFileSync(pathfile,'utf8')).state;assert.equal(persisted.tables.find(x=>x.id==='m1').x,56.8);assert(persisted.areas.includes('Garden'));
});
