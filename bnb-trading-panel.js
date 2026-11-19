/* Compact mobile readiness + verified PancakeSwap snapshot in existing BNB laboratory. */
(()=>{
'use strict';
const ADDRESS=/^0x[0-9a-fA-F]{40}$/;
const WBNB='0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
const labels={
  ANALIZZA:'Analisi e feed token',VERIFICA:'Sicurezza e rischio',CALCOLA:'Preventivo PancakeSwap',
  ESEGUE:'Swap autorizzato',MONITORA:'Ordini e posizioni H24',REGISTRA:'Registro persistente'
};
function mount(){
  const parent=document.querySelector('#section-lab .section-body');
  if(!parent||document.getElementById('kiberBnbTradingPipeline'))return;
  const box=document.createElement('details');
  box.id='kiberBnbTradingPipeline';
  box.style.cssText='margin:10px 0 14px;border:1px solid #31627b;border-radius:13px;background:#0a2333;color:#e0f3ff;padding:12px 14px';
  const header=document.createElement('summary');
  header.style.cssText='cursor:pointer;font-weight:700;font-size:14px';
  header.textContent='Strategie BNB · dati PancakeSwap · esecuzione disattivata';
  const description=document.createElement('p');
  description.style.cssText='color:#afc9d9;font-size:12px;margin:10px 0';
  description.textContent='Rilevazioni di mercato su BNB Chain (56). Gli snapshot HTTP non sono uno stream WebSocket e non garantiscono un nuovo prezzo ogni secondo.';
  const grid=document.createElement('div');
  grid.style.cssText='display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:8px';
  const cells=new Map();
  Object.entries(labels).forEach(([key,title])=>{
    const cell=document.createElement('div');
    cell.style.cssText='border:1px solid #25485e;border-radius:9px;padding:9px;background:#102b3b';
    const h=document.createElement('strong');h.style.cssText='display:block;font-size:12px';h.textContent=key+' · '+title;
    const p=document.createElement('small');p.style.cssText='display:block;color:#aac5d5;margin-top:5px;line-height:1.5';p.textContent='Da collegare';
    cell.append(h,p);grid.appendChild(cell);cells.set(key,p);
  });
  const report=document.createElement('p');
  report.style.cssText='font-size:12px;color:#b5d9e9;margin:10px 0 0;line-height:1.5';
  report.setAttribute('role','status');
  const sourceLink=document.createElement('a');
  sourceLink.style.cssText='display:none;font-size:12px;color:#80d9ff;margin-top:7px';
  sourceLink.textContent='Apri la pool su DEX Screener';
  sourceLink.rel='noopener noreferrer';sourceLink.target='_blank';
  const note=document.createElement('p');note.style.cssText='font-size:12px;color:#9ab9c9;margin:8px 0 0';
  let address='', snapshot=null, error='', busy=false, controller=null;
  const poolChecks=new Map();
  const tokenAddress=()=>{
    const c=window.kiberTokenContext?.()?.coin;
    if(!c)return '';
    const v=String(c.address||c.contract||'').trim();
    if(ADDRESS.test(v))return v;
    return c.id==='binancecoin'?WBNB:'';
  };
  const money=v=>Number.isFinite(v)&&v>0?'$'+v.toLocaleString('it-IT',{maximumSignificantDigits:8}):'—';
  function refresh(){
    const current=tokenAddress();
    if(current!==address){address=current;snapshot=null;error='';controller?.abort();}
    const hasCore=Boolean(window.KiberBNBTradingCore?.createPipeline);
    cells.get('ANALIZZA').textContent=snapshot&&snapshot.address.toLowerCase()===address.toLowerCase()
      ? 'DEX Screener · PancakeSwap · acquisizione HTTP, non stream on-chain.'
      : address?'Contratto BSC trovato; acquisizione snapshot quando il pannello è aperto.':'Seleziona un token con contratto verificato su BNB Chain.';
    const poolId=String(snapshot?.pair?.address||'').toLowerCase();
    const check=poolChecks.get(poolId);
    cells.get('VERIFICA').textContent=check?.verified===true
      ? 'Pool PancakeSwap V3 verificata dalla factory BNB. Sicurezza dei token ancora da valutare.'
      : check?.verified===false?'Pool non confermata dalla factory V3. Nessuna operazione autorizzata.'
      : 'Origine della pool da verificare. Analisi rischio token non conclusa.';
    cells.get('CALCOLA').textContent='Calcoli predisposti; quote Smart Router da collegare.';
    cells.get('ESEGUE').textContent='DISATTIVATO: nessun acquisto o vendita reale.';
    cells.get('MONITORA').textContent='Adattatore eventi Swap V3 predisposto; nodo WSS e servizio H24 da collegare.';
    cells.get('REGISTRA').textContent='Interfaccia registro pronta; archivio persistente da collegare.';
    const p=snapshot?.pair,age=snapshot?Math.max(0,Math.floor((Date.now()-Date.parse(snapshot.fetchedAt))/1000)):null;
    if(p&&snapshot.address.toLowerCase()===address.toLowerCase()){
      report.textContent='Prezzo '+money(p.priceUsd)+' · liquidità '+money(p.liquidityUsd)+' · volume 24h '+money(p.volume24Usd)+' · acquisto/vendita 24h '+(p.buys24??'—')+'/'+(p.sells24??'—')+' · snapshot acquisito '+age+'s fa'+(age>45?' (da aggiornare)':'')+'. Ora dell’ultimo trade non verificata.';
      if(p.url){sourceLink.href=p.url;sourceLink.style.display='inline-block'}else sourceLink.style.display='none';
    } else {
      sourceLink.style.display='none';
      report.textContent=error||(!address?'Nessun contratto BSC disponibile per questa moneta.':'Snapshot PancakeSwap non ancora acquisito.');
    }
    note.textContent=hasCore?'Controlli software caricati · nessuna autorizzazione wallet o esecuzione automatica attivata.':'Motore non caricato: verificare gli script della piattaforma.';
  }
  async function checkPool(pool){
    if(!/^0x[0-9a-fA-F]{40}$/.test(String(pool||'')))return;
    const id=pool.toLowerCase(),cached=poolChecks.get(id);
    if(cached&&Date.now()-cached.checked<300000)return;
    poolChecks.set(id,{verified:null,checked:Date.now()});
    try{
      const res=await fetch('/api/bnb-pool-verify?pool='+encodeURIComponent(id),{signal:AbortSignal.timeout(9000)});
      const data=await res.json();
      poolChecks.set(id,{verified:res.ok&&data.verified===true?true:res.ok&&data.verified===false?false:null,checked:Date.now()});
    }catch{poolChecks.set(id,{verified:null,checked:Date.now()})}
    refresh();
  }
  async function load(){
    if(!box.open||document.hidden||busy)return;
    refresh();
    if(!address)return;
    busy=true;
    const target=address;
    controller=new AbortController();
    const cutoff=setTimeout(()=>controller.abort(),10000);
    try{
      const r=await fetch('/api/bnb-dex-live?address='+encodeURIComponent(target),{signal:controller.signal,cache:'no-store'});
      const data=await r.json();
      if(target!==address)return;
      if(!r.ok||!data.ok){snapshot=null;error=data?.status==='NO_VERIFIED_PANCAKE_POOL'?'Nessuna pool PancakeSwap verificata per questa moneta.':'Fonte di mercato non disponibile: nessun prezzo mostrato.'}
      else {snapshot=data;error='';void checkPool(data.pair?.address)}
    }catch{if(target===address){snapshot=null;error='Connessione di mercato non disponibile.'}}
    finally{clearTimeout(cutoff);busy=false;refresh()}
  }
  box.append(header,description,grid,report,sourceLink,note);
  box.addEventListener('toggle',()=>{refresh();if(box.open)load();else controller?.abort()});
  parent.insertBefore(box,parent.firstChild);
  refresh();
  setInterval(()=>{if(!box.isConnected)return;if(box.open){refresh();}},1000);
  setInterval(()=>{if(box.open&&!document.hidden)load()},15000);
  document.addEventListener('visibilitychange',()=>{if(box.open&&!document.hidden)load()});
  document.addEventListener('kiber:analysis-updated',()=>{if(box.open&&tokenAddress()!==address){refresh();load()}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);
else mount();
})();