'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const html=fs.readFileSync(require.resolve('../v20-production.html'),'utf8');
const boot=fs.readFileSync(require.resolve('../index.html'),'utf8');
test('XAU/USD appears as a native menu item even before deferred JS runs',()=>{
  assert.match(html,/<nav[^>]*id="hubNav"[\s\S]*?<a\s+id="xauUsdNav"[^>]*>\s*<b>Oro XAU\/USD<\/b><span>Decoder separato<\/span><\/a><\/nav>/);
});
test('gold menu item navigates top-level browser to separate XAU decoder page',()=>{
  const anchor=html.match(/<a id="xauUsdNav"[^>]+>/)?.[0]||'';
  assert.match(anchor,/href="\/xau-usd"/);
  assert.match(anchor,/target="_top"/);
});
test('BNB remains mounted and gold menu uses link to avoid legacy button click interception',()=>{
  assert.match(boot,/v20-production\.html/);
  assert.doesNotMatch(html,/<button[^>]+id="xauUsdNav"/);
  assert.match(boot,/xau-nav\.js/);
});
