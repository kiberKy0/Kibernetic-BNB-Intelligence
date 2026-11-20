/* Read-only per-version technical dossier: named strategies, functions, evidence.
 * Never fetches, executes or uploads a betting script. Data is illustrative of source
 * structure and historic tests, not an active AI trading signal or LIVE certification.
 */
(function(){
'use strict';
const data=window.KiberBustabitTechData,legacy=window.KiberBustabitLegacy;
const base=window.KiberBustabitArchiveData,fn=window.KiberBotFunctionNames||{};
const $=id=>document.getElementById(id);
if(!data||!legacy||!base||!$('bfTechSelect')||!$('bfTechView'))return;
const entries=[...legacy.primary,...legacy.variants,...base.codes.filter(c=>![...legacy.primary,...legacy.variants].some(o=>o.sha===c.sha))];
const byId=new Map(entries.map(x=>[x.id,x]));
const nf=x=>typeof x==='number'?x.toLocaleString('it-IT',{maximumFractionDigits:2}):'Non disponibile';
const signed=x=>typeof x==='number'?(x>0?'+':'')+nf(x)+' bit':'Non disponibile';
const e=(tag,cls,text)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(text!==undefined)x.textContent=text;return x};
const attr=(node,label,value)=>{const box=e('div','bf-tech-attr');box.append(e('small','',label),e('p','',value));node.append(box);return box};
const sel=$('bfTechSelect'),panel=$('bfTechView'),search=$('bfTechFunctionSearch');
let currentId='',inventory=null;
function showNumber(node,label,value){const q=e('div','bf-tech-number');q.append(e('small','',label),e('strong','',value));node.append(q)}
function def(id){return data.descriptions[id]||null}
function idSelect(){
 entries.forEach(entry=>{const o=e('option','',entry.name);o.value=entry.id;sel.append(o)});
 sel.addEventListener('change',()=>render(sel.value));
 search?.addEventListener('input',renderFunctions);
}
function moduleFor(name,groups){
 return groups.find(g=>g.functions.includes(name));
}
const specifics={
buildSnapshot:'Prepara uno snapshot dello storico già disponibile.',
metrics:'Calcola le misure statistiche del contesto.',
detectPhase:'Classifica la fase del contesto in base ai round già conclusi.',
detectNegativeBreak:'Segnala una possibile interruzione del blocco di esiti bassi.',
computeConfidence:'Attribuisce un punteggio di confidenza alla proposta.',
computeTargetPotential:'Valuta il potenziale del target secondo i criteri dello script.',
evaluateEntry:'Verifica se una proposta supera i criteri di ingresso.',
chooseAdaptiveBetSize:'Sceglie una dimensione della puntata soggetta ai limiti.',
updateProtection:'Aggiorna i freni legati a saldo, profitto e drawdown.',
recordOutcome:'Memorizza l’esito di una puntata ai fini dei feedback successivi.',
computeOutcomeFeedback:'Confronta i risultati recenti per correggere i punteggi.',
analyzeMoment:'Descrive lo storico al momento della decisione.',
redStreak:'Conta la sequenza di risultati sotto la soglia.',
moonshotReady:'Controlla se sono soddisfatti i requisiti per la modalità Moonshot.',
moonshotPlan:'Prepara un eventuale piano a moltiplicatore elevato.',
placePlan:'Passa il piano al motore di puntata previsto dal codice.',
processLastResult:'Aggiorna i registri con il risultato del round appena finito.',
safeBetSat:'Normalizza gli importi in unità intere consentite dal codice.',
classifyBlock:'Classifica un blocco di risultati precedenti.',
prudentSignal:'Calcola il segnale della strategia PRUDENT.',
offensiveSignal:'Calcola il segnale della strategia OFFENSIVE.',
maybeStartExtreme:'Verifica i prerequisiti per iniziare una sessione EXTREME.',
chooseMode:'Seleziona PRUDENT, OFFENSIVE o EXTREME tra i candidati ammessi.',
recordPerf:'Aggiorna il rendimento attribuito alla modalità.',
selectAttackLevel:'Seleziona L1, L2, L3 o L4 secondo i vincoli correnti.',
evaluateHighHunt:'Valuta una proposta HUNT per eventi rari.',
evaluateLevel4:'Valuta la modalità L4 separatamente.',
updateRecoveryState:'Aggiorna le condizioni del modulo Recovery.',
createKiberV24Brain:'Crea il modulo ML Brain V2.4 per stime e calibrazione.',
createKiberV25PatternEngine:'Crea il motore dei pattern V2.5.',
createKiberV26Governor:'Crea il Governor per ammissioni, pause e veti.',
createKiberV26AutoMemory:'Crea il componente di persistenza dei modelli.',
createKiberV27Classic21:'Crea il modulo Classic21 di riconoscimento pattern.',
createKiberV27DeepStrike:'Crea il motore dei candidati ad alto moltiplicatore.',
createKiberV27Ensemble:'Crea l’arbitro che confronta i candidati dei motori.',
createKiberV30Drift:'Crea il componente di cautela dopo deterioramento recente.',
k30RecoveryProbe:'Valuta la sonda di recupero nelle condizioni configurate.',
ksiPredict:'Calcola una stima interna KSI usando il contesto disponibile.',
normalizedEntropy:'Misura la dispersione informativa nei risultati osservati.',
specialDecision:'Valuta un ingresso speciale con le proprie regole.',
originalReplay:'Esegue un replay in ambiente di laboratorio, senza attestare LIVE.'
};
const tagOf=name=>{
 if(/memory|learn|brain|feedback|calibr|record|perf|settle|outcome|report|stats|log/i.test(name))return 'Memoria e verifica';
 if(/protect|risk|stop|drawdown|betSize|reserve|capita|budget|balance|bankroll|brake|canBet|profitLock/i.test(name))return 'Rischio e capitale';
 if(/phase|regime|snapshot|metric|median|mean|streak|entropy|pattern|block|context|sequence|slope|highEvent|fiveX/i.test(name))return 'Analisi dello storico';
 if(/entry|score|confidence|potential|signal|decision|choose|evaluate|supervise|governor|veto|ensemble|drift|approve/i.test(name))return 'Decisione e filtri';
 if(/payout|bet|wager|stake|moon|hunt|extreme|attack|place|construct|build|recovery|probe/i.test(name))return 'Esecuzione prevista e Recovery';
 return 'Funzione di supporto';
};
function functionCard(name,groups){
 const g=moduleFor(name,groups),t=tagOf(name);
 const item=e('details','bf-tech-function');
 const summary=e('summary','',name);summary.append(e('span','bf-tech-function-tag',g?.name||t));item.append(summary);
 const body=e('div','bf-tech-function-content');
 const what=specifics[name]||('Funzione del sorgente denominata '+name+'. La funzione precisa non è ancora documentata da un tracciamento di chiamate.');
 attr(body,'COSA',what);
 attr(body,'QUANDO',g?.when||'Il momento effettivo di esecuzione richiede un trace di runtime della versione selezionata.');
 attr(body,'COME',g?.how||'È parte delle funzioni tecniche del sorgente; il suo comportamento completo va verificato nel codice importato.');
 attr(body,'PERCHÉ',g?.why||'Supporta il funzionamento della versione; non costituisce da sola una strategia né una prova di puntata.');
 if(!specifics[name])body.append(e('small','bf-tech-uncertain','Descrizione generale: nome verificato nel sorgente, percorso di chiamata non certificato.'));
 item.append(body);return item;
}
function renderFunctions(){
 const root=$('bfTechFunctionList'),count=$('bfTechFunctionCount');if(!root)return;
 const query=(search?.value||'').trim().toLocaleLowerCase('it-IT'),groups=def(currentId)?.[4]||[];
 root.replaceChildren();
 const current=Array.isArray(inventory)?inventory:[];
 const found=current.filter(name=>(name+' '+(moduleFor(name,groups)?.name||'')+' '+tagOf(name)).toLocaleLowerCase('it-IT').includes(query));
 count.textContent=found.length+' / '+current.length+' funzioni per nome';
 found.forEach(name=>root.append(functionCard(name,groups)));
 if(!found.length)root.append(e('p','bf-tech-empty',current.length?'Nessuna funzione corrisponde alla ricerca.':'Nessun elenco di funzioni verificato per questa versione.'));
}
function render(id){
 const entry=byId.get(id)||entries[0];if(!entry)return;
 currentId=entry.id;sel.value=entry.id;if(search)search.value='';
 const detail=def(entry.id),groups=detail?.[4]||[],perf=data.performance[entry.id]||[];
 inventory=Array.isArray(fn[entry.id])?fn[entry.id]:null;
 panel.replaceChildren();
 const header=e('div','bf-tech-dossier-head');
 header.append(e('h3','',entry.name),e('span','bf-pill warn','LIVE NON CERTIFICATO'));
 panel.append(header);
 const summary=e('div','bf-tech-quadrant');
 attr(summary,'COSA FA',detail?.[0]||entry.detail||'Versione catalogata; comportamento da analizzare.');
 attr(summary,'QUANDO ENTRA IN AZIONE',detail?.[1]||'Dipende dai parametri dell’originale e dai suoi controlli.');
 attr(summary,'COME FUNZIONA',detail?.[2]||'I dettagli disponibili sono descritti nella scheda del sorgente.');
 attr(summary,'PERCHÉ È STATO PROGETTATO',detail?.[3]||'Finalità specifica da verificare nei report.');
 panel.append(summary);
 const mini=e('div','bf-tech-measures');
 showNumber(mini,'Funzioni nominate',inventory?nf(inventory.length):'Non catalogate');
 showNumber(mini,'Tecnologie individuate',nf(groups.filter(g=>inventory&&g.functions.some(name=>inventory.includes(name))).length));
 showNumber(mini,'Report collegati',nf(perf.length));
 panel.append(mini);
 const source=e('p','bf-tech-source','ORIGINALE · '+entry.file+' · SHA-256: '+entry.sha);
 panel.append(source);
 const sec=e('section','bf-tech-sub');
 sec.append(e('h4','','Tecnologie e strategie, per nome'));
 if(!groups.length)sec.append(e('p','bf-tech-empty','Mappatura tecnologica non ancora certificata per questa specifica versione.'));
 else{
  for(const group of groups){
   const found=(inventory||[]).filter(f=>group.functions.includes(f));
   if(!found.length)continue;
   const details=e('details','bf-tech-module');
   details.append(e('summary','',group.name+' · '+found.length+' funzioni'));
   const body=e('div','bf-tech-module-body');
   attr(body,'COSA',group.what);attr(body,'QUANDO',group.when);attr(body,'COME',group.how);attr(body,'PERCHÉ',group.why);
   const names=e('p','bf-tech-function-names');
   found.forEach(n=>names.append(e('code','',n)));
   body.append(names);details.append(body);sec.append(details);
  }
 }
 panel.append(sec);
 const perfSection=e('section','bf-tech-sub');perfSection.append(e('h4','','Performance e prove di questa versione'));
 if(!perf.length){
  const none=e('div','bf-tech-no-evidence');
  none.append(e('strong','','Nessuna performance quantitativa attribuibile con certezza a questo sorgente.'),e('p','','I numeri di altre versioni non vengono trasferiti qui. Il controllo della sintassi e lo SHA-256 non misurano l’efficacia del bot.'));
  perfSection.append(none);
 }else for(const row of perf){
  const card=e('article','bf-tech-performance');
  const h=e('div','bf-code-title');h.append(e('b','',row.label),e('span','bf-pill warn',row.kind));card.append(h);
  const numbers=e('div','bf-tech-performance-numbers');
  showNumber(numbers,'Puntate (non LIVE certificate)',nf(row.bets));
  showNumber(numbers,'Vittorie',nf(row.wins));
  showNumber(numbers,'Win rate',typeof row.wins==='number'&&row.bets?nf(row.wins*100/row.bets)+'%':'N/D');
  showNumber(numbers,'Profitto/perdita',signed(row.net));
  if(typeof row.roi==='number')showNumber(numbers,'ROI sul puntato',nf(row.roi)+'%');
  if(typeof row.dd==='number')showNumber(numbers,'Drawdown osservato',nf(row.dd)+'%');
  if(typeof row.rounds==='number')showNumber(numbers,'Round',nf(row.rounds));
  card.append(numbers,e('p','',row.note),e('small','bf-tech-source','Fonte: '+row.source));perfSection.append(card);
 }
 panel.append(perfSection);
 const functions=e('section','bf-tech-sub');
 const details=e('details','bf-expand bf-tech-functions-details');
 details.append(e('summary','','Catalogo completo delle funzioni JavaScript · '+(inventory?.length||0)+' nomi'));
 const contents=e('div','bf-expand-body');
 const filter=e('p','bf-tech-info','Elenco estratto dai nomi delle funzioni originali, non dal codice riscritto. Apri un nome per leggere cosa, quando, come e perché. I comportamenti non verificati dal trace sono segnalati.');
 contents.append(filter);
 const line=e('p','bf-tech-counter');line.id='bfTechFunctionCount';contents.append(line);
 const list=e('div','bf-tech-function-list');list.id='bfTechFunctionList';contents.append(list);
 details.append(contents);functions.append(details);panel.append(functions);
 renderFunctions();
 $('bfTechStatus').textContent='Scheda caricata: '+entry.name+' · '+(inventory?.length||0)+' funzioni nominate · '+perf.length+' rapporti storici attribuibili.';
}
idSelect();
render(entries[0]?.id);
window.KiberBustabitTechUI={open(id){if(!byId.has(id))return;render(id);const target=$('bf-tech');target?.scrollIntoView({behavior:'smooth',block:'start'});}};
})();
