/* Kibernetic BNB cloud orb: compact, truthful status on existing home dashboard. */
(()=>{
'use strict';
const ENDPOINT='https://iytjxruxpvwjjhbndkzo.supabase.co/functions/v1/kibernetic-bnb-scan?id=binancecoin';
const STATE_ID='kiberBnbCloudOrb';
const DETAIL_ID='kiberBnbCloudOrbDetails';
const FRESH_LIMIT_S=190;
let last=null, fetchedAt=0, busy=false, isExpanded=false, request=null;
const $=id=>document.getElementById(id);
const n=(tag,cls,txt)=>{
  const el=document.createElement(tag);
  if(cls)el.className=cls;
  if(txt!==undefined)el.textContent=txt;
  return el;
};
const formatPct=(v)=>{
  if(typeof v!=='number'||!Number.isFinite(v))return '—';
  return (v>0?'+':'')+v.toLocaleString('it-IT',{maximumFractionDigits:2})+'%';
};
const when=(input)=>{
  const t=Date.parse(input||'');
  return Number.isFinite(t)?new Date(t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}):'—';
};
const ageSec=(input)=>{
  const t=Date.parse(input||'');
  return Number.isFinite(t)?Math.max(0,Math.floor((Date.now()-t)/1000)):null;
};
function liveState(){
  if(!last||last.ok!==true)return 'unavailable';
  const age=ageSec(last.lastAnalysisAt);
  if(last.scanOnline===true&&last.status==='CURRENT'&&age!==null&&age<=FRESH_LIMIT_S)return 'active';
  return 'stale';
}
function render(){
  const button=$(STATE_ID),panel=$(DETAIL_ID);
  if(!button||!panel)return;
  const status=liveState();
  const age=ageSec(last?.lastAnalysisAt);
  const count=Number.isSafeInteger(Number(last?.monitoredAssets))?Number(last.monitoredAssets):null;
  button.dataset.status=status;
  button.setAttribute('aria-label',status==='active'
    ?'Ricerca BNB attiva: '+count+' token monitorati. Apri i dettagli'
    :status==='stale'?'Ricerca BNB: dati non recenti. Apri i dettagli':'Ricerca BNB non verificata. Apri i dettagli');
  $('kboStatus').textContent=status==='active'?'Attiva ogni minuto':status==='stale'?'Dati da aggiornare':'Connessione da verificare';
  $('kboCoverage').textContent=count!==null&&last?.ok===true
    ?'Monitorati '+count+' token · massimo 12 nel collector attuale'
    :'Numero token attualmente non verificabile';
  $('kboFreshness').textContent=last?.lastAnalysisAt
    ?'Ultimo controllo '+when(last.lastAnalysisAt)+(age!==null?' · '+age+' secondi fa':'')
    :'Ultimo controllo non disponibile';
  const token=last?.token;
  const tokenFresh=token&&token.status==='OK'&&ageSec(token.lastSourceAt)<=FRESH_LIMIT_S;
  $('kboChanges').textContent=status==='active'&&tokenFresh
    ?'BNB osservato: prezzo 5 min '+formatPct(token.priceChange5mPct)+' · 15 min '+formatPct(token.priceChange15mPct)+' · liquidità 15 min '+formatPct(token.liquidityChange15mPct)
    :'Variazioni BNB non disponibili o fonte non abbastanza recente';
  const findings=Array.isArray(last?.findings)?last.findings:[];
  const relevant=status==='active'?findings.find(x=>Date.now()-Date.parse(x.at)>=0&&Date.now()-Date.parse(x.at)<86400000):null;
  $('kboEvent').textContent=relevant
    ?'Ultima osservazione BNB: '+String(relevant.summary||'Evento di mercato').slice(0,160)
    :'Nessuna anomalia BNB recente verificata. Non significa assenza di rischio.';
  $('kboScope').textContent='La raccolta è programmata ogni 60 s sul server, anche a telefono spento. Solo token selezionati, non ogni scambio della BNB Chain. Nessun acquisto automatico.';
}
async function load(force=false){
  if(busy||document.hidden)return;
  if(!force&&Date.now()-fetchedAt<55000)return;
  busy=true;fetchedAt=Date.now();
  request?.abort();
  const controller=new AbortController();request=controller;
  const timeout=setTimeout(()=>controller.abort(),10000);
  try{
    const resp=await fetch(ENDPOINT,{method:'GET',mode:'cors',cache:'no-store',signal:controller.signal});
    const data=await resp.json();
    last=resp.ok&&data?.ok===true?data:null;
  }catch{last=null}
  finally{clearTimeout(timeout);busy=false;render()}
}
function mount(){
  if($(STATE_ID))return true;
  const home=$('kiberCompactDashboard');
  const header=home?.querySelector('.kcd-header');
  if(!header)return false;
  const refresh=$('kcdRefresh');
  const button=n('button','kbo-orb-button');
  button.type='button';button.id=STATE_ID;button.dataset.status='unavailable';
  button.setAttribute('aria-controls',DETAIL_ID);
  button.setAttribute('aria-expanded','false');
  button.setAttribute('aria-label','Ricerca BNB: controllo in corso. Apri i dettagli');
  const sphere=n('span','kbo-orb-sphere');
  sphere.setAttribute('aria-hidden','true');
  const label=n('span','kbo-orb-label','RICERCA');
  button.append(sphere,label);
  if(refresh)header.insertBefore(button,refresh);else header.append(button);

  const panel=n('section','kbo-panel');panel.id=DETAIL_ID;panel.hidden=true;
  panel.setAttribute('aria-label','Stato della ricerca automatica BNB');
  const title=n('strong','kbo-panel-title','Kiber · monitoraggio BNB');
  const state=n('p','kbo-line');state.id='kboStatus';
  const coverage=n('p','kbo-line');coverage.id='kboCoverage';
  const freshness=n('p','kbo-line');freshness.id='kboFreshness';
  const changes=n('p','kbo-changes');changes.id='kboChanges';
  const event=n('p','kbo-line');event.id='kboEvent';
  const scope=n('p','kbo-note');scope.id='kboScope';
  const actions=n('div','kbo-actions');
  const refreshButton=n('button','kbo-refresh','Aggiorna stato');refreshButton.type='button';
  refreshButton.addEventListener('click',()=>load(true));
  const close=n('button','kbo-close','Chiudi');close.type='button';close.addEventListener('click',()=>toggle(false));
  actions.append(refreshButton,close);
  panel.append(title,state,coverage,freshness,changes,event,scope,actions);
  header.insertAdjacentElement('afterend',panel);
  function toggle(open){
    isExpanded=Boolean(open);panel.hidden=!isExpanded;
    button.setAttribute('aria-expanded',String(isExpanded));
    if(isExpanded){render();void load(true)}else button.focus();
  }
  button.addEventListener('click',()=>toggle(!isExpanded));
  button.addEventListener('keydown',e=>{if(e.key==='Escape'&&isExpanded){e.preventDefault();toggle(false)}});
  render();void load(true);
  return true;
}
function boot(){
  if(mount())return;
  const observer=new MutationObserver(()=>{
    if(mount())observer.disconnect();
  });
  observer.observe(document.body,{subtree:true,childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
setInterval(()=>{
  if(!$(STATE_ID))return;
  render();
  if(document.body.dataset.v241View==='home')void load();
},15000);
document.addEventListener('visibilitychange',()=>{
  if(!document.hidden&&$(STATE_ID)){render();void load(true)}
});
})();