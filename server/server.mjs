/** ServiceFlow local integration server. DEMONSTRATION ONLY.
 * No authentication, no fiscal receipts, no payment processor, no real printing.
 * Binds to loopback by default. Never expose to untrusted users or the internet.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

const ROOT = path.resolve(fileURLToPath(new URL('..',import.meta.url)));
const DATA_FILE = process.env.SERVICEFLOW_DATA_FILE || path.join(ROOT,'data','runtime.json');
const SEED_FILE = path.join(ROOT,'data','seed.json');
const HOST = process.env.SERVICEFLOW_HOST || '127.0.0.1';
const PORT = Number(process.env.SERVICEFLOW_PORT || 4317);
const MIME={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon','.webmanifest':'application/manifest+json','.json':'application/json; charset=utf-8'};
if(!Number.isInteger(PORT)||PORT<1||PORT>65535)throw Error('Invalid port');

let db;
function readSeed(){return JSON.parse(fs.readFileSync(SEED_FILE,'utf8'))}
try{db=JSON.parse(fs.readFileSync(DATA_FILE,'utf8'))}catch(error){if(error.code!=='ENOENT')throw error;db={revision:0,state:readSeed(),processedIds:[]}}
function json(res,code,obj){res.writeHead(code,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj))}
function dataToWrite(){return JSON.stringify(db,null,2)+'\n'}
function persist(){fs.mkdirSync(path.dirname(DATA_FILE),{recursive:true});const temp=DATA_FILE+'.'+process.pid+'.tmp';fs.writeFileSync(temp,dataToWrite(),{mode:0o600});fs.renameSync(temp,DATA_FILE)}
function validState(s){
 if(!s||typeof s!=='object'||s.version!==1||typeof s.restaurant!=='string'||s.restaurant.length>100)return false;
 for(const [field,max] of [['products',1500],['tables',250],['stations',50],['printJobs',5000],['ledger',50000],['inventory',10000]])if(!Array.isArray(s[field])||s[field].length>max)return false;
 if(!s.products.every(p=>p&&typeof p.id==='string'&&p.id.length<90&&typeof p.name==='string'&&p.name.length<=120&&Number.isFinite(p.price)&&p.price>=0&&p.price<=1000000&&Number.isFinite(Number(p.cost||0))&&Number(p.cost||0)>=0))return false;
 if(!s.tables.every(t=>t&&typeof t.id==='string'&&Array.isArray(t.items)&&t.items.length<1000&&Number.isInteger(t.covers)&&t.covers>=0&&t.covers<=500))return false;
 if(!s.stations.every(x=>x&&typeof x.id==='string'&&x.id.length<90&&typeof x.name==='string'&&x.name.length<100))return false;
 return true;
}
function makePrintJobs(before,after){
 const seen=new Set(before.tables.flatMap(t=>t.items.filter(l=>l.sent).map(l=>l.id)));
 const jobs=[];
 for(const table of after.tables){
  const byStation=new Map();
  for(const line of table.items){
   if(!line.sent||seen.has(line.id))continue;
   const product=after.products.find(p=>p.id===line.productId);
   const stationId=line.stationId||product?.stationId||after.routes?.[product?.category]||'hot';
   if(!byStation.has(stationId))byStation.set(stationId,[]);
   byStation.get(stationId).push({id:line.id,name:line.productName||product?.name||'Item',qty:line.qty,course:line.course,notes:line.notes||'',options:line.options||[]});
  }
  for(const [stationId,items] of byStation){jobs.push({id:crypto.randomUUID(),at:new Date().toISOString(),tableId:table.id,table:table.name,stationId,status:'queued',items})}
 }
 return jobs;
}
// v0.3: compare-and-swap each touched resource, rather than rejecting unrelated tables.
// Each change includes the exact base object the terminal last observed. This is
// still a LAN development API with NO authentication and NO production authorization.
const RESOURCES = new Set(['tables','products','inventory','stations']);
const SINGLETONS = new Set(['restaurant','routes','categories','stockLog','shift','ledger','notes']);
const equal = (a,b)=>JSON.stringify(a)===JSON.stringify(b);
function applyChanges(changes){
 if(!Array.isArray(changes)||!changes.length||changes.length>250)throw Object.assign(new Error('Expected 1–250 changes'),{status:422});
 const draft=structuredClone(db.state);
 const keys=new Set();
 for(const c of changes){
  if(!c||typeof c!=='object'||typeof c.collection!=='string')throw Object.assign(new Error('Invalid change'),{status:422});
  const key=c.collection+':'+(c.id||'');
  if(keys.has(key))throw Object.assign(new Error('Duplicate change target'),{status:422});
  keys.add(key);
  if(RESOURCES.has(c.collection)){
   if(typeof c.id!=='string'||!c.id||c.id.length>90)throw Object.assign(new Error('Invalid resource ID'),{status:422});
   const list=draft[c.collection];if(!Array.isArray(list))throw Object.assign(new Error('Invalid collection'),{status:422});
   const idx=list.findIndex(v=>v.id===c.id);
   const current=idx<0?null:list[idx];
   if(!equal(current,c.previous??null))throw Object.assign(new Error('Another terminal changed '+c.collection+' / '+c.id+'. Refresh before editing again.'),{status:409});
   if(c.next===null){if(idx>=0)list.splice(idx,1)}
   else{
    if(!c.next||typeof c.next!=='object'||c.next.id!==c.id)throw Object.assign(new Error('Invalid updated resource'),{status:422});
    if(idx<0)list.push(c.next);else list[idx]=c.next;
   }
  }else if(SINGLETONS.has(c.collection)){
   if(!equal(draft[c.collection],c.previous))throw Object.assign(new Error('Another terminal changed '+c.collection+'. Refresh before editing again.'),{status:409});
   draft[c.collection]=c.next;
  }else throw Object.assign(new Error('Cannot edit '+c.collection),{status:422});
 }
 if(!validState(draft))throw Object.assign(new Error('Invalid restaurant data'),{status:422});
 if(draft.products.some((p,i,arr)=>arr.findIndex(v=>v.id===p.id)!==i))throw Object.assign(new Error('Duplicate product ID'),{status:422});
 if(draft.tables.some((p,i,arr)=>arr.findIndex(v=>v.id===p.id)!==i))throw Object.assign(new Error('Duplicate table ID'),{status:422});
 // Kitchen job queue is *always* assembled from newly sent lines on the server.
 const jobs=makePrintJobs(db.state,draft);
 draft.printJobs=[...db.state.printJobs,...jobs].slice(-5000);
 return {draft,jobs};
}
async function readJson(req){let parts=[],length=0;for await(const chunk of req){length+=chunk.length;if(length>5_000_000){const err=new Error('Payload exceeds 5 MB');err.status=413;throw err}parts.push(chunk)}try{return JSON.parse(Buffer.concat(parts).toString('utf8'))}catch{const err=new Error('Invalid JSON');err.status=400;throw err}}
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname==='/api/health'&&req.method==='GET')return json(res,200,{ok:true,mode:'local-demo-server',version:'0.3.0',scopedChanges:true,revision:db.revision,physicalPrinting:false,fiscal:false});
  if(url.pathname==='/api/state'&&req.method==='GET')return json(res,200,{revision:db.revision,state:db.state});
  if(url.pathname==='/api/patch'&&req.method==='POST'){
   const {requestId,changes}=await readJson(req);
   if(typeof requestId!=='string'||requestId.length<8||requestId.length>100)return json(res,422,{error:'Invalid requestId'});
   if(db.processedIds.includes(requestId))return json(res,200,{revision:db.revision,state:db.state,replayed:true,ticketsCreated:0});
   let result;
   try{result=applyChanges(changes)}catch(error){return json(res,error.status||500,{error:error.message,revision:db.revision});}
   db={revision:db.revision+1,state:result.draft,processedIds:[...db.processedIds,requestId].slice(-300)};
   persist();return json(res,200,{revision:db.revision,state:db.state,ticketsCreated:result.jobs.length});
  }
  if(url.pathname==='/api/commit'&&req.method==='POST'){
   const {revision,requestId,state}=await readJson(req);
   if(!Number.isInteger(revision)||typeof requestId!=='string'||requestId.length>100||!validState(state))return json(res,422,{error:'Invalid restaurant data or revision'});
   if(db.processedIds.includes(requestId))return json(res,200,{revision:db.revision,state:db.state,replayed:true});
   if(revision!==db.revision)return json(res,409,{error:'Another terminal made a change. Reload latest data.',revision:db.revision,state:db.state});
   const jobs=makePrintJobs(db.state,state);
   // The server owns printer ticket creation. Clients cannot overwrite existing jobs.
   state.printJobs=[...db.state.printJobs,...jobs].slice(-5000);
   db={revision:db.revision+1,state,processedIds:[...db.processedIds,requestId].slice(-300)};
   persist();return json(res,200,{revision:db.revision,state:db.state,ticketsCreated:jobs.length});
  }
  if(url.pathname.startsWith('/api/'))return json(res,404,{error:'No such API route'});
  if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Method not allowed'});
  const requested=decodeURIComponent(url.pathname);
  const file=path.resolve(ROOT,'.'+(requested==='/'?'/index.html':requested));
  if(file!==ROOT&&!file.startsWith(ROOT+path.sep))return json(res,403,{error:'Forbidden'});
  if(file.includes(path.sep+'data'+path.sep)||file.includes(path.sep+'server'+path.sep)||file.includes(path.sep+'docs'+path.sep)||path.basename(file).startsWith('.'))return json(res,403,{error:'Private resource'});
  let stat;try{stat=fs.statSync(file)}catch{return json(res,404,{error:'Not found'})}
  if(!stat.isFile())return json(res,404,{error:'Not found'});
  res.writeHead(200,{'Content-Type':MIME[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Cache-Control':/\.(js|css|html)$/.test(file)?'no-cache':'max-age=120'});
  if(req.method==='HEAD')return res.end();fs.createReadStream(file).pipe(res);return;
 }catch(err){json(res,err.status||500,{error:err.status?err.message:'Server error'})}
});
server.listen(PORT,HOST,()=>{console.log(`ServiceFlow demo server listening at http://${HOST}:${PORT}/`)});
