'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require.resolve('../v20-production.html'),'utf8');
const boot=fs.readFileSync(require.resolve('../index.html'),'utf8');
const base=fs.readFileSync(require.resolve('../v17.js'),'utf8');

test('Gold is an actual section in the Oracle hub, not an outbound page link',()=>{
  assert.match(html,/<nav[^>]*id="hubNav"[\s\S]*?<button id="xauUsdNav"[^>]*data-section="gold"[^>]*>[\s\S]*?<b>Oro XAU\/USD<\/b><span>Decoder interno<\/span><\/button><\/nav>/);
  assert.doesNotMatch(html,/<a id="xauUsdNav"/);
  assert.doesNotMatch(html,/<button id="xauUsdNav"[^>]*target="_top"/);
});

test('Gold section embeds its independent XAU/USD decoder iframe inside the live BNB page',()=>{
  assert.match(html,/<section class="panel" id="section-gold"[\s\S]*?<h2>Oro XAU\/USD · Decoder<\/h2>/);
  assert.match(html,/<iframe id="xauEmbeddedFrame"[^>]*src="\/xau-usd"/);
  assert.match(html,/<\/iframe>/);
  assert.match(html,/<section class="panel open" id="section-market"/);
});

test('The existing hub section selector opens the gold panel without leaving BNB',()=>{
  assert.match(base,/function openSection\(key\)/);
  assert.match(base,/p\.id==='section-'\+key/);
  assert.match(base,/#hubNav button/);
  assert.match(base,/openSection\(b\.dataset\.section\)/);
  assert.match(boot,/v20-production\.html/);
  assert.doesNotMatch(boot,/xau-nav\.js/);
});
