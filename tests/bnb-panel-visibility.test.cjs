'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const root=path.join(__dirname,'..');
const panel=fs.readFileSync(path.join(root,'bnb-trading-panel.js'),'utf8');
const tokenScanner=fs.readFileSync(path.join(root,'v27-1.js'),'utf8');
const boot=fs.readFileSync(path.join(root,'index.html'),'utf8');
test('BNB market panel mounts in visible token scanner, not obsolete hidden legacy laboratory',()=>{
  assert.match(tokenScanner,/id='v271TokenView'/);
  assert.match(tokenScanner,/class="v271-main"/);
  assert.match(panel,/#v271TokenView \.v271-main/);
  assert.match(panel,/\.v271-metrics/);
  assert.doesNotMatch(panel,/#section-lab/);
});
test('BNB panel waits for token overlay to be mounted by scanner',()=>{
  assert.match(panel,/MutationObserver/);
  assert.match(panel,/observer\.observe\(document\.body,\{childList:true\}\)/);
  assert.match(panel,/observer\.disconnect\(\)/);
  assert.match(boot,/'bnb-trading-panel\.js'/);
});
