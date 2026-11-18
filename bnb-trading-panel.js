/* Lightweight status surface inside the EXISTING BNB token laboratory. */
(()=>{
'use strict';
const labels = {
  ANALIZZA:'Analisi e feed token',
  VERIFICA:'Sicurezza e rischio',
  CALCOLA:'Preventivo PancakeSwap',
  ESEGUE:'Swap autorizzato',
  MONITORA:'Ordini e posizioni H24',
  REGISTRA:'Registro persistente'
};
function mount(){
  const parent=document.querySelector('#section-lab .section-body');
  if(!parent||document.getElementById('kiberBnbTradingPipeline'))return;
  const box=document.createElement('details');
  box.id='kiberBnbTradingPipeline';
  box.style.cssText='margin:10px 0 14px;border:1px solid #31627b;border-radius:13px;background:#0a2333;color:#e0f3ff;padding:12px 14px';
  const header=document.createElement('summary');
  header.style.cssText='cursor:pointer;font-weight:700;font-size:14px';
  header.textContent='Strategie BNB · 6 collegamenti · preparazione (nessun ordine reale)';
  const description=document.createElement('p');
  description.style.cssText='color:#afc9d9;font-size:12px;margin:10px 0';
  description.textContent='Struttura predisposta per PancakeSwap e MetaMask sulla BNB Smart Chain (56). Il trading automatico e il monitoraggio cloud H24 non sono ancora attivi.';
  const grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px';
  const state=new Map();
  Object.entries(labels).forEach(([key,title])=>{
    const cell=document.createElement('div');
    cell.style.cssText='border:1px solid #25485e;border-radius:9px;padding:9px;background:#102b3b';
    const h=document.createElement('strong');h.style.cssText='display:block;font-size:12px';h.textContent=key+' · '+title;
    const p=document.createElement('small');p.style.cssText='display:block;color:#aac5d5;margin-top:5px;line-height:1.5';p.textContent='Non collegato';
    cell.append(h,p);grid.appendChild(cell);state.set(key,p);
  });
  const note=document.createElement('p');note.style.cssText='font-size:12px;color:#9ab9c9;margin:8px 0 0';
  function refresh(){
    const present=Boolean(window.KiberBNBTradingCore?.createPipeline);
    const token=window.kiberTokenContext?.()?.coin;
    state.get('ANALIZZA').textContent=token?'Token selezionato: '+String(token.symbol||token.name||'contratto')+'. Feed al secondo da collegare.':'Seleziona un token. Feed al secondo da collegare.';
    state.get('VERIFICA').textContent='Controlli rischio nel motore; sicurezza on-chain da collegare.';
    state.get('CALCOLA').textContent='Interfaccia preventivo pronta; Smart Router da collegare.';
    state.get('ESEGUE').textContent='BLOCCATO: nessun acquisto o vendita reale.';
    state.get('MONITORA').textContent='Ricevute previste; servizio cloud H24 da collegare.';
    state.get('REGISTRA').textContent='Interfaccia registro pronta; storage persistente da collegare.';
    note.textContent=present?'Motore di controllo caricato. Nessun wallet autorizzato a spendere.':'Motore non caricato: controllare gli script della piattaforma.';
  }
  box.append(header,description,grid,note);
  box.addEventListener('toggle',()=>{if(box.open)refresh()});
  parent.insertBefore(box,parent.firstChild);
  refresh();
  document.addEventListener('kiber:analysis-updated',()=>{if(box.open)refresh()});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
else mount();
})();