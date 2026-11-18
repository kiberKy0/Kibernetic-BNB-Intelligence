'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const endpoint=require('../api/bnb-dex-live.js');
const W='0x'+'1'.repeat(40),P='0x'+'2'.repeat(40);
function fakePair(extra={}){return {chainId:'bsc',dexId:'pancakeswap-v3',pairAddress:P,baseToken:{address:W,symbol:'TKN'},quoteToken:{address:'0x'+'3'.repeat(40),symbol:'USDT'},priceUsd:'1.25',liquidity:{usd:900000},volume:{h24:320000},txns:{h24:{buys:100,sells:80}},...extra};}
function mockRes(){
  return {code:200,headers:{},body:null,setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this},json(v){this.body=v;return this}};
}
test('non presume pool PancakeSwap da altre chain o altri DEX',()=>{
  assert.equal(endpoint.selectPair([{...fakePair(),chainId:'eth'}, {...fakePair(),dexId:'uniswap'}],W),null);
});
test('non usa il prezzo di un token quote come se fosse base',()=>{
  assert.equal(endpoint.selectPair([fakePair({baseToken:{address:'0x'+'4'.repeat(40)},quoteToken:{address:W}})],W),null);
});
test('sceglie la pool PancakeSwap con maggiore liquidità verificata',()=>{
  const a=fakePair({liquidity:{usd:20}}),b=fakePair({liquidity:{usd:2000}});
  assert.equal(endpoint.selectPair([a,b],W),b);
});
test('rifiuta indirizzo non valido e non chiama provider',async()=>{
  const res=mockRes();await endpoint({method:'GET',query:{address:'BNB'}},res);
  assert.equal(res.code,400);assert.equal(res.body.ok,false);
});
test('restituisce snapshot con orario acquisizione distinto da ultimo trade',async()=>{
  const old=global.fetch;
  global.fetch=async()=>({ok:true,json:async()=>[fakePair()]});
  try {
    const res=mockRes();await endpoint({method:'GET',query:{address:W}},res);
    assert.equal(res.code,200);assert.equal(res.body.pair.priceUsd,1.25);
    assert.equal(res.body.websocket,false);
    assert.equal(res.body.feedType,'HTTP_POLL');
    assert.equal(res.body.priceTimestampVerified,false);
    assert.ok(Date.parse(res.body.fetchedAt)>0);
  } finally {global.fetch=old}
});
test('se il provider fallisce non inventa prezzi',async()=>{
  const old=global.fetch;global.fetch=async()=>{throw Error('timeout')};
  try {const res=mockRes();await endpoint({method:'GET',query:{address:W}},res);
    assert.equal(res.code,503);assert.equal(res.body.ok,false);assert.equal(res.body.pair,undefined);
  } finally{global.fetch=old}
});
