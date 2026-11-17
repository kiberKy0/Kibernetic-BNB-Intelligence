'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const U=require('../wallet-ledger.js');
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
const client=fs.readFileSync(require.resolve('../wallet-monitor.js'),'utf8');
const styles=fs.readFileSync(require.resolve('../wallet-monitor.css'),'utf8');

test('MetaMask opens directly as an external wallet link, not as an internal portfolio',()=>{
  assert.match(html,/<a id="walletOpen" href="https:\/\/link\.metamask\.io\/home"/);
  assert.match(html,/<button id="walletBalanceToggle"/);
  assert.match(html,/<section id="walletMini" hidden/);
  assert.match(styles,/#walletShortcuts/);
  assert.doesNotMatch(html,/id="walletPanel"|id="walletEntryForm"|id="walletExport"|id="walletMarket"/);
  assert.doesNotMatch(html,/Registro capitale e risultati strategie|Portafoglio e controllo capitale/);
});

test('Balances reflect only user-approved MetaMask BNB network and cannot initiate transfers',()=>{
  for(const id of ['walletConnect','walletBnb','walletUsdt','walletUsdc','walletNetwork','walletRefresh']){
    assert.match(html,new RegExp('id="'+id+'"'));
  }
  assert.match(client,/eth_requestAccounts/);
  assert.match(client,/eth_accounts/);
  assert.match(client,/eth_chainId/);
  assert.match(client,/eth_getBalance/);
  assert.match(client,/eth_call/);
  assert.match(client,/EXPECTED_CHAIN='0x38'/);
  assert.match(html,/Per il totale su altre reti e per i trasferimenti usa MetaMask/);
  for(const dangerous of ['eth_sendTransaction','wallet_sendCalls','personal_sign','eth_signTypedData','wallet_requestExecutionPermissions','wallet_addEthereumChain','wallet_switchEthereumChain']){
    assert.equal(client.includes(dangerous),false,'Unexpected transaction/permission capability: '+dangerous);
  }
});

test('Read-only helpers validate addresses and format very large integer balances',()=>{
  const address='0x1111111111111111111111111111111111111111';
  assert.equal(U.validAddress(address),true);
  assert.equal(U.validAddress('0xBAD'),false);
  assert.equal(U.formatUnits('0xde0b6b3a7640000',18), '1');
  assert.equal(U.formatUnits('0x1',18,6),'0');
  assert.throws(()=>U.formatUnits('bad',18));
  assert.equal(U.erc20BalanceOf(address),'0x70a08231'+address.slice(2).padStart(64,'0'));
  assert.throws(()=>U.erc20BalanceOf('not-address'));
  assert.equal(Object.hasOwn(U,'totals'),false,'Manual local strategy ledger has been removed');
});

test('Wallet opening is a voluntary user action and the balance module never stores a private key',()=>{
  assert.match(client,/walletBalanceToggle'\)\.addEventListener\('click'/);
  assert.match(client,/walletConnect'\)\.addEventListener\('click',connect\)/);
  assert.doesNotMatch(client,/localStorage|sessionStorage|privateKey|seedPhrase|mnemonic|secretRecovery/);
  assert.match(html,/https:\/\/link\.metamask\.io\/dapp\/kibernetic-bnb-intelligence\.vercel\.app\//);
});
