'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const A=require('../bnb-speculative-strategy.js');
const panel=fs.readFileSync('bnb-speculative-panel.js','utf8');
const index=fs.readFileSync('index.html','utf8');
const v=fs.readFileSync('v27-1.js','utf8');
const shell=fs.readFileSync('v20-production.html','utf8');
const now=Date.parse('2026-11-20T14:15:00Z'),step=900,t=Math.floor(now/1000)-85*step;
const pool='0x'+'2'.repeat(40),token='0x'+'1'.repeat(40);
function candles(){
 const a=[];
 for(let i=0;i<84;i++){
  const open=100+i*0.13,close=open+.10;
  a.push({time:t+i*step,open,high:close+.04,low:open-.04,close,volume:100});
 }
 const resistance=Math.max(...a.slice(60,80).map(x=>x.high));
 a[80]={time:t+80*step,open:resistance-.05,high:resistance+.65,low:resistance-.08,close:resistance+.45,volume:200};
 a[81]={time:t+81*step,open:resistance+.45,high:resistance+.65,low:resistance+.1,close:resistance+.4,volume:100};
 a[82]={time:t+82*step,open:resistance+.4,high:resistance+.6,low:resistance+.1,close:resistance+.5,volume:100};
 a[83]={time:t+83*step,open:resistance+.4,high:resistance+.7,low:resistance-.08,close:resistance+.48,volume:100};
 return a;
}
const valid=()=>({chainId:56,sourceKind:'dex',tokenAddress:token,historicalPoolAddress:pool,quotedPoolAddress:pool,liquidityUsd:250000,candles:candles()});
test('educational candidate requires real Donchian breakout, EMA trend, volume and retest',()=>{
 const x=A.analyze(valid(),now);
 assert.equal(x.status,'CANDIDATO_DIDATTICO');
 assert.ok(x.volumeRatio>=A.CONFIG.volumeMultiplier);
 assert.ok(x.illustrativeTarget2R>x.illustrativeEntry);
 assert.ok(x.illustrativeEntry>x.illustrativeStop);
 assert.equal(x.executionEnabled,false);
 assert.equal(x.performanceVerified,false);
 assert.equal(x.quoteVerified,false);
 assert.equal(x.riskPerTradePct,.5);
});
test('candles from sampled charts and crossed pools NEVER yield speculation signal',()=>{
 assert.equal(A.analyze({...valid(),sourceKind:'sampled'},now).status,'NON_VALUTATA');
 assert.equal(A.analyze({...valid(),historicalPoolAddress:'0x'+'3'.repeat(40)},now).status,'NON_VALUTATA');
 assert.equal(A.analyze({...valid(),quotedPoolAddress:''},now).status,'NON_VALUTATA');
 assert.equal(A.analyze({...valid(),chainId:1},now).status,'NON_VALUTATA');
 assert.equal(A.analyze({...valid(),tokenAddress:'not a token'},now).status,'NON_VALUTATA');
});
test('stale, low liquidity, no volume, short histories fail closed',()=>{
 assert.equal(A.analyze({...valid(),liquidityUsd:90000},now).status,'NON_VALUTATA');
 assert.equal(A.analyze({...valid(),candles:candles().slice(40)},now).status,'DATI_INSUFFICIENTI');
 assert.equal(A.analyze({...valid(),candles:candles().map(c=>({...c,volume:null}))},now).status,'DATI_INSUFFICIENTI');
 assert.equal(A.analyze(valid(),now+5*step*1000).status,'DATI_OBSOLETI');
});
test('no breakout or trending EMA returns ATTESA, no invented targets',()=>{
 const x=valid();x.candles=x.candles.map(c=>({...c,volume:100}));
 const out=A.analyze(x,now);
 assert.equal(out.status,'ATTESA');assert.equal(out.illustrativeTarget2R,undefined);
});
test('UI integrates a compact collapsed home guide and token read-only context',()=>{
 assert.match(panel,/kiberBnbSpecHome/);
 assert.match(panel,/kiberBnbSpecToken/);
 assert.match(panel,/kiberBnbTradingPipeline/);
 assert.match(panel,/kiberTokenContext\?\.\(\)/);
 assert.match(panel,/ohlc|OHLC/);
 assert.match(panel,/Nessun ordine automatico|nessun ordine automatico/);
 assert.match(index,/'bnb-speculative-strategy\.js','bnb-speculative-panel\.js'/);
 assert.match(v,/studyCandles:S\.chartKind==='dex'/);
 assert.match(v,/studyPoolAddress:S\.chartKind==='dex'/);
 assert.match(v,/studyPoolLiquidityUsd/);
 assert.doesNotThrow(()=>new Function(panel));
});
test('no wallet signing or side effects in strategy module',()=>{
 const s=fs.readFileSync('bnb-speculative-strategy.js','utf8');
 assert.doesNotMatch(s,/\b(?:fetch\(|eth_sendTransaction|sendRawTransaction|wallet_requestPermissions|approve\(|engine\.bet|window\.ethereum)\b/);
 assert.doesNotMatch(panel,/eth_sendTransaction|sendRawTransaction|wallet_requestPermissions|\.click\(\).*wallet/);
});
test('profile icon is outside visible header DOM, four action subtitles are visible',()=>{
 const top=shell.indexOf('<div class="top-actions">'),end=shell.indexOf('</header>',top);
 const header=shell.slice(top,end);
 assert.ok(top>=0&&end>top);
 assert.doesNotMatch(header,/id="profileBtn"/);
 assert.match(shell,/<div id="kiberLegacyProfileSlot" hidden aria-hidden="true" style="display:none!important">/);
 assert.match(shell,/id="profileBtn"/);
 assert.match(shell,/Oro · analisi/);
 assert.match(shell,/Bot · laboratorio/);
 assert.match(shell,/Wallet BNB/);
 assert.match(shell,/Dati · mercato/);
 assert.match(shell,/#kiberLegacyProfileSlot,#profileDrawer,#profileBtn\{display:none!important\}/);
});
