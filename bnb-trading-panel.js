/* Compact mobile readiness + verified PancakeSwap snapshot in existing BNB laboratory. */
(()=>{
'use strict';
const ADDRESS=/^0x[0-9a-fA-F]{40}$/;
const WBNB='0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c';
const CAKE='0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82';
const LINK='0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd';
const CLOUD_URL='https://iytjxruxpvwjjhbndkzo.supabase.co/functions/v1/kibernetic-bnb-scan';
const labels={
  ANALIZZA:'Analisi e feed token',VERIFICA:'Sicurezza e rischio',CALCOLA:'Preventivo PancakeSwap',
  ESEGUE:'Swap autorizzato',MONITORA:'Ordini e posizioni H24',REGISTRA:'Registro persistente'
};
function mount(){
  const parent=document.querySelector('#v271TokenView .v271-main');
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
  const cloudLine=document.createElement('p');
  cloudLine.style.cssText='font-size:12px;line-height:1.55;font-weight:600;margin:11px 0 2px;color:#d9efff';
  const cloudDetails=document.createElement('p');
  cloudDetails.style.cssText='font-size:12px;line-height:1.55;color:#adcbdc;margin:0 0 10px';
  let address='', snapshot=null, error='', busy=false, controller=null;
  let cloud=null,cloudError='',cloudBusy=false,cloudUpdatedAt=0,cloudController=null;
  const poolChecks=new Map();
  const tokenAddress=()=>{
    const c=window.kiberTokenContext?.()?.coin;
    if(!c)return '';
    const v=String(c.address||c.contract||'').trim();
    if(ADDRESS.test(v))return v;
    return c.id==='binancecoin'?WBNB:c.id==='pancakeswap-token'?CAKE:c.id==='chainlink'?LINK:'';
  };
  const money=v=>Number.isFinite(v)&&v>0?'$'+v.toLocaleString('it-IT',{maximumSignificantDigits:8}):'—';
  function refresh(){
    const current=tokenAddress();
    if(current!==address){address=current;snapshot=null;error='';cloud=null;cloudError='';cloudUpdatedAt=0;controller?.abort();cloudController?.abort();}
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
    const cloudAge=cloud?.lastAnalysisAt?Math.max(0,Math.floor((Date.now()-Date.parse(cloud.lastAnalysisAt))/1000)):null;
    const cloudActive=cloud?.scanOnline===true&&cloudAge!==null&&cloudAge<=190;
    cells.get('MONITORA').textContent=cloudActive?'Monitoraggio cloud ogni 60 secondi su '+Number(cloud.monitoredAssets||0)+' token, anche a telefono spento. WebSocket H24 non ancora attivo.':'Monitor cloud non verificato o temporaneamente non disponibile. WebSocket H24 non ancora attivo.';
    cells.get('REGISTRA').textContent=cloudActive?'Stato dei token ed eventi significativi registrati in Supabase. Nessun ordine eseguito.':'Archivio predisposto; lo stato dei nuovi eventi non è verificabile ora.';
    if(!cloud){cloudLine.textContent=cloudError?'Ricerca cloud · non disponibile':'Ricerca cloud · verifica in corso';cloudDetails.textContent=cloudError||'La ricerca server è indipendente dall’apertura di questa pagina.';}
    else{
      cloudLine.textContent=cloudActive?'Ricerca cloud attiva · ogni 60 s · '+Number(cloud.monitoredAssets||0)+' token monitorati · ultimo controllo '+cloudAge+' s fa':'Ricerca cloud · controllo non recente o non confermato';
      const t=cloud.token;
      if(!t)cloudDetails.textContent='Questa moneta non risulta nella raccolta cloud: le altre monete monitorate continuano ad essere controllate.';
      else if(t.status==='STALE'||!cloudActive)cloudDetails.textContent='Ultimi dati del token non recenti: sospese le valutazioni sul movimento.';
      else if(snapshot?.pair?.address && String(t.pool||'').toLowerCase()!==String(snapshot.pair.address).toLowerCase()){
        cloudDetails.textContent='La raccolta cloud misura una pool differente da quella mostrata qui: variazioni non confrontabili. La ricerca continua sul server.';
      }
      else{
        const pct=value=>Number.isFinite(value)?(value>=0?'+':'')+value.toLocaleString('it-IT',{maximumFractionDigits:2})+'%':'—';
        const observations='Prezzo 5 min '+pct(t.priceChange5mPct)+' · 15 min '+pct(t.priceChange15mPct)+' · liquidità 15 min '+pct(t.liquidityChange15mPct)+'.';
        const latest=(cloud.findings||[]).find(x=>Number.isFinite(Date.parse(x.at))&&Date.now()-Date.parse(x.at)<86400000);
        cloudDetails.textContent=observations+(latest?' Evento rilevato: '+latest.summary+' ('+pct(latest.changePct)+').':' Nessuna anomalia recente registrata.');
      }
    }
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
  async function loadCloud(){
    if(!box.open||document.hidden||cloudBusy)return;
    refresh();
    const target=address;
    cloudBusy=true;
    cloudController=new AbortController();
    const timer=setTimeout(()=>cloudController.abort(),10500);
    try{
      const query=target?'?address='+encodeURIComponent(target):'';
      const r=await fetch(CLOUD_URL+query,{signal:cloudController.signal,cache:'no-store'});
      const data=await r.json();
      if(target!==address)return;
      if(!r.ok||data.ok!==true){cloud=null;cloudError='Servizio di monitoraggio non raggiungibile: nessuna conferma H24.';}
      else {cloud=data;cloudError='';}
    }catch{if(target===address){cloud=null;cloudError='Controllo cloud temporaneamente non disponibile.';}}
    finally{clearTimeout(timer);cloudBusy=false;if(target===address)cloudUpdatedAt=Date.now();refresh();}
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
  box.append(header,description,cloudLine,cloudDetails,grid,report,sourceLink,note);
  box.addEventListener('toggle',()=>{refresh();if(box.open){load();loadCloud();}else{controller?.abort();cloudController?.abort();}});
  const metrics=parent.querySelector('.v271-metrics');
  if(metrics)metrics.insertAdjacentElement('afterend',box);
  else parent.insertBefore(box,parent.firstChild);
  refresh();
  setInterval(()=>{if(!box.isConnected)return;if(box.open){refresh();}},1000);
  setInterval(()=>{if(box.open&&!document.hidden)load()},15000);
  setInterval(()=>{if(box.open&&!document.hidden&&Date.now()-cloudUpdatedAt>=60000)loadCloud()},15000);
  document.addEventListener('visibilitychange',()=>{if(box.open&&!document.hidden){load();loadCloud()}});
  document.addEventListener('kiber:analysis-updated',()=>{if(box.open&&tokenAddress()!==address){refresh();load();loadCloud()}});
}
function enableMount(){
  if(document.getElementById('kiberBnbTradingPipeline'))return;
  mount();
  if(document.getElementById('kiberBnbTradingPipeline'))return;
  // The token detail overlay is created only when a user opens a coin.
  // Watch direct additions to body rather than polling hidden legacy panels.
  const observer=new MutationObserver(()=>{
    if(document.getElementById('v271TokenView')){
      mount();
      if(document.getElementById('kiberBnbTradingPipeline'))observer.disconnect();
    }
  });
  observer.observe(document.body,{childList:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',enableMount,{once:true});
else enableMount();
})();