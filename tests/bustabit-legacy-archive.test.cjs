'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const rd=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function load(){const c={};for(const f of ['bustabit-archive-data.js','bustabit-legacy-data.js'])vm.runInNewContext(rd(f),c,{filename:f});return c}
test('five main historic bots and ten original revisions remain separate from six later versions',()=>{
 const c=load(),L=c.KiberBustabitLegacy,D=c.KiberBustabitArchiveData;
 assert.equal(L.primary.length,5);assert.equal(L.variants.length,10);assert.equal(D.codes.length,21);
 for(const file of ['kiber_strike_v1_4_calibrated.js','Kiber_Negative_Breaker_v1_3_LIVE.js','kiber_trident_v1_1_adaptive_reserve.js','CYBER_STRIKER_3_0.js','KIBER_STRIKER_V3_0_COMPLETO_UNICO.js'])assert.ok(L.primary.some(x=>x.file===file),file);
 assert.equal(new Set(D.codes.map(x=>x.sha)).size,21);
});
test('historical numeric bands and conflicting Cyber Striker 3.0 outcomes remain archived',()=>{
 const L=load().KiberBustabitLegacy;
 assert.equal(L.bands.map(x=>x[0]).join(''),'UBMAVREX');assert.equal(L.audits.length,3);
 assert.equal(L.audits[0].bets,6212);assert.equal(L.audits[0].net,108.01);
 assert.equal(L.audits[1].bets,6493);assert.equal(L.audits[1].net,-567.34);
});
test('only historical source originals are presented on active sector; later metadata retained offscreen',()=>{
 const h=rd('bustabit-lab.html'),js=rd('bustabit-vault.js');
 assert.match(h,/Archivio dei bot/);assert.match(h,/bvaBotList/);
 assert.match(h,/Copia tutto il codice/);assert.match(h,/Scarica originale \.js/);
 assert.match(h,/https:\/\/bustabit\.com/);
 assert.match(js,/const items=\[\.\.\.L\.primary,\.\.\.L\.variants\]/);
 assert.doesNotMatch(h,/kbtAnalyze|bustabit-scanner\.js/);
 assert.doesNotMatch(js,/engine\.bet\s*\(/);
});
