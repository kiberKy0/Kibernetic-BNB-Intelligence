/* Kiber Bustabit: one sector, bot archive only. No game connection or execution.
 * Source files served as inert .txt and verified byte-for-byte before copying.
 */
(function(){
'use strict';
const L=window.KiberBustabitLegacy,T=window.KiberBustabitTechData,Fn=window.KiberBotFunctionNames||{};
if(!L||!T)return;
const items=[...L.primary,...L.variants];
const byId=new Map(items.map(x=>[x.id,x]));
const $=id=>document.getElementById(id);
const n=v=>Number(v).toLocaleString('it-IT',{maximumFractionDigits:2});
const fmt=v=>typeof v==='number'?n(v):'Non disponibile';
const pnl=v=>typeof v==='number'?(v>0?'+':'')+n(v)+' bit':'Non disponibile';
const make=(tag,cls,txt)=>{const el=document.createElement(tag);if(cls)el.className=cls;if(txt!==undefined)el.textContent=txt;return el};
let current=items[0],generation=0,loaded=null,activeTab='code';
const cache=new Map(),groups=[...new Set(items.map(x=>x.family))];
const head=$('bvaBotName'),note=$('bvaCodeStatus'),badge=$('bvaSourceBadge');
const inputs={search:$('bvaSearch'),family:$('bvaFamily'),fn:$('bvaFnSearch')};
function stat(label,value){
 const box=make('div','bva-stat');box.append(make('small','',label),make('strong','',value));return box;
}
function fact(parent,label,value){
 const box=make('div');box.append(make('small','',label),make('strong','',value));parent.append(box);
}
function explain(parent,title,description){
 const block=make('div');block.append(make('small','',title),make('p','',description||'Non disponibile per questa versione.'));parent.append(block);
}
function setTab(tab){
 activeTab=tab;
 for(const x of ['code','logic','strategies','results']){
  const selected=tab===x;
  $('bvaPane'+x[0].toUpperCase()+x.slice(1)).hidden=!selected;
  const button=document.querySelector('[data-bva-tab="'+x+'"]');
  button?.classList.toggle('active',selected);
  button?.setAttribute('aria-selected',String(selected));
 }
}
function renderList(){
 const term=(inputs.search.value||'').trim().toLocaleLowerCase('it-IT'),family=inputs.family.value;
 const root=$('bvaBotList');root.replaceChildren();
 let shown=0,last='';
 for(const bot of items){
  if(family!=='all'&&bot.family!==family)continue;
  const search=(bot.name+' '+bot.file+' '+bot.family+' '+bot.detail).toLocaleLowerCase('it-IT');
  if(term&&!search.includes(term))continue;
  if(bot.family!==last){root.append(make('p','bva-group-name',bot.family));last=bot.family}
  const btn=make('button','bva-bot-item'+(bot.id===current.id?' active':''));
  btn.type='button';btn.dataset.bot=bot.id;
  btn.append(make('b','',bot.name),make('small','',bot.file));
  btn.addEventListener('click',()=>select(bot.id));
  root.append(btn);shown++;
 }
 if(!shown)root.append(make('p','bva-empty','Nessun bot trovato per questa ricerca.'));
}
function renderOverview(){
 head.textContent=current.name;
 $('bvaFamilyName').textContent=current.family;
 $('bvaBotSummary').textContent=current.detail;
 const facts=$('bvaQuickFacts');facts.replaceChildren();
 facts.append(stat('Versione',current.file.split('.js')[0].split('_').slice(-3).join(' ')||current.name));
 facts.append(stat('Funzioni catalogate',Fn[current.id]?String(Fn[current.id].length):'N/D'));
 const tests=T.performance[current.id]||[];
 facts.append(stat('Report associati',n(tests.length)));
 $('bvaFilename').textContent=current.file;
 $('bvaBytes').textContent=n(current.bytes);
 $('bvaHash').textContent=current.sha;
}
function renderLogic(){
 const root=$('bvaLogic');root.replaceChildren();
 const d=T.descriptions[current.id];
 const labels=['COSA FA','QUANDO INTERVIENE','COME FUNZIONA','PERCHÉ È STATO CREATO'];
 if(d)labels.forEach((name,i)=>explain(root,name,d[i]));
 else{
  const fallback=[current.detail,'Condizioni da ricostruire dal sorgente.','Codice storico recuperato, non ancora mappato per moduli.','Versione conservata nell’archivio originale.'];
  labels.forEach((name,i)=>explain(root,name,fallback[i]));
 }
}
function moduleGroups(){return T.descriptions[current.id]?.[4]||[]}
function renderStrategies(){
 const root=$('bvaStrategies');root.replaceChildren();
 const functions=Fn[current.id]||[],modules=moduleGroups();let found=0;
 for(const module of modules){
  const names=module.functions.filter(f=>functions.includes(f));
  if(!names.length)continue;
  found++;
  const details=make('details','bva-expand');
  const summary=make('summary','',module.name+' · '+names.length+' funzioni');details.append(summary);
  const wrap=make('div','bva-four');
  for(const [name,content] of [['COSA',module.what],['QUANDO',module.when],['COME',module.how],['PERCHÉ',module.why]])explain(wrap,name,content);
  details.append(wrap);
  const line=make('p');line.append(make('b','','Funzioni originali: '),make('span','',names.join(' · ')));details.append(line);
  root.append(details);
 }
 if(!found)root.append(make('p','bva-empty','Nessun modulo associato con certezza a questa revisione. Puoi comunque consultare tutti i nomi delle funzioni originali.'));
 $('bvaFnCount').textContent=n(functions.length)+' nomi';
 renderFunctionNames();
}
const descriptions={
'buildSnapshot':'Prepara statistiche e stato dei risultati già osservati.',
'metrics':'Calcola misure statistiche usate dal contesto.',
'detectPhase':'Classifica il regime in base alle uscite già concluse.',
'detectNegativeBreak':'Riconosce un cambiamento secondo il filtro di blocco negativo.',
'computeConfidence':'Calcola un punteggio interno sulla proposta.',
'computeTargetPotential':'Valuta il target con le regole della versione.',
'evaluateEntry':'Controlla le condizioni prima di autorizzare un eventuale ingresso.',
'chooseAdaptiveBetSize':'Stabilisce la dimensione proposta della puntata con limiti.',
'updateProtection':'Aggiorna i limiti di protezione del capitale.',
'recordOutcome':'Registra l’esito osservato per il feedback.',
'computeOutcomeFeedback':'Aggiorna i punteggi a partire dai risultati chiusi.',
'moonshotReady':'Controlla i requisiti di una proposta Moonshot.',
'moonshotPlan':'Prepara un piano di ingresso a moltiplicatore elevato.',
'prudentSignal':'Valuta l’ammissibilità della modalità PRUDENT.',
'offensiveSignal':'Valuta l’ammissibilità della modalità OFFENSIVE.',
'maybeStartExtreme':'Controlla le condizioni per EXTREME.',
'chooseMode':'Sceglie tra le modalità ammesse.',
'createKiberV24Brain':'Crea il modulo statistico ML Brain V2.4.',
'createKiberV25PatternEngine':'Crea il rilevatore di pattern V2.5.',
'createKiberV27Classic21':'Crea la libreria Classic21.',
'createKiberV27DeepStrike':'Crea il motore specializzato Deep Strike.',
'createKiberV26Governor':'Crea il modulo di sospensioni e veti.',
'createKiberV27Ensemble':'Crea l’arbitro di confronto tra strategie.',
'createKiberV30Drift':'Crea il filtro di cautela dopo peggioramento degli esiti.',
'k30RecoveryProbe':'Valuta la sonda di recupero quando ammessa.',
'ksiPredict':'Calcola una stima interna del modulo Sentinel.'
};
function renderFunctionNames(){
 const root=$('bvaFnList');root.replaceChildren();
 const funcs=Fn[current.id]||[],term=(inputs.fn.value||'').trim().toLowerCase();
 const groups=moduleGroups();
 let shown=0;
 for(const name of funcs){
  const m=groups.find(x=>x.functions.includes(name));
  if(term&&!(name+' '+(m?.name||'')).toLowerCase().includes(term))continue;
  shown++;
  const card=make('details','bva-function');
  card.append(make('summary','',name));
  const content=make('div','bva-four');
  explain(content,'COSA',descriptions[name]||'Funzione originale presente nel file: '+name+'. Descrizione tecnica non verificata in un trace.');
  explain(content,'QUANDO',m?.when||'L’attivazione effettiva richiede una traccia del runtime del bot.');
  explain(content,'COME',m?.how||'La chiamata completa deve essere ricostruita dal sorgente originale.');
  explain(content,'PERCHÉ',m?.why||'È parte della tecnologia di questa versione; non dimostra un vantaggio statistico.');
  card.append(content);root.append(card);
 }
 if(!shown)root.append(make('p','bva-empty','Nessuna funzione corrisponde alla ricerca.'));
}
function renderResults(){
 const root=$('bvaResults');root.replaceChildren();
 const perf=T.performance[current.id]||[];
 if(!perf.length){
  root.append(make('p','bva-empty','Non sono disponibili performance quantitative dimostrate per questo preciso sorgente. I risultati di versioni simili non vengono attribuiti a questa.'));
  return;
 }
 for(const row of perf){
  const card=make('article','bva-result');
  card.append(make('h4','',row.label),make('small','',row.kind));
  const stats=make('div','bva-result-grid');
  fact(stats,'Round',fmt(row.rounds));
  fact(stats,'Puntate',fmt(row.bets));
  fact(stats,'Vittorie',fmt(row.wins));
  fact(stats,'Risultato',pnl(row.net));
  fact(stats,'ROI',typeof row.roi==='number'?n(row.roi)+'%':'N/D');
  fact(stats,'Win rate',typeof row.wins==='number'&&row.bets?n(100*row.wins/row.bets)+'%':'N/D');
  if(typeof row.dd==='number')fact(stats,'Drawdown',n(row.dd)+'%');
  card.append(stats,make('p','',row.note),make('small','','Fonte: '+row.source));root.append(card);
 }
}
function status(kind,message){
 note.textContent=message;
 badge.className='bva-status'+(kind==='verified'?' verified':kind==='error'?' error':'');
 badge.textContent=kind==='verified'?'ORIGINALE SHA-256 OK':kind==='error'?'FILE NON VERIFICATO':'Verifica...';
}
function resetCode(){
 loaded=null;$('bvaCodeText').value='';$('bvaCopy').disabled=true;$('bvaDownload').disabled=true;
}
function hex(buffer){return Array.from(new Uint8Array(buffer),v=>v.toString(16).padStart(2,'0')).join('')}
async function fetchOriginal(entry,force=false){
 const ticket=++generation;
 resetCode();status('pending','Caricamento e verifica SHA-256 del sorgente originale...');
 const existing=force?null:cache.get(entry.sha);
 try{
  let bytes;
  if(existing)bytes=existing.bytes;
  else{
   const url='/bustabit-code-originals/'+encodeURIComponent(entry.file)+'.txt?v=1';
   const response=await fetch(url,{credentials:'same-origin',cache:'no-cache'});
   if(!response.ok)throw Error('Sorgente non disponibile sul server (HTTP '+response.status+')');
   bytes=await response.arrayBuffer();
  }
  if(bytes.byteLength!==entry.bytes)throw Error('La dimensione non corrisponde al sorgente catalogato.');
  if(!crypto?.subtle?.digest)throw Error('La verifica SHA-256 non è supportata da questo browser.');
  const checksum=hex(await crypto.subtle.digest('SHA-256',bytes));
  if(checksum!==entry.sha)throw Error('SHA-256 differente: copia bloccata per proteggere l’originale.');
  const source=new TextDecoder('utf-8',{fatal:true}).decode(bytes);
  if(ticket!==generation||current.id!==entry.id)return;
  loaded={entry,bytes,source};cache.set(entry.sha,{bytes,source});
  $('bvaCodeText').value=source;
  $('bvaCopy').disabled=false;$('bvaDownload').disabled=false;
  status('verified','Codice completo verificato: '+n(bytes.byteLength)+' byte. Pronto da copiare o scaricare. Questo controllo certifica l’identità del file, NON il funzionamento LIVE su Bustabit.');
 }catch(err){
  if(ticket!==generation||current.id!==entry.id)return;
  status('error','Codice non verificato: '+err.message+'. Nessuna copia di un file differente dall’originale è consentita.');
 }
}
function select(id){
 const entry=byId.get(id);if(!entry)return;
 current=entry;
 inputs.fn.value='';
 renderList();renderOverview();renderLogic();renderStrategies();renderResults();
 setTab('code');fetchOriginal(entry);
}
function copyCode(){
 if(!loaded||loaded.entry.id!==current.id)return;
 const source=loaded.source;
 const fallback=()=>{
  const textarea=$('bvaCodeText');textarea.focus();textarea.select();
  if(!document.execCommand('copy'))throw Error('Copia bloccata dal browser');
 };
 (async()=>{
  try{
   if(navigator.clipboard&&window.isSecureContext)await navigator.clipboard.writeText(source);
   else fallback();
   note.textContent='Copiato il codice integrale di '+current.name+' ('+n(loaded.bytes.byteLength)+' byte). Incollalo nell’editor ufficiale di Bustabit e verifica la compatibilità in modalità demo.';
  }catch(err){try{fallback();note.textContent='Codice originale copiato con procedura alternativa.'}catch(e){note.textContent='Copia automatica non consentita. Seleziona e copia il testo nel riquadro.'}}
 })();
}
function downloadCode(){
 if(!loaded||loaded.entry.id!==current.id)return;
 const url=URL.createObjectURL(new Blob([loaded.bytes],{type:'text/javascript;charset=utf-8'}));
 const a=document.createElement('a');a.href=url;a.download=current.file;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),5000);
}
function init(){
 for(const family of groups){const option=make('option','',family);option.value=family;inputs.family.append(option)}
 inputs.search.addEventListener('input',renderList);inputs.family.addEventListener('change',renderList);
 inputs.fn.addEventListener('input',renderFunctionNames);
 document.querySelectorAll('[data-bva-tab]').forEach(x=>x.addEventListener('click',()=>setTab(x.dataset.bvaTab)));
 $('bvaCopy').addEventListener('click',copyCode);
 $('bvaDownload').addEventListener('click',downloadCode);
 $('bvaReload').addEventListener('click',()=>fetchOriginal(current,true));
 const start=new URLSearchParams(location.search).get('bot')||'strike14';
 select(byId.has(start)?start:items[0].id);
}
init();
})();
