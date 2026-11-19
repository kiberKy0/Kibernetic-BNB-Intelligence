'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createWorker}=require('../server/bnb-ws-worker.cjs');
const POOL='0x'+'9'.repeat(40),A='0x'+'1'.repeat(40),B='0x'+'2'.repeat(40);
const ROW={pool_address:POOL,token0_address:A,token1_address:B,fee:500};
const proof={verified:true,chainId:56,token0:A,token1:B,fee:500};
function fixture(rows=[ROW]){
  const states=[],events=[];
  const store={listPools:async()=>rows,state:async s=>{states.push(s)},insertEvent:async e=>{events.push(e)}};
  return {store,states,events};
}
const env={BSC_WSS_URL:'wss://mock.example'};
test('nessuna pool verificata: worker rimane spento',async()=>{
  const f=fixture([]),worker=createWorker({store:f.store,env,makeWatcher:()=>{throw Error('mai avviato')}});
  const r=await worker.start();assert.equal(r.active,false);
  assert.equal(worker.health().running,false);assert.equal(f.states.at(-1).status,'NOT_CONFIGURED');
});
test('verifica factory fallita: worker non sottoscrive eventi',async()=>{
  const f=fixture(),worker=createWorker({store:f.store,env,verify:async()=>({...proof,verified:false}),
    makeWatcher:()=>{throw Error('mai avviato')}});
  const r=await worker.start();assert.equal(r.active,false);
  assert.equal(f.states.at(-1).status,'ERROR');
});
test('manca URL WSS: segnala configurazione assente senza inventare live',async()=>{
  const f=fixture(),worker=createWorker({store:f.store,env:{},verify:async()=>proof,
    makeWatcher:()=>{throw Error('mai avviato')}});
  const r=await worker.start();assert.equal(r.active,false);
  assert.equal(f.states.at(-1).status,'NOT_CONFIGURED');
});
test('evento onchain: persiste hash, pool e flag non confermato, senza prezzo',async()=>{
  const f=fixture();let adapter;
  const watcher=options=>{
    adapter=options;
    return {start(){options.onState({stage:'SUBSCRIBED',details:'Stream attivo'})},stop(){},
      state(){return{subscribed:true,poolCount:1}}};
  };
  const worker=createWorker({store:f.store,env,verify:async()=>proof,makeWatcher:watcher,
    clock:()=>Date.parse('2026-11-19T00:00:00.000Z')});
  const r=await worker.start();assert.equal(r.active,true);assert.equal(r.pools,1);
  adapter.onSwap({chainId:56,pool:POOL,transactionHash:'0x'+'a'.repeat(64),
    blockNumber:'0xff',logIndex:'0x3',removed:false,source:'test V3',
    receivedAt:'2026-11-19T00:00:00.000Z',priceAvailable:false});
  await worker.stop();
  assert.equal(f.events.length,1);assert.equal(f.events[0].block_number,255);
  assert.equal(f.events[0].price_usd,null);
  assert.equal(f.events[0].payload.unconfirmed,true);
  assert.equal(worker.health().running,false);
});
test('worker non elabora un falso prezzo o una chain diversa',async()=>{
  const f=fixture();let adapter;
  const worker=createWorker({store:f.store,env,verify:async()=>proof,makeWatcher:options=>{
    adapter=options;return {start(){},stop(){},state(){return {subscribed:true,poolCount:1}}}
  }});
  await worker.start();
  adapter.onSwap({chainId:1,priceAvailable:false});
  adapter.onSwap({chainId:56,priceAvailable:true});
  await worker.stop();
  assert.equal(f.events.length,0);
});
