/* Kiber XAU/USD · UI for educational, read-only price-action strategies.
 * No controls for execution, no wallet access, no private data.
 */
(function(root){
 'use strict';
 if(!root||typeof document==='undefined')return;
 const names=['hammer','shooting','breakout','trend','exits'];
 const $=id=>document.getElementById(id);
 const safeText=(id,value)=>{const element=$(id);if(element)element.textContent=String(value??'—');};
 const formatSource=source=>/CSV locale/i.test(String(source||''))?'storico CSV':'feed esterno';
 function render(_technical,context,source){
  const lab=$('xauMethodLab');
  if(!lab)return null;
  let evaluation;
  try{
   const engine=root.KiberXauMethods;
   if(!engine||typeof engine.evaluate!=='function')throw Error('Motore price action non disponibile.');
   // CSV is historic: without broker freshness verification it cannot receive a live bias.
   const data=/CSV locale/i.test(String(source||''))?null:context;
   evaluation=engine.evaluate(data);
  }catch(e){
   evaluation={ready:false,heading:'DATI NON DISPONIBILI',bias:'unavailable',
     summary:'Il laboratorio non ha dati M5 recenti verificabili.',
     meta:'In attesa del feed M5',quality:String(e?.message||'Fonte non verificata'),
     methods:Object.fromEntries(names.map(n=>[n,{status:'IN ATTESA',detail:'Nessuna valutazione disponibile.'}]))};
  }
  safeText('xauMethodDirection',evaluation.heading);
  $('xauMethodDirection').dataset.bias=evaluation.bias||'unavailable';
  safeText('xauMethodLive',evaluation.summary);
  safeText('xauMethodMeta',evaluation.meta);
  safeText('xauMethodQuality',evaluation.quality);
  for(const name of names){
   const entry=evaluation.methods?.[name];
   safeText('xauMethod'+name+'Status',entry?.status||'IN ATTESA');
   safeText('xauMethod'+name+'Evidence',entry?.detail||'Dati insufficienti.');
  }
  lab.dataset.feed=evaluation.ready?'observed':'unavailable';
  lab.dataset.source=formatSource(source);
  return evaluation;
 }
 root.KiberXauMethodsUI={render};
})(typeof globalThis!=='undefined'?globalThis:this);
