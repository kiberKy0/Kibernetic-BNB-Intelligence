'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const boot=fs.readFileSync('index.html','utf8');
const orb=fs.readFileSync('bnb-cloud-orb.js','utf8');
const css=fs.readFileSync('bnb-cloud-orb.css','utf8');
const compact=fs.readFileSync('dashboard-compact.js','utf8');

test('monitoring orb is loaded inside existing compact BNB home, not as a second homepage',()=>{
 assert.match(compact,/id='kiberCompactDashboard'|box\.id=rootId/);
 assert.match(orb,/getElementById/);
 assert.match(orb,/kiberCompactDashboard/);
 assert.match(orb,/querySelector\('\.kcd-header'\)/);
 assert.match(orb,/header\.insertBefore\(button,refresh\)/);
 assert.match(boot,/'bnb-cloud-orb\.js'/);
 assert.match(boot,/'bnb-cloud-orb\.css'/);
 assert.match(boot,/V='314-20261120-platform-guide-v1'/);
});

test('sphere shows only verified cloud state and a scope warning',()=>{
 assert.match(orb,/scanOnline===true/);
 assert.match(orb,/age<=FRESH_LIMIT_S/);
 assert.match(orb,/FRESH_LIMIT_S=190/);
 assert.match(orb,/unavailable/);
 assert.match(orb,/aria-expanded/);
 assert.match(orb,/60 s sul server/);
 assert.match(orb,/Nessun acquisto automatico/);
 assert.match(orb,/token\.status==='OK'/);
 assert.match(orb,/5 min/);
 assert.match(css,/radial-gradient/);
 assert.match(css,/data-status="active"/);
 assert.match(css,/data-status="stale"/);
 assert.match(css,/data-status="unavailable"/);
});

test('orb remains read-only and script has valid JS syntax',()=>{
 assert.doesNotMatch(orb,/eth_sendTransaction|eth_sendRawTransaction|wallet_requestPermissions/);
 assert.doesNotMatch(orb,/method:'POST'|method:"POST"/);
 assert.doesNotThrow(()=>new Function(orb));
});

test('orb is mobile compact and respects reduced motion',()=>{
 assert.match(css,/max-width:390px/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/\.kbo-panel\[hidden\]/);
});
