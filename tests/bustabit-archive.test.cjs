'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const base=path.join(__dirname,'..');
const read=p=>fs.readFileSync(path.join(base,p),'utf8');
function data(){
 const sandbox={};
 vm.runInNewContext(read('bustabit-archive-data.js'),sandbox);
 return sandbox.KiberBustabitArchiveData;
}
test('evidence registry reproduces reported CSV aggregates without claiming LIVE',()=>{
 const d=data();
 assert.equal(d.evidence.bets,333);
 assert.equal(d.evidence.wins,139);
 assert.equal(d.evidence.sessions,3);
 assert.equal(d.evidence.netBits,-29.5);
 assert.equal(d.strategies.reduce((a,x)=>a+x.bets,0),d.evidence.bets);
 assert.equal(d.strategies.reduce((a,x)=>a+x.wins,0),d.evidence.wins);
 assert.ok(Math.abs(d.strategies.reduce((a,x)=>a+x.net,0)-d.evidence.netBits)<1e-6);
 assert.match(d.evidence.status,/NON CERTIFICATO/);
});
test('six original versions are individually keyed to immutable byte fingerprints',()=>{
 const d=data();
 assert.equal(d.codes.length,6);
 assert.equal(new Set(d.codes.map(x=>x.sha)).size,d.codes.length);
 assert.equal(new Set(d.codes.map(x=>x.file)).size,d.codes.length);
 for(const c of d.codes){
  assert.match(c.sha,/^[a-f0-9]{64}$/);
  assert.ok(c.bytes>1000);
  assert.ok(c.state.length>5);
 }
});
test('archive route has all accessible controls and script dependencies',()=>{
 const html=read('bustabit-archivio.html');
 for(const id of ['bfStrategyRows','bfArchiveCards','bfArchiveImport','bfArchiveStatus','bfTeachSelect','bfTeachText','bfSourceDialog','bfSourceText','bfSourceDownload','bfSourceClose','bustaClose']){
  assert.ok(html.includes('id="'+id+'"'),id);
 }
 for(const path of ['bustabit-finance.css','bustabit-archive-data.js','bustabit-archive-ui.js'])assert.ok(html.includes(path));
 assert.ok(html.includes('/bustabit-lab.html'));
 assert.match(html,/(Non certificato LIVE|LIVE non certificate|LIVE NON CERTIFICATO)/i);
});
test('legacy Bustabit lab provides link to new original archive',()=>{
 const html=read('bustabit-lab.html');
 assert.ok(html.includes('href="/bustabit-archivio.html"'));
 assert.ok(html.includes('bustabit-finance.css'));
 assert.ok(html.includes('id="kbtAnalyze"'));
});
test('private archive source never uploads or runs imported JS',()=>{
 const js=read('bustabit-archive-ui.js');
 assert.ok(js.includes('indexedDB'));
 assert.ok(js.includes('SHA-256'));
 assert.ok(js.includes('crypto.subtle.digest'));
 assert.ok(js.includes('file.arrayBuffer()'));
 assert.ok(js.includes('new Blob([record.bytes]'));
 assert.doesNotMatch(js,/engine\s*\.\s*bet\s*\(/);
 assert.doesNotMatch(js,/fetch\s*\(|XMLHttpRequest|eval\s*\(|new\s+Function\s*\(/);
});
test('JS syntax and selector references',()=>{
 const js=read('bustabit-archive-ui.js');
 new (require('node:vm').Script)(js,{filename:'bustabit-archive-ui.js'});
 const html=read('bustabit-archivio.html');
 const refs=[...js.matchAll(/\$\('([A-Za-z][A-Za-z0-9]+)'\)/g)].map(x=>x[1]);
 for(const ref of new Set(refs))assert.ok(html.includes('id="'+ref+'"'),'missing id '+ref);
});
