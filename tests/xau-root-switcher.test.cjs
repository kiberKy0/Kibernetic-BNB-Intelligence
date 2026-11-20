'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
const gold=fs.readFileSync(require.resolve('../xau-usd.html'),'utf8');

test('root keeps the internal Gold launcher but hides the redundant floating control',()=>{
  assert.match(html,/<iframe id="app" title="Kiber BNB Chain"/);
  assert.match(html,/<button type="button" id="switchGold"[^>]*aria-controls="goldPanel"/);
  assert.match(html,/<b>Oro XAU\/USD<\/b><\/button>/);
  assert.match(html,/#switchGold\{position:fixed/);
  assert.match(html,/#switchGold\{display:none!important\}/);
});

test('opening Gold displays only the standalone decoder header and closes by a validated message',()=>{
  assert.match(html,/<section id="goldPanel" hidden/);
  assert.match(html,/<iframe id="goldFrame"[^>]*data-src="\/xau-usd"/);
  assert.match(html,/goldButton\.addEventListener\('click',showGold\)/);
  assert.doesNotMatch(html,/class="gold-panel-head"/);
  assert.match(html,/KIBER_XAU_CLOSE/);
  assert.match(html,/e\.origin!==window\.location\.origin/);
  assert.match(gold,/id="xauBackToBnb"/);
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

test('Gold mobile has no profile customizer or avatar control, notice remains compact',()=>{
  assert.doesNotMatch(gold,/id="xauProfileBtn"/);
  assert.doesNotMatch(gold,/id="xauProfileDrawer"/);
  assert.match(gold,/id="xauBackToBnb"/);
  assert.match(gold,/<details class="banner xau-disclosure">/);
  assert.doesNotMatch(html,/class="gold-panel-head"/);
});

