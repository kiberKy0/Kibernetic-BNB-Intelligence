'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const read=p=>fs.readFileSync(require.resolve('../'+p),'utf8');

test('shared planet retains one localStorage key and real img rendering',()=>{
  const planets=read('profile-planets.js');
  assert.match(planets,/kiber_v17_profile/);
  assert.match(planets,/el\.replaceChildren\(img\)/);
  assert.match(planets,/addEventListener\('storage'/);
});

test('BNB legacy modules do not overwrite illustrated profile with initials on refresh',()=>{
  const old=read('v24-profile-fix.js'),v26=read('v26-6.js'),v23=read('v23-experience.js'),v24=read('v24.js');
  assert.doesNotMatch(old,/setInterval\(ensure/);
  for(const s of [old,v26,v23,v24])assert.match(s,/KiberPlanets\?\.refresh/);
  assert.match(read('v17.js'),/planet:window\.KiberPlanets\?\.selection/);
});

test('BNB has official CoinGecko external links and the new profile bundle',()=>{
  const home=read('dashboard-compact.js'),shell=read('index.html');
  assert.match(home,/https:\/\/www\.coingecko\.com\/it\/categories\/binance-smart-chain/);
  assert.match(home,/https:\/\/www\.coingecko\.com\/it\/monete\/bnb/);
  assert.match(home,/rel="noopener noreferrer"/);
  assert.match(shell,/profile-planets\.js/);
});
