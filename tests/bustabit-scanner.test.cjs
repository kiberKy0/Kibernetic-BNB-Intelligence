const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const S=require('../bustabit-scanner.js');

test('scanner exports exactly 21 unique category-pattern detectors',()=>{
  const p=S.patterns(Array.from({length:60},(_,i)=>i%3===0?2.5:1.2));
  assert.equal(p.length,21);assert.equal(new Set(p.map(x=>x.id)).size,21);
  assert.deepEqual(new Set(p.map(x=>x.type)),new Set(['CAT','SEQ','DIR','PIC','REG']));
});
test('no invented dataset or invalid values',()=>{
  assert.throws(()=>S.parse(''),/Nessun dato inventato/);
  assert.throws(()=>S.parse('1.2x abc 2.2x'),/non valido/);
  assert.throws(()=>S.parse('0.9 1.2'),/non valido/);
  assert.throws(()=>S.parse('1.2 NaN'),/non valido/);
});
test('parse spaces and comma separated multipliers',()=>{
  assert.deepEqual(S.parse('1.2x 2.5x 1.05x'),[1.2,2.5,1.05]);
  assert.deepEqual(S.parse('1.2x, 2.5x, 1.05x'),[1.2,2.5,1.05]);
});
test('parse Italian decimals (spaces and one column)',()=>{
  assert.deepEqual(S.parse('1,23\n2,14'),[1.23,2.14]);
  assert.deepEqual(S.parse('1,23 2,14'),[1.23,2.14]);
  assert.deepEqual(S.parse('multiplier\n1,23\n2,14'),[1.23,2.14]);
});
test('parse semicolon CSV with commas in numeric cells',()=>{
  assert.deepEqual(S.parse('game;multiplier;timestamp\n1;1,23;abc\n2;3,14;xyz'),[1.23,3.14]);
});
test('parse CSV with id field, no accidental round IDs',()=>{
  assert.deepEqual(S.parse('id,bust\n101,1.21\n102,3.40'),[1.21,3.4]);
});
test('parse JSON arrays and records',()=>{
  assert.deepEqual(S.parse('[1.12,2.03]'),[1.12,2.03]);
  assert.deepEqual(S.parse('{"rounds":[{"bust":1.12},{"multiplier":2.03}]}'),[1.12,2.03]);
});
test('scanner enforces 200000-round limit',()=>{
  assert.throws(()=>S.parse('1.2 '.repeat(200001)),/Limite/);
});
test('median is correct for even and odd sets',()=>{
  assert.equal(S.median([4,2,1]),2);
  assert.equal(S.median([4,2,1,3]),2.5);
});
test('roi is a descriptive fixed-size all-round counterfactual',()=>{
  const r=S.estimate([1.1,2.1,3,1.02],2);
  assert.equal(r.wins,2);assert.equal(r.losses,2);
  assert.equal(r.profitBits,0);assert.equal(r.roi,0);
  assert.equal(r.modelRoi,-.01);
});
test('small sample confidence intervals are finite and conservative',()=>{
  const r=S.estimate([2,2,2],2);
  assert.equal(r.wins,3);assert.ok(r.confidence95[0]<1);assert.equal(r.confidence95[1],1);
});
test('insufficient samples must not activate long-window patterns',()=>{
  const r=S.scan([1.2,2.4],{target:2});
  assert.equal(r.patterns.length,21);
  assert.equal(r.patterns.find(p=>p.id==='PIC04').status,'DATI_INSUFFICIENTI');
});
test('holdout target is selected only from first 70% of data',()=>{
  const first=Array.from({length:70},(_,i)=>i%2===0?2.1:1.01);
  const r1=S.scan([...first,...Array(30).fill(1.01)]);
  const r2=S.scan([...first,...Array(30).fill(25)]);
  assert.equal(r1.holdout.chosenTarget,r2.holdout.chosenTarget);
  assert.notEqual(r1.holdout.test.roi,r2.holdout.test.roi);
});
test('lab page registers the local scanner and keeps wager execution outside',()=>{
 const h=fs.readFileSync(path.join(__dirname,'../bustabit-lab.html'),'utf8');
 const shell=fs.readFileSync(path.join(__dirname,'../bustabit-shell.js'),'utf8');
 const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 const s=fs.readFileSync(path.join(__dirname,'../bustabit-scanner.js'),'utf8');
 assert.match(h,/bustabit-scanner\.js/);assert.match(h,/bustabit-lab-ui\.js/);
 assert.match(index,/bustabit-shell\.js/);assert.match(shell,/kiberBustabitTab/);
 assert.doesNotMatch(s,/engine\.bet\(|window\.fetch\(|fetch\(/);
 assert.match(h,/ANALISI, non LIVE/);
});
