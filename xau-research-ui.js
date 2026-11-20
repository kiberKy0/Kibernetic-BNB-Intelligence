/* Kiber XAU/USD · rendering of expanded research methods, read-only.
 * Values for entry / stop / TP are NON-EXECUTABLE study scenarios.
 */
(function(root){
  'use strict';
  if(!root||typeof document==='undefined')return;
  const ids=['retest','sweep','pullback','micro','session','macro'];
  const $=id=>document.getElementById(id);
  const txt=(id,value)=>{const e=$(id);if(e)e.textContent=String(value??'—');};
  const price=n=>Number.isFinite(n)?n.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
  function render(feed,base,source){
    const panel=$('xauMethodLab');
    if(!panel)return null;
    let data;
    try{
      const engine=root.KiberXauResearch;
      if(!engine||typeof engine.evaluate!=='function')throw Error('Motore non caricato.');
      data=/CSV locale/i.test(String(source||''))?engine.evaluate(null,null):engine.evaluate(feed,base);
    }catch(err){
      data={ready:false,quality:'Analisi aggiuntiva non disponibile: '+String(err?.message||'errore'),
        methods:Object.fromEntries(ids.map(id=>[id,{status:'IN ATTESA',detail:'Verifica del feed necessaria.'}])),
        candidates:[]};
    }
    panel.dataset.ready=data.ready?'yes':'no';
    for(const id of ids){
      const m=data.methods?.[id];
      txt('xauResearch'+id+'Status',m?.status||'IN ATTESA');
      txt('xauResearch'+id+'Evidence',m?.detail||'Dati non verificati.');
    }
    txt('xauResearchQuality',data.quality||'Nessun dato.');
    const candidate=Array.isArray(data.candidates)?data.candidates[0]:null;
    const validCandidate=!!candidate&&!data.hasConflict&&!candidate.executable;
    txt('xauResearchScenarioStatus',validCandidate?'IPOTESI PRESENTE':'NESSUNA IPOTESI VALIDABILE');
    const fields=[
      ['xauResearchEntry',candidate?.entry],
      ['xauResearchStop',candidate?.stop],
      ['xauResearchTP1',candidate?.tp1],
      ['xauResearchTP2',candidate?.tp2]
    ];
    for(const [id,val] of fields)txt(id,validCandidate?price(val):'—');
    txt('xauResearchScenarioMethod',validCandidate?
      candidate.method+' · '+(candidate.side==='BUY'?'studio rialzista':'studio ribassista'):
      data.hasConflict?'Metodi contrastanti: nessun livello utilizzabile.':
      'Nessuna figura qualificata sull’ultima candela chiusa.');
    txt('xauResearchScenarioNote',validCandidate?
      'Prezzi teorici USD/oz, formula 1R/2R e stop strutturale. '+candidate.condition+
      ' Non includono commissioni, slippage, fill e vincoli del broker personale.':
      'I livelli compaiono solo quando una configurazione sulle candele chiuse supera i controlli di freschezza, spread e calendario. Nessun ordine possibile.');
    return data;
  }
  root.KiberXauResearchUI={render};
})(typeof globalThis!=='undefined'?globalThis:this);
