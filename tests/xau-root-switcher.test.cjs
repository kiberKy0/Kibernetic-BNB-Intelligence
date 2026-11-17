'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
const gold=fs.readFileSync(require.resolve('../xau-usd.html'),'utf8');

test('root renders a visible Gold XAU/USD button independent of legacy BNB iframe',()=>{
  assert.match(html,/<iframe id="app" title="Kiber BNB Chain"/);
  assert.match(html,/<button type="button" id="switchGold"[^>]*aria-controls="goldPanel"/);
  assert.match(html,/<b>Oro XAU\/USD<\/b><\/button>/);
  assert.match(html,/#switchGold\{position:fixed/);
});

test('opening Gold reveals a same-page overlay with an embedded, separate decoder',()=>{
  assert.match(html,/<section id="goldPanel" hidden/);
  assert.match(html,/<iframe id="goldFrame"[^>]*data-src="\/xau-usd"/);
  assert.match(html,/goldButton\.addEventListener\('click',showGold\)/);
  assert.match(html,/goldBack\.addEventListener\('click',hideGold\)/);
  assert.match(html,/goldPanel\.hidden=false/);
  assert.match(html,/goldPanel\.hidden=true/);
  assert.doesNotMatch(html,/window\.top\.location\.href\s*=\s*['"]\/xau-usd/);
});

test('Gold decoder contains independent analysis and TradingView chart',()=>{
  assert.match(gold,/Decoder XAU\/USD/);
  assert.match(gold,/OANDA:XAUUSD/);
  assert.match(gold,/id="decoder"/);
  assert.match(gold,/xau-analysis\.js/);
});
