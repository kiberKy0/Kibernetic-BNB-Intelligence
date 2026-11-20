'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
function metadata(){const c={};vm.runInNewContext(read('bustabit-archive-data.js'),c);return c.KiberBustabitArchiveData}
test('prior CSV aggregate and six recent source fingerprints remain preserved as historical metadata',()=>{
 const d=metadata();assert.equal(d.evidence.bets,333);assert.equal(d.evidence.wins,139);assert.equal(d.evidence.sessions,3);assert.equal(d.evidence.netBits,-29.5);assert.match(d.evidence.status,/NON CERTIFICATO/);
 assert.equal(d.codes.length,6);assert.equal(new Set(d.codes.map(x=>x.sha)).size,6);for(const c of d.codes)assert.match(c.sha,/^[0-9a-f]{64}$/);
});
test('Bustabit entry page and archive route are the same unified original-bot library',()=>{
 const a=read('bustabit-lab.html'),b=read('bustabit-archivio.html');
 assert.equal(a,b);
 for(const id of ['bvaBotList','bvaDossier','bvaCodeText','bvaCopy','bvaDownload','bvaResults','bvaStrategies','bvaLogic','bustaClose'])assert.ok(a.includes('id="'+id+'"'),id);
 assert.match(a,/https:\/\/bustabit\.com\//);
 assert.match(a,/bustabit-vault\.js/);
 assert.match(a,/bustabit-finance\.css/);
 assert.match(a,/SHA-256/);
 assert.doesNotMatch(a,/id="kbtAnalyze"|bustabit-scanner\.js/);
});
test('archive is source-only: no executable betting code in page and source loading verifies hash',()=>{
 const js=read('bustabit-vault.js');assert.doesNotThrow(()=>new vm.Script(js));
 assert.match(js,/SHA-256/);assert.match(js,/crypto\.subtle\.digest/);
 assert.match(js,/loaded=\{entry,bytes,source\}/);assert.match(js,/navigator\.clipboard\.writeText/);
 assert.doesNotMatch(js,/engine\s*\.\s*bet\s*\(|\beval\s*\(/);
});
