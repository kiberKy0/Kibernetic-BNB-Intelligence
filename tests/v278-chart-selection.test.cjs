const test=require('node:test'),assert=require('node:assert/strict'),C=require('../chart-interaction.js');
const points=[{t:100000,p:1},{t:200000,p:2},{t:500000,p:3}];
test('Crosshair timestamp selects the nearest sample even across irregular gaps',()=>{assert.equal(C.resolve(points,{time:240},{}).t,200000);assert.equal(C.resolve(points,{time:480},{}).t,500000)});
test('Empty crosshair time resolves against the visible logical scale, preserving zoom and pan',()=>{const scale={coordinateToLogical:x=>x/20+1};assert.equal(C.resolve(points,{point:{x:10}},scale).t,500000);assert.equal(C.resolve(points,{point:{x:-100}},scale).t,100000);assert.equal(C.resolve(points,{},scale),null)});
test('Date ticks expose dates, intraday ticks expose hours',()=>{assert.match(C.tick(1791723600,2,'it-IT'),/11/);assert.match(C.tick(1791723600,3,'it-IT'),/\d{2}:\d{2}/)});

test('TradingView SVG branding cannot trigger the fallback chart selection',()=>{const tv={querySelector:s=>s==='table'?{}:s===':scope > svg'?{}:null},fallback={querySelector:s=>s===':scope > svg'?{}:null};assert.equal(C.isFallback(tv),false);assert.equal(C.isFallback(fallback),true);assert.equal(C.isFallback(null),false)});
