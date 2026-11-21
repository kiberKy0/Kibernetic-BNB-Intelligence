'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const rd=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
function catalog(){
 const ctx={};
 for(const p of ['bustabit-archive-data.js','bustabit-legacy-data.js','bustabit-tech-functions-primary.js','bustabit-tech-functions-variants.js','bustabit-tech-data.js']){
  vm.runInNewContext(rd(p),ctx,{filename:p});
 }
 return ctx;
}
test('21 entries are shown, 15 historical originals have exact function-name inventories',()=>{
 const c=catalog(),a=[...c.KiberBustabitLegacy.primary,...c.KiberBustabitLegacy.variants];
 assert.equal(a.length,15);
 assert.equal(c.KiberBustabitArchiveData.codes.length,21);
 const inventory=c.KiberBotFunctionNames,details=c.KiberBustabitTechData.descriptions;
 for(const entry of a){
  assert.ok(Array.isArray(inventory[entry.id]),entry.id);
  assert.ok(inventory[entry.id].length>=10,entry.id);
  assert.ok(Array.isArray(details[entry.id]),entry.id);
  assert.equal(details[entry.id].length,5,entry.id);
  for(const module of details[entry.id][4]){
   assert.equal(typeof module.name,'string');
   assert.ok(Array.isArray(module.functions));
   for(const key of ['what','when','how','why'])assert.ok(module[key]?.length>=15,entry.id+' '+key);
  }
 }
 assert.ok(inventory.strike14.includes('computeOutcomeFeedback'));
 assert.ok(inventory.negative13.includes('moonshotReady'));
 assert.ok(inventory.trident11.includes('chooseMode'));
 assert.ok(inventory.cyber30.includes('evaluateHighHunt'));
 assert.ok(inventory.kiber30.includes('createKiberV30Drift'));
 assert.ok(inventory.kiber30.includes('k30RecoveryProbe'));
});
test('performance belongs to the exact original version, not to adjacent revisions',()=>{
 const x=catalog().KiberBustabitTechData.performance;
 assert.equal(x.strike14,undefined);
 assert.equal(x.negative13,undefined);
 assert.equal(x.strike13,undefined);
 assert.equal(x.strike131[0].bets,3384);
 assert.equal(x.strike131[0].net,-138.48);
 assert.match(x.strike131[0].note,/Recovery/);
 assert.equal(x.trident11[0].bets+x.trident11[1].bets,105);
 assert.equal(x.trident11[0].wins+x.trident11[1].wins,58);
 assert.ok(Math.abs(x.trident11[0].net+x.trident11[1].net-x.trident11[2].net)<0.0001);
 assert.equal(x.trident11[2].roi,-2.43);
 assert.equal(x.cyber30.length,2);
 assert.equal(x.cyber30[0].bets,6212);
 assert.equal(x.cyber30[0].net,108.01);
 assert.equal(x.cyber30[1].bets,6493);
 assert.equal(x.cyber30[1].net,-567.34);
 assert.equal(x.kiber30[0].bets,128166);
 assert.equal(x.kiber30[0].net,null);
});
test('active Bustabit sector exposes strategies and performance while source is in elaboration',()=>{
 const html=rd('bustabit-lab.html'),ui=rd('bustabit-vault.js');
 for(const id of ['bvaBotList','bvaDossier','bvaBotName','bvaStrategies','bvaResults','bvaLogic','bvaTopModules','bvaFnList','bvaPaneCode'])assert.match(html,new RegExp('id="'+id+'"'),id);
 for(const h of ['COSA','QUANDO','COME','PERCHÉ','Performance e log','Codice in elaborazione'])assert.ok(html.includes(h)||ui.includes(h),h);
 for(const p of ['bustabit-tech-data.js','bustabit-tech-functions-primary.js','bustabit-tech-functions-variants.js','bustabit-vault.js','bustabit-vault.css'])assert.ok(html.includes(p),p);
 assert.ok(html.indexOf('bustabit-tech-data.js')<html.indexOf('bustabit-vault.js'));
 assert.doesNotThrow(()=>new vm.Script(ui,{filename:'bustabit-vault.js'}));
 assert.match(ui,/setTab\('logic'\)/);
});
test('unverified results remain unavailable without implementing any source retrieval or execution',()=>{
 const ui=rd('bustabit-vault.js');
 assert.match(ui,/Nessuna performance numerica verificabile/);
 assert.match(ui,/I risultati di altri bot non vengono trasferiti qui/);
 assert.doesNotMatch(ui,/fetch\s*\(|crypto\.subtle\.digest|clipboard|new Blob\s*\(|engine\s*\.\s*bet\s*\(|\beval\s*\(/);
 const html=rd('bustabit-lab.html');
 assert.doesNotMatch(html,/bvaCopy|bvaDownload|bvaCodeText|Copia tutto il codice/);
});
