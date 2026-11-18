'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {normalizeBars,normalizeTick,getSnapshot}=require('../server/xau-biquote.cjs');
const NOW=Date.parse('2026-11-18T20:55:00Z');
const MINUTES={ '1m':1,'5m':5,'15m':15,'1h':60,'4h':240,'1d':1440 };
function fixture(interval){
 const ms=MINUTES[interval]*60000;
 const lastClosed=Math.floor(NOW/ms)*ms-ms;
 const bars=[];
 for(let i=0;i<112;i++){
   const openTime=new Date(lastClosed-i*ms).toISOString().replace('.000Z','Z');
   const base=3745-i*.1;
   bars.push({openTime,open:base,high:base+1,low:base-1,close:base-.3,isOpen:false,tickVolume:100});
 }
 return {symbol:'XAUUSD',interval,bars};
}
function mockFetch({age=5,marketState='open',spread=.2,calendar=[],bad=false}={}){
 return async function(url){
   const u=new URL(url);
   let result;
   if(u.pathname.endsWith('/ohlc')){
     result=fixture(u.searchParams.get('interval'));
     if(bad)result.symbol='NOTXAU';
   }else if(u.pathname==='/api/XAUUSD'){
     result={symbol:'XAUUSD',timestamp:new Date(NOW-age*1000).toISOString().replace('.000Z','Z'),marketState,stale:marketState!=='open',
       bid:3744,ask:3744+spread,mid:3744+spread/2,source:'MetaTrader 5 (Broker external)'};
   }else if(u.pathname==='/api/calendar'){
     result=calendar;
   }else throw Error('Unexpected request '+url);
   return {ok:true,status:200,json:async()=>result};
 };
}
test('normalizes OHLC, ignores the open bar, checks complete candles',()=>{
 const raw=fixture('15m');
 raw.bars.unshift({openTime:'2026-11-18T20:45:00Z',open:3750,high:3755,low:3749,close:3751,isOpen:true});
 const d=normalizeBars(raw,'15min',NOW);
 assert.equal(d.candles.length,112);
 assert.equal(d.recent,true);
 assert.ok(d.candles.every(c=>Date.parse(c.time)+15*60000<=NOW));
});
test('fresh true tick contains valid Bid/Ask and spread',()=>{
 const d=normalizeTick({timestamp:'2026-11-18T20:54:55Z',bid:3744,ask:3744.2,mid:3744.1,marketState:'open',stale:false},NOW);
 assert.equal(d.ok,true);assert.equal(d.spread,.2);
});
test('a stale tick never passes',()=>{
 const d=normalizeTick({timestamp:'2026-11-18T20:35:00Z',bid:3744,ask:3744.2,mid:3744.1,marketState:'open',stale:false},NOW);
 assert.equal(d.ok,false);assert.equal(d.fresh,false);
});
test('live snapshots have 100+ real-shaped candles, timeframe and calendar diagnostics',async()=>{
 const data=await getSnapshot({now:NOW,interval:'15min',fetchImpl:mockFetch()});
 assert.equal(data.quality.ok,true);
 assert.equal(data.feedStatus,'recent');
 assert.equal(data.candles.length,112);
 assert.equal(data.multiTimeframe['5min'].status,'observed');
 assert.equal(data.multiTimeframe['4h'].status,'observed');
 assert.equal(data.calendar.connected,true);
});
test('market closed blocks all operative OHLC',async()=>{
 const d=await getSnapshot({now:NOW,interval:'5min',fetchImpl:mockFetch({marketState:'closed'})});
 assert.equal(d.quality.ok,false);assert.equal(d.candles.length,0);
});
test('high spread blocks all operative OHLC',async()=>{
 const d=await getSnapshot({now:NOW,interval:'5min',fetchImpl:mockFetch({spread:20})});
 assert.equal(d.quality.ok,false);assert.equal(d.quality.tick.valid,false);
});
test('high-impact US news within 30 minutes blocks',async()=>{
 const events=[{time:'2026-11-18T21:10:00Z',importance:'high',countryCode:'US',timeMode:'exact',name:'FOMC'}];
 const d=await getSnapshot({now:NOW,interval:'15min',fetchImpl:mockFetch({calendar:events})});
 assert.equal(d.calendar.highImpactNear,true);assert.equal(d.quality.ok,false);assert.equal(d.candles.length,0);
});
test('wrong symbol cannot pass as gold',async()=>{
 await assert.rejects(()=>getSnapshot({now:NOW,interval:'15min',fetchImpl:mockFetch({bad:true})}),/XAUUSD/);
});
test('delayed quote blocks rather than reusing historic prices',async()=>{
 const d=await getSnapshot({now:NOW,interval:'15min',fetchImpl:mockFetch({age:5000})});
 assert.equal(d.quality.ok,false);assert.equal(d.quality.tick.fresh,false);
});
