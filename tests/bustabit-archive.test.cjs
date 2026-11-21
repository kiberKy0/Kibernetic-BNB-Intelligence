'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const base=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(base,p),'utf8');
function metadata(){const c={};vm.runInNewContext(read('bustabit-archive-data.js'),c);return c.KiberBustabitArchiveData}
test('past CSV aggregate and later metadata remain catalogued but are not presented as live results',()=>{
 const d=metadata();assert.equal(d.evidence.bets,333);assert.equal(d.evidence.wins,139);assert.equal(d.evidence.sessions,3);assert.equal(d.evidence.netBits,-29.5);assert.match(d.evidence.status,/NON CERTIFICATO/);
 assert.equal(d.codes.length,6);assert.equal(new Set(d.codes.map(x=>x.sha)).size,6);
});
test('both Bustabit entry routes display bot names, strategies, results and code-in-progress',()=>{
 const a=read('bustabit-lab.html'),b=read('bustabit-archivio.html');assert.equal(a,b);
 for(const id of ['bvaBotList','bvaDossier','bvaResults','bvaStrategies','bvaLogic','bvaPaneCode','bustaClose'])assert.ok(a.includes('id="'+id+'"'),id);
 for(const phrase of ['Codice in elaborazione','Strategie e tecnologie','Performance e log','https://bustabit.com/'])assert.ok(a.includes(phrase),phrase);
 assert.doesNotMatch(a,/bustabit-scanner\.js|kbtAnalyze|bvaCopy|bvaDownload|bvaCodeText/);
});
test('archive JavaScript is descriptive only and cannot fetch, copy, download or run source code',()=>{
 const js=read('bustabit-vault.js');assert.doesNotThrow(()=>new vm.Script(js));
 assert.match(js,/renderLogic|renderSummary/);assert.match(js,/renderStrategies/);assert.match(js,/renderResults/);
 assert.doesNotMatch(js,/fetch\s*\(|XMLHttpRequest|clipboard|createObjectURL|new Blob\s*\(|engine\s*\.\s*bet\s*\(|eval\s*\(/);
});
