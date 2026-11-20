'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const dir=path.join(__dirname,'..'),read=n=>fs.readFileSync(path.join(dir,n),'utf8');
function catalog(){
 const ctx={};for(const f of ['bustabit-archive-data.js','bustabit-legacy-data.js','bustabit-tech-functions-primary.js','bustabit-tech-functions-variants.js','bustabit-tech-data.js'])vm.runInNewContext(read(f),ctx,{filename:f});return ctx;
}
test('Bustabit sector opens the ARCHIVE directly with official link and no scanner, news or trading engine',()=>{
 const h=read('bustabit-lab.html'),alias=read('bustabit-archivio.html');
 assert.equal(h,alias);
 for(const id of ['bvaBotList','bvaDossier','bvaCodeText','bvaCopy','bvaDownload','bvaResults','bvaStrategies','bvaLogic','bvaSearch','bvaFamily'])assert.match(h,new RegExp('id="'+id+'"'),id);
 for(const link of ['https://bustabit.com/','bustabit-vault.css','bustabit-vault.js','bustabit-tech-data.js'])assert.ok(h.includes(link),link);
 assert.match(h,/Kiber Strike 1\.4/);
 assert.match(h,/Negative Breaker/);
 assert.match(h,/Trident/);
 assert.doesNotMatch(h,/kbtAnalyze|kbtRaw|bustabit-scanner\.js|id="newsList"/);
 assert.doesNotMatch(h,/engine\.bet\s*\(/);
});
test('all 15 original code copies are byte-for-byte identical to catalogued SHA256 hashes',()=>{
 const {KiberBustabitLegacy:L,KiberBotFunctionNames:Fn}=catalog(),items=[...L.primary,...L.variants];
 assert.equal(items.length,15);
 assert.equal(new Set(items.map(i=>i.sha)).size,15);
 for(const entry of items){
  const file=path.join(dir,'bustabit-code-originals',entry.file+'.txt');
  assert.ok(fs.existsSync(file),'missing code '+entry.file);
  const buf=fs.readFileSync(file),sha=crypto.createHash('sha256').update(buf).digest('hex');
  assert.equal(sha,entry.sha,'wrong original '+entry.file);
  assert.equal(buf.byteLength,entry.bytes,'changed byte count '+entry.file);
  assert.ok(Array.isArray(Fn[entry.id])&&Fn[entry.id].length>8,entry.name);
 }
});
test('every bot has a separate dossier with four named explanations, modules and exact-version performance',()=>{
 const c=catalog(),d=c.KiberBustabitTechData;
 const bots=[...c.KiberBustabitLegacy.primary,...c.KiberBustabitLegacy.variants];
 for(const bot of bots){
  assert.ok(d.descriptions[bot.id],bot.id);
  assert.equal(d.descriptions[bot.id].length,5);
  assert.ok(d.descriptions[bot.id].slice(0,4).every(x=>typeof x==='string'&&x.length>25));
 }
 assert.equal(d.performance.strike14,undefined,'Do not invent Strike v1.4 results');
 assert.equal(d.performance.negative13,undefined,'Do not invent Negative Breaker v1.3 results');
 assert.equal(d.performance.strike131[0].net,-138.48,'1.3.1 is not 1.4');
 assert.equal(d.performance.trident11[2].net,-16.55);
 assert.equal(d.performance.cyber30[0].net,108.01);
 assert.equal(d.performance.cyber30[1].net,-567.34);
 assert.equal(d.performance.kiber30[0].bets,128166);
});
test('copy/download unlocked only after server file passes byte length and SHA256',()=>{
 const s=read('bustabit-vault.js');
 assert.doesNotThrow(()=>new vm.Script(s,{filename:'bustabit-vault.js'}));
 assert.match(s,/encodeURIComponent\(entry\.file\)\+'\.txt/);
 assert.match(s,/crypto\.subtle\.digest\('SHA-256',bytes\)/);
 assert.match(s,/checksum!==entry\.sha/);
 assert.match(s,/bytes\.byteLength!==entry\.bytes/);
 assert.match(s,/loaded=\{entry,bytes,source\}/);
 assert.match(s,/navigator\.clipboard\.writeText\(source\)/);
 assert.match(s,/new Blob\(\[loaded\.bytes\]/);
 assert.match(s,/bvaCopy'\)\.disabled=false/);
 assert.match(s,/bvaDownload'\)\.disabled=false/);
 assert.doesNotMatch(s,/\bengine\s*\.\s*bet\s*\(/);
 assert.doesNotMatch(s,/\beval\s*\(/);
 assert.doesNotMatch(s,/\bnew\s+Function\s*\(/);
});
