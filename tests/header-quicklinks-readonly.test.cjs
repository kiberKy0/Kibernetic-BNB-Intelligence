'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const shell=fs.readFileSync('v20-production.html','utf8');
const home=fs.readFileSync('dashboard-compact.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const busta=fs.readFileSync('bustabit-shell.js','utf8');
const originalLab=fs.readFileSync('bustabit-lab.html','utf8');

test('header now contains permanent XAU / Bustabit above MetaMask / CoinGecko',()=>{
 for(const id of ['kiberHeaderGold','kiberHeaderBustabit','kiberHeaderWalletBalance','kiberHeaderCoinGecko'])
  assert.ok(shell.includes('id="'+id+'"'),id);
 assert.match(shell,/#kiberHeaderGold\{grid-column:2;grid-row:1\}/);
 assert.match(shell,/#kiberHeaderBustabit\{grid-column:3;grid-row:1\}/);
 assert.match(shell,/#kiberHeaderWalletBalance\{grid-column:2;grid-row:2\}/);
 assert.match(shell,/#kiberHeaderCoinGecko\{grid-column:3;grid-row:2\}/);
 assert.match(shell,/header\.top\.kiber-wallet-top\{[\s\S]*?grid-template-rows:auto auto/);
 assert.match(shell,/id="kiberHeaderWalletBalance"[\s\S]*?<span>MetaMask<\/span>/);
});

test('CoinGecko opens official BNB ecosystem externally without touching token data',()=>{
 assert.match(shell,/id="kiberHeaderCoinGecko" href="https:\/\/www\.coingecko\.com\/it\/categories\/binance-smart-chain" target="_blank" rel="noopener noreferrer"/);
 assert.match(home,/https:\/\/www\.coingecko\.com\/it\/categories\/binance-smart-chain/);
 assert.doesNotMatch(shell,/onclick="[^"]*(?:ethereum|wallet|transaction)/);
});

test('floating Bustabit button is hidden when header launcher binds archive sector',()=>{
 assert.match(busta,/getElementById\('kiberHeaderBustabit'\)/);
 assert.match(busta,/headerButton\.addEventListener\('click',open\)/);
 assert.match(busta,/quick\.style\.display='none'/);
 assert.match(busta,/frame\.dataset\.src='\/bustabit-lab\.html'/);
 assert.match(busta,/layer\.hidden=false/);
 assert.match(busta,/close\.addEventListener\('click',shut\)/);
 assert.match(index,/bustabit-shell\.js\?v=busta-20261120-header/);
 assert.match(originalLab,/id="bvaBotList"/);
});

test('only visual profile entrypoints are hidden; data and code remain untouched',()=>{
 assert.match(shell,/\.kiber-wallet-top #profileBtn,#profileDrawer\{display:none!important\}/);
 assert.match(shell,/#kiberCompactDashboard \.kcd-dock button\[data-kcd-action="profile"\]\{display:none!important\}/);
 assert.match(shell,/#kiberCompactDashboard \.kcd-dock\{grid-template-columns:repeat\(3,minmax\(0,1fr\)\)!important\}/);
 for(const id of ['profileBtn','profileDrawer','saveProfile','profileName'])
  assert.ok(shell.includes('id="'+id+'"'),'data retained '+id);
 assert.match(home,/data-kcd-action="profile"/);
 const profile=fs.readFileSync('profile-planets.js','utf8');
 assert.match(profile,/kiber_v17_profile/);
});

test('read-only UI change keeps scanner, Kiber chat, wallet and XAU logic',()=>{
 for(const script of ["'dashboard-compact.js'","'kiber-assistant.js'","'bnb-trading-panel.js'","'bnb-cloud-orb.js'"])
  assert.ok(index.includes(script),'script retained '+script);
 assert.match(index,/walletBalanceToggle'\)\?\.click\(\)/);
 assert.match(index,/id="walletMini"/);
 assert.match(index,/id="goldPanel"/);
 assert.match(index,/V='314-20261120-speculative-layout'/);
 assert.doesNotThrow(()=>new Function(busta));
});
