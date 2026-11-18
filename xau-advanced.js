/* Kibernetic Oracolo BNB · validatore avanzato per la sezione XAU/USD.
 * Livelli indipendenti: NON certifica live un feed sulla sola base delle candele.
 * In assenza di multi-timeframe, costi broker, macro e test indipendenti: ATTESA.
 * Nessun ordine, nessun dato inventato e nessuna dipendenza dal feed BNB.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.KiberXauAdvanced=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const minutes={'1min':1,'5min':5,'15min':15,'1h':60,'4h':240,'1day':1440};
 const n=x=>typeof x==='number'&&Number.isFinite(x);
 const fmt=x=>n(x)?x.toLocaleString('it-IT',{maximumFractionDigits:2,minimumFractionDigits:2}):'—';
 const labels=[
  '01 · Affidabilità del feed',
  '02 · Analisi multi-timeframe',
  '03 · Struttura di mercato',
  '04 · Contesto macroeconomico',
  '05 · Pattern e validazione statistica',
  '06 · Riconoscimento del regime',
  '07 · Costi e protezione del capitale',
  '08 · Verifica indipendente finale'
 ];
 function evaluate(analysis,source,now=Date.now(),context={}){
  const a=analysis||{},m=a.metrics||{};
  const type=/CSV locale/i.test(String(source||''))?'csv':'provider';
  const duration=minutes[a.interval]||null;
  const t=a.time?Date.parse(a.time):NaN;
  const age=n(t)?Math.round((now-t)/60000):null;
  const present=!!a.ready && a.samples>=60 && n(m.price) && n(m.ema20) && n(m.ema50) && n(m.rsi14) && n(m.atr14);
  const maxAge=duration===null?null:Math.max(duration*2+2,15);
  // A timestamp check is only one component of feed integrity, not proof of no delay.
  const temporallyValid=type==='provider'&&present&&age!==null&&age>=-1&&age<=maxAge;
  const quality=context?.quality||null;
  const feedVerified=type==='provider'&&!!quality?.ok&&quality?.tick?.fresh===true;
  const frames=Object.entries(context?.multiTimeframe||{});
  const observed=frames.filter(([,item])=>item?.status==='observed');
  const frameSummary=observed.map(([k,x])=>k+' '+x.direction).join(' · ');
  const frameCovered=observed.length>=4;
  const macro=context?.calendar||null;
  const macroConnected=macro?.connected===true;
  const macroNear=macroConnected&&macro.highImpactNear===true;
  const macroNext=macroConnected&&macro.next?.name?
    String(macro.next.name)+' ('+String(macro.next.time||'').slice(0,16).replace('T',' ')+' UTC)' : 'Nessun evento USA ad alto impatto rilevato nella finestra interrogata.';
  const spread=Number(quality?.tick?.spread);
  const spreadValid=feedVerified&&n(spread)&&spread>0;
  const patternFromData=Array.isArray(context?.candles)&&context.candles.length>=60;
  const last3=patternFromData?context.candles.slice(-3):[];
  const redCount=last3.filter(c=>c.close<c.open).length;
  const greenCount=last3.filter(c=>c.close>c.open).length;
  const patternText=last3.length===3?
    'Ultime 3 candele: '+greenCount+' rialziste, '+redCount+' ribassiste. Ricorrenza solo descrittiva, nessuna previsione provata.':
    'Pattern non disponibili: almeno tre candele OHLC verificate necessarie.';
  const statuses=[
    {status:feedVerified&&temporallyValid?'MONITORATO':temporallyValid?'PARZIALE':'BLOCCATO',
      note:type==='csv'?'Storico CSV locale: mai feed live.':
      !present?'Feed/indicatori non disponibili.':
      !temporallyValid?'Candela troppo vecchia o nel futuro ('+age+' min).':
      feedVerified?'Tick e OHLC esterni recenti; latenza a monte non certificata.': 
      'Timestamp plausibile, fonte e freschezza tick da verificare.'},
    {status:frameCovered?'MONITORATO':'NON COMPLETO',
      note:frameCovered?frameSummary+'. Direzione degli intervalli misurata, non previsione.':
      'Intervalli confrontati: '+observed.length+'/5. Mancano dati o controlli sui timeframe.'},
    {status:present?'CALCOLATO':'IN ATTESA',
      note:present?'EMA20 '+fmt(m.ema20)+' / EMA50 '+fmt(m.ema50)+'. Supporto '+fmt(m.support20)+
      ', resistenza '+fmt(m.resistance20)+'. Livelli sulle ultime candele (non garanzie).':
      'Servono almeno 60 candele OHLC valide e recenti.'},
    {status:macroConnected?'CALENDARIO ATTIVO':'NON COLLEGATO',
      note:macroConnected?(macroNear?'Evento USA ad alto impatto vicino: nessun ingresso. ':'Prossimo evento USA: ')+macroNext+
      '. Il calendario non equivale a una previsione macro.':
      'Calendario eventi USA non disponibile; analisi macro non autorizzata.'},
    {status:patternFromData?'OSSERVATO':'NON VALIDATO',
      note:patternFromData?patternText+' Backtest fuori campione e walk-forward ancora assenti.':
      'Pattern non misurabili. Nessuna probabilità di rendimento attribuibile.'},
    {status:present?'MISURATO':'IN ATTESA',
      note:present?'ATR14 '+fmt(m.atr14)+' USD, '+fmt(m.atrPct)+'% del prezzo; volatilità del timeframe.':
      'Senza ATR e prezzi affidabili non si può classificare la volatilità.'},
    {status:spreadValid?'PARZIALE':'BLOCCATO',
      note:spreadValid?'Spread esterno '+fmt(spread)+' USD/oncia. Non è il conto MT5 Android: slippage, leva e costi del tuo broker restano sconosciuti.':
      'Spread, leva, commissioni e regole del tuo broker MT5 non verificati.'},
    {status:'ATTESA',note:'Dati tecnici ora verificabili, ma senza backtest indipendenti e costi del broker non esiste un segnale eseguibile.'}
  ];
  const technical=a.signal==='BUY'?'Ipotesi tecnica rialzista':a.signal==='SELL'?'Ipotesi tecnica ribassista':'Nessuna ipotesi operativa';
  const blockers=[
    !feedVerified||!temporallyValid?'freschezza del feed da confermare':'feed recente senza garanzia di latenza a monte',
    !frameCovered?'timeframe insufficienti':null,
    !macroConnected?'calendario macro non raggiungibile':macroNear?'notizia USA ad alto impatto vicina':null,
    'backtest fuori campione non validato',
    'costi e condizioni del tuo broker MT5 assenti'
  ].filter(Boolean);
  const result={
    decision:'WAIT',
    title:'ASPETTA',
    technical,
    source:type==='csv'?'Storico CSV locale':String(source||'Non disponibile'),
    interval:String(a.interval||'—'),
    timestamp:n(t)?new Date(t).toISOString():null,
    ageMinutes:age,
    reason:'Mancano verifiche indipendenti: '+blockers.join('; ')+'.',
    labels:labels.map((label,i)=>({label,...statuses[i]})),
    verified:false
  };
  return result;
 }
 function mount(){
  if(typeof document==='undefined')return null;
  let root=document.getElementById('xauAdvancedPanel');
  if(root)return root;
  const anchor=document.querySelector('.grid-bottom');
  if(!anchor)return null;
  root=document.createElement('section');
  root.id='xauAdvancedPanel';root.className='panel xau-advanced';
  root.setAttribute('aria-label','Filtri Kiber avanzati XAU/USD');
  root.innerHTML='<div class="xau-adv-head"><div><small>KIBER INTELLIGENCE · VALIDATORE V1</small><h2>Analisi e filtraggio avanzato</h2><p>Otto controlli indipendenti, senza inventare dati mancanti.</p></div><strong id="xauAdvFinal" class="xau-adv-final" role="status">ASPETTA</strong></div>'+
   '<div class="xau-adv-stats"><div><small>Fonte</small><strong id="xauAdvSource">Da verificare</strong></div><div><small>Ultimo dato</small><strong id="xauAdvTime">—</strong></div><div><small>Ipotesi tecnica</small><strong id="xauAdvTechnical">Non disponibile</strong></div></div>'+
   '<p id="xauAdvReason" class="xau-adv-reason" role="status">La valutazione definitiva rimane in attesa finché le verifiche non sono complete.</p>'+
   '<details class="xau-adv-details"><summary>Esamina gli 8 livelli di intelligence</summary><div id="xauAdvRows"></div></details>'+
   '<p class="xau-adv-note">Valutazione informativa. MT5 Android non è collegato automaticamente. Dati storici, grafico TradingView e feed del Decoder sono fonti distinte.</p>';
  anchor.parentNode.insertBefore(root,anchor);
  return root;
 }
 function render(audit){
  const root=mount();if(!root||!audit)return;
  const $=id=>document.getElementById(id);
  $('xauAdvFinal').textContent=audit.title;
  $('xauAdvSource').textContent=audit.source;
  $('xauAdvTime').textContent=audit.timestamp?new Date(audit.timestamp).toLocaleString('it-IT',{timeZone:'UTC',hour:'2-digit',minute:'2-digit',day:'2-digit',month:'2-digit'})+' UTC':'Non disponibile';
  $('xauAdvTechnical').textContent=audit.technical;
  $('xauAdvReason').textContent=audit.reason;
  const rows=$('xauAdvRows');rows.replaceChildren();
  for(const row of audit.labels){
    const item=document.createElement('div');item.className='xau-adv-row';
    const head=document.createElement('div');head.className='xau-adv-row-head';
    const title=document.createElement('strong');title.textContent=row.label;
    const state=document.createElement('span');state.textContent=row.status;
    if(row.status==='BLOCCATO'||row.status==='ATTESA')state.className='xau-adv-fail';
    head.append(title,state);
    const body=document.createElement('p');body.textContent=row.note;
    item.append(head,body);rows.append(item);
  }
 }
 return {evaluate,render,mount};
});
