/* XAU learning hub · text-only, fail-closed, no local storage or brokerage actions. */
(function(root){
 'use strict';
 if(!root||typeof document==='undefined')return;
 const $=id=>document.getElementById(id);
 const keys=['adx','bollinger','macd','stochastic','structure','macro'];
 function fill(id,value){const el=$(id);if(el)el.textContent=String(value??'—');}
 function render(context,source){
  const el=$('xauLearningHub');if(!el)return null;
  let report;
  try{
   const engine=root.KiberXauLearning;
   if(!engine||typeof engine.evaluate!=='function')throw Error('Motore educativo non caricato.');
   report=/CSV locale/i.test(String(source||''))?engine.evaluate(null):engine.evaluate(context);
  }catch(e){
   report={ready:false,status:'IN ATTESA',summary:'Il motore didattico non è disponibile.',
    updated:'—',methods:{},macro:{status:'STUDIO · NON LIVE',reading:'Fattori macro non collegati.'}};
  }
  fill('xauLearnStatus',report.status);
  fill('xauLearnSummary',report.summary);
  fill('xauLearnUpdated',report.ready?'Ultima candela M5 (inizio UTC): '+report.updated:
    'Dati M5 non verificati: nessuna lettura aggiornata.');
  for(const key of keys){
   const data=key==='macro'?report.macro:report.methods?.[key];
   fill('xauLearn'+key+'Status',data?.status??'IN ATTESA');
   fill('xauLearn'+key+'Reading',data?.reading??'In attesa di candele valide.');
  }
  el.dataset.dataState=report.ready?'calculated':'waiting';
  return report;
 }
 root.KiberXauLearningUI={render};
})(typeof globalThis!=='undefined'?globalThis:this);
