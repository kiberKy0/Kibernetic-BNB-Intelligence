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
 const minutes={'5min':5,'15min':15,'1h':60,'4h':240,'1day':1440};
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
 function evaluate(analysis,source,now=Date.now()){
  const a=analysis||{},m=a.metrics||{};
  const type=/CSV locale/i.test(String(source||''))?'csv':'provider';
  const duration=minutes[a.interval]||null;
  const t=a.time?Date.parse(a.time):NaN;
  const age=n(t)?Math.round((now-t)/60000):null;
  const present=!!a.ready && a.samples>=60 && n(m.price) && n(m.ema20) && n(m.ema50) && n(m.rsi14) && n(m.atr14);
  const maxAge=duration===null?null:Math.max(duration*2+2,15);
  // A timestamp check is only one component of feed integrity, not proof of no delay.
  const temporallyValid=type==='provider'&&present&&age!==null&&age>=-1&&age<=maxAge;
  const statuses=[
    {status:temporallyValid?'PARZIALE':'BLOCCATO',note:type==='csv'?'CSV importato: storico, mai segnale live.':
       !present?'Feed OHLC insufficiente o indicatori mancanti.':
       age===null?'Timestamp mancante.':
       !temporallyValid?'Candela vecchia o nel futuro ('+age+' min).':
       'Timestamp coerente ('+age+' min). Ritardo del provider NON certificato.'},
    {status:'NON COMPLETO',note:'È analizzato solo '+String(a.interval||'il periodo selezionato')+'. M1, M5, M15, H1, H4 e D1 devono essere confrontati con feed verificati distinti.'},
    {status:present?'DESCRITTIVO':'IN ATTESA',note:present?
      'EMA20 '+fmt(m.ema20)+' / EMA50 '+fmt(m.ema50)+'. Supporto '+fmt(m.support20)+' e resistenza '+fmt(m.resistance20)+'. Livelli osservati, non capacità predittiva.':
      'Servono almeno 60 candele valide con OHLC.'},
    {status:'NON COLLEGATO',note:'Dollaro, tassi reali, Fed, CPI e NFP non sono acquisiti da fonti aggiornate: nessuna conferma macro.'},
    {status:'NON VALIDATO',note:'Non esistono risultati certificati di backtest fuori campione, walk-forward e costi per questo setup: nessuna probabilità attribuita.'},
    {status:present?'PRELIMINARE':'IN ATTESA',note:present?
      'ATR '+fmt(m.atr14)+' USD / '+fmt(m.atrPct)+'% del prezzo. La classificazione trend/range richiede ulteriore verifica.':
      'Senza volatilità valida non è possibile classificare il regime.'},
    {status:'BLOCCATO',note:'Spread, slippage, commissioni, swap, leva e dimensione del contratto del broker MT5 non sono collegati e verificati.'},
    {status:'ATTESA',note:'I controlli critici sopra non sono superati: nessuna indicazione eseguibile di acquisto o vendita.'}
  ];
  const technical=a.signal==='BUY'?'Ipotesi tecnica rialzista':a.signal==='SELL'?'Ipotesi tecnica ribassista':'Nessuna ipotesi operativa';
  const blockers=[
    !temporallyValid?'feed non confermato come recente':'latency del provider non verificata indipendentemente',
    'multi-timeframe incompleto','calendario macro non collegato','backtest non validato','costi reali del broker assenti'
  ];
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
  const anchor=document.querySelector('.grid-bottom');
  if(!anchor)return null;
  let root=document.getElementById('xauAdvancedPanel');
  if(root)return root;
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
