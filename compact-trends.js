/* Compact, readable Kibernetic cards and factual token/sector trend panel. */
(()=>{
'use strict';
const $=id=>document.getElementById(id), T=window.KiberTrendMetrics;
if(!T)return;
const foldKey='kiber_fold_preferences_v1';
let folds={};try{folds=JSON.parse(localStorage.getItem(foldKey)||'{}')||{}}catch{}
const FOLDS=[
  {selector:'#kiberAccessGuide',key:'project',open:false,keep:'.guide-kicker,h2'},
  {selector:'.v266-now',key:'summary',open:true,keep:'.v266-title'},
  {selector:'.v266-forecast-grid .v266-forecast:first-child',key:'bnb-card',open:true,keep:'.v266-pill'},
  {selector:'.v266-forecast-grid .v266-forecast:last-child',key:'chain-card',open:true,keep:'.v266-pill'},
  {selector:'.v269-chart',key:'bnb-chart',open:true,keep:'.v269-head'},
  {selector:'#v28MainForecast',key:'bnboracle',open:false,keep:'h2,h3,span:first-child'},
  {selector:'#freeScanner',key:'scanner',open:false,keep:'.free-scanner-head'},
  {selector:'#kiberAutoToken',key:'token-report',open:false,keep:'header,h2:first-child'},
  {selector:'#v277Sectors',key:'sectors',open:false,keep:'h3:first-child'}
];
let sectorData=null,loadedAt=0,inflight=null,renderHash='',summaryText='',lastFetchAttempt=0;
function store(){try{localStorage.setItem(foldKey,JSON.stringify(folds))}catch{}}
function toggle(host,key,open){
  folds[key]=!!open;store();
  host.dataset.kiberFoldClosed=open?'0':'1';
  const button=host.querySelector(':scope > .kiber-fold-toggle');
  if(button){button.setAttribute('aria-expanded',String(!!open));button.setAttribute('aria-label',(open?'Chiudi':'Apri')+' sezione');button.textContent=open?'⌃':'⌄';button.title=(open?'Chiudi':'Apri')+' sezione';}
  if(open)window.dispatchEvent(new Event('resize'));
}
function enhanceFold(cfg){
 const host=document.querySelector(cfg.selector);if(!host||host.hidden)return;
 if(host.dataset.kiberFoldKey!==cfg.key)host.dataset.kiberFoldKey=cfg.key;
 host.classList.add('kiber-fold-host');
 for(const child of host.children){
   if(child.classList.contains('kiber-fold-toggle'))continue;
   const directHeader=(cfg.key==='bnb-card'||cfg.key==='chain-card')&&child===host.firstElementChild;
   if(directHeader||child.matches(cfg.keep))child.setAttribute('data-kiber-fold-keep','1');
 }
 let btn=host.querySelector(':scope > .kiber-fold-toggle');
 if(!btn){
   btn=document.createElement('button');btn.type='button';btn.className='kiber-fold-toggle';
   btn.setAttribute('aria-label','Apri o chiudi sezione');
   host.append(btn);
   btn.onclick=e=>{e.preventDefault();e.stopPropagation();toggle(host,cfg.key,host.dataset.kiberFoldClosed==='1')};
 }
 if(host.dataset.kiberFoldClosed!==(folds[cfg.key]===undefined?(cfg.open?'0':'1'):(folds[cfg.key]?'0':'1'))){
   const open=folds[cfg.key]===undefined?cfg.open:folds[cfg.key];
   host.dataset.kiberFoldClosed=open?'0':'1';
 }
 const open=host.dataset.kiberFoldClosed!=='1';
 btn.setAttribute('aria-expanded',String(open));btn.setAttribute('aria-label',(open?'Chiudi':'Apri')+' sezione');btn.title=(open?'Chiudi':'Apri')+' sezione';
 btn.textContent=open?'⌃':'⌄';
}
function requestSectors(){
 if(inflight||Date.now()-lastFetchAttempt<180000)return inflight;
 if(sectorData&&Date.now()-loadedAt<600000)return null;
 if(document.hidden)return null;
 lastFetchAttempt=Date.now();
 inflight=(async()=>{
   try{
     const res=await fetch('/api/intelligence?type=sectors',{signal:AbortSignal.timeout(25000)});
     if(!res.ok)throw Error('Settori non disponibili');
     const data=await res.json();
     if(!T.validFeed(data))throw Error('Settori non aggiornati');
     sectorData=data;loadedAt=Date.now();
   }catch{if(sectorData&&!T.validFeed(sectorData))sectorData=null;}
   finally{inflight=null;renderHash='';renderAll()}
 })();
 return inflight;
}
function make(tag,cls,label){const e=document.createElement(tag);if(cls)e.className=cls;if(label!==undefined)e.textContent=label;return e;}
function tone(node,data){
 node.classList.remove('kiber-up','kiber-down','kiber-flat','kiber-unknown');
 node.classList.add('kiber-'+(data?.state||'unknown'));
}
function renderOne(node,label,value,detail){
 node.replaceChildren(make('small','',label),make('strong','',value),make('span','',detail||''));
}
function appendTrendCard(){
 const panel=$('v271TokenView'),hero=panel?.querySelector('.v271-hero');
 if(!hero||!panel.classList.contains('open'))return;
 const ctx=window.kiberTokenContext?.(),coin=ctx?.coin;
 if(!coin||!(coin.id||coin.address))return;
 let container=$('kiberTokenTrend');
 if(!container){container=make('section','kiber-trend-panel');container.id='kiberTokenTrend';container.innerHTML='<div class="kiber-trend-title"><strong>Trend del momento</strong><small>Variazione token 24h · settori TVL 7 giorni</small></div><div class="kiber-trend-grid"><div id="kiberTrendToken"></div><div id="kiberTrendSector"></div><div id="kiberTrendLeader"></div></div><p id="kiberTrendNote"></p>';}
 const auto=$('kiberAutoToken');
 if(auto?.isConnected&&auto.parentElement===hero.parentElement){if(container.previousElementSibling!==auto)auto.after(container);}
 else if(container.previousElementSibling!==hero)hero.after(container);
 const token=T.periodChange(coin.change24??ctx.intel?.token?.change24h);
 const classified=T.matchingSector(coin,sectorData,window.KiberWatch);
 const leader=T.strongest(sectorData);
 const key=JSON.stringify([coin.id,coin.address,coin.change24,classified.name,classified.value,leader?.name,leader?.value,sectorData?.updatedAt]);
 if(container.dataset.renderKey===key)return;
 container.dataset.renderKey=key;
 const tk=$('kiberTrendToken'),sect=$('kiberTrendSector'),lead=$('kiberTrendLeader');
 const tokenText=token.state==='unknown'?'DATI MANCANTI':token.label+' '+T.percentage(token.value);
 const sectorText=classified.state==='unknown'?'NON VERIFICABILE':classified.label+' '+T.percentage(classified.value);
 renderOne(tk,'TOKEN · 24 ORE',tokenText,coin.symbol||coin.name||'Moneta');
 renderOne(sect,'SETTORE · TVL 7 GIORNI',sectorText,classified.name||'Non classificato');
 const leadText=leader?(leader.label+' '+T.percentage(leader.value)):'NON DISPONIBILE';
 renderOne(lead,'SETTORE PIÙ FORTE NEL CAMPIONE',leadText,leader?.name||'Campione non aggiornato');
 tone(tk,token);tone(sect,classified);tone(lead,leader);
 $('kiberTrendNote').textContent=leader
  ? 'Settori: variazione TVL BNB Chain degli ultimi 7 giorni, campione di '+leader.sample+' protocolli (fonte DefiLlama). Non misura il prezzo dei token e non indica automaticamente un settore in cui investire. Dati del '+new Date(leader.updatedAt).toLocaleString('it-IT')+'.'
  : 'Trend settore non verificabile finché non sono disponibili dati recenti. Non deduco la direzione dai soli nomi delle monete.';
 summaryText='Token '+(coin.symbol||coin.name)+': '+tokenText+' nelle 24 ore. Settore '+classified.name+': '+sectorText+' (TVL 7 giorni). Settore più forte nel campione: '+(leader?.name||'non disponibile')+' '+leadText+'.';
 window.kiberCurrentTrendSummary=()=>summaryText;
}
function marketLeader(){
 const guide=$('kiberAccessGuide'),home=$('v241Home');if(!guide||!home)return;
 let box=$('kiberMarketLeader');
 if(!box){box=make('div','kiber-market-leader');box.id='kiberMarketLeader';guide.after(box);}
 const leader=T.strongest(sectorData);
 const label=leader?'Settore con variazione TVL più alta nel campione: '+leader.name+' · '+leader.label+' '+T.percentage(leader.value):'Settore più forte: dati non ancora verificabili';
 if(box.textContent!==label)box.textContent=label;
 box.className='kiber-market-leader '+(leader?'kiber-'+leader.state:'kiber-unknown');
 box.title=leader?'Indicatore TVL a 7 giorni su campione limitato, non variazione dei prezzi':'Servizio settori in attesa di dati recenti';
 window.kiberMarketSectorSummary=()=>leader?'Nel campione TVL BNB Chain di '+leader.sample+' protocolli, il settore con variazione maggiore a 7 giorni è '+leader.name+' ('+leader.label+' '+T.percentage(leader.value)+'). Questo non misura il prezzo dei token e non è una raccomandazione di acquisto.':'Settori: dati recenti non disponibili. Non posso indicare un settore favorito.';
}

function sectorOf(info){
 const c=window.KiberWatch?.sector?.(info||{});
 if(c?.name&&c.name!=='Non classificato'&&c.name!=='Altro')return c.name;
 return ({binancecoin:'Layer 1 & Layer 2',chainlink:'Data & Oracle','pancakeswap-token':'DeFi'})[String(info?.id||'').toLowerCase()]||'Non classificato';
}
function usd(v,compact=false){
 if(v===null||v===undefined||v==='')return '—';
 const n=Number(v);if(!Number.isFinite(n))return '—';
 if(compact){
  const x=Math.abs(n),d=x>=1e12?1e12:x>=1e9?1e9:x>=1e6?1e6:x>=1e3?1e3:1;
  const suffix=d===1e12?' T':d===1e9?' Mld':d===1e6?' Mln':d===1e3?' mila':'';
  return '$'+(n/d).toLocaleString('it-IT',{maximumFractionDigits:2})+suffix;
 }
 return '$'+n.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:Math.abs(n)<1?6:2});
}
function compactBnb(){
 const host=document.querySelector('.v269-chart.kiber-fold-host'),head=host?.querySelector(':scope > .v269-head');
 if(!head)return;
 let panel=host.querySelector(':scope > #kiberBnbCompact');
 if(!panel){
  panel=make('div','kiber-bnb-compact');panel.id='kiberBnbCompact';panel.dataset.kiberFoldKeep='1';
  panel.innerHTML='<div class="kiber-bnb-compact-grid"><div data-bnb-stat="price"><small>PREZZO BNB (USD)</small><strong>—</strong></div><div data-bnb-stat="cap"><small>MARKET CAP</small><strong>—</strong></div><div data-bnb-stat="volume"><small>VOLUME 24H</small><strong>—</strong></div><div data-bnb-stat="change"><small>VARIAZIONE 24H</small><strong>—</strong></div></div><div class="kiber-bnb-compact-note">Settore: <b>Layer 1 &amp; Layer 2</b> · Market cap e volume non sono il TVL della blockchain.</div>';
  head.after(panel);
 }
 const coin=(window.kiberCatalogContext?.()||[]).find(x=>x?.id==='binancecoin'||String(x?.symbol||'').toUpperCase()==='BNB');
 const validPrice=coin?.price!==null&&coin?.price!==undefined&&Number.isFinite(Number(coin.price));
 const chartLast=document.getElementById('v269Last')?.textContent?.trim();
 const price=validPrice?usd(coin.price):(chartLast&&chartLast!=='—'?chartLast:'—');
 const change=coin?.change24==null?null:Number(coin.change24);
 const vals={
  price:[validPrice?'PREZZO BNB (USD)':'ULTIMA CANDELA (USDT)',price],
  cap:['MARKET CAP',usd(coin?.marketCap,true)],
  volume:['VOLUME 24H',usd(coin?.volume24,true)],
  change:['VARIAZIONE 24H',Number.isFinite(change)?T.percentage(change):'—']
 };
 for(const [key,[label,value]] of Object.entries(vals)){
  const tile=panel.querySelector('[data-bnb-stat="'+key+'"]'),s=tile?.querySelector('small'),b=tile?.querySelector('strong');if(!s||!b)continue;
  if(s.textContent!==label)s.textContent=label;if(b.textContent!==value)b.textContent=value;
  if(key==='change'){b.classList.toggle('kiber-positive',Number.isFinite(change)&&change>0);b.classList.toggle('kiber-negative',Number.isFinite(change)&&change<0);}
 }
}
function enhanceSearch(){
 const catalog=window.kiberCatalogContext?.()||[],search=window.kiberSearchContext?.()||[];
 const byId=new Map([...catalog,...search].filter(x=>x?.id).map(x=>[String(x.id),x]));
 for(const row of document.querySelectorAll('#v272SearchResults [data-v272-id],#v21CatalogList [data-v21-id]')){
  const info=byId.get(row.dataset.v272Id||row.dataset.v21Id);if(!info)continue;
  const sector=sectorOf(info),label='Settore: '+sector;
  let tag=row.querySelector('.kiber-search-sector,.kiber-search-trend');
  if(!tag){
   tag=make('small','kiber-search-sector');
   (row.querySelector('.v21-name>div:last-child,.v272-result>div')||row).append(tag);
  }
  tag.className='kiber-search-sector';if(tag.textContent!==label)tag.textContent=label;
  tag.title=sector==='Non classificato'?'Categoria non disponibile nei dati attuali':'Settore di appartenenza del token';
 }
}
function renderAll(){
 for(const cfg of FOLDS)enhanceFold(cfg);
 compactBnb();
 appendTrendCard();
 marketLeader();
 enhanceSearch();
}
function init(){
 document.addEventListener('click',e=>{if(e.target.closest?.('#freeScanNav')){const s=$('freeScanner');if(s)toggle(s,'scanner',true);}},true);
 document.addEventListener('kiber:token-loading',()=>{$('kiberTokenTrend')?.remove();summaryText='';window.kiberCurrentTrendSummary=()=>'';renderHash='';},{passive:true});
 document.addEventListener('kiber:live-updated',renderAll,{passive:true});
 renderAll();
 setTimeout(()=>{requestSectors();renderAll()},1500);
 setInterval(()=>{if(!document.hidden){renderAll();requestSectors()}},2400);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden){renderAll();requestSectors()}});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
