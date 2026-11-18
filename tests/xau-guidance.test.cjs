'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const G=require('../xau-guidance.js');
const base=(signal,metrics)=>({ready:true,signal,interval:'15min',time:'2026-11-18T07:00:00Z',metrics});
test('No OHLC data means WAIT without fake levels or fabricated probabilities',()=>{
 const x=G.advise({ready:false,signal:'WAIT',metrics:{},reasons:['Feed mancante']});
 assert.equal(x.state,'WAIT');assert.equal(x.entry,null);assert.equal(x.stop,null);assert.equal(x.target,null);
 assert.match(x.reason,/Feed mancante/);
});
test('Unconfirmed technical indicator stays WAIT',()=>{
 const x=G.advise(base('WAIT',{}));assert.equal(x.state,'WAIT');assert.equal(x.rr,null);
});
test('Confirmed positive setup yields conditional LONG with stop under entry and target over entry',()=>{
 const m={price:3000,ema20:2995,ema50:2990,rsi14:60,atr14:6,atrPct:0.2};
 const x=G.advise(base('BUY',m));
 assert.equal(x.state,'WATCH_BUY');assert.equal(x.mode,'conditional');
 assert(x.stop<x.entry&&x.target>x.entry);assert.match(x.reason,/EMA20 sopra/);
 assert.match(x.when,/candela chiusa/);assert.match(x.disclosure,/NON è una raccomandazione/);
});
test('Confirmed negative setup yields conditional SHORT, not a sell instruction for existing holdings',()=>{
 const m={price:3000,ema20:3005,ema50:3010,rsi14:40,atr14:6,atrPct:0.2};
 const x=G.advise(base('SELL',m));
 assert.equal(x.state,'WATCH_SELL');assert(x.stop>x.entry&&x.target<x.entry);
 assert.match(x.title,/SHORT/);
});
test('CSV cannot masquerade as a real-time brokerage signal',()=>{
 const x=G.advise(base('BUY',{price:3000,ema20:2995,ema50:2990,rsi14:60,atr14:6,atrPct:0.2}),{source:'csv'});
 assert.equal(x.mode,'simulation');assert.match(x.title,/SIMULAZIONE/);
});
test('Invalid indicator or extreme volatility disables conditional entry',()=>{
 const x=G.advise(base('BUY',{price:3000,ema20:2990,rsi14:60,atr14:6,atrPct:3.8}));
 assert.equal(x.state,'WAIT');
});
test('Web view renders advice after chart and references external ratings without scraping them',()=>{
 const html=fs.readFileSync(require.resolve('../xau-usd.html'),'utf8');
 const ui=fs.readFileSync(require.resolve('../xau-ui.js'),'utf8');
 assert(html.indexOf('id="xauOperationalGuide"')>html.indexOf('Grafico XAU/USD · TradingView'));
 assert(html.indexOf('id="xauOperationalGuide"')<html.indexOf('id="decoder"'));
 assert.match(html,/xau-guidance\.js/);
 assert.match(html,/xauGuideReason/);
 assert.match(html,/tradingview\.com\/symbols\/XAUUSD\/technicals/);
 assert.match(ui,/renderOperationalGuide\(result, source\)/);
});
