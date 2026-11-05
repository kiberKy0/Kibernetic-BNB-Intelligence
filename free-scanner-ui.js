(()=>{
'use strict';
const $$=id=>document.getElementById(id),ADDRESS=/^0x[a-f0-9]{40}$/i;
const state={loaded:false,busy:false,lastAt:0,candidates:[],source:''};
const money=v=>Number.isFinite(Number(v))?'$'+Number(v).toLocaleString('it-IT',{maximumFractionDigits:Number(v)<1?6:0}):'—';
const percent=v=>v===null||v===undefined||!Number.isFinite(Number(v))?'—':(Number(v)>=0?'+':'')+Number(v).toFixed(1)+'%';
function node(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function stamp(at){const d=new Date(at||Date.now());return Number.isFinite(d.getTime())?d.toLocaleString('it-IT',{dateStyle:'short',timeStyle:'short'}):'—'}
function init(){
 const anchor=$$('section-market'),hub=$$('hubNav');if(!anchor||!hub||$$('freeScanner'))return;
 const section=node('section','panel open');section.id='freeScanner';
 section.innerHTML='<div class="free-scanner-head"><div><span>BNB CHAIN / DATI PUBBLICI</span><h2>Scanner FREE</h2><p>Nuovi pool con liquidità verificabile nelle fonti, non tutte le monete della rete.</p></div><button type="button" id="freeScanRefresh">Aggiorna</button></div><div class="free-scanner-meta" id="freeScanStatus" role="status">Apri lo scanner per caricare i dati. Si aggiorna ogni 15 minuti mentre la pagina è aperta.</div><div class="free-scanner-list" id="freeScanList"></div><p class="free-scanner-foot">Punteggi euristici di attività, NON probabilità di profitto. Sicurezza GoPlus su richiesta; rischio non verificato finché non consultato.</p>';
 anchor.insertAdjacentElement('afterend',section);
 const nav=node('button','free-scanner-nav','Scanner FREE');nav.type='button';nav.id='freeScanNav';nav.onclick=()=>{section.scrollIntoView({behavior:'smooth',block:'start'});if(!state.loaded&&!state.busy)void refresh()};
 hub.append(nav);$$('freeScanRefresh').onclick=()=>refresh(true);
 setInterval(()=>{if(state.loaded&&!document.hidden&&Date.now()-state.lastAt>15*60000)void refresh()},60000);
}
async function refresh(force=false){
 if(state.busy||(!force&&state.lastAt&&Date.now()-state.lastAt<60000))return;
 state.busy=true;$$('freeScanRefresh').disabled=true;$$('freeScanStatus').textContent='Acquisizione candidati GeckoTerminal e DEX Screener…';
 try{
  const r=await fetch('/api/discovery-v26?limit=40',{signal:AbortSignal.timeout(18000)});
  if(!r.ok)throw Error('Sorgenti non disponibili ('+r.status+')');
  const data=await r.json();if(!Array.isArray(data.candidates))throw Error('Formato fonte inatteso');
  state.candidates=data.candidates.filter(x=>ADDRESS.test(String(x.address||'')));
  state.loaded=true;state.lastAt=Date.now();state.source=(data.sources||[]).join(' · ');
  $$('freeScanStatus').textContent=state.candidates.length+' token selezionati · '+stamp(data.updatedAt)+' · '+state.source;
  render();
 }catch(e){$$('freeScanStatus').textContent='Dati non aggiornati: '+e.message+(state.loaded?' · Elenco precedente conservato.':' · Riprova tra qualche minuto.');}
 finally{state.busy=false;$$('freeScanRefresh').disabled=false;}
}
function render(){
 const list=$$('freeScanList');list.replaceChildren();
 if(!state.candidates.length){list.append(node('p','free-scanner-empty','Nessuna nuova coppia supera i filtri di liquidità delle fonti disponibili.'));return;}
 const frag=document.createDocumentFragment();
 for(const candidate of state.candidates){
  const row=node('article','free-scanner-row');
  const heading=node('div','free-scanner-title');
  heading.append(node('strong','',String(candidate.symbol||candidate.name||'Token').slice(0,35)),node('span','',String(candidate.name||'').slice(0,65)));
  row.append(heading);
  const metrics=node('div','free-scanner-metrics');
  metrics.append(node('span','','Liquidità '+money(candidate.metrics?.liquidityUsd)),node('span','','Vol. 24h '+money(candidate.metrics?.volume24h)),node('span','','24h '+percent(candidate.metrics?.change24h)),node('span','','Indice dati '+(candidate.score??'—')+'/100'));
  row.append(metrics);
  const commands=node('div','free-scanner-actions');
  const analyze=node('button','free-scanner-open','Apri analisi');
  analyze.onclick=()=>{if(window.kiberOpenToken)window.kiberOpenToken(candidate.address);else {const i=$$('tokenSearch');if(i)i.value=candidate.address;$$('searchBtn')?.click()}};
  const safety=node('button','free-scanner-safety','Controlla rischio');
  safety.onclick=()=>security(candidate,row,safety);
  commands.append(analyze,safety);row.append(commands);
  if((candidate.risks||[]).length)row.append(node('small','free-scanner-risk',candidate.risks.slice(0,2).join(' · ')));
  frag.append(row);
 }
 list.append(frag);
}
async function security(token,row,button){
 if(button.disabled)return;button.disabled=true;button.textContent='Verifica…';
 let box=row.querySelector('.free-scanner-result');
 if(!box){box=node('div','free-scanner-result');row.append(box);}
 try{
  const r=await fetch('/api/token-safety?address='+encodeURIComponent(token.address),{signal:AbortSignal.timeout(10000)});
  const data=await r.json();if(!r.ok||!data.ok)throw Error(data.error||'Controllo temporaneamente non disponibile');
  box.replaceChildren(node('strong','',data.risk+' · '+data.source),node('p','',(data.flags||[]).map(f=>f.label).join(' · ')||'Nessuna segnalazione nei campi disponibili.'),node('small','',data.warning||''));
 }catch(e){box.textContent='Sicurezza non verificata: '+e.message;}
 finally{button.disabled=false;button.textContent='Ricontrolla rischio';}
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
