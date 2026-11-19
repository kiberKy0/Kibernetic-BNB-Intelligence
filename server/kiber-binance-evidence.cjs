'use strict';
/* Public Binance Spot facts, strictly READ ONLY, no account/private API access.
   This endpoint is already used by Kibernetic's api/chain.js. */
const URL='https://data-api.binance.vision/api/v3/ticker/24hr?symbol=BNBUSDT';
function isBinanceQuestion(q){return /\bbinance\b|\bBNBUSDT\b|binance\s+spot/i.test(String(q||''))}
function isCapabilityQuestion(q){
 const v=String(q||'').trim();
 return isBinanceQuestion(v)&&/(?:\b(?:hai|avete|possiedi|puoi|sai|riesci|disponi)\b.*\b(?:dat[io]|info|informazion|accesso|collegament|connession|quotazion|api|prezz)|\b(?:dat[io]|info|informazion|accesso|connession|collegament|api)\b.*\b(?:da|di|con|alla|alle|su)\s+binance|(?:sei|è)\s+collegat[oa]\s+(?:a|con)\s+binance)/i.test(v)&&!/(?:\b(?:analizza|confronta|prevedi|ricerca sul web|acquista|compra|vendi|ordine)\b)/i.test(v);
}
function asFinite(value,max){
 const n=typeof value==='string'&&value.trim()?Number(value):typeof value==='number'?value:NaN;
 return Number.isFinite(n)&&Math.abs(n)<=max?n:null;
}
function parseTicker(raw,now=Date.now()){
 if(!raw||raw.symbol!=='BNBUSDT')return {status:'UNAVAILABLE',reason:'Risposta Binance Spot non valida'};
 const price=asFinite(raw.lastPrice,1e7),pct=asFinite(raw.priceChangePercent,10000),volume=asFinite(raw.quoteVolume,1e15),
  high=asFinite(raw.highPrice,1e7),low=asFinite(raw.lowPrice,1e7),timestamp=asFinite(raw.closeTime,1e16);
 if(price===null||price<=0||timestamp===null)return {status:'UNAVAILABLE',reason:'Prezzo o timestamp Binance mancanti'};
 const age=Math.floor((now-timestamp)/1000);
 const common={source:'Binance Spot (API pubblica Binance Vision)',market:'BNB/USDT',quoteCurrency:'USDT',
   lastPrice:price,change24Pct:pct,quoteVolume24:volume,high24:high,low24:low,
   sourceTimestamp:new Date(timestamp).toISOString(),sourceAgeSeconds:age,
   accountConnected:false,privateApiAccess:false,tradeExecution:false};
 return age>=-10&&age<=240?{...common,status:'CURRENT'}:
  {status:'STALE',source:common.source,market:common.market,sourceTimestamp:common.sourceTimestamp,sourceAgeSeconds:age,
   accountConnected:false,privateApiAccess:false,tradeExecution:false,reason:'Orario di aggiornamento oltre il limite di 240 secondi; prezzo non mostrato come attuale'};
}
async function fetchEvidence({fetchImpl=fetch,now=Date.now(),timeoutMs=4800}={}){
 try{
  const response=await fetchImpl(URL,{method:'GET',headers:{Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(timeoutMs)});
  if(!response.ok)return {status:'UNAVAILABLE',reason:'Binance Spot HTTP '+response.status,accountConnected:false,privateApiAccess:false,tradeExecution:false};
  return parseTicker(await response.json(),now);
 }catch{
  return {status:'UNAVAILABLE',reason:'Binance Spot non raggiungibile in questa richiesta',accountConnected:false,privateApiAccess:false,tradeExecution:false};
 }
}
function summarize(facts){
 const f=facts||{status:'UNAVAILABLE'};
 const lines=['Sì. Kiber può consultare informazioni PUBBLICHE di Binance Spot senza accedere al tuo account.',
 'Fonti disponibili nell’Oracolo: Binance Spot BNB/USDT per le quotazioni, DefiLlama per metriche di BNB Chain, DEX Screener/PancakeSwap per le pool; le altre fonti hanno aggiornamenti differenti.'];
 if(f.status==='CURRENT'){
  const format=n=>typeof n==='number'?n.toLocaleString('it-IT',{maximumFractionDigits:4}):'non disponibile';
  lines.push('ULTIMA RILEVAZIONE BINANCE SPOT · coppia BNB/USDT');
  lines.push('Prezzo: '+format(f.lastPrice)+' USDT · variazione 24 ore: '+format(f.change24Pct)+'% · volume 24h della sola coppia: '+format(f.quoteVolume24)+' USDT.');
  lines.push('Timestamp Binance Spot: '+f.sourceTimestamp+' · età della rilevazione '+f.sourceAgeSeconds+' secondi al momento del controllo.');
 }else{
  lines.push('Il collegamento pubblico Binance esiste, ma la verifica corrente non ha fornito una quotazione recente affidabile. '+String(f.reason||'').slice(0,180)+'.');
 }
 lines.push('Questi sono dati pubblici di mercato, NON dati del tuo account Binance. Non ho accesso a saldo, ordini o API private e non posso eseguire compravendite. BNB Chain e Binance Exchange non sono la stessa cosa.');
 return lines.join('\n\n');
}
module.exports={URL,isBinanceQuestion,isCapabilityQuestion,parseTicker,fetchEvidence,summarize};