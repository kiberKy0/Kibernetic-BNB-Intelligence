/* Kiber XAU/USD Research v1 · public price-action ideas, NOT proprietary signals.
 * Named methods are independent interpretations of publicly documented concepts.
 * Never executes orders, uses credentials, or verifies profitability.
 * Entry/stop/TP are HYPOTHETICAL next-bar conditions in USD per troy ounce.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KiberXauResearch=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const finite=x=>typeof x==='number'&&Number.isFinite(x);
  const round=x=>finite(x)?Number(x.toFixed(2)):null;
  const fmt=x=>finite(x)?x.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
  const blank=(status,detail)=>({status,detail,active:false,scenario:null});
  const empty=(reason)=>({
    ready:false,source:'biquote.io · conto personale non collegato',quality:reason,
    methods:{
      retest:blank('IN ATTESA',reason),
      sweep:blank('IN ATTESA',reason),
      pullback:blank('IN ATTESA',reason),
      micro:blank('IN ATTESA',reason),
      session:blank('IN ATTESA',reason),
      macro:blank('IN ATTESA',reason)
    },
    candidates:[],sampleCount:0,decision:'WAIT',executable:false
  });
  function barsValid(bars,minutes,minCount,now,maxCloseAge){
    if(!Array.isArray(bars)||bars.length<minCount)return false;
    let prev=-Infinity;
    for(const b of bars){
      if(typeof b?.time!=='string')return false;
      const t=Date.parse(b.time);
      if(!finite(t)||t<=prev||t+minutes*60000>now+5000)return false;
      if(![b.open,b.high,b.low,b.close].every(x=>finite(x)&&x>0))return false;
      if(b.high<Math.max(b.open,b.close,b.low)||b.low>Math.min(b.open,b.close,b.high))return false;
      prev=t;
    }
    const last=bars.at(-1);
    const age=now-(Date.parse(last.time)+minutes*60000);
    return age>=-5000&&age<=maxCloseAge*1000;
  }
  function ema(values,period){
    if(values.length<period)return null;
    let value=values.slice(0,period).reduce((a,b)=>a+b,0)/period;
    const weight=2/(period+1);
    for(let i=period;i<values.length;i++)value=value*(1-weight)+values[i]*weight;
    return value;
  }
  function trueRange(bars,period=14){
    if(bars.length<period+1)return null;
    const arr=[];
    for(let i=1;i<bars.length;i++){
      const b=bars[i],last=bars[i-1];
      arr.push(Math.max(b.high-b.low,Math.abs(b.high-last.close),Math.abs(b.low-last.close)));
    }
    let a=arr.slice(0,period).reduce((x,y)=>x+y,0)/period;
    for(let i=period;i<arr.length;i++)a=(a*(period-1)+arr[i])/period;
    return a;
  }
  function range(bars,at,lookback=20){
    if(at<lookback||at>bars.length)return null;
    const sub=bars.slice(at-lookback,at);
    return {low:Math.min(...sub.map(x=>x.low)),high:Math.max(...sub.map(x=>x.high))};
  }
  function direction(frames,key){
    return frames?.[key]?.status==='observed'?frames[key].direction:null;
  }
  function localParts(date,zone){
    const items=new Intl.DateTimeFormat('en-GB',{
      timeZone:zone,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'
    }).formatToParts(date);
    const out={};for(const item of items)out[item.type]=item.value;
    return {day:out.year+'-'+out.month+'-'+out.day,minutes:Number(out.hour)*60+Number(out.minute)};
  }
  function sessionRange(bars,zone,hour,minute,now){
    const at=localParts(new Date(now),zone),opening=hour*60+minute;
    if(at.minutes<opening+30)return {status:'NON ANCORA APERTO',detail:'La finestra iniziale di 30 minuti non è terminata.'};
    const session=bars.filter(b=>{
      const p=localParts(new Date(b.time),zone);
      return p.day===at.day&&p.minutes>=opening&&p.minutes<opening+30;
    });
    if(session.length!==6)return {status:'STORICO INSUFFICIENTE',detail:'Servono tutte e sei le candele M5 della prima mezz’ora.'};
    for(let i=1;i<session.length;i++){
      if(Date.parse(session[i].time)-Date.parse(session[i-1].time)!==300000)
        return {status:'GAP NELLO STORICO',detail:'Candele non continue nella mezz’ora iniziale.'};
    }
    return {status:'RANGE MISURATO',
      low:Math.min(...session.map(x=>x.low)),high:Math.max(...session.map(x=>x.high)),
      detail:'Range della prima mezz’ora misurato; da solo non dimostra una direzione futura.'};
  }
  function theoretical(side,method,entry,stop,atr,spread,candleTime){
    if(!finite(entry)||!finite(stop)||!finite(atr)||!finite(spread)||atr<=0||spread<=0)return null;
    const risk=side==='BUY'?entry-stop:stop-entry;
    if(risk<=Math.max(atr*.12,spread*3)||risk>atr*3.5||spread>atr*.15)return null;
    const sign=side==='BUY'?1:-1;
    return {method,side,entry:round(entry),stop:round(stop),
      tp1:round(entry+sign*risk),tp2:round(entry+sign*2*risk),
      risk:round(risk),spread:round(spread),candleTime,
      condition:'Scenario di studio: la condizione va verificata nella candela successiva; nessun prezzo di esecuzione garantito.',
      verified:false,executable:false};
  }
  function newestBreak(bars,end,atr,lookback=20){
    const b=bars[end],p=bars[end-1],r=range(bars,end,lookback);
    if(!b||!p||!r||!finite(atr))return null;
    if(b.close>r.high+atr*.10&&p.close<=r.high)return {side:'BUY',level:r.high,candle:b,at:end};
    if(b.close<r.low-atr*.10&&p.close>=r.low)return {side:'SELL',level:r.low,candle:b,at:end};
    return null;
  }
  function evaluate(context,base,now=Date.now()){
    const quality=context?.quality||{};
    if(!quality.ok||!quality.tick?.ok||!quality.tick?.fresh)
      return empty('Feed XAU/USD bloccato o non aggiornato: non calcolo nuovi livelli.');
    if(context?.calendar?.connected!==true||context.calendar.highImpactNear===true)
      return empty('Calendario USA assente o notizia ad alto impatto vicina: niente scenari di ingresso.');
    const series=context?.strategySeries?.m5;
    const b=series?.candles,spread=quality.tick.spread;
    if(!series?.recent||!barsValid(b,5,60,now,720))
      return empty('M5 incomplete, vecchie o non ordinate. Servono almeno 60 candele completate.');
    const atr=trueRange(b),last=b.at(-1),previous=b.at(-2),index=b.length-1,r=range(b,index,20);
    if(!finite(atr)||!r||!finite(spread))
      return empty('ATR, range o Bid/Ask non validi.');
    const poorSpread=spread>atr*.15;
    const candidates=[];
    const add=(side,method,entry,stop,scaleAtr=atr)=>{
      if(poorSpread)return null;
      const c=theoretical(side,method,entry,stop,scaleAtr,spread,last.time);
      if(c)candidates.push(c);
      return c;
    };
    function method(active,status,detail,scenario=null){
      return {active,status,detail,scenario};
    }
    // (1) Breakout + retest: look back six fully CLOSED M5 candles, never future bars.
    let retest=null,retestDir=null;
    for(let i=index-1;i>=Math.max(21,index-6);i--){
      const x=newestBreak(b,i,atr);
      if(!x)continue;
      if(x.side==='BUY'&&last.low<=x.level+atr*.2&&last.close>x.level+atr*.05&&last.close>last.open){
        retestDir='BUY';retest=x;break;
      }
      if(x.side==='SELL'&&last.high>=x.level-atr*.2&&last.close<x.level-atr*.05&&last.close<last.open){
        retestDir='SELL';retest=x;break;
      }
    }
    const retestPlan=retestDir==='BUY'?add('BUY','Rottura + retest M5',last.high+atr*.05,Math.min(last.low,retest.level-atr*.2)-atr*.08):
       retestDir==='SELL'?add('SELL','Rottura + retest M5',last.low-atr*.05,Math.max(last.high,retest.level+atr*.2)+atr*.08):null;
    const retestMethod=method(!!retest,retest?'RETEST OSSERVATO':'NON RILEVATO',
      retest?'Rottura precedente '+fmt(retest.level)+' e ritorno al livello sull’ultima M5. '+(retestDir==='BUY'?'Rifiuto rialzista':'Rifiuto ribassista')+' osservato.':
      'Nessuna rottura recente seguita dal test del vecchio livello nelle ultime sei M5. Serve una conferma, non basta il contatto col livello.',retestPlan);
    // (2) False breakout / liquidity sweep
    const sweptHigh=last.high>r.high+atr*.12&&last.close<r.high-atr*.02&&last.close<last.open;
    const sweptLow=last.low<r.low-atr*.12&&last.close>r.low+atr*.02&&last.close>last.open;
    const sweepSide=sweptHigh?'SELL':sweptLow?'BUY':null;
    const sweepPlan=sweepSide==='BUY'?add('BUY','Falsa rottura dei minimi',last.high+atr*.06,last.low-atr*.10):
      sweepSide==='SELL'?add('SELL','Falsa rottura dei massimi',last.low-atr*.06,last.high+atr*.10):null;
    const sweepMethod=method(!!sweepSide,sweepSide?'FALSA ROTTURA OSSERVATA':'NON RILEVATO',
      sweepSide?'L’ultima M5 è uscita dal range '+fmt(r.low)+' – '+fmt(r.high)+' ed è rientrata chiudendo nella direzione opposta.':
      'Ultima M5: nessuna escursione oltre il range di 20 candele seguita da chiusura di rientro.',sweepPlan);
    // (3) Trend-pullback to EMA20 on M5, requiring M5 and M15 agreement
    const e20=ema(b.map(x=>x.close),20);
    const trendM5=direction(context.multiTimeframe,'5min'),trendM15=direction(context.multiTimeframe,'15min');
    const upTrend=trendM5==='rialzista'&&trendM15==='rialzista';
    const downTrend=trendM5==='ribassista'&&trendM15==='ribassista';
    const pullBuy=upTrend&&last.low<=e20+atr*.15&&last.low>=e20-atr*.7&&last.close>e20+atr*.08&&last.close>last.open;
    const pullSell=downTrend&&last.high>=e20-atr*.15&&last.high<=e20+atr*.7&&last.close<e20-atr*.08&&last.close<last.open;
    const pullSide=pullBuy?'BUY':pullSell?'SELL':null;
    const last5=b.slice(-5);
    const pullPlan=pullSide==='BUY'?add('BUY','Pullback EMA20',last.high+atr*.06,Math.min(...last5.map(x=>x.low))-atr*.12):
      pullSide==='SELL'?add('SELL','Pullback EMA20',last.low-atr*.06,Math.max(...last5.map(x=>x.high))+atr*.12):null;
    const pullMethod=method(!!pullSide,pullSide?'RIPRESA DEL TREND OSSERVATA':'NESSUN PULLBACK',
      'EMA20 M5 '+fmt(e20)+' USD/oz. '+(pullSide?'Candelа di rifiuto della media con M5/M15 allineati.':
      'Manca allineamento M5/M15 o un ritorno con conferma sulla EMA20.')+
      ' È un’ipotesi di price action, non la definizione completa del metodo di alcun trader.',pullPlan);
    // (4) M1 continuation scalp: ONLY independent complete fresh M1 + M5/M15 direction
    const m1=context?.strategySeries?.m1;
    const validM1=m1?.recent&&barsValid(m1.candles,1,60,180);
    let microMethod;
    if(!validM1)microMethod=blank('M1 NON DISPONIBILE','Candele M1 indipendenti insufficienti o non fresche.');
    else{
      const minB=m1.candles,ml=minB.at(-1),prev=minB.at(-2),miniAtr=trueRange(minB),
        miniRange=range(minB,minB.length-1,10),isUp=trendM5==='rialzista'&&trendM15==='rialzista',
        isDown=trendM5==='ribassista'&&trendM15==='ribassista';
      const microBuy=isUp&&ml.close>miniRange.high+miniAtr*.08&&prev.close<=miniRange.high;
      const microSell=isDown&&ml.close<miniRange.low-miniAtr*.08&&prev.close>=miniRange.low;
      const microSide=microBuy?'BUY':microSell?'SELL':null;
      let microPlan=null;
      if(microSide&&finite(miniAtr)){
        const recentM1=minB.slice(-6);
        const entry=microSide==='BUY'?ml.high+miniAtr*.06:ml.low-miniAtr*.06;
        const stop=microSide==='BUY'?Math.min(...recentM1.map(x=>x.low))-miniAtr*.12:
          Math.max(...recentM1.map(x=>x.high))+miniAtr*.12;
        if(!poorSpread&&spread<=miniAtr*.15){
          const p=theoretical(microSide,'Continuazione M1',entry,stop,miniAtr,spread,ml.time);
          if(p){microPlan=p;candidates.push(p);}
        }
      }
      microMethod=method(!!microSide,microSide?'M1 IN CONTINUAZIONE':'SENZA CONFERMA M1',
        microSide?'Nuova rottura di 10 M1 con direzione concorde M5/M15.':
        'M1 presente: non emerge una nuova rottura nella direzione concorde M5/M15.'+
        ' Il micro-scalping è particolarmente sensibile a spread e slippage.',microPlan);
    }
    // (5) Opening-range observations: 08:00 London and 08:20 NY local. These are
    // chosen research windows, NOT synchronized gold CFD exchange opening times.
    const london=sessionRange(b,'Europe/London',8,0,now);
    const newyork=sessionRange(b,'America/New_York',8,20,now);
    const sessionMethod=method(false,
      london.status==='RANGE MISURATO'||newyork.status==='RANGE MISURATO'?'RANGE DI SESSIONE':'DATI PARZIALI',
      'Londra 08:00 locali: '+london.status+(finite(london.high)?' ['+fmt(london.low)+' – '+fmt(london.high)+']':'')+
      '. New York 08:20 locali: '+newyork.status+(finite(newyork.high)?' ['+fmt(newyork.low)+' – '+fmt(newyork.high)+']':'')+
      '. Sono finestre di ricerca, non orari di apertura esclusiva di XAU/USD; nessun vantaggio statistico dimostrato.');
    // (6) Economic calendar gate. No invented NFP/CPI results and no news forecasting.
    const news=context.calendar;
    const macroMethod=method(false,'FILTRO NEWS ATTIVO',
      'Eventi USA ad alto impatto filtrati; nessun ingresso teorico in ±30 minuti. '+
      'Non leggiamo ancora risultati pubblicati, sorprese economiche, rendimenti reali o DXY: '+String(news?.next?.name||'prossimo evento non disponibile')+'.');
    // Existing M5 pattern and new breakout candidates, only on last COMPLETED candle
    const baseMethods=base?.methods||{};
    if(base?.ready&&baseMethods.hammer?.status==='FIGURA OSSERVATA')
      add('BUY','Hammer M5',last.high+atr*.06,last.low-atr*.12);
    if(base?.ready&&baseMethods.shooting?.status==='FIGURA OSSERVATA')
      add('SELL','Shooting Star M5',last.low-atr*.06,last.high+atr*.12);
    if(base?.ready&&baseMethods.breakout?.status==='ROTTURA RIALZISTA')
      add('BUY','Rottura range M5',last.high+atr*.07,Math.min(last.low,r.high-atr*.2)-atr*.1);
    if(base?.ready&&baseMethods.breakout?.status==='ROTTURA RIBASSISTA')
      add('SELL','Rottura range M5',last.low-atr*.07,Math.max(last.high,r.low+atr*.2)+atr*.1);
    const sides=[...new Set(candidates.map(x=>x.side))];
    const conflict=sides.length>1;
    const filtered=conflict?[]:candidates;
    return {ready:true,source:String(context?.source||'biquote.io'),sampleCount:b.length,
      quality:'Condizioni teoriche da candela chiusa, senza forward test. '+(poorSpread?'Spread elevato rispetto all’ATR; livelli bloccati. ':
       conflict?'Modelli con direzioni contrastanti: nessuno scenario principale. ':'')+
       'Nessun accesso al conto IC Markets/cTrader, nessuna esecuzione.',
      methods:{retest:retestMethod,sweep:sweepMethod,pullback:pullMethod,
        micro:microMethod,session:sessionMethod,macro:macroMethod},
      candidates:filtered.slice(0,3),hasConflict:conflict,spreadGuardPassed:!poorSpread,
      decision:'WAIT',executable:false};
  }
  return {evaluate,barsValid,theoretical,range,sessionRange,newestBreak,ema,trueRange};
});
