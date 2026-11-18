'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const index=fs.readFileSync(require.resolve('../index.html'),'utf8');
const bnb=fs.readFileSync(require.resolve('../v20-production.html'),'utf8');
const profile=fs.readFileSync(require.resolve('../v17.js'),'utf8');
const gold=fs.readFileSync(require.resolve('../xau-usd.html'),'utf8');
const css=fs.readFileSync(require.resolve('../wallet-monitor.css'),'utf8');

test('BNB header has one centered Portafoglio and adjacent Oro before profile actions',()=>{
  assert.match(bnb,/<header class="top kiber-wallet-top">/);
  assert.match(bnb,/<nav class="kiber-header-wallet"[^>]*>[\s\S]*?id="kiberHeaderWalletBalance"[\s\S]*?id="kiberHeaderGold"[\s\S]*?<\/nav><div class="top-actions">/);
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

test('XAU/USD has one visible Portafoglio button while broker remains unconnected',()=>{
  assert.match(gold,/<header class="xau-topbar">/);
  assert.match(gold,/<nav class="xau-finance"[^>]*>[\s\S]*?id="xauWalletAccountBtn"[\s\S]*?id="xauWalletBalanceBtn"[\s\S]*?<\/nav>/);
  assert.match(gold,/id="xauWalletBalanceBtn"[^>]*hidden/);
  assert.match(gold, /class="xau-wallet-round"[^>]*id="xauWalletAccountBtn"/);
  assert.match(gold,/Portafoglio<\/span>/);
  assert.match(gold,/Broker non collegato/);
  assert.match(gold,/Nessun movimento automatico è attivo/);
  assert.doesNotMatch(gold,/id="xauWalletAccountBtn"[^>]*MetaMask/);
});

test('Kiber profile is editable and shared across BNB and gold without changing other settings',()=>{
  for(const id of ['profileName','profileTagline','profileBio','avatarSelect','profileSubtitleTop','profileBioPreview'])assert.match(bnb,new RegExp('id="'+id+'"'));
  for(const id of ['xauProfileBtn','xauProfileDrawer','xauProfileForm','xauProfileEditName','xauProfileEditAvatar','xauProfileEditTagline','xauProfileEditBio'])assert.match(gold,new RegExp('id="'+id+'"'));
  assert.match(profile,/tagline:\(\$\('profileTagline'\)/);
  assert.match(profile,/bio:\(\$\('profileBio'\)/);
  assert.match(gold,/kiber_v17_profile/);
  assert.match(profile,/kiber_v17_profile/);
});

test('Gold standalone document remains independently accessible with its technical engine',()=>{
  assert.match(gold, /<h1>Decoder <span class="gold">XAU\/USD<\/span><\/h1>/);
  assert.match(gold, /id="decoder"/);
  assert.match(gold, /xau-analysis\.js/);
  assert.match(gold, /xau-ui\.js/);
});
