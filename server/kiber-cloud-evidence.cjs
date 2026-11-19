'use strict';
/* Kiber AI 2026: server-side evidence from the user's existing Supabase minute scanner.
   Read-only. Do not use client-supplied prices as proof of live market conditions.
   No wallet access, model training, private credentials, or automatic trades. */
const API='https://iytjxruxpvwjjhbndkzo.supabase.co/functions/v1/kibernetic-bnb-scan';
const ADDR=/^0x[a-f0-9]{40}$/;
const FIXED=Object.freeze({
 '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c':'binancecoin',
 '0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82':'pancakeswap-token',
 '0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd':'chainlink'
});
const EVENT_NAMES=Object.freeze({
 PRICE_CHANGE_5M:'variazione del prezzo in circa 5 minuti',
 LIQUIDITY_CHANGE_15M:'variazione di liquidità in circa 15 minuti',
 POOL_CHANGED:'cambio della pool principale nel campione'
});
function number(v,absMax=1000000000){
 const n=typeof v==='number'?v:null;
 return n!==null&&Number.isFinite(n)&&Math.abs(n)<=absMax?n:null;
}
function since(time,now){
 const t=typeof time==='string'?Date.parse(time):NaN;
 if(!Number.isFinite(t))return null;
 const seconds=Math.floor((now-t)/1000);
 return seconds>=-10?seconds:null;
}
function identity(address){
 const v=String(address||'').toLowerCase();
 if(!ADDR.test(v))return null;
 return {address:v,asset:FIXED[v]||'address:'+v};
}
function resolveRequestedToken(question,selectedAddress=''){
 const q=String(question||'').slice(0,1100);
 const candidates=[
  {subject:'CAKE',address:'0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82',match:/\bCAKE\b|\b(?:token|moneta|coin)\s+(?:di\s+)?PancakeSwap\b/i},
  {subject:'LINK',address:'0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd',match:/\bLINK\b|\bChainlink\b/i},
  {subject:'BNB',address:FIXED_ADDRESS,match:/\bBNB\b(?!\s*Chain\b)/i}
 ];
 const hits=candidates.filter(x=>x.match.test(q));
 if(hits.length>1)return {subject:hits.map(x=>x.subject).join(' e '),address:'',explicit:true,ambiguous:true};
 if(hits.length===1)return {subject:hits[0].subject,address:hits[0].address,explicit:true};
 const unknown=/\b(?:analizza|monitora|token|moneta|coin)\s+([a-z0-9]{2,15})\b/i.exec(q);
 if(unknown&&!/^(?:il|la|lo|un|una|mercato|prezzo|contratto|grafico|rischio|settore|token|moneta)$/i.test(unknown[1]))
  return {subject:unknown[1].toUpperCase(),address:'',explicit:true,unknown:true};
 const selected=identity(selectedAddress);
 if(selected)return {subject:selected.asset,address:selected.address,explicit:false};
 return {subject:'BNB',address:FIXED_ADDRESS,explicit:false};
}
function isCloudDataQuestion(question){
 const q=String(question||'');
 return wantsBackground(q)||
   /\b(?:5|15)\s*(?:minuti?|min)\b/i.test(q)&&/\b(?:BNB|CAKE|LINK)\b/i.test(q)||
   /\b(?:BNB|CAKE|LINK)\b/i.test(q)&&/\bpool\b/i.test(q);
}
function analyze(raw,{address='',now=Date.now()}={}){
 const selected=identity(address);
 if(!raw||raw.ok!==true)return {status:'UNAVAILABLE',scanner:'BACKGROUND_SQL_1M',reason:'Nessuna risposta valida dal monitor cloud',source:'Kibernetic BNB / Supabase',tradingEnabled:false,websocket:false};
 const age=since(raw.lastAnalysisAt,now);
 const online=raw.scanOnline===true&&raw.status==='CURRENT'&&age!==null&&age<=190&&raw.mode==='BACKGROUND_SQL_1M';
 const observedCount=Number.isInteger(raw.monitoredAssets)&&raw.monitoredAssets>=0&&raw.monitoredAssets<=12?raw.monitoredAssets:null;
 const base={status:online?'CURRENT':'STALE',scanner:'BACKGROUND_SQL_1M',
  updatedAt:typeof raw.lastAnalysisAt==='string'?raw.lastAnalysisAt:null,
  scanAgeSeconds:age,monitoredTokens:observedCount,coverage:'Solo token selezionati, limite attuale del collector: 12',source:'Snapshot HTTP DEX Screener archiviati in Supabase',
  websocket:false,tradingEnabled:false,interpretation:'Osservazioni storiche; non segnale di acquisto, né prova di causalità'};
 if(!online)return {...base,reason:'Ultimo controllo cloud non abbastanza recente; non utilizzare questi dati come live'};
 const token=raw.token;
 if(!selected||!token||token.asset!==selected.asset||String(token.pool||'').toLowerCase().match(ADDR)===null){
  return {...base,tokenStatus:'NOT_MONITORED',reason:selected?'Token richiesto non presente nel campione della raccolta cloud':'Nessun contratto verificabile selezionato'};
 }
 const sourceAge=since(token.lastSourceAt,now);
 const available=token.status==='OK'&&sourceAge!==null&&sourceAge<=190;
 if(!available)return {...base,tokenStatus:'STALE',tokenAddress:selected.address,sourceAgeSeconds:sourceAge,reason:'Dati del singolo token obsoleti o serie storica insufficiente'};
 const facts={
  asset:selected.asset,contract:selected.address,pool:String(token.pool).toLowerCase(),
  lastSourceAt:token.lastSourceAt,sourceAgeSeconds:sourceAge,
  priceChange5mPct:number(token.priceChange5mPct,100000),
  priceChange15mPct:number(token.priceChange15mPct,100000),
  liquidityChange15mPct:number(token.liquidityChange15mPct,100000),
  priceUsd:number(token.priceUsd,1e12),
  liquidityUsd:number(token.liquidityUsd,1e15),
 };
 const events=Array.isArray(raw.findings)?raw.findings.filter(x=>{
  const t=since(x.at,now);return EVENT_NAMES[x.type]&&t!==null&&t<=86400;
 }).slice(0,4).map(x=>({type:x.type,description:EVENT_NAMES[x.type],at:x.at,changePct:number(x.changePct,100000)})):[];
 return {...base,tokenStatus:'CURRENT',token:facts,findings:events,
  limits:['Il timestamp indica acquisizione dello snapshot, non l’ultimo trade on-chain',
    'Le variazioni non forniscono probabilità di rendimento','Cambio pool significa dati storici non necessariamente confrontabili']};
}
function prettyPct(n){
 return typeof n==='number'&&Number.isFinite(n)?(n>0?'+':'')+n.toFixed(2)+'%':'non disponibile';
}
function summarize(result,{subject=''}={}){
 const x=result||{status:'UNAVAILABLE'};
 if(x.status==='UNAVAILABLE')return 'Non riesco a verificare lo stato della ricerca cloud in questo momento. Non invento risultati o movimenti.';
 const lines=['RICERCA AUTOMATICA KIBER BNB',x.status==='CURRENT'?'Scanner server aggiornato (cadenza prevista: 60 secondi).':'Scanner server non abbastanza recente.'];
 if(subject)lines.push('Moneta richiesta: '+String(subject).slice(0,20)+'.');
 if(x.scanAgeSeconds!==null&&x.scanAgeSeconds!==undefined)lines.push('Ultimo controllo: '+x.scanAgeSeconds+' secondi fa.');
 if(x.monitoredTokens!==null)lines.push('Token controllati: '+x.monitoredTokens+'; raccolta limitata a 12 token.');
 if(x.tokenStatus==='CURRENT'){
  const t=x.token;lines.push('TOKEN MONITORATO '+(subject||t.asset)+' (identificativo fonte: '+t.asset+').');
  lines.push('Pool PER QUESTO STORICO: '+t.pool+'. Il feed PancakeSwap principale può riferirsi a un’altra pool. Non unire dati di pool differenti.');
  lines.push('Snapshot: '+t.lastSourceAt+' · '+t.sourceAgeSeconds+' secondi fa, non ora ultimo trade on-chain.');
  lines.push('Prezzo snapshot: '+(t.priceUsd===null?'non disponibile':'$'+t.priceUsd)+' · liquidità pool: '+(t.liquidityUsd===null?'non disponibile':'$'+t.liquidityUsd)+'.');
  lines.push('Prezzo su circa 5 minuti: '+prettyPct(t.priceChange5mPct)+'; su 15 minuti: '+prettyPct(t.priceChange15mPct)+'.');
  lines.push('Liquidità su circa 15 minuti: '+prettyPct(t.liquidityChange15mPct)+'.');
  lines.push(x.findings.length?'Eventi rilevati: '+x.findings.map(f=>f.description+' ('+prettyPct(f.changePct)+')').join('; ')+'.':'Nessuna anomalia registrata recentemente per questo token: non equivale ad assenza di rischio.');
 }else lines.push(x.reason||'Lettura specifica del token non disponibile.');
 lines.push('Fonte: '+x.source+'. Non è uno stream WebSocket, non copre l’intera BNB Chain e non autorizza operazioni.');
 return lines.join('\n');
}
function wantsBackground(question){
 return /(?:monitoraggi|monitorat|ricerca cloud|ricerca automatica|controll(?:a|i|o).*mercato|ogni minuto|h24|24\/7|sfera|scanner.*(?:attiv|cloud)|cosa (?:hai|avete) (?:rilevat|trovat)|moviment[io] (?:recent|anomali)|cosa sta succedendo)/i.test(String(question||''));
}
async function fetchEvidence({fetchImpl=fetch,address='',now=Date.now(),timeoutMs=4200,allowDefaultBNB=true}={}){
 const selected=identity(address),path=selected?'?address='+encodeURIComponent(selected.address):'?id=binancecoin';
 const targetAddress=selected?.address||(allowDefaultBNB?FIXED_ADDRESS:'');
 try{
  const response=await fetchImpl(API+path,{
   method:'GET',headers:{Accept:'application/json'},
   cache:'no-store',signal:AbortSignal.timeout(timeoutMs)
  });
  if(!response.ok)return analyze(null,{address:targetAddress,now});
  const raw=await response.json();
  return analyze(raw,{address:targetAddress,now});
 }catch{return analyze(null,{address:targetAddress,now})}
}
const FIXED_ADDRESS='0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
module.exports={API,FIXED_ADDRESS,identity,resolveRequestedToken,isCloudDataQuestion,analyze,summarize,wantsBackground,fetchEvidence};
