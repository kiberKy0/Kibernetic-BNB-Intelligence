'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { createPipeline, PHASES } = require('../bnb-trading-core.js');
const now = Date.parse('2026-11-18T20:30:00Z');
const A = '0x1111111111111111111111111111111111111111';
const B = '0x2222222222222222222222222222222222222222';
const R = '0x3333333333333333333333333333333333333333';
const W = '0x4444444444444444444444444444444444444444';
const H = '0x' + 'a'.repeat(64);
const request = {chainId:56,wallet:W,tokenIn:A,tokenOut:B,amountInRaw:'1000000000000000000',strategyId:'strategia_1',signalId:'block:123',slippageBps:50};
function fixture(overrides = {}, events = []) {
  return {
    analyze: async () => { events.push('ANALIZZA'); return {trigger:true,live:true,source:'bsc-verified',observedAt:now-1000}; },
    verify: async () => { events.push('VERIFICA'); return {approved:true,tokenSecurityChecked:true,liquidityChecked:true,balanceChecked:true,limitsChecked:true}; },
    quote: async () => { events.push('CALCOLA'); return {chainId:56,tokenIn:A,tokenOut:B,amountInRaw:request.amountInRaw,amountOutRaw:'100000',minAmountOutRaw:'99500',slippageBps:50,router:R,quotedAt:now-1000}; },
    isAuthorized: async () => true,
    reserveOrder: async () => { events.push('RESERVE'); return true; },
    execute: async () => { events.push('ESEGUE'); return {hash:H}; },
    monitor: async () => { events.push('MONITORA'); return {chainId:56,confirmed:true,success:true,hash:H}; },
    record: async r => { events.push('REGISTRA'); assert.ok(r.decision); },
    ...overrides
  };
}
const options = {now:()=>now,allowedRouters:[R]};
test('espone sempre sei fasi ordinate',()=>assert.deepEqual(PHASES,['ANALIZZA','VERIFICA','CALCOLA','ESEGUE','MONITORA','REGISTRA']));
test('paper mode prepara ma non invia transazioni',async()=>{
  const events=[];const out=await createPipeline(fixture({},events),options).run(request);
  assert.equal(out.decision,'PAPER_READY'); assert.equal(out.txHash,null); assert.equal(out.recorded,true);
  assert.deepEqual(events,['ANALIZZA','VERIFICA','CALCOLA','REGISTRA']);
});
test('chain differente è rifiutata prima di accedere a dati e ordini',async()=>{
  const events=[];const out=await createPipeline(fixture({},events),options).run({...request,chainId:1});
  assert.equal(out.decision,'WAIT'); assert.deepEqual(events,['REGISTRA']); assert.match(out.reason,/BNB Smart Chain/);
});
test('segnale stale blocca e registra',async()=>{
  const events=[];const adapters=fixture({analyze:async()=>({trigger:true,live:true,source:'bsc',observedAt:now-70000})},events);
  const out=await createPipeline(adapters,options).run(request);
  assert.equal(out.decision,'WAIT'); assert.match(out.reason,/scaduto/); assert.deepEqual(events,['REGISTRA']);
});
test('controlli di sicurezza mancanti bloccano la quotazione',async()=>{
  const events=[];const adapters=fixture({verify:async()=>({approved:true,tokenSecurityChecked:false})},events);
  const out=await createPipeline(adapters,options).run(request);
  assert.equal(out.decision,'WAIT');assert.deepEqual(events,['ANALIZZA','REGISTRA']);
});
test('router non autorizzato viene rifiutato',async()=>{
  const out=await createPipeline(fixture(),{now:()=>now,allowedRouters:[]}).run(request);
  assert.equal(out.decision,'WAIT');assert.match(out.reason,/Router/);
});
test('slippage minAmountOut troppo basso viene rifiutato',async()=>{
  const adapters=fixture({quote:async()=>({chainId:56,tokenIn:A,tokenOut:B,amountInRaw:request.amountInRaw,amountOutRaw:'100000',minAmountOutRaw:'1',slippageBps:50,router:R,quotedAt:now-1000})});
  const out=await createPipeline(adapters,options).run(request);
  assert.equal(out.decision,'WAIT');assert.match(out.reason,/slippage/);
});
test('mode live non attivo non esegue né prenota',async()=>{
  const events=[];const out=await createPipeline(fixture({},events),{...options,mode:'live'}).run(request);
  assert.equal(out.decision,'WAIT');assert.ok(!events.includes('ESEGUE'));assert.ok(!events.includes('RESERVE'));
});
test('live richiede idempotenza persistente prima della firma',async()=>{
  const events=[];const out=await createPipeline(fixture({reserveOrder:async()=>false},events),{...options,mode:'live',liveEnabled:true}).run(request);
  assert.equal(out.decision,'WAIT');assert.ok(!events.includes('ESEGUE'));
});
test('solo un ordine autorizzato confermato viene dichiarato riuscito',async()=>{
  const events=[];const out=await createPipeline(fixture({},events),{...options,mode:'live',liveEnabled:true}).run(request);
  assert.equal(out.decision,'CONFIRMED');assert.equal(out.txHash,H);assert.equal(out.recorded,true);
  assert.deepEqual(events,['ANALIZZA','VERIFICA','CALCOLA','RESERVE','ESEGUE','MONITORA','REGISTRA']);
});
test('transazione inviata con esito ignoto non viene ripetuta',async()=>{
  const events=[];const adapters=fixture({monitor:async()=>{throw Error('timeout on-chain')}},events);
  const out=await createPipeline(adapters,{...options,mode:'live',liveEnabled:true}).run(request);
  assert.equal(out.decision,'PENDING_RECONCILIATION');assert.equal(out.txHash,H);assert.ok(!events.includes('MONITORA'));
});