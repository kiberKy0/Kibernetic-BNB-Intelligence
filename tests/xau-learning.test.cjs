'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const lab=require('../xau-learning.js');
const NOW=Date.parse('2026-11-20T18:00:00Z');
function candles(count=120,mode='rising'){
 return Array.from({length:count},(_,i)=>{
  const base=mode==='flat'?3600:mode==='falling'?3700-i*.4:3600+i*.4;
  return {time:new Date(NOW-(count-i)*300000).toISOString(),
   open:base,high:base+1.2,low:base-.9,close:base+.25};
 });
}
function feed(bars=candles()){
 return {source:'fixture',quality:{ok:true,tick:{ok:true,fresh:true}},
  strategySeries:{m5:{interval:'5min',recent:true,candles:bars}}};
}
test('valid 120 completed M5 candles render five indicators, no execution',()=>{
 const v=lab.evaluate(feed(),NOW);
 assert.equal(v.ready,true);assert.equal(v.executable,false);assert.equal(v.decision,'WAIT');
 assert.equal(Object.keys(v.methods).length,5);
 for(const item of Object.values(v.methods))assert.ok(item.reading.length>20);
});
test('ADX differentiates rising trend strength from flat series',()=>{
 const up=lab.calcAdx(candles(120,'rising'));
 const flat=lab.calcAdx(candles(120,'flat'));
 assert.ok(up.adx>25);assert.ok(up.plusDI>up.minusDI);
 assert.equal(flat.adx,0);
});
test('Bollinger bandwidth on flat series is zero and has valid midpoint',()=>{
 const b=lab.bollinger(candles(120,'flat'));
 assert.equal(b.width,0);assert.equal(b.mid,3600.25);
});
test('MACD and stochastic calculations remain finite',()=>{
 const m=lab.macd(candles());
 const s=lab.stochastic(candles());
 assert.ok(Number.isFinite(m.line)&&Number.isFinite(m.signal)&&Number.isFinite(m.hist));
 assert.ok(Number.isFinite(s.k)&&Number.isFinite(s.d)&&s.k>=0&&s.k<=100);
});
test('duplicate or invalid OHLC candle blocks stale directional readings',()=>{
 const b=candles();b[25].time=b[24].time;
 assert.equal(lab.evaluate(feed(b),NOW).ready,false);
 const c=candles();c[25].high=c[25].low-1;
 assert.equal(lab.evaluate(feed(c),NOW).ready,false);
});
test('old feed and missing freshness flag fail closed',()=>{
 const old=candles().map(x=>({...x,time:new Date(Date.parse(x.time)-3600000).toISOString()}));
 assert.equal(lab.evaluate(feed(old),NOW).ready,false);
 const d=feed();d.quality.tick.fresh=false;
 assert.equal(lab.evaluate(d,NOW).ready,false);
});
test('macro lesson remains explicitly not connected even when price feed is valid',()=>{
 const result=lab.evaluate(feed(),NOW);
 assert.equal(result.macro.status,'STUDIO · NON LIVE');
 assert.match(result.macro.reading,/non collegati/);
});
test('future candle is rejected and no performance numbers are computed',()=>{
 const b=candles();b[b.length-1].time=new Date(NOW+300000).toISOString();
 const v=lab.evaluate(feed(b),NOW);
 assert.equal(v.ready,false);assert.equal(v.executable,false);
});
