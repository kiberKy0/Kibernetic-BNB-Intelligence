'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const index=fs.readFileSync(require.resolve('../index.html'),'utf8');
const bnb=fs.readFileSync(require.resolve('../v20-production.html'),'utf8');
const profile=fs.readFileSync(require.resolve('../v17.js'),'utf8');
const gold=fs.readFileSync(require.resolve('../xau-usd.html'),'utf8');
const css=fs.readFileSync(require.resolve('../wallet-monitor.css'),'utf8');

test('BNB header has XAU and Bustabit with MetaMask and CoinGecko below; profile hidden',()=>{
  assert.match(bnb,/<header class="top kiber-wallet-top">/);
  assert.match(bnb,/<nav class="kiber-header-wallet"[^>]*>[\s\S]*?id="kiberHeaderWalletBalance"[\s\S]*?id="kiberHeaderGold"[\s\S]*?id="kiberHeaderBustabit"[\s\S]*?id="kiberHeaderCoinGecko"[\s\S]*?<\/nav><div class="top-actions">/);
  assert.doesNotMatch(bnb,/id="kiberHeaderWalletLink"/);
  assert.match(bnb,/\.kiber-header-wallet #kiberHeaderWalletBalance/);
  assert.match(bnb, /header\.top\.kiber-wallet-top\{display:grid!important/);
});

test('BNB shell bridges the real Saldo button without duplicating buttons over the chat',()=>{
  assert.match(index,/function mountHeaderWallet\(d\)/);
  assert.match(index,/mountHeaderWallet\(d\)/);
  assert.match(index,/walletBalanceToggle'\)\?\.click\(\)/);
  assert.match(css,/#walletShortcuts\{display:none!important\}/);
  assert.match(css,/#walletMini\{top:72px;bottom:auto!important/);
  assert.match(index,/id="walletMini"/);
});

test('XAU/USD offers separate Broker and MT5 information, not a connected account',()=>{
  assert.match(gold,/<header class="xau-topbar">/);
  assert.match(gold,/<nav class="xau-finance xau-platform-nav"[^>]*>[\s\S]*?id="xauBrokerOpen"[\s\S]*?id="xauMt5Open"[\s\S]*?<\/nav>/);
  assert.match(gold,/id="xauWalletBalanceBtn"[^>]*hidden/);
  assert.match(gold,/id="xauBrokerInfo"/);
  assert.match(gold,/Nessuna operazione/);
  assert.doesNotMatch(gold,/id="xauWalletAccountBtn"[^>]*MetaMask/);
});
test('BNB legacy profile data remain stored, while XAU has no editable profile interface',()=>{
  for(const id of ['profileName','profileTagline','profileBio','avatarSelect','profileSubtitleTop','profileBioPreview'])assert.match(bnb,new RegExp('id="'+id+'"'));
  assert.match(profile,/tagline:\(\$\('profileTagline'\)/);
  assert.match(profile,/bio:\(\$\('profileBio'\)/);
  assert.match(profile,/kiber_v17_profile/);
  assert.match(gold,/id="xauProfileName"|xauProfileName/);
  assert.doesNotMatch(gold,/id="xauProfileBtn"/);
  assert.doesNotMatch(gold,/id="xauProfileDrawer"/);
});
test('Gold standalone document remains independently accessible with its technical engine',()=>{
  assert.match(gold, /<h1>(?:Kiber|Decoder) <span class="gold">XAU\/USD<\/span><\/h1>/);
  assert.match(gold, /id="decoder"/);
  assert.match(gold, /xau-analysis\.js/);
  assert.match(gold, /xau-ui\.js/);
});
