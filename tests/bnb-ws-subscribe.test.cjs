'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createSwapWatcher,SWAP_TOPIC}=require('../server/bnb-ws-subscribe.cjs');
const POOL='0x'+'2'.repeat(40),H='0x'+'3'.repeat(64);
class FakeWebSocket {
  static instances=[];
  constructor(url){this.url=url;this.sent=[];FakeWebSocket.instances.push(this)}
  send(s){this.sent.push(JSON.parse(s))}
  close(){this.closed=true;this.onclose?.()}
  emit(data){this.onmessage?.({data:JSON.stringify(data)})}
}
function make(events=[]){
  FakeWebSocket.instances=[];
  const watcher=createSwapWatcher({url:'wss://node.example',pools:[POOL],WebSocketImpl:FakeWebSocket,
    onSwap:x=>events.push(x),onState:s=>events.push({state:s.stage}),setTimeoutFn:()=>777,clearTimeoutFn:()=>{}});
  watcher.start();const socket=FakeWebSocket.instances[0];socket.onopen();
  return {watcher,socket,events};
}
function ready(socket,chain='0x38'){
  socket.emit({id:1,jsonrpc:'2.0',result:chain});
  if(chain==='0x38')socket.emit({id:2,jsonrpc:'2.0',result:'0xsubscription'});
}
function log(data={}){
  return {jsonrpc:'2.0',method:'eth_subscription',params:{subscription:'0xsubscription',result:{
    address:POOL,topics:[SWAP_TOPIC],transactionHash:H,blockNumber:'0xff',logIndex:'0x1',removed:false,...data}}};
}
test('richiede 1-30 pool valide e TLS WSS',()=>{
  assert.throws(()=>createSwapWatcher({url:'ws://unsafe',pools:[POOL],WebSocketImpl:FakeWebSocket}),/WSS/);
  assert.throws(()=>createSwapWatcher({url:'wss://example',pools:[],WebSocketImpl:FakeWebSocket}),/pool/);
});
test('verifica chain 56 prima di sottoscrivere gli eventi',()=>{
  const {socket,watcher}=make();assert.equal(socket.sent[0].method,'eth_chainId');
  ready(socket,'0x1');assert.equal(socket.sent.some(x=>x.method==='eth_subscribe'),false);
  assert.equal(watcher.state().subscribed,false);watcher.stop();
});
test('sottoscrive solo gli swap della pool PancakeSwap V3 scelta',()=>{
  const {socket,watcher}=make();ready(socket);
  assert.equal(socket.sent[1].method,'eth_subscribe');
  assert.deepEqual(socket.sent[1].params,['logs',{address:[POOL],topics:[SWAP_TOPIC]}]);
  assert.equal(watcher.state().subscribed,true);watcher.stop();
});
test('ignora eventi con topic o pool differente, duplicati inclusi',()=>{
  const events=[];const {socket,watcher}=make(events);ready(socket);
  socket.emit(log({topics:['0x'+'4'.repeat(64)]}));
  socket.emit(log({address:'0x'+'5'.repeat(40)}));
  socket.emit(log());socket.emit(log());
  const swaps=events.filter(x=>x.transactionHash);
  assert.equal(swaps.length,1);assert.equal(swaps[0].usdPrice,null);
  assert.equal(swaps[0].chainId,56);
  watcher.stop();
});
test('evento removed è distinguibile e non finge un prezzo USD',()=>{
  const events=[];const {socket,watcher}=make(events);ready(socket);
  socket.emit(log());socket.emit(log({removed:true}));
  const swaps=events.filter(x=>x.transactionHash);
  assert.equal(swaps.length,2);assert.equal(swaps[1].removed,true);assert.equal(swaps[1].priceAvailable,false);
  watcher.stop();
});
test('gli eventi on-chain non diventano un ordine wallet',()=>{
  const {socket,watcher}=make();ready(socket);socket.emit(log());
  assert.equal(socket.sent.filter(x=>x.method==='eth_sendRawTransaction').length,0);
  watcher.stop();
});
