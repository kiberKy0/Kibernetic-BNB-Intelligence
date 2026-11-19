'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const panel=fs.readFileSync('bnb-trading-panel.js','utf8');
const boot=fs.readFileSync('index.html','utf8');
test('mobile market scanner shows server-side minute scan without duplicating chart',()=>{
  assert.match(panel,/kibernetic-bnb-scan/);
  assert.match(panel,/cloudLine/);
  assert.match(panel,/priceChange5mPct/);
  assert.match(panel,/priceChange15mPct/);
  assert.match(panel,/liquidityChange15mPct/);
  assert.match(panel,/monitoredAssets/);
  assert.match(panel,/\\.v271-main/);
  assert.match(boot,/'bnb-trading-panel.js'/);
  assert.match(boot,/bnb-cloud-scanner-v1/);
});
test('cloud status is fail-closed, never claims WebSocket or wallet trading',()=>{
  assert.match(panel,/cloudAge<=190/);
  assert.match(panel,/scanOnline===true/);
  assert.match(panel,/cloudActive/);
  assert.match(panel,/WebSocket H24 non ancora attivo/);
  assert.match(panel,/nessun ordine eseguito/);
  assert.match(panel,/textContent/);
  assert.doesNotMatch(panel,/eth_sendTransaction|eth_sendRawTransaction/);
});
test('BNB scanner panel remains syntactically valid',()=>{
  assert.doesNotThrow(()=>new Function(panel));
});
