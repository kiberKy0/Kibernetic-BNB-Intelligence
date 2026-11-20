/* Bustabit Lab UI: no remote data access or betting functions. */
(function(){
'use strict';
const $=id=>document.getElementById(id);
const S=window.KiberBustabitScanner;
if(!S){$('kbtStatus').textContent='Motore scanner non caricato.';return}
const set=(id,v)=>{const e=$(id);if(e)e.textContent=String(v)};
const fx=v=>Number.isFinite(v)?v.toLocaleString('it-IT',{maximumFractionDigits:2})+'x':'—';
const pc=v=>Number.isFinite(v)?(v*100).toFixed(2).replace('.',',')+'%':'—';
const roi=v=>Number.isFinite(v)?(v>=0?'+':'')+pc(v):'—';
// Historical sources remain in the private ChatGPT file library; do not leak unpublished strategy source to public GitHub.
const catalog=[
 {name:'Cyberstriker Adaptive Core V3.5',note:'Codice presente. Report locale: 29/29 test superati. Non verificato sul game reale.',url:''},
 {name:'Kiber Striker V4.0 Event Audit',note:'Codice presente. Esecuzione e compatibilità LIVE da certificare.',url:''},
 {name:'Kiber Striker V3.3 Balanced',note:'Codice presente. Test storici locali; gioco reale non verificato.',url:''},
 {name:'Kiber Striker V3.6 Restored',note:'Versione storica recuperata nell’archivio originale; in attesa di audit.',url:''},
 {name:'Cyberstriker V3.4',note:'Versione storica recuperata nell’archivio originale; in attesa di audit.',url:''}
];
const registry=$('kbtRegistry');
catalog.forEach(v=>{
 const box=document.createElement('div');box.className='kbt-cell';
 const h=document.createElement('b');h.textContent=v.name;
 const small=document.createElement('small');small.textContent=v.note;box.append(h,small);
 if(v.url){const link=document.createElement('a');link.href='https://github.com/kiberKy0/Kibernetic-BNB-Intelligence/blob/feat/bustabit-intelligence-lab-20261120/'+v.url;link.textContent='Apri sorgente archivio';link.target='_blank';link.rel='noopener noreferrer';box.append(link)}
 registry.append(box);
});
$('bustaClose').onclick=()=>{if(window.parent!==window)window.parent.postMessage({type:'KIBER_BUSTABIT_CLOSE'},location.origin);else location.href='/'};
let source='manual';
$('kbtFile').addEventListener('change',async event=>{
 const file=event.target.files?.[0];if(!file)return;
 if(file.size>8*1024*1024){set('kbtStatus','File oltre 8 MB: usa un file più piccolo.');return}
 try{$('kbtRaw').value=await file.text();source='file';$('kbtResults').hidden=true;set('kbtStatus','Caricato '+file.name+'. Premi Analizza storico.')}
 catch(e){set('kbtStatus','Errore di lettura file: '+e.message)}
});
$('kbtRaw').addEventListener('input',()=>{source='manual';$('kbtResults').hidden=true;set('kbtStatus','Storico modificato. Premere Analizza storico.')});
$('kbtTarget').addEventListener('change',()=>{$('kbtResults').hidden=true;set('kbtStatus','Target modificato. Premere Analizza storico.')});
$('kbtClear').onclick=()=>{
 $('kbtRaw').value='';$('kbtFile').value='';source='manual';$('kbtResults').hidden=true;
 ['kbtRounds','kbtLast','kbtMedian','kbtDetected'].forEach(k=>set(k,'—'));
 set('kbtStatus','Schermata pulita. Nessun dato storico salvato o trasmesso.');
};
$('kbtAnalyze').onclick=()=>{
 $('kbtResults').hidden=true;
 try{
  const data=S.parse($('kbtRaw').value);
  const r=S.scan(data,{target:Number($('kbtTarget').value),source});
  set('kbtRounds',r.rounds.toLocaleString('it-IT'));set('kbtLast',fx(r.latest));
  set('kbtMedian',fx(r.median.last15));
  set('kbtDetected',r.patterns.filter(p=>p.status==='RILEVATO').length+' / 21');
  set('kbtMeans',[r.mean.last5,r.mean.last15,r.mean.last50].map(fx).join(' / '));
  set('kbtMedians',[r.median.last5,r.median.last15,r.median.last50].map(fx).join(' / '));
  set('kbtCategories',r.red+' / '+r.green);set('kbtGap',r.gap10+' round');
  const d=$('kbtDistribution');d.replaceChildren();
  r.frequency.forEach(item=>{
   const tr=document.createElement('tr');
   [fx(item.target),String(item.count),pc(item.rate)].forEach(text=>{const td=document.createElement('td');td.textContent=text;tr.append(td)});
   d.append(tr);
  });
  set('kbtHits',r.target.wins+' su '+r.rounds+' ('+pc(r.target.hitRate)+')');
  set('kbtCI',r.target.confidence95.map(pc).join(' – '));
  set('kbtRoi',roi(r.target.roi));set('kbtModel','≈ '+pc(r.target.modelHitRate)+' | ROI -1%');
  set('kbtHoldout',r.holdout?
    'Verifica fuori campione: target '+fx(r.holdout.chosenTarget)+' scelto sui primi '+r.holdout.trainSize+' round (ROI '+roi(r.holdout.trainRoi)+'). Prova sui successivi '+r.holdout.testSize+' round: ROI '+roi(r.holdout.test.roi)+'. Nessuna previsione.':
    'Per verificare un modello con dati successivi distinti, carica almeno 100 round (70% sviluppo / 30% verifica).');
  const host=$('kbtPatterns');host.replaceChildren();
  r.patterns.forEach(p=>{
   const cell=document.createElement('div');cell.className='kbt-pattern '+(p.status==='RILEVATO'?'kbt-active':'');
   const b=document.createElement('strong');b.textContent=p.id+' · '+p.name;
   const s=document.createElement('small');s.textContent=p.status.replaceAll('_',' ')+(p.trigger?' · '+p.trigger.replaceAll('_',' '):'');
   cell.append(b,s);host.append(cell);
  });
  $('kbtResults').hidden=false;
  set('kbtStatus','Scansione completata: '+r.rounds+' round. Origine: '+r.source+'. Solo dati locali, nessuna puntata.');
 }catch(error){set('kbtStatus','Errore scanner: '+error.message)}
};
const codeFile=$('kbtCodeFile');
codeFile?.addEventListener('change',async event=>{
 const file=event.target.files?.[0];if(!file)return;
 const result=$('kbtCodeSummary');result.replaceChildren();
 if(file.size>2*1024*1024){set('kbtCodeStatus','Codice troppo grande (max 2 MB).');return}
 try{
  const code=await file.text();
  const details=[
   ['Config interfaccia',/\bvar\s+config\s*=\s*[{]/.test(code)||/\blet\s+config\s*=\s*[{]/.test(code)],
   ['Evento GAME_STARTING',/engine\.on\s*\(\s*['"]GAME_STARTING['"]/.test(code)],
   ['Evento GAME_STARTED',/engine\.on\s*\(\s*['"]GAME_STARTED['"]/.test(code)],
   ['Evento GAME_ENDED',/engine\.on\s*\(\s*['"]GAME_ENDED['"]/.test(code)],
   ['API invio puntata (rilevata, non eseguita)',/engine\.bet\s*\(/.test(code)],
   ['Lettura history',/engine\.history|history\.toArray/.test(code)],
   ['Eventi legacy (verificare compatibilità)',/engine\.on\s*\(\s*['"](?:game_started|game_crash)['"]/.test(code)],
   ['Riferimenti ML/Pattern',/\b(?:ML|PATTERN|BAYES|ADAPTIVE)\b/i.test(code)],
   ['Controlli rischio',/\b(?:maxLoss|stopLoss|maxBet|drawdown|riskManager)\b/i.test(code)],
   ['Memoria o storage',/\b(?:localStorage|sessionStorage|storage|persist)\b/i.test(code)]
  ];
  details.forEach(([label,found])=>{
   const cell=document.createElement('div');cell.className='kbt-cell';
   const name=document.createElement('small');name.textContent=label;
   const state=document.createElement('b');state.textContent=found?'Riferimento trovato':'Non individuato';
   state.className=found?'kbt-ok':'kbt-muted';cell.append(name,state);result.append(cell);
  });
  const modern=details.slice(1,4).some(x=>x[1]),legacy=details[6][1];
  set('kbtCodeStatus','Audit statico locale: '+file.name+' ('+code.split(/\r?\n/).length+' righe). '+(modern?'Eventi moderni presenti. ':legacy?'Rilevati eventi legacy da verificare. ':'Eventi del game non rilevati. ')+'Nessuna esecuzione, nessun upload, nessuna certificazione LIVE.');
 }catch(e){set('kbtCodeStatus','Errore lettura codice: '+e.message)}
});

})();