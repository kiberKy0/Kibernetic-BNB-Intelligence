/* Kiber Bustabit: catalogo informativo dei 15 bot storici.
   Nessun codice sorgente, fetch, download o operazione di puntata.
   Le performance appartengono esclusivamente alla versione specificata. */
(function(){
'use strict';
const L=window.KiberBustabitLegacy;
const T=window.KiberBustabitTechData;
const FN=window.KiberBotFunctionNames||{};
if(!L||!T)return;
const items=[...L.primary,...L.variants];
const byId=new Map(items.map(x=>[x.id,x]));
const groups=[...new Set(items.map(x=>x.family))];
const $=id=>document.getElementById(id);
const fmt=value=>typeof value==='number'?value.toLocaleString('it-IT',{maximumFractionDigits:2}):'Non disponibile';
const signed=value=>typeof value==='number'?(value>0?'+':'')+fmt(value)+' bit':'Non disponibile';
const make=(type,cls,text)=>{const e=document.createElement(type);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e};
let selected=items[0];
const search=$('bvaSearch'),family=$('bvaFamily'),fnSearch=$('bvaFnSearch');
function info(parent,name,content){
 const card=make('div');card.append(make('small','',name),make('p','',content||'Non disponibile per questa versione.'));parent.append(card);
}
function fact(parent,name,value){
 const card=make('div','bva-stat');card.append(make('small','',name),make('strong','',value));parent.append(card);
}
function setTab(id){
 const valid=['logic','strategies','results','code'];
 if(!valid.includes(id))return;
 for(const name of valid){
  const active=name===id,part=$('bvaPane'+name[0].toUpperCase()+name.slice(1));
  if(part)part.hidden=!active;
  const button=document.querySelector('[data-bva-tab="'+name+'"]');
  button?.classList.toggle('active',active);
  button?.setAttribute('aria-selected',String(active));
 }
}
function renderList(){
 const query=(search.value||'').toLocaleLowerCase('it-IT').trim();
 const want=family.value,root=$('bvaBotList');root.replaceChildren();
 let count=0,previous='';
 for(const bot of items){
  if(want!=='all'&&bot.family!==want)continue;
  const d=T.descriptions[bot.id],tech=(d?.[4]||[]).map(x=>x.name).join(' ');
  const haystack=[bot.name,bot.file,bot.family,bot.detail,tech].join(' ').toLocaleLowerCase('it-IT');
  if(query&&!haystack.includes(query))continue;
  if(bot.family!==previous){root.append(make('p','bva-group-name',bot.family));previous=bot.family}
  const b=make('button','bva-bot-item'+(selected?.id===bot.id?' active':''));b.type='button';b.dataset.bot=bot.id;
  b.append(make('b','',bot.name),make('small','','Scheda strategie e risultati'));
  b.addEventListener('click',()=>select(bot.id));root.append(b);count++;
 }
 if(!count)root.append(make('p','bva-empty','Nessun bot trovato. Prova un’altra famiglia o tecnologia.'));
}
function actualModules(){
 const d=T.descriptions[selected.id],func=FN[selected.id]||[];
 return (d?.[4]||[]).map(m=>({...m,verifiedNames:m.functions.filter(name=>func.includes(name))})).filter(m=>m.verifiedNames.length);
}
function renderSummary(){
 $('bvaBotName').textContent=selected.name;
 $('bvaFamilyName').textContent=selected.family;
 $('bvaBotSummary').textContent=selected.detail;
 $('bvaSourceBadge').textContent='CODICE IN ELABORAZIONE';
 $('bvaSourceBadge').className='bva-status';
 $('bvaFilename').textContent=selected.file;
 const modules=actualModules(),runs=T.performance[selected.id]||[];
 const stats=$('bvaQuickFacts');stats.replaceChildren();
 fact(stats,'Tecnologie / modalità',fmt(modules.length));
 fact(stats,'Funzioni catalogate',fmt((FN[selected.id]||[]).length));
 fact(stats,'Rapporti della versione',fmt(runs.length));
 const box=$('bvaLogic');box.replaceChildren();
 const detail=T.descriptions[selected.id],names=['COSA FA','QUANDO INTERVIENE','COME FUNZIONA','PERCHÉ È STATO CREATO'];
 const text=detail||[selected.detail,'Condizioni non ancora verificate.','Documentazione della versione da completare.','Conservazione delle strategie storiche.'];
 names.forEach((name,i)=>info(box,name,text[i]));
 const top=$('bvaTopModules');top.replaceChildren();
 if(!modules.length)top.append(make('p','bva-empty','Tecnologie specifiche ancora da documentare.'));
 else{
  for(const m of modules){
   const button=make('button','bva-module-chip',m.name+' · '+m.verifiedNames.length+' funzioni');
   button.type='button';button.addEventListener('click',()=>{setTab('strategies');document.querySelector('[data-bva-module="'+m.name+'"]')?.setAttribute('open','');});
   top.append(button);
  }
 }
}
function renderStrategies(){
 const root=$('bvaStrategies'),mods=actualModules();root.replaceChildren();
 if(!mods.length)root.append(make('p','bva-empty','Nessun modulo specifico verificato in questa versione.'));
 for(const mod of mods){
  const node=make('details','bva-expand');node.dataset.bvaModule=mod.name;
  node.append(make('summary','',mod.name+' · '+mod.verifiedNames.length+' funzioni'));
  const body=make('div','bva-four');
  [['COSA',mod.what],['QUANDO',mod.when],['COME',mod.how],['PERCHÉ',mod.why]].forEach(([a,b])=>info(body,a,b));
  node.append(body);
  const row=make('p');row.append(make('b','','Funzioni: '),make('span','',mod.verifiedNames.join(' · ')));
  node.append(row);root.append(node);
 }
 $('bvaFnCount').textContent=fmt((FN[selected.id]||[]).length)+' nomi';
 renderFunctions();
}
const descriptions={
buildSnapshot:'Calcola un riepilogo dei risultati storici.',metrics:'Misura i dati disponibili prima delle decisioni.',
detectPhase:'Classifica la fase osservata.',detectNegativeBreak:'Verifica il filtro di rottura negativa.',
computeConfidence:'Calcola un punteggio di confidenza.',computeTargetPotential:'Valuta il target scelto con le regole del bot.',
evaluateEntry:'Controlla le condizioni di ingresso.',chooseAdaptiveBetSize:'Definisce un importo nei limiti previsti.',
updateProtection:'Aggiorna le protezioni del capitale.',recordOutcome:'Memorizza l’esito osservato.',
computeOutcomeFeedback:'Aggiorna i punteggi dei segnali in base agli esiti.',moonshotReady:'Controlla le condizioni Moonshot.',
moonshotPlan:'Descrive il piano Moonshot.',prudentSignal:'Calcola il segnale PRUDENT.',
offensiveSignal:'Calcola il segnale OFFENSIVE.',maybeStartExtreme:'Verifica quando considerare EXTREME.',
chooseMode:'Sceglie una modalità candidata.',
createKiberV24Brain:'Crea il modulo statistico ML Brain V2.4.',
createKiberV25PatternEngine:'Prepara il riconoscitore dei pattern.',
createKiberV27Classic21:'Inizializza Classic21.',
createKiberV27DeepStrike:'Inizializza Deep Strike.',
createKiberV26Governor:'Inizializza il Governor e i suoi veti.',
createKiberV27Ensemble:'Prepara l’arbitro delle proposte.',
createKiberV30Drift:'Prepara il controllo sulle prestazioni in peggioramento.',
k30RecoveryProbe:'Valuta le condizioni di Recovery PROBE.',
ksiPredict:'Calcola una stima interna del modulo Sentinel.'
};
function renderFunctions(){
 const root=$('bvaFnList');root.replaceChildren();
 const text=(fnSearch?.value||'').trim().toLocaleLowerCase('it-IT'),modules=actualModules();
 const fun=FN[selected.id]||[];let shown=0;
 for(const name of fun){
  const mod=modules.find(x=>x.verifiedNames.includes(name));
  if(text&&!(name+' '+(mod?.name||'')).toLocaleLowerCase('it-IT').includes(text))continue;
  shown++;
  const detail=make('details','bva-function');
  detail.append(make('summary','',name));
  const pane=make('div','bva-four');
  info(pane,'COSA',descriptions[name]||'Funzione del sorgente originale: '+name+'. Il comportamento esatto non è ancora tracciato.');
  info(pane,'QUANDO',mod?.when||'Serve un log d’esecuzione per verificare il momento esatto.');
  info(pane,'COME',mod?.how||'Le chiamate interne richiedono verifica sulla versione specifica.');
  info(pane,'PERCHÉ',mod?.why||'Supporta la tecnologia storica di questa versione.');
  detail.append(pane);root.append(detail);
 }
 if(!shown)root.append(make('p','bva-empty','Nessuna funzione trovata.'));
}
function renderResults(){
 const root=$('bvaResults');root.replaceChildren();
 const reports=T.performance[selected.id]||[];
 if(!reports.length){
  root.append(make('p','bva-empty','Nessuna performance numerica verificabile attribuibile a questa esatta versione. I risultati di altri bot non vengono trasferiti qui.'));
  return;
 }
 for(const result of reports){
  const card=make('article','bva-result');
  card.append(make('h4','',result.label),make('small','',result.kind));
  const numbers=make('div','bva-result-grid');
  fact(numbers,'Round',fmt(result.rounds));
  fact(numbers,'Puntate',fmt(result.bets));
  fact(numbers,'Vittorie',fmt(result.wins));
  fact(numbers,'Risultato',signed(result.net));
  fact(numbers,'ROI',typeof result.roi==='number'?fmt(result.roi)+'%':'Non disponibile');
  fact(numbers,'Win rate',typeof result.wins==='number'&&result.bets?fmt(result.wins*100/result.bets)+'%':'Non disponibile');
  if(typeof result.dd==='number')fact(numbers,'Drawdown',fmt(result.dd)+'%');
  card.append(numbers,make('p','',result.note),make('small','','Fonte storica: '+result.source));
  root.append(card);
 }
}
function select(id){
 const bot=byId.get(id);if(!bot)return;
 selected=bot;
 if(fnSearch)fnSearch.value='';
 renderList();renderSummary();renderStrategies();renderResults();setTab('logic');
}
for(const group of groups){const option=make('option','',group);option.value=group;family.append(option)}
search.addEventListener('input',renderList);
family.addEventListener('change',renderList);
fnSearch.addEventListener('input',renderFunctions);
document.querySelectorAll('[data-bva-tab]').forEach(node=>node.addEventListener('click',()=>setTab(node.dataset.bvaTab)));
const requested=new URLSearchParams(location.search).get('bot')||items[0]?.id;
select(byId.has(requested)?requested:items[0].id);
})();