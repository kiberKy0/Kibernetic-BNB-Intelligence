'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const L=require('../wallet-ledger.js');
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');
const client=fs.readFileSync(require.resolve('../wallet-monitor.js'),'utf8');

test('wallet connection remains user-triggered and read-only',()=>{
 assert.match(html,/id="walletConnect"/);
 assert.match(client,/walletConnect'\)\.addEventListener\('click',connect\)/);
 assert.match(client,/eth_requestAccounts/);
 for(const forbidden of ['eth_sendTransaction','wallet_sendCalls','wallet_requestExecutionPermissions','personal_sign','eth_signTypedData','eth_sign','approve(','transfer(']){
   assert.equal(client.includes(forbidden),false,'forbidden wallet operation: '+forbidden);
 }
});

test('wallet dashboard is inside BNB root and distinguishes wallet balance from strategy ledger',()=>{
 for(const id of ['walletOpen','walletPanel','walletBnb','walletUsdt','walletUsdc','walletNet','walletCapital','walletMode','walletMarket','walletEntryForm','walletExport']){
   assert.match(html,new RegExp('id="'+id+'"'));
 }
 assert.match(html,/Automazione strategie/);
 assert.match(html,/Non collegata/);
 assert.match(html,/Simulazione/);
 assert.match(html,/Operazioni reali/);
});

test('ledger refuses negative values, unknown markets and unknown movement types',()=>{
 assert.equal(L.validEntry({market:'BNB',mode:'real',type:'profit',amount:'-10'}),null);
 assert.equal(L.validEntry({market:'XAUUSD',mode:'real',type:'buy',amount:100}),null);
 assert.equal(L.validEntry({market:'BTC',mode:'real',type:'deposit',amount:100}),null);
 assert.equal(L.validEntry({market:'BNB',mode:'real',type:'deposit',amount:'NaN'}),null);
 assert.equal(L.validEntry({market:'BNB',mode:'real',type:'deposit',amount:2.5}).amount,2.5);
});

test('strategy accounting separates BNB from XAUUSD and demo from real',()=>{
 const rows=[
  {market:'BNB',mode:'real',type:'deposit',amount:100},
  {market:'BNB',mode:'real',type:'profit',amount:21},
  {market:'BNB',mode:'real',type:'loss',amount:7},
  {market:'BNB',mode:'real',type:'fee',amount:2},
  {market:'BNB',mode:'real',type:'withdrawal',amount:10},
  {market:'XAUUSD',mode:'real',type:'profit',amount:900},
  {market:'BNB',mode:'demo',type:'profit',amount:400}
 ];
 const bnb=L.totals(rows,'BNB','real');
 assert.equal(bnb.net,12);
 assert.equal(bnb.capital,102);
 assert.equal(L.totals(rows,'BNB','demo').net,400);
 assert.equal(L.totals(rows,'XAUUSD','real').net,900);
 assert.equal(L.totals([],'XAUUSD','real').hasCapital,false);
});

test('on-chain formatter and balanceOf call handle large integer tokens without floating precision loss',()=>{
 assert.equal(L.formatUnits('0xde0b6b3a7640000',18), '1');
 assert.equal(L.formatUnits('0x0',18), '0');
 assert.equal(L.formatUnits('0x1',18,6), '0');
 assert.throws(()=>L.formatUnits('nothex',18));
 const wallet='0x1111111111111111111111111111111111111111';
 assert.equal(L.validAddress(wallet),true);
 assert.equal(L.erc20BalanceOf(wallet),'0x70a08231'+wallet.slice(2).padStart(64,'0'));
 assert.throws(()=>L.erc20BalanceOf('bad'));
});
