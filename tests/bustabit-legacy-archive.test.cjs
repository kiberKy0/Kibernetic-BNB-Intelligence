'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const rd=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const load=()=>{
 const c={};vm.runInNewContext(rd('bustabit-archive-data.js'),c);vm.runInNewContext(rd('bustabit-legacy-data.js'),c);
 return c;
};
test('restores five original families, ten variants and keeps six recent versions',()=>{
 const c=load(),L=c.KiberBustabitLegacy,D=c.KiberBustabitArchiveData;
 assert.equal(L.primary.length,5);assert.equal(L.variants.length,10);assert.equal(D.codes.length,21);
 assert.equal(D.codes[0].file,'kiber_strike_v1_4_calibrated.js');
 assert.ok(L.primary.some(x=>x.file==='Kiber_Negative_Breaker_v1_3_LIVE.js'));
 assert.ok(L.primary.some(x=>x.file==='kiber_trident_v1_1_adaptive_reserve.js'));
 assert.ok(L.primary.some(x=>x.file==='CYBER_STRIKER_3_0.js'));
 assert.ok(L.primary.some(x=>x.file==='KIBER_STRIKER_V3_0_COMPLETO_UNICO.js'));
 const hashes=D.codes.map(x=>x.sha);assert.equal(new Set(hashes).size,21);
 hashes.forEach(x=>assert.match(x,/^[a-f0-9]{64}$/));
});
test('eight original categories U B M A V R E X and 2 contradictory Cyber3 logs retained',()=>{
 const L=load().KiberBustabitLegacy;
 assert.equal(Array.from(L.bands.map(b=>b[0])).join(''),'UBMAVREX');
 assert.equal(L.audits.length,3);
 assert.equal(L.audits[0].bets,6212);assert.equal(L.audits[0].net,108.01);
 assert.equal(L.audits[1].bets,6493);assert.equal(L.audits[1].net,-567.34);
 assert.ok(L.explanations.some(x=>x[0]==='TRIDENT'));
});
test('historical archive is the primary screen and recent versions collapse',()=>{
 const html=rd('bustabit-archivio.html');
 for(const id of ['bfLegacyPrimary','bfLegacyVariants','bfLegacyAudits','bfLegacyBands','bfHistoricalSelect','bfArchiveCards','bfArchiveImport','bfCodeSearch','bfStrategyRows','bfTeachText','bfSourceDialog'])assert.ok(html.includes('id="'+id+'"'),id);
 assert.ok(html.indexOf('id="bfLegacyPrimary"')<html.indexOf('id="bfArchiveCards"'));
 assert.ok(html.includes('bustabit-legacy-data.js'));
 assert.ok(html.includes('bustabit-legacy-ui.js'));
 assert.ok(html.includes('bustabit-legacy.css'));
 assert.match(html,/LIVE NON CERTIFICATO/);
 assert.ok(html.includes('<details class="bf-expand"><summary>Versioni recenti'));
 assert.ok(!html.includes('id="newsFeed"'));
});
test('read-only vault recognizes exact original byte fingerprints and never executes source',()=>{
 const js=rd('bustabit-archive-ui.js');
 assert.match(js,/crypto\.subtle\.digest\('SHA-256'/);
 assert.match(js,/D\.codes\.find\(v=>v\.sha===sha && v\.bytes===bytes\.byteLength\)/);
 assert.match(js,/const L=window\.KiberBustabitLegacy/);
 assert.match(js,/isPrimary/);
 assert.doesNotMatch(js,/engine\s*\.\s*bet\s*\(/);
 assert.doesNotMatch(js,/eval\s*\(|new Function\s*\(|fetch\s*\(|XMLHttpRequest/);
});
test('JS syntax for all three catalog and presentation scripts',()=>{
 for(const f of ['bustabit-legacy-data.js','bustabit-archive-ui.js','bustabit-legacy-ui.js']){
  assert.doesNotThrow(()=>new vm.Script(rd(f),{filename:f}));
 }
 const h=rd('bustabit-archivio.html');
 for(const match of rd('bustabit-archive-ui.js').matchAll(/\$\('([A-Za-z][A-Za-z0-9]+)'\)/g))assert.ok(h.includes('id="'+match[1]+'"'),match[1]);
 for(const match of rd('bustabit-legacy-ui.js').matchAll(/\$\('([A-Za-z][A-Za-z0-9]+)'\)/g))assert.ok(h.includes('id="'+match[1]+'"'),match[1]);
});
