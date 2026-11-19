'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const E=require('../server/kiber-binance-evidence.cjs');
const now=Date.parse('2026-11-19T12:20:00Z');
const ticker={symbol:'BNBUSDT',lastPrice:'591.08000000',priceChangePercent:'0.115',quoteVolume:'63418815.84374000',highPrice:'593.86000000',lowPrice:'575.37000000',closeTime:now-28000};
test('the exact screenshot question is answered from public Binance market API',()=>{
 const q='Hai dati o info da binance';
 assert.equal(E.isBinanceQuestion(q),true);
 assert.equal(E.isCapabilityQuestion(q),true);
 const parsed=E.parseTicker(ticker,now);
 assert.equal(parsed.status,'CURRENT');
 assert.equal(parsed.market,'BNB/USDT');
 assert.equal(parsed.lastPrice,591.08);
 assert.equal(parsed.sourceAgeSeconds,28);
 assert.equal(parsed.accountConnected,false);
 assert.equal(parsed.privateApiAccess,false);
 assert.equal(parsed.tradeExecution,false);
 const answer=E.summarize(parsed);
 assert.match(answer,/Sì.*dati|Sì.*informazioni|Sì.*può consultare informazioni PUBBLICHE/s);
 assert.match(answer,/Binance Spot BNB\/USDT/);
 assert.match(answer,/591,08/);
 assert.match(answer,/NON dati del tuo account Binance/);
 assert.doesNotMatch(answer,/non posso eseguire ricerche live esterne|nessuna connessione in tempo reale/i);
});
test('never treat a third-party ticker as an account connection or USD price',()=>{
 const x=E.parseTicker(ticker,now);
 assert.equal(x.quoteCurrency,'USDT');
 assert.equal(x.source,'Binance Spot (API pubblica Binance Vision)');
 assert.match(E.summarize(x),/USDT/);
 assert.match(E.summarize(x),/API private/);
});
test('stale and invalid data fail closed without fabricated current price',()=>{
 const stale=E.parseTicker({...ticker,closeTime:now-500000},now);
 assert.equal(stale.status,'STALE');
 assert.doesNotMatch(E.summarize(stale),/591,08/);
 const invalid=E.parseTicker({...ticker,symbol:'BTCUSDT'},now);
 assert.equal(invalid.status,'UNAVAILABLE');
 const noTime=E.parseTicker({...ticker,closeTime:null},now);
 assert.equal(noTime.status,'UNAVAILABLE');
 const noPrice=E.parseTicker({...ticker,lastPrice:'NaN'},now);
 assert.equal(noPrice.status,'UNAVAILABLE');
});
test('GET read-only without keys, public Binance Vision URL only',async()=>{
 let lastURL='',config;
 const output=await E.fetchEvidence({now,fetchImpl:async(url,opts)=>{lastURL=url;config=opts;return {ok:true,json:async()=>ticker}}});
 assert.equal(output.status,'CURRENT');
 assert.equal(config.method,'GET');
 assert.equal(config.headers.Authorization,undefined);
 assert.equal(lastURL,'https://data-api.binance.vision/api/v3/ticker/24hr?symbol=BNBUSDT');
});
test('capability questions and market analysis are separated',()=>{
 assert.equal(E.isCapabilityQuestion('Hai dati o info da binance'),true);
 assert.equal(E.isCapabilityQuestion('Sei collegato a Binance?'),true);
 assert.equal(E.isCapabilityQuestion('Analizza le variazioni BNB/USDT su Binance'),false);
 assert.equal(E.isBinanceQuestion('Come stai oggi?'),false);
});
test('server and UI route the exact question to verified public data, not fictional lore',()=>{
 const backend=fs.readFileSync('api/kiber.js','utf8');
 const ui=fs.readFileSync('kiber-assistant.js','utf8');
 assert.match(backend,/BinanceEvidence\.fetchEvidence/);
 assert.match(backend,/BinanceEvidence\.isCapabilityQuestion\(question\)/);
 assert.match(backend,/BinanceEvidence\.summarize\(binanceEvidence\)/);
 assert.match(backend,/provider:'verified-binance-spot'/);
 assert.match(backend,/context\.verifiedBinanceSpot=binanceEvidence/);
 assert.match(ui,/isBinanceQuestion/);
 assert.match(ui,/verified-binance-spot/);
 assert.doesNotThrow(()=>new Function(ui));
 assert.doesNotThrow(()=>new Function('require','process','module','exports',backend));
});

test('clock skew of one second never displays a negative age; excessive future timestamps are rejected',()=>{
 const oneSecond=E.parseTicker({...ticker,closeTime:now+1000},now);
 assert.equal(oneSecond.status,'CURRENT');
 assert.equal(oneSecond.sourceAgeSeconds,0);
 assert.match(E.summarize(oneSecond),/0 secondi/);
 const wrongClock=E.parseTicker({...ticker,closeTime:now+15000},now);
 assert.equal(wrongClock.status,'STALE');
 assert.doesNotMatch(E.summarize(wrongClock),/591,08/);
});
test('chat header does not say Gemini generated every response',()=>{
 const ui=fs.readFileSync('kiber-assistant.js','utf8');
 assert.match(ui,/Analisi BNB · IA e fonti/);
 assert.doesNotMatch(ui,/<small>Analisi BNB · Gemini<\/small>/);
});
