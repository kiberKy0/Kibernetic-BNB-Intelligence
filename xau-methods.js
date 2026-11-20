/* Kiber XAU/USD · Laboratorio Price Action M5, indicatori descrittivi.
 * Metodi pubblici e ipotesi tecniche: NON una replica degli algoritmi di un trader,
 * NON fornisce ordini o una previsione statistica validata.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.KiberXauMethods=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const isNum=x=>typeof x==='number'&&Number.isFinite(x);
 const round=(x,n=2)=>isNum(x)?Number(x.toFixed(n)):null;
 const fmt=x=>isNum(x)?x.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
 const MIN_M5=60,WINDOW=20;
 function unavailable(message){
  return {ready:false,heading:'DATI NON DISPONIBILI',bias:'unavailable',
   summary:message,meta:'M5 · feed verificato necessario',quality:message,
   methods:{
    hammer:{status:'IN ATTESA',detail:message},
    shooting:{status:'IN ATTESA',detail:message},
    breakout:{status:'IN ATTESA',detail:message},
    trend:{status:'IN ATTESA',detail:message},
    exits:{status:'SOLO STUDIO',detail:'TP1 a 1R e TP2 a 2R sono esempi di gestione, non ordini.'}
   },decision:'WAIT',executable:false};
 }
 function cleanM5(data,now){
  if(!Array.isArray(data)||data.length<MIN_M5)return [];
  let prev=-Infinity;
  const out=[];
  for(const c of data){
   const t=typeof c?.time==='string'?Date.parse(c.time):NaN;
   const o=Number(c?.open),h=Number(c?.high),l=Number(c?.low),cl=Number(c?.close);
   if(!Number.isFinite(t)||t<=prev||t+300000>now+5000||t>now
      ||![o,h,l,cl].every(n=>isNum(n)&&n>0)||h<Math.max(o,cl,l)||l>Math.min(o,cl,h))return [];
   prev=t;out.push({time:new Date(t).toISOString(),open:o,high:h,low:l,close:cl});
  }
  return out;
 }
 function atr(bars,period=14){
  if(bars.length<period+1)return null;
  const ranges=[];
  for(let i=1;i<bars.length;i++){
   const c=bars[i],prev=bars[i-1];
   ranges.push(Math.max(c.high-c.low,Math.abs(c.high-prev.close),Math.abs(c.low-prev.close)));
  }
  let a=ranges.slice(0,period).reduce((x,y)=>x+y,0)/period;
  for(let i=period;i<ranges.length;i++)a=(a*(period-1)+ranges[i])/period;
  return a;
 }
 function previousRange(bars,i){
  if(i<WINDOW)return null;
  const p=bars.slice(i-WINDOW,i);
  return {low:Math.min(...p.map(c=>c.low)),high:Math.max(...p.map(c=>c.high))};
 }
 function candlePattern(bars,index,atrValue){
  const c=bars[index],p=previousRange(bars,index);
  if(!c||!p||!isNum(atrValue)||atrValue<=0)return {hammer:false,shooting:false,range:p};
  const span=c.high-c.low;
  if(span<=0)return {hammer:false,shooting:false,range:p};
  const body=Math.abs(c.close-c.open),upper=c.high-Math.max(c.open,c.close),
    lower=Math.min(c.open,c.close)-c.low;
  const smallBody=body>=span*.04&&body<=span*.35;
  const threshold=Math.max(body*2,span*.5);
  const nearSupport=c.low<=p.low+atrValue*.30;
  const nearResistance=c.high>=p.high-atrValue*.30;
  const hammer=smallBody&&lower>=threshold&&upper<=span*.20&&nearSupport;
  const shooting=smallBody&&upper>=threshold&&lower<=span*.20&&nearResistance;
  return {hammer,shooting,range:p};
 }
 function recentPatternCounts(bars,atrValue){
  const start=Math.max(WINDOW,bars.length-30);let hammer=0,shooting=0;
  for(let i=start;i<bars.length;i++){
   const p=candlePattern(bars,i,atrValue);
   if(p.hammer)hammer++;if(p.shooting)shooting++;
  }
  return {hammer,shooting,lookback:bars.length-start};
 }
 function evaluate(context,now=Date.now()){
  const quality=context?.quality||{};
  if(quality.ok!==true||quality.tick?.ok!==true)return unavailable('Il feed o le quotazioni del broker esterno non superano i controlli di sicurezza.');
  const series=context?.strategySeries?.m5;
  if(!series||series.interval!=='5min'||series.recent!==true)return unavailable('Le candele M5 chiuse non sono disponibili o risultano vecchie.');
  const candles=cleanM5(series.candles,now);
  if(candles.length<MIN_M5)return unavailable('Servono almeno 60 candele M5 valide, complete e ordinate.');
  const last=candles.at(-1);
  const lastClose=Date.parse(last.time)+300000;
  const age=Math.round((now-lastClose)/1000);
  if(age< -5||age>720)return unavailable('Ultima candela M5 troppo vecchia ('+age+' secondi dalla chiusura).');
  const a=atr(candles),r=previousRange(candles,candles.length-1);
  if(!isNum(a)||a<=0||!r)return unavailable('ATR e intervallo precedente insufficienti per confrontare le strategie.');
  const lastPattern=candlePattern(candles,candles.length-1,a);
  const counts=recentPatternCounts(candles,a);
  const hammer=lastPattern.hammer,shooting=lastPattern.shooting;
  const former=candles.at(-2);
  const buffer=.10*a;
  const breakUp=last.close>r.high+buffer&&former.close<=r.high;
  const breakDown=last.close<r.low-buffer&&former.close>=r.low;
  const frames=context?.multiTimeframe||{};
  const frameKeys=['5min','15min','1h'];
  const frameData=frameKeys.map(k=>({interval:k,value:frames[k]?.status==='observed'?frames[k].direction:null}));
  const validFrames=frameData.every(x=>['rialzista','ribassista','laterale'].includes(x.value));
  const aligned=validFrames&&frameData.every(x=>x.value===frameData[0].value)
    &&frameData[0].value!=='laterale';
  const alignedBias=aligned?frameData[0].value:null;
  const breakoutBias=breakUp?'rialzista':breakDown?'ribassista':null;
  const patternBias=hammer?'rialzista':shooting?'ribassista':null;
  let bias=alignedBias||'misto';
  let summary=aligned?'M5, M15 e H1 indicano un trend '+alignedBias+'.':'M5, M15 e H1 non sono allineati o manca un intervallo.';
  if((patternBias&&alignedBias&&patternBias!==alignedBias)||(breakoutBias&&alignedBias&&breakoutBias!==alignedBias)){
   bias='misto';summary+=' Un pattern o una rottura contrasta con il trend.';
  }
  if(context?.calendar?.highImpactNear===true){bias='unavailable';summary='Notizia USA ad alto impatto vicina: nessuna direzione operativa.';}
  const qualityNote='Ultima M5 chiusa '+last.time.slice(0,16).replace('T',' ')+' UTC · '+candles.length+
    ' candele · ATR14 '+fmt(a)+' USD/oz · fonte '+String(context?.source||'esterna');
  const readTrend=validFrames?frameData.map(x=>x.interval+' '+x.value).join(' · '):
     'Dati multi-timeframe incompleti.';
  const mk=(status,detail)=>({status,detail});
  return {ready:true,heading:bias==='rialzista'?'BIAS RIALZISTA':bias==='ribassista'?'BIAS RIBASSISTA':
    bias==='unavailable'?'ATTESA MACRO':'BIAS MISTO',
   bias,summary:summary+' Lettura descrittiva, non probabilità di profitto.',
   meta:qualityNote,quality:'Latenza del provider non certificata. Conto IC Markets/cTrader personale non collegato.',
   latestM5:last.time,price:round(last.close),atr14:round(a),
   range:{low:round(r.low),high:round(r.high)},
   methods:{
    hammer:mk(hammer?'FIGURA OSSERVATA':'NON RILEVATO',
      'Cerca una lunga ombra inferiore vicino ai minimi delle precedenti 20 M5. '+(hammer?
       'L’ultima M5 rispetta i criteri sperimentali; serve conferma indipendente.':
       'L’ultima M5 non rispetta tutti i criteri.')+
       ' Negli ultimi '+counts.lookback+' intervalli: '+counts.hammer+' rilevazioni, senza efficacia statistica misurata.'),
    shooting:mk(shooting?'FIGURA OSSERVATA':'NON RILEVATO',
      'Cerca un’ombra superiore lunga vicino ai massimi delle precedenti 20 M5. '+(shooting?
       'L’ultima M5 rispetta i criteri sperimentali; serve conferma indipendente.':
       'L’ultima M5 non rispetta tutti i criteri.')+
       ' Negli ultimi '+counts.lookback+' intervalli: '+counts.shooting+' rilevazioni, senza efficacia statistica misurata.'),
    breakout:mk(breakUp?'ROTTURA RIALZISTA':breakDown?'ROTTURA RIBASSISTA':'NEL RANGE / SENZA ROTTURA',
      'Range precedente di 20 M5: '+fmt(r.low)+' – '+fmt(r.high)+' USD/oz. '+
      'Una rottura richiede chiusura oltre il livello di almeno 0,1 ATR e precedente chiusura all’interno. '+
      (breakUp?'Rottura rialzista osservata.':breakDown?'Rottura ribassista osservata.':'Ultima M5: nessuna nuova rottura qualificata.')+
      ' False rotture possibili.'),
    trend:mk(aligned?'TIMEFRAME ALLINEATI':validFrames?'DIREZIONI DISCORDANTI':'DATI PARZIALI',
      readTrend+'. Confronto di direzione mediante EMA20/50 e chiusure, non previsione né segnale di entrata.'),
    exits:mk('SIMULAZIONE DA VALIDARE',
      'Regole da provare su storico: TP1 a +1R, TP2 a +2R, stop residuo al pareggio dopo TP1. '+
      'R è la distanza iniziale tra ingresso ipotetico e stop. Nessun ordine, rendimento o livello di prezzo reale calcolato. '+
      'Spread, commissioni e slippage del tuo broker sono ancora sconosciuti.')
   },
   executable:false,decision:'WAIT'};
 }
 return {evaluate,cleanM5,candlePattern,recentPatternCounts,atr};
});
