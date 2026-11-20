/* Kibernetic BNB: Donchian breakout + retest, EMA and relative volume.
   Educational strategy assessment on verified SAME-pool DEX candles only.
   No wallet, order, signing, profitability claim or model-based guess. */
(function(root,factory){
 const result=factory();
 if(typeof module==='object'&&module.exports)module.exports=result;
 if(root)root.KiberBnbSpeculativeStrategy=result;
})(typeof window==='object'?window:globalThis,function(){
 'use strict';
 const ADDRESS=/^0x[a-f0-9]{40}$/i;
 const CONFIG=Object.freeze({lookback:20,emaShort:20,emaLong:50,atrLength:14,volumeMultiplier:1.5,
   retestBars:4,riskPerTradePct:0.5,illustrativeRR:2,minLiquidityUsd:100000,
   maxSlippagePct:0.5,maxPriceImpactPct:0.5});
 const fail=(status,reason,extra={})=>({status,reason,method:'Donchian 20 + EMA 20/50 + volume 1,5× + retest',executionEnabled:false,performanceVerified:false,...extra});
 const num=x=>x===null||x===undefined||x===''?null:Number.isFinite(Number(x))?Number(x):null;
 const validAddress=x=>ADDRESS.test(String(x||''));
 function normalize(raw){
  const map=new Map();
  for(const r of Array.isArray(raw)?raw:[]){
   const row=Array.isArray(r)?{time:r[0],open:r[1],high:r[2],low:r[3],close:r[4],volume:r[5]}:r;
   if(!row||typeof row!=='object')continue;
   let time=num(row.time??row.t);if(time===null)continue;
   if(time>1e12)time=Math.floor(time/1000);
   const open=num(row.open),high=num(row.high),low=num(row.low),close=num(row.close),volume=num(row.volume);
   if(!Number.isSafeInteger(time)||time<=0||[open,high,low,close].some(v=>v===null||v<=0))continue;
   if(low>Math.min(open,close)||high<Math.max(open,close)||high<low)continue;
   map.set(time,{time,open,high,low,close,volume:volume===null||volume<0?null:volume});
  }
  return [...map.values()].sort((a,b)=>a.time-b.time);
 }
 function ema(candles,period,end){
  const a=candles.slice(0,end+1).map(c=>c.close);
  if(a.length<period)return null;
  const k=2/(period+1);
  let value=a.slice(0,period).reduce((x,y)=>x+y,0)/period;
  for(let i=period;i<a.length;i++)value=a[i]*k+value*(1-k);
  return value;
 }
 function atr(candles,period,end){
  if(end<period)return null;
  let sum=0;
  for(let i=end-period+1;i<=end;i++){
   const c=candles[i],before=candles[i-1];
   sum+=Math.max(c.high-c.low,Math.abs(c.high-before.close),Math.abs(c.low-before.close));
  }
  return sum/period;
 }
 function median(xs){const v=[...xs].sort((a,b)=>a-b);return v[Math.floor(v.length/2)]}
 function analyze(input={},now=Date.now()){
  const token=String(input.tokenAddress||''),historicalPool=String(input.historicalPoolAddress||''),
   quotedPool=String(input.quotedPoolAddress||'');
  if(input.sourceKind!=='dex')return fail('NON_VALUTATA','Mancano vere candele OHLC DEX; dati campionati non ammessi.');
  if(input.chainId!==56||!validAddress(token))return fail('NON_VALUTATA','Contratto/token BNB Chain (chain 56) non verificato.');
  if(!validAddress(historicalPool)||!validAddress(quotedPool)||historicalPool.toLowerCase()!==quotedPool.toLowerCase())
   return fail('NON_VALUTATA','Pool dello storico e pool della liquidità non confermate come identiche.');
  const liquidity=num(input.liquidityUsd);
  if(liquidity===null||liquidity<CONFIG.minLiquidityUsd)
   return fail('NON_VALUTATA','Liquidità mancante o inferiore alla soglia di studio $100.000.');
  const candles=normalize(input.candles);
  if(candles.length<60)return fail('DATI_INSUFFICIENTI','Servono almeno 60 candele OHLC reali della stessa pool, con volumi verificati.',{candlesAvailable:candles.length});
  const gaps=candles.slice(-60).slice(1).map((r,i)=>r.time-candles.slice(-60)[i].time);
  const step=median(gaps);
  if(!Number.isFinite(step)||step<60||step>14400||gaps.some(x=>x<step*0.7||x>step*1.3))
   return fail('NON_VALUTATA','Intervalli delle candele irregolari o timeframe non adatto allo studio speculativo.');
  const nowSec=Math.floor(now/1000);
  if(!Number.isFinite(nowSec))return fail('NON_VALUTATA','Timestamp non valido.');
  // GeckoTerminal OHLC timestamps represent candle starts: never use a forming candle.
  const closed=candles.filter(c=>c.time+step<=nowSec).slice(-160);
  if(closed.length<60)return fail('DATI_INSUFFICIENTI','Mancano 60 candele già chiuse.');
  const ageSeconds=nowSec-(closed.at(-1).time+step);
  if(ageSeconds<0||ageSeconds>step*2)
   return fail('DATI_OBSOLETI','Ultima candela chiusa troppo vecchia per valutare il setup.',{ageSeconds,timeframeSeconds:step});
  if(closed.slice(-60).some(c=>c.volume===null||c.volume<=0))
   return fail('DATI_INSUFFICIENTI','Volumi per candela mancanti o non positivi; nessuna conferma del breakout.');
  const latest=closed.length-1;
  const ema20=ema(closed,CONFIG.emaShort,latest),ema50=ema(closed,CONFIG.emaLong,latest),volatility=atr(closed,CONFIG.atrLength,latest);
  const context={source:'GeckoTerminal · OHLC DEX',tokenAddress:token.toLowerCase(),
   poolAddress:quotedPool.toLowerCase(),candlesUsed:closed.length,
   timeframeSeconds:step,ageSeconds,ema20,ema50,atr14:volatility,
   minLiquidityUsd:CONFIG.minLiquidityUsd,observedLiquidityUsd:liquidity,
   maxSlippagePct:CONFIG.maxSlippagePct,maxPriceImpactPct:CONFIG.maxPriceImpactPct,
   riskPerTradePct:CONFIG.riskPerTradePct};
  if(!(ema20>ema50&&closed[latest].close>ema20))
   return fail('ATTESA','Filtro tendenza non confermato: EMA20 deve superare EMA50 e il prezzo deve restare sopra EMA20.',context);
  let found=null;
  for(let i=latest-1;i>=Math.max(52,latest-CONFIG.retestBars);i--){
   const prior=closed.slice(i-20,i);if(prior.length!==20)continue;
   const level=Math.max(...prior.map(x=>x.high));
   const reference=prior.reduce((acc,x)=>acc+x.volume,0)/20;
   const bar=closed[i],breakout=bar.close>level&&bar.volume>=reference*CONFIG.volumeMultiplier&&ema(closed,20,i)>ema(closed,50,i);
   if(breakout){found={i,level,volumeRatio:bar.volume/reference};break;}
  }
  if(!found)return fail('ATTESA','Nessuna rottura Donchian20 confermata da volume ≥1,5× nelle ultime quattro candele chiuse.',context);
  const last=closed[latest],allowance=volatility*0.5;
  const retest=last.low<=found.level+allowance&&last.low>=found.level-allowance&&last.close>=found.level;
  if(!retest)return fail('ATTESA','Breakout rilevato, ma manca un retest con chiusura sopra la resistenza.',{...context,resistance:found.level,volumeRatio:found.volumeRatio});
  const entry=last.close,stop=found.level-volatility*1.5,risk=entry-stop;
  if(!(risk>0&&risk/entry<0.20))return fail('NON_VALUTATA','Distanza stop/ingresso troppo ampia o incoerente.',context);
  return fail('CANDIDATO_DIDATTICO','Retest confermato sui dati OHLC: ipotesi da validare con quote, gas, slippage, impatto, audit del token e test fuori campione.',
  {...context,resistance:found.level,volumeRatio:found.volumeRatio,
   illustrativeEntry:entry,illustrativeStop:stop,illustrativeTarget2R:entry+risk*CONFIG.illustrativeRR,
   quoteVerified:false,walletSigning:false,warning:'Setup puramente didattico; nessun ordine o probabilità di rendimento'});
 }
 return Object.freeze({CONFIG,normalize,ema,atr,analyze});
});
