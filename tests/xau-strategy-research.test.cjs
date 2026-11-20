'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const research=require('../xau-strategy-research.js');
const base=require('../xau-methods.js');
const NOW=Date.parse('2026-11-20T12:00:00Z');
function buildBars(count=120,minutes=5,offset=0){
  return Array.from({length:count},(_,i)=>{
    const time=new Date(NOW-(count-i)*minutes*60000).toISOString();
    const p=3570+offset;
    return {time,open:p,high:p+1,low:p-1,close:p+.2};
  });
}
function ctx(overrides={}){
  const m5=buildBars(),m1=buildBars(120,1);
  return {
    source:'test provider',
    quality:{ok:true,tick:{ok:true,fresh:true,spread:.12}},
    calendar:{connected:true,highImpactNear:false},
    strategySeries:{m5:{recent:true,interval:'5min',candles:m5},m1:{recent:true,interval:'1min',candles:m1}},
    multiTimeframe:{
      '5min':{status:'observed',direction:'rialzista'},
      '15min':{status:'observed',direction:'rialzista'},
      '1h':{status:'observed',direction:'rialzista'}
    },...overrides
  };
}
test('valid M5 and M1 samples are accepted',()=>{
  assert.equal(research.barsValid(buildBars(),5,60,NOW,720),true);
  assert.equal(research.barsValid(buildBars(120,1),1,60,NOW,180),true);
});
test('duplicate timestamps, malformed high and future candles are rejected',()=>{
  let b=buildBars();b[45].time=b[44].time;
  assert.equal(research.barsValid(b,5,60,NOW,720),false);
  b=buildBars();b[8].high=b[8].low-1;
  assert.equal(research.barsValid(b,5,60,NOW,720),false);
  b=buildBars();b[b.length-1].time=new Date(NOW).toISOString();
  assert.equal(research.barsValid(b,5,60,NOW,720),false);
});
test('outdated or missing series block signals completely',()=>{
  let d=ctx();d.strategySeries.m5.candles=buildBars().map(x=>({...x,time:new Date(Date.parse(x.time)-3600000).toISOString()}));
  assert.equal(research.evaluate(d,null,NOW).ready,false);
  assert.equal(research.evaluate({},null,NOW).executable,false);
});
test('news blackout and absent macro calendar block scenarios',()=>{
  let d=ctx();d.calendar={connected:true,highImpactNear:true};
  assert.equal(research.evaluate(d,null,NOW).ready,false);
  d=ctx();d.calendar={connected:false,highImpactNear:false};
  assert.equal(research.evaluate(d,null,NOW).ready,false);
});
test('BUY hypothetical scenario computes 1R and 2R correctly',()=>{
  const x=research.theoretical('BUY','test',3570,3565,10,.12,'2026-11-20T11:55:00Z');
  assert.equal(x.entry,3570);assert.equal(x.stop,3565);
  assert.equal(x.tp1,3575);assert.equal(x.tp2,3580);
  assert.equal(x.executable,false);assert.equal(x.verified,false);
});
test('SELL hypothetical scenario computes 1R and 2R correctly',()=>{
  const x=research.theoretical('SELL','test',3570,3575,10,.12,'2026-11-20T11:55:00Z');
  assert.equal(x.tp1,3565);assert.equal(x.tp2,3560);
  assert.equal(x.executable,false);
});
test('narrow stop, oversized stop or excessive spread yields no levels',()=>{
  assert.equal(research.theoretical('BUY','test',3570,3569.99,10,.12,'x'),null);
  assert.equal(research.theoretical('BUY','test',3570,3530,10,.12,'x'),null);
  assert.equal(research.theoretical('BUY','test',3570,3565,10,2,'x'),null);
});
test('range looks only at previous candles, excluding triggering bar',()=>{
  const b=buildBars();b[b.length-1].high=3700;
  const r=research.range(b,b.length-1,20);
  assert.equal(r.high,3571);
});
test('breakout recognizes a new close outside previous 20 candles',()=>{
  const b=buildBars();const last=b.length-1;
  b[last]={...b[last],open:3570,high:3575,low:3569.8,close:3574};
  const e=research.newestBreak(b,last,1,20);
  assert.equal(e.side,'BUY');assert.equal(e.level,3571);
});
test('London opening 30m window respects local zone and six adjacent M5 candles',()=>{
  const ts=Date.parse('2026-11-20T08:00:00Z');
  const bars=Array.from({length:6},(_,i)=>({time:new Date(ts+i*300000).toISOString(),
    high:3575+i,low:3560-i,open:3570,close:3571}));
  const x=research.sessionRange(bars,'Europe/London',8,0,NOW);
  assert.equal(x.status,'RANGE MISURATO');assert.equal(x.high,3580);assert.equal(x.low,3555);
  const missing=research.sessionRange(bars.slice(1),'Europe/London',8,0,NOW);
  assert.equal(missing.status,'STORICO INSUFFICIENTE');
});
test('consistent directional reading does not authorize a real trade',()=>{
  const d=ctx(),b=base.evaluate(d,NOW),x=research.evaluate(d,b,NOW);
  assert.equal(x.ready,true);assert.equal(x.decision,'WAIT');assert.equal(x.executable,false);
  assert.equal(x.methods.macro.status,'FILTRO NEWS ATTIVO');
  assert.equal(x.methods.micro.status,'SENZA CONFERMA M1');
});
test('spread too large blocks all candidate prices',()=>{
  const d=ctx();d.quality.tick.spread=8;
  const x=research.evaluate(d,base.evaluate(d,NOW),NOW);
  assert.equal(x.spreadGuardPassed,false);assert.equal(x.candidates.length,0);
});
