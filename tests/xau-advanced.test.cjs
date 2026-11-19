'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const advanced=require('../xau-advanced.js');
const now=Date.parse('2026-11-18T20:00:00.000Z');
const validAnalysis={
 ready:true,signal:'BUY',interval:'15min',samples:100,time:'2026-11-18T19:45:00.000Z',
 metrics:{price:3750,ema20:3742,ema50:3738,rsi14:60,atr14:10,atrPct:0.27,support20:3710,resistance20:3770}
};
test('XAU advanced engine exposes eight named levels',()=>{
 const r=advanced.evaluate(validAnalysis,'Twelve Data · dati provider',now);
 assert.equal(r.labels.length,8);
 assert.equal(r.labels[0].status,'PARZIALE');
 assert.equal(r.labels[7].status,'ATTESA');
});
test('a technical BUY is never an executable BUY without independent validation',()=>{
 const r=advanced.evaluate(validAnalysis,'Twelve Data · dati provider',now);
 assert.equal(r.decision,'WAIT');
 assert.equal(r.title,'ASPETTA');
 assert.match(r.technical,/rialzista/);
 assert.equal(r.verified,false);
 assert.match(r.reason,/broker/);
});
test('a technical SELL is also blocked',()=>{
 const r=advanced.evaluate({...validAnalysis,signal:'SELL'},'Twelve Data · dati provider',now);
 assert.equal(r.decision,'WAIT');
 assert.match(r.technical,/ribassista/);
});
test('a fresh-looking CSV never becomes live',()=>{
 const r=advanced.evaluate(validAnalysis,'CSV locale (non collegato al mercato live)',now);
 assert.equal(r.decision,'WAIT');
 assert.equal(r.labels[0].status,'BLOCCATO');
 assert.match(r.labels[0].note,/storico/i);
});
test('delayed candle fails timestamp check',()=>{
 const r=advanced.evaluate({...validAnalysis,time:'2026-11-18T18:00:00.000Z'},'Twelve Data · dati provider',now);
 assert.equal(r.decision,'WAIT');
 assert.equal(r.labels[0].status,'BLOCCATO');
 assert.match(r.labels[0].note,/vecchia/);
});
test('missing data remains a wait decision',()=>{
 const r=advanced.evaluate(null,'Nessun feed',now);
 assert.equal(r.decision,'WAIT');
 assert.equal(r.labels[0].status,'BLOCCATO');
 assert.equal(r.timestamp,null);
});
