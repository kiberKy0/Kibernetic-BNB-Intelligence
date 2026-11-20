'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const status=require('../xau-platform.js');
const NOW=Date.parse('2026-11-20T18:00:00Z');
const iso=n=>new Date(n).toISOString();
const snapshot=(over={})=>({
  symbol:'XAU/USD',timestamp:iso(NOW-12000),lastClosedAt:iso(NOW-300000),
  source:'biquote.io · MT5 broker esterno',
  quality:{ok:true,tick:{ok:true,fresh:true,timestamp:iso(NOW-3000)}},...over
});
test('fresh verified bid/ask feed with recent server verification is ONLINE',()=>{
  const x=status.derive(snapshot(),NOW);
  assert.equal(x.state,'online');assert.equal(x.label,'ONLINE');
});
test('a feed timestamped over two minutes ago must not claim ONLINE',()=>{
  const x=status.derive(snapshot({timestamp:iso(NOW-240000)}),NOW);
  assert.equal(x.state,'stale');assert.equal(x.label,'DATI VECCHI');
});
test('old broker-external tick forces amber stale',()=>{
  const x=status.derive(snapshot({quality:{ok:true,tick:{ok:true,fresh:true,timestamp:iso(NOW-240000)}}}),NOW);
  assert.equal(x.state,'stale');
});
test('unverified provider and disconnected quote are OFFLINE',()=>{
  assert.equal(status.derive(snapshot({quality:{ok:false,tick:{ok:true,fresh:true,timestamp:iso(NOW)}}}),NOW).state,'offline');
  assert.equal(status.derive(null,NOW).state,'offline');
});
test('missing, future or malformed timestamps cannot be ONLINE',()=>{
  assert.equal(status.derive(snapshot({timestamp:'?' }),NOW).state,'offline');
  assert.equal(status.derive(snapshot({timestamp:iso(NOW+60000)}),NOW).state,'stale');
  assert.equal(status.derive(snapshot({quality:{ok:true,tick:{ok:true,fresh:true,timestamp:null}}}),NOW).state,'offline');
});
test('other markets cannot spoof XAU/USD ONLINE',()=>{
  assert.equal(status.derive(snapshot({symbol:'BTC/USD'}),NOW).state,'offline');
});
test('no broker connectivity, trading, wallet mutation or secret handling in platform module',()=>{
  const source=require('node:fs').readFileSync(require('node:path').join(__dirname,'../xau-platform.js'),'utf8');
  assert.doesNotMatch(source,/executeOrder|placeOrder|trade\.execute|localStorage|sessionStorage|password\s*=|wallet\.connect/);
});
