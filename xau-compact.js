/* Kiber XAU/USD · Compact chart-first layout within the existing BNB Oracle. */
(function(){
 'use strict';
 if(typeof document==='undefined')return;
 function build(){
  const $=id=>document.getElementById(id);
  const layout=document.querySelector('.container>.layout');
  if(!layout||$('xauCompactTop'))return;
  const main=layout.parentNode;
  const market=document.createElement('section');
  market.id='xauCompactTop';market.className='xau-compact-top';
  market.setAttribute('aria-label','Stato dati XAU/USD');
  market.innerHTML=
   '<div class="xau-compact-head">'+
   '<div class="xau-compact-title"><small>XAU/USD · ORO / DOLLARO</small><strong>Verifica prezzi e dati</strong></div>'+
   '<div class="xau-compact-price"><small>ULTIMA CHIUSURA OHLC</small><strong><span id="xauCompactPrice"></span> <span class="xau-compact-unit">USD/oz</span></strong></div>'+
   '</div>'+
   '<div id="xauCompactMeta" class="xau-compact-meta"></div>'+
   '<div id="xauCompactControls"></div>';
  main.insertBefore(market,layout);
  const price=$('price');
  if(price){
   const original=price.closest('.metric');
   $('xauCompactPrice').append(price);
   if(original)original.remove();
  }
  const feed=$('xauFeedHealth');
  if(feed)market.insertBefore(feed,$('xauCompactMeta'));
  for(const id of ['source','timestamp']){
   const el=$(id);if(el)$('xauCompactMeta').appendChild(el);
  }
  const controls=$('decoder')?.querySelector('.controls');
  if(controls)$('xauCompactControls').append(controls);
  const guide=$('xauOperationalGuide');
  if(guide){
   const details=guide.querySelector('.xau-guide-details');
   const levels=guide.querySelector('.xau-guide-levels');
   const mode=$('xauGuideMode');
   if(details){
    const before=details.firstElementChild?.nextElementSibling;
    if(levels)details.insertBefore(levels,before||null);
    if(mode)details.appendChild(mode);
   }
   guide.querySelector('.xau-guide-head h2')?.replaceChildren(document.createTextNode('Decisione Kiber'));
  }
  const supplement=document.createElement('div');
  supplement.className='xau-supplement';supplement.id='xauSupplement';
  supplement.setAttribute('aria-label','Approfondimenti facoltativi XAU/USD');
  const add=(el,title)=>{
   if(!el)return;
   const details=document.createElement('details');
   const summary=document.createElement('summary');
   summary.textContent=title;
   details.append(summary,el);
   supplement.appendChild(details);
  };
  const bottom=document.querySelector('.container>.grid-bottom');
  const decoder=$('decoder');
  add(decoder,'Indicatori · EMA, RSI, ATR e supporti');
  const context=bottom?.querySelector('section[aria-label="Filtri contesto e importazione"]');
  add(context,'Contesto macro e importazione CSV');
  const tv=document.querySelector('.layout>section[aria-label="Analisi tecnica TradingView"]');
  add(tv,'Analisi tecnica esterna · TradingView');
  if(bottom)bottom.remove();
  const advanced=$('xauAdvancedPanel');
  if(advanced&&advanced.parentNode)advanced.after(supplement);
  else if(guide)guide.after(supplement);
  else layout.after(supplement);
  // The rest of the Oracle UI writes to the SAME DOM IDs: no duplicate state.
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',build,{once:true});
 else build();
})();