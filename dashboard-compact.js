
/* Kiber Compact Dashboard V29: routes to existing tools and reads existing public APIs. */
(()=>{
'use strict';
const $=id=>document.getElementById(id), rootId='kiberCompactDashboard';
let busy=false,lastRefresh=0;
function node(tag,cls,txt){const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x}
function fmtMoney(raw){const n=Number(raw);if(raw==null||raw===''||!Number.isFinite(n))return '—';const a=Math.abs(n);if(a>=1e12)return '$'+(n/1e12).toFixed(2)+'T';if(a>=1e9)return '$'+(n/1e9).toFixed(2)+'B';if(a>=1e6)return '$'+(n/1e6).toFixed(2)+'M';if(a>=1e3)return '$'+(n/1e3).toFixed(1)+'K';return '$'+n.toLocaleString('it-IT',{maximumFractionDigits:a<1?5:2})}
function fmtPct(raw){const n=Number(raw);return raw==null||raw===''||!Number.isFinite(n)?'—':(n>0?'+':'')+n.toLocaleString('it-IT',{maximumFractionDigits:2})+'%'}
function navigateIntelligence(sub){
 $('v241Details')?.click();
 if(sub&&sub!=='chain')setTimeout(()=>document.querySelector('[data-v241-sub="'+sub+'"]')?.click(),90);
}
function navigate(action){
 if(action==='bnb'){navigateIntelligence('chain');return}
 if(action==='new'){navigateIntelligence('market');return}
 if(action==='defi'){navigateIntelligence('fundamentals');return}
 if(action==='compare'){navigateIntelligence('compare');return}
 if(action==='market'){document.querySelector('[data-v241-open="market"]')?.click();return}
 if(action==='watch'){document.querySelector('[data-v241-open="market"]')?.click();setTimeout(()=>document.querySelector('[data-v241-sub="watch"]')?.click(),90);return}
 if(action==='news'){document.querySelector('[data-v241-open="news"]')?.click();return}
 if(action==='search'){$('v272Search')?.click();return}
 if(action==='ai'){if($('kiberFab'))$('kiberFab').click();else document.querySelector('[data-v241-open="kiber"]')?.click();return}
 if(action==='profile'){$('profileBtn')?.click();return}
 if(action==='gold'){
   try{const p=window.parent;if(p&&p!==window){const b=p.document.getElementById('switchGold');if(b){b.click();return}}}catch{}
   $('xauUsdNav')?.click();return
 }
 if(action==='home'){$('v241Back')?.click();document.getElementById(rootId)?.scrollIntoView({block:'start',behavior:'smooth'});return}
 if(action==='details'){
   document.body.classList.toggle('kcd-expanded');
   const expanded=document.body.classList.contains('kcd-expanded');
   const b=$('kcdDetails');if(b){b.textContent=expanded?'Vista compatta':'Mostra tutto';b.setAttribute('aria-expanded',String(expanded))}
   syncParent();return
 }
 if(action==='refresh')void load(true);
}
function syncParent(){
 try{const p=window.parent;if(p&&p!==window){
   p.document.body.classList.toggle('kiber-compact-home',document.body.dataset.v241View==='home'&&!document.body.classList.contains('kcd-expanded'));
 }}catch{}
}
function renderSector(){
 const source=$('kiberMarketLeader'),target=$('kcdSectorText'),card=$('kcdSector');
 if(!target||!card)return;
 const s=String(source?.textContent||'').trim();
 const m=s.match(/Settore con variazione TVL più alta nel campione:\s*(.*?)\s*·\s*(UP|DOWN|FLAT)\s*([+\u2212-]?[\d.,]+%)/i);
 if(!m){target.textContent='Settore: dati non disponibili';card.dataset.tone='unknown';return}
 target.textContent=m[1]+'  '+m[3];
 card.dataset.tone=m[2].toUpperCase()==='UP'?'up':m[2].toUpperCase()==='DOWN'?'down':'unknown';
 card.title='Variazione TVL a 7 giorni, su un campione limitato di protocolli. Non è una variazione di prezzo.';
}
function renderTokens(items){
 const host=$('kcdTokens');if(!host)return;host.replaceChildren();
 if(!Array.isArray(items)||items.length===0){host.append(node('div','kcd-empty','Non ci sono candidati verificabili con i filtri attuali. Apri Nuovi token per esplorare le coppie.'));return}
 for(const t of items.slice(0,4)){
   const button=node('button','kcd-row');button.type='button';
   const info=node('span');info.append(node('span','kcd-row-name',String(t.symbol||t.name||'Token').slice(0,34)));
   const extra=t.metrics||{},detail=extra.liquidityUsd!=null?'Liquidità '+fmtMoney(extra.liquidityUsd):'Apri analisi e rischio';
   info.append(node('span','kcd-row-sub',detail));
   let value=extra.priceChange24h??extra.change24h??t.priceChange24h??t.change24h;
   const score=Number(t.score),priceLabel=fmtPct(value);
   const right=node('span','kcd-row-price',priceLabel!=='—'?priceLabel:Number.isFinite(score)?Math.round(score)+'/100':'—');
   if(priceLabel!=='—'&&Number(value)!==0)right.classList.add(Number(value)>0?'up':'down');
   const arrow=node('span','kcd-row-arrow','›');arrow.setAttribute('aria-hidden','true');
   button.append(info,right,arrow);
   button.setAttribute('aria-label','Apri analisi di '+String(t.name||t.symbol||'token'));
   button.onclick=()=>{
     if(t.address&&typeof window.kiberOpenToken==='function'){window.kiberOpenToken(t.address);return}
     navigate('search');
     setTimeout(()=>{const input=$('v272SearchInput');if(input&&t.address){input.value=t.address;$('v272SearchGo')?.click()}},120);
   };
   host.append(button)
 }
}
function renderChain(data){
 const b=data?.bnb||{},c=data?.chain||{};
 const set=(id,val)=>{const el=$(id);if(el)el.textContent=val};
 set('kcdBnbPrice',fmtMoney(b.price));
 set('kcdTvl',fmtMoney(c.tvl));
 set('kcdDex',fmtMoney(c.dexVolume24));
 const update=data?.updatedAt||b.updatedAt||c.updatedAt;
 let label='Valori secondo le fonti disponibili';
 if(update){const d=new Date(update);if(Number.isFinite(d.getTime()))label='Dati: '+d.toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}
 set('kcdUpdated',label);
}
async function json(url){const r=await fetch(url,{cache:'no-store',signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error('Dati non disponibili');return r.json()}
async function load(force=false){
 if(busy||(!force&&Date.now()-lastRefresh<90000))return;busy=true;
 const refresh=$('kcdRefresh');if(refresh)refresh.disabled=true;
 const res=await Promise.allSettled([json('/api/chain?v=kcd29'),json('/api/discovery-v26?v=kcd29')]);
 if(res[0].status==='fulfilled')renderChain(res[0].value);
 else{const b=$('v241Bnb')?.textContent||'—',t=$('v241Tvl')?.textContent||'—';if($('kcdBnbPrice'))$('kcdBnbPrice').textContent=b;if($('kcdTvl'))$('kcdTvl').textContent=t}
 if(res[1].status==='fulfilled')renderTokens(res[1].value?.candidates||[]);
 else renderTokens([]);
 lastRefresh=Date.now();busy=false;if(refresh)refresh.disabled=false;renderSector();
}
function mount(){
 const home=$('v241Home');if(!home||$(rootId))return false;
 const box=node('section');box.id=rootId;box.setAttribute('aria-label','Dashboard compatta Kiber');
 box.innerHTML=[
  '<div class="kcd-header"><div><h1>Panoramica BNB</h1><p>Il necessario, senza riquadri inutili</p></div><button id="kcdRefresh" type="button" class="kcd-icon-action" data-kcd-action="refresh" aria-label="Aggiorna dati">↻</button></div>',
  '<nav class="kcd-nav" aria-label="Analisi principali">',
  '<button type="button" data-kcd-action="bnb"><span class="kcd-nav-icon">⬡</span>BNB</button>',
  '<button type="button" data-kcd-action="new"><span class="kcd-nav-icon">✦</span>Nuovi token</button>',
  '<button type="button" data-kcd-action="defi"><span class="kcd-nav-icon">▱</span>DeFi</button>',
  '<button type="button" data-kcd-action="compare"><span class="kcd-nav-icon">⚖</span>Confronta</button></nav>',
  '<div class="kcd-leader" id="kcdSector" data-tone="unknown"><span class="kcd-leader-symbol" aria-hidden="true">▥</span>',
  '<div class="kcd-leader-main"><small>Settore con maggiore variazione TVL nel campione</small><strong class="kcd-leader-value" id="kcdSectorText">Verifica in corso…</strong></div>',
  '<span class="kcd-leader-info">7 giorni · TVL ≠ prezzo</span></div>',
  '<section class="kcd-card"><header class="kcd-card-head"><h2>Token da osservare</h2><button type="button" data-kcd-action="new">Vedi tutti ›</button></header>',
  '<div class="kcd-list" id="kcdTokens"><div class="kcd-empty">Caricamento delle selezioni disponibili…</div></div></section>',
  '<div class="kcd-metrics" aria-label="Dati di mercato">',
  '<div><span>Prezzo BNB</span><strong id="kcdBnbPrice">—</strong></div>',
  '<div><span>Capitale DeFi</span><strong id="kcdTvl">—</strong></div>',
  '<div><span>Scambi DEX 24h</span><strong id="kcdDex">—</strong></div></div>',
  '<p class="kcd-footnote"><span id="kcdUpdated">Caricamento…</span>. Candidati da Kiber Discovery; punteggi non equivalgono a rendimento o sicurezza.</p>',
  '<nav class="kcd-dock" aria-label="Navigazione rapida">',
  '<button type="button" data-kcd-action="home"><span>⌂</span>Home</button>',
  '<button type="button" data-kcd-action="ai"><span>✧</span>Analisi</button>',
  '<button type="button" data-kcd-action="gold"><span>🟡</span>Oro</button>',
  '<button type="button" data-kcd-action="watch"><span>♧</span>Monitorati</button>',
  '<button type="button" data-kcd-action="profile"><span>⚙</span>Profilo</button></nav>',
  '<div style="text-align:center;padding:10px 0"><button type="button" id="kcdDetails" class="kcd-icon-action" data-kcd-action="details" aria-expanded="false">Mostra tutto</button></div>'
 ].join('');
 home.prepend(box);
 box.addEventListener('click',e=>{const b=e.target.closest('[data-kcd-action]');if(b){e.preventDefault();navigate(b.dataset.kcdAction)}});
 renderSector();void load();
 return true
}
function init(){
 let count=0;const timer=setInterval(()=>{count++;if(mount()||count>40)clearInterval(timer)},250);
 const refresh=()=>{syncParent();if(document.body.dataset.v241View==='home'){renderSector();if(!document.hidden)void load()}};
 setInterval(refresh,12000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});
 document.addEventListener('click',()=>setTimeout(syncParent,80),true);
 setTimeout(refresh,1000)
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();
