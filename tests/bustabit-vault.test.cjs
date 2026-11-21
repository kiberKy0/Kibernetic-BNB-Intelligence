'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(dir,p),'utf8');
function catalog(){
 const ctx={};
 for(const p of ['bustabit-archive-data.js','bustabit-legacy-data.js','bustabit-tech-functions-primary.js','bustabit-tech-functions-variants.js','bustabit-tech-data.js'])vm.runInNewContext(read(p),ctx,{filename:p});
 return ctx;
}
test('Bustabit shows direct 15-bot technical library and official Bustabit link',()=>{
 const h=read('bustabit-lab.html'),alias=read('bustabit-archivio.html');assert.equal(h,alias);
 for(const id of ['bvaBotList','bvaDossier','bvaResults','bvaStrategies','bvaLogic','bvaTopModules','bvaSearch','bvaFamily','bvaPaneCode'])assert.match(h,new RegExp('id="'+id+'"'),id);
 for(const asset of ['https://bustabit.com/','bustabit-vault.css','bustabit-vault.js','bustabit-tech-data.js'])assert.ok(h.includes(asset),asset);
 assert.match(h,/Kiber Strike 1\.4/);assert.match(h,/Negative Breaker/);assert.match(h,/Trident/);
 assert.doesNotMatch(h,/kbtAnalyze|kbtRaw|bustabit-scanner\.js|id="newsList"/);
});
test('historical technology and function names are retained for all 15 versions while source is withheld',()=>{
 const c=catalog(),items=[...c.KiberBustabitLegacy.primary,...c.KiberBustabitLegacy.variants];
 assert.equal(items.length,15);assert.equal(new Set(items.map(x=>x.sha)).size,15);
 const sourceDirectory=path.join(dir,'bustabit-code-originals');
 assert.equal(fs.existsSync(sourceDirectory),false,'Originals must not be distributed from current Git tree');
 for(const bot of items){
  assert.ok(Array.isArray(c.KiberBotFunctionNames[bot.id]),bot.id);
  assert.ok(c.KiberBotFunctionNames[bot.id].length>8,bot.id);
  assert.equal(c.KiberBustabitTechData.descriptions[bot.id]?.length,5,bot.id);
 }
});
test('historical performance remains scoped to the exact bot version',()=>{
 const p=catalog().KiberBustabitTechData.performance;
 assert.equal(p.strike14,undefined);assert.equal(p.negative13,undefined);
 assert.equal(p.strike131[0].net,-138.48);
 assert.equal(p.trident11[2].net,-16.55);
 assert.equal(p.cyber30[0].net,108.01);
 assert.equal(p.cyber30[1].net,-567.34);
 assert.equal(p.kiber30[0].bets,128166);
});
test('no copied or fetched JavaScript sources and placeholder is clearly visible',()=>{
 const js=read('bustabit-vault.js'),html=read('bustabit-lab.html');
 assert.doesNotThrow(()=>new vm.Script(js,{filename:'bustabit-vault.js'}));
 assert.match(html,/Codice in elaborazione/);
 assert.match(js,/setTab\('logic'\)/);
 assert.match(js,/renderStrategies/);assert.match(js,/renderResults/);
 for(const forbidden of ['bvaCopy','bvaDownload','bvaReload','bvaCodeText','Copia tutto il codice','Scarica originale .js','bustabit-code-originals'])assert.ok(!html.includes(forbidden)&&!js.includes(forbidden),forbidden);
 assert.doesNotMatch(js,/fetch\s*\(|navigator\.clipboard|new Blob\s*\(|XMLHttpRequest|engine\s*\.\s*bet\s*\(|eval\s*\(/);
});
