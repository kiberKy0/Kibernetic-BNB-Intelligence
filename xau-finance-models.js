/* IA Finance XAU/USD · three independent, accessible research model views.
 * Presentation only: this script NEVER changes the market feed, indicators,
 * decision safety gate, trading orders, user credentials or broker APIs.
 */
(function(root){
  'use strict';
  if(typeof document==='undefined')return;
  const $=id=>document.getElementById(id);
  const ids=['original','priceaction','learning'];
  const tabIds={original:'xauModelTabOriginal',priceaction:'xauModelTabPriceAction',learning:'xauModelTabLearning'};
  const panelIds={original:'xauModelOriginal',priceaction:'xauModelPriceAction',learning:'xauModelLearning'};
  let current='original';
  function selectView(name,focus){
    if(!ids.includes(name))return false;
    for(const key of ids){
      const active=key===name;
      const tab=$(tabIds[key]),panel=$(panelIds[key]);
      if(!tab||!panel)return false;
      tab.setAttribute('aria-selected',String(active));
      tab.tabIndex=active?0:-1;
      panel.hidden=!active;
      panel.dataset.selected=String(active);
    }
    current=name;
    const selected=$(tabIds[name]);
    const desc={
      original:'Decoder originale · EMA20/50, RSI, ATR e 8 verifiche Kiber. Decisione finale separata dai metodi.',
      priceaction:'Zanni + Price Action Kiber · 11 schede sperimentali. Non sono 11 strategie certificate da Matteo Zanni.',
      learning:'Analisi e studio avanzato · ADX, Bollinger, MACD, Stocastico, struttura e fattori macro.'
    };
    const status=$('xauModelSelectedTitle');if(status)status.textContent=desc[name];
    if(name==='priceaction'){
      const all=$('xauMethodLab')?.querySelector('.xau-method-root');
      if(all)all.open=true;
    }
    if(name==='learning'){
      const hub=$('xauLearningHub');if(hub)hub.open=true;
    }
    if(focus)selected?.focus();
    return true;
  }
  function setup(){
    const rootPanel=$('xauModelsHub');
    if(!rootPanel||rootPanel.dataset.ready==='true')return false;
    const original=$(panelIds.original),price=$(panelIds.priceaction),learning=$(panelIds.learning);
    const guide=$('xauOperationalGuide'),methods=$('xauMethodLab'),learn=$('xauLearningHub');
    if(!original||!price||!learning||!guide||!methods||!learn)return false;
    const adv=$('xauAdvancedPanel'),supplement=$('xauSupplement');
    // Move existing components; original IDs and existing event handlers remain valid.
    original.append(guide);
    if(adv)original.append(adv);
    if(supplement)original.append(supplement);
    price.append(methods);
    learning.append(learn);
    for(const name of ids){
      const tab=$(tabIds[name]),panel=$(panelIds[name]);
      if(!tab||!panel)return false;
      tab.addEventListener('click',()=>selectView(name,false));
      tab.addEventListener('keydown',ev=>{
        if(!['ArrowLeft','ArrowRight','Home','End'].includes(ev.key))return;
        ev.preventDefault();
        const idx=ids.indexOf(name);
        const target=ev.key==='Home'?ids[0]:ev.key==='End'?ids.at(-1):
          ids[(idx+(ev.key==='ArrowRight'?1:ids.length-1))%ids.length];
        selectView(target,true);
      });
    }
    rootPanel.dataset.ready='true';
    selectView('original',false);
    return true;
  }
  function boot(){
    if(setup())return;
    // The legacy compact layout may finish after the first check.
    // The optional model navigation never blocks normal XAU analysis.
    let retries=0;
    const ticker=setInterval(()=>{
      retries++;
      if(setup()||retries>=12)clearInterval(ticker);
    },200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
  root.XauThreeModels={selectView,get active(){return current;}};
})(typeof globalThis!=='undefined'?globalThis:this);
