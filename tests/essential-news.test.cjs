'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const read=x=>fs.readFileSync(path.join(__dirname,'..',x),'utf8');
test('active BNB news rendering prioritizes max 3 fresh impact >=70 while keeping category lists',()=>{
 const s=read('v18.js'),h=read('v20-production.html');
 assert.doesNotThrow(()=>new vm.Script(s));
 assert.match(s,/f==='all'\?all\.filter/);
 assert.match(s,/sc>=70/);
 assert.match(s,/now-72\*3600000/);
 assert.match(s,/\.slice\(0,3\):all;/);
 assert.match(h,/data-news="all">Priorità/);
 assert.match(h,/data-news="bnb">BNB/);
 assert.match(h,/data-news="token">Token/);
 assert.match(h,/id="newsList"/);
});
test('Bustabit sector is an original code archive, not an extra news or scanner dashboard',()=>{
 const h=read('bustabit-lab.html');
 assert.match(h,/Kiber Strike 1\.4/);
 assert.match(h,/Negative Breaker/);
 assert.match(h,/Trident/);
 assert.match(h,/LIVE/);
 assert.match(h,/bustabit-vault\.js/);
 assert.match(h,/https:\/\/bustabit\.com/);
 assert.doesNotMatch(h,/bustabit-scanner\.js|id="newsList"|id="kbtAnalyze"/);
});
