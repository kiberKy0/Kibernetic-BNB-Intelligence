/* Kiber XAU/USD | Indicazioni operative condizionate v1.
 * Usa soltanto metriche provenienti da candele OHLC già chiuse e validate.
 * Non genera ordini, probabilità, segnali da widget o prezzi in tempo reale.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.XauGuidance=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const finite=n=>typeof n==='number'&&Number.isFinite(n);
 const round=n=>finite(n)?Math.round(n*100)/100:null;
 const format=n=>finite(n)?n.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
 function wait(reason,detail){
  return {state:'WAIT',title:'ATTESA',direction:'none',summary:String(reason||'Servono dati confermati.'),
   entry:null,stop:null,target:null,rr:null,when:'Non entrare. Attendere una configurazione completa e dati affidabili.',
   reason:String(detail||reason||'I criteri non sono soddisfatti.'),invalid:'—',mode:'info',
   disclosure:'Indicazioni tecniche sperimentali, non ordini o previsioni garantite.'};
 }
 function advise(analysis,opts={}){
  const source=opts.source==='csv'?'csv':'feed';
  const a=analysis||{},m=a.metrics||{},side=a.signal;
  if(!a.ready||!['BUY','SELL','WAIT'].includes(side)){
   const base=wait('Dati insufficienti o non aggiornati.',
     (a.reasons||[]).join(' · ')||'Il feed deve fornire almeno 60 candele chiuse.');
   base.mode=source==='csv'?'simulation':'info';return base;
  }
  if(side==='WAIT'){
   const base=wait('Nessun ingresso: condizioni incomplete.',
     (a.reasons||[]).slice(-2).join(' · ')||'Il segnale tecnico non è confermato.');
   base.mode=source==='csv'?'simulation':'info';return base;
  }
  const price=m.price,atr=m.atr14,ema=m.ema20,rsi=m.rsi14,vol=m.atrPct;
  if(![price,atr,ema,rsi,vol].every(finite)||price<=0||atr<=0||vol>3)
    return wait('ATTESA: rischio o indicatori non verificabili.','ATR, EMA, prezzo e RSI devono essere validi.');
  const bullish=side==='BUY';
  const entry=round(price);
  // Stop educativo ricavato da EMA20 e ATR, NON ordine inviato al broker.
  const stop=round(bullish?Math.min(ema-0.5*atr,price-1.2*atr):Math.max(ema+0.5*atr,price+1.2*atr));
  const risk=Math.abs(price-stop);
  if(!finite(risk)||risk<0.5*atr||risk>4*atr)
    return wait('ATTESA: stop tecnico non proporzionato alla volatilità.','La distanza stop/ingresso non supera i controlli ATR.');
  const target=round(price+(bullish?1:-1)*risk*2);
  if(!finite(target)||target<=0||Math.abs(target-entry)<1.5*risk)
    return wait('ATTESA: obiettivo tecnico non coerente.','Rapporto teorico rendimento/rischio insufficiente.');
  const mode=source==='csv'?'simulation':'conditional';
  const direction=bullish?'long':'short';
  return {
   state:bullish?'WATCH_BUY':'WATCH_SELL',
   title:source==='csv'?'SIMULAZIONE '+(bullish?'LONG':'SHORT'):(bullish?'VALUTA ACQUISTO · LONG':'VALUTA VENDITA · SHORT'),
   direction, mode,
   summary:bullish?'Le medie, il prezzo e il momentum favoriscono uno scenario rialzista.':
                    'Le medie, il prezzo e il momentum favoriscono uno scenario ribassista.',
   entry, stop, target, rr:2,
   when:'Solo dopo candela chiusa sul periodo '+String(a.interval||'selezionato')+
     ', se il prezzo è ancora vicino all’ultima chiusura e spread/notizie sono stati controllati. Non inseguire il movimento.',
   reason:'EMA20 '+(bullish?'sopra':'sotto')+' EMA50; prezzo '+(bullish?'sopra':'sotto')+
     ' EMA20; RSI '+format(rsi)+'; momentum coerente. ATR '+format(atr)+' USD.',
   invalid:'Se il prezzo '+(bullish?'scende sotto':'sale sopra')+' '+format(stop)+' USD, lo scenario tecnico è invalidato.',
   disclosure:'Zona ingresso indicativa, stop e target proiettati dalla volatilità; nessun rendimento dimostrato. '+ 
     'Senza spread del broker, calendario notizie e backtest fuori campione, NON è una raccomandazione eseguibile.'
  };
 }
 return {advise,format};
});
