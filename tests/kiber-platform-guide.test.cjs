'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const K=require('../server/kiber-platform-knowledge.cjs');

test('guide inventory has unique complete descriptions with traceable active source',()=>{
 assert.ok(K.CATALOG.length>=32);
 assert.equal(new Set(K.CATALOG.map(x=>x.id)).size,K.CATALOG.length);
 for(const item of K.CATALOG){
  for(const field of ['id','title','where','purpose','how','details','limits','source','status'])assert.ok(String(item[field]||'').length>=(field==='id'?2:4),field+' '+item.id);
  assert.ok(item.aliases.length>=2,'alias '+item.id);
  assert.doesNotMatch(item.purpose,/esegui (?:ordini|acquisti) automaticamente/);
 }
});
const cases=[
 ["Spiegami tutte le sezioni della piattaforma","overview"],
 ["Che cos'è Kibernetic?","overview"],
 ["A cosa serve la sfera Ricerca?","cloud"],
 ["Come funziona il monitoraggio cloud ogni minuto?","cloud"],
 ["Cosa significa market cap?","marketcap"],
 ["Come si usa la campanella per monitorare?","watch"],
 ["Cosa fa Memoria OFF?","memory"],
 ["Spiegami il pulsante Confronta","compare"],
 ["Che significa TVL DeFi?","defi"],
 ["Come funziona il grafico storico?","chart"],
 ["Che cosa sono i settori DeFi?","sectors"],
 ["A cosa serve la liquidità della pool?","liquidity"],
 ["Come funziona lo scanner dei token?","token"],
 ["Che cosa significa RSI 14?","xauindicators"],
 ["Spiegami Hammer M5","xaumethods"],
 ["Come uso il Decoder oro?","xaudecoder"],
 ["A cosa serve il broker XAU/USD?","xaubroker"],
 ["Come funziona il portafoglio?","wallet"],
 ["Che differenza c'è tra Binance e BNB Chain?","binance"],
 ["Come si chiede una ricerca esterna TinyFish?","aiweb"]
];
for(const [question,expected] of cases){
 test('help: '+question,()=>{
  const m=K.match(question);
  assert.ok(m,'missing guide for '+question);
  if(expected==='overview')assert.equal(m.type,'overview');
  else assert.ok(m.entries.some(x=>x.id===expected),expected+' mismatch '+m.entries.map(x=>x.id));
  const answer=K.summaries(m);
  assert.ok(answer.length>70);
  assert.doesNotMatch(answer,/undefined|\[object Object\]/);
  assert.match(answer,/LIMITI|limiti|non è|non esegue/i);
 });
}
test('questions about this section use a whitelisted last-click focus, no arbitrary private values',()=>{
 const a=K.match('Spiegami questa sezione',{focus:'kiberBnbCloudOrb'});
 assert.equal(a.entries[0].id,'cloud');
 const b=K.match('A cosa serve questo riquadro?',{focus:'v271Factors'});
 assert.equal(b.entries[0].id,'factors');
 const c=K.match('Che cosa fa questo pulsante?',{focus:'action:gold'});
 assert.equal(c.entries[0].id,'xau');
 const untrusted=K.match('Spiegami questa sezione',{focus:'userWalletPrivateKey-123'});
 assert.equal(untrusted,null);
});
test('research request stays recognizable as platform help for sourced web follow-up',()=>{
 const m=K.match('Cerca approfondimenti sul RSI, fonti esterne',{area:'xau'});
 assert.ok(m?.entries.some(x=>x.id==='xauindicators'));
 assert.match(K.summaries(m),/ATR/);
});
test('market prediction question is not hijacked by guide',()=>{
 assert.equal(K.match('Perché sale il prezzo di BNB oggi?'),null);
 assert.equal(K.match('Analizza CAKE'),null);
 assert.equal(K.match('Quanto vale BNB adesso?'),null);
});
test('guidance distinguishes actual available functionality from planned ML and trading',()=>{
 const ml=K.match('Spiegami autoapprendimento machine learning');
 assert.ok(ml?.entries.some(x=>x.id==='ml'));
 assert.match(K.summaries(ml),/non|Non/);
 const cloud=K.match('A cosa serve il monitoraggio cloud');
 assert.match(K.summaries(cloud),/WebSocket/);
 const xau=K.match('Come funziona XAU/USD');
 assert.match(K.summaries(xau),/OHLC/);
});
test('BNB backend routes internal explanations and XAU independently',()=>{
 const api=fs.readFileSync('api/kiber.js','utf8'),ui=fs.readFileSync('kiber-assistant.js','utf8');
 assert.match(api,/PlatformGuide\.match\(question,\{focus:helpFocus,area:'bnb'\}\)/);
 assert.match(api,/PlatformGuide\.match\(question,\{area:'xau'/);
 assert.match(api,/provider:'platform-guide'/);
 assert.match(api,/context\.platformGuide=PlatformGuide\.relevantForModel\(guide\)/);
 assert.match(api,/tinyFishSearch\(question\)/);
 assert.match(ui,/platformHelpFocus:lastHelpFocus/);
 assert.match(ui,/data-kiber="Spiegami tutte le sezioni della piattaforma"/);
 assert.match(ui,/isGuideQuestion/);
 assert.match(ui,/provider==='platform-guide'/);
 assert.doesNotThrow(()=>new Function(ui));
 assert.doesNotThrow(()=>new Function('require','process','module','exports',api));
});
