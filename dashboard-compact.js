
/* Kiber Compact Dashboard V29: routes to existing tools and reads existing public APIs. */
(()=>{
'use strict';
const $=id=>document.getElementById(id), rootId='kiberCompactDashboard';
let busy=false,lastRefresh=0,sectorLatest=null,dailyTokens=[],compareRows=[];
function node(tag,cls,txt){const x=document.createElement(tag);if(cls)x.className=cls;if(txt!==undefined)x.textContent=txt;return x}
function fmtMoney(raw){const n=Number(raw);if(raw==null||raw===''||!Number.isFinite(n))return '—';const a=Math.abs(n);if(a>=1e12)return '$'+(n/1e12).toFixed(2)+'T';if(a>=1e9)return '$'+(n/1e9).toFixed(2)+'B';if(a>=1e6)return '$'+(n/1e6).toFixed(2)+'M';if(a>=1e3)return '$'+(n/1e3).toFixed(1)+'K';if(a>0&&a<1e-12)return '$'+n.toExponential(4);return '$'+n.toLocaleString('it-IT',{maximumFractionDigits:a<0.0001?12:a<1?8:2})}
function fmtPct(raw){const n=Number(raw);return raw==null||raw===''||!Number.isFinite(n)?'—':(n>0?'+':'')+n.toLocaleString('it-IT',{maximumFractionDigits:2})+'%'}
function navigateIntelligence(sub){
 $('v241Details')?.click();
 if(sub&&sub!=='chain')setTimeout(()=>document.querySelector('[data-v241-sub="'+sub+'"]')?.click(),90);
}
function navigate(action){
 if(action==='bnb'){navigate('market');return}
 if(action==='new'){navigateIntelligence('market');return}
 if(action==='defi'){navigateIntelligence('fundamentals');return}
 if(action==='compare'){openCompare();return}
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
 if(action==='refresh')void load(true);
}
function syncParent(){
 try{const p=window.parent;if(p&&p!==window){
   p.document.body.classList.toggle('kiber-compact-home',document.body.dataset.v241View==='home');
 }}catch{}
}
function renderSector(){
 const source=$('kiberMarketLeader'),target=$('kcdSectorText'),card=$('kcdSector');
 if(!target||!card)return;
 const raw=String(source?.textContent||'').trim();
 const m=!sectorLatest&&raw.match(/Settore con variazione TVL più alta nel campione:\s*(.*?)\s*·\s*(UP|DOWN|FLAT)\s*([+\u2212-]?[\d.,]+%)/i);
 if(m){sectorLatest={name:m[1],value:m[3],tone:m[2].toUpperCase()==='UP'?'up':m[2].toUpperCase()==='DOWN'?'down':'unknown',sample:sectorLatest?.sample||null}}
 if(!sectorLatest){target.textContent='Dati settore in attesa di verifica';card.dataset.tone='unknown';return}
 target.textContent=sectorLatest.name+'  '+sectorLatest.value+(sectorLatest.tvl!=null?'  ·  Capitale '+fmtMoney(sectorLatest.tvl):'');
 card.dataset.tone=sectorLatest.tone;
 card.title='TVL BNB Chain negli ultimi 7 giorni · campione limitato di '+(sectorLatest.sample||'alcuni')+' protocolli. Non indica l’andamento dei prezzi.';
 const info=card.querySelector('.kcd-leader-info');if(info)info.textContent='7G · TVL, non prezzo';
}
function updateSector(data){
 const stamp=Date.parse(data?.updatedAt||'');
 if(!Number.isFinite(stamp)||Math.abs(Date.now()-stamp)>48*60*60*1000)return;
 const sectors=Array.isArray(data?.sectors)?data.sectors:[];
 const valid=sectors.filter(x=>x&&Number.isFinite(Number(x.change7d))&&Number(x.count)>0&&Number(x.tvl)>0).sort((a,b)=>Number(b.change7d)-Number(a.change7d));
 if(!valid.length)return;
 const top=valid[0],v=Number(top.change7d),sample=Number(data.sampleSize);
 sectorLatest={name:String(top.name||'Settore'),value:fmtPct(v),tone:v>0?'up':v<0?'down':'unknown',sample:Number.isFinite(sample)?sample:null,tvl:Number(top.tvl)};
 renderSector()
}
function renderTokens(items){
 const host=$('kcdTokens');if(!host)return;host.replaceChildren();
 dailyTokens=(Array.isArray(items)?items:[]).filter(t=>/^0x[a-f0-9]{40}$/i.test(String(t.address||''))&&Number(t.metrics?.liquidityUsd)>=20000&&Number(t.metrics?.volume24h)>=10000&&Number.isFinite(Number(t.metrics?.change24h))&&Number(t.score)>=35).sort((a,b)=>Number(b.metrics.change24h)-Number(a.metrics.change24h)||Number(b.score)-Number(a.score));
 if(!dailyTokens.length){host.append(node('div','kcd-empty','Non ci sono candidati verificabili con i filtri attuali. Apri Nuovi token per esplorare le coppie.'));return}
 for(const t of dailyTokens.slice(0,4)){
   const button=node('button','kcd-row');button.type='button';
   const info=node('span');info.append(node('span','kcd-row-name',String(t.symbol||t.name||'Token').slice(0,34)));
   const extra=t.metrics||{},detail='24h · Liquidità '+fmtMoney(extra.liquidityUsd);
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
 const res=await Promise.allSettled([json('/api/chain?v=kcd29'),json('/api/discovery-v26?mode=daily&limit=40&v=307').catch(()=>json('/api/discovery-v26?limit=40&v=307')),json('/api/intelligence?type=sectors')]);
 if(res[0].status==='fulfilled')renderChain(res[0].value);
 else{const b=$('v241Bnb')?.textContent||'—',t=$('v241Tvl')?.textContent||'—';if($('kcdBnbPrice'))$('kcdBnbPrice').textContent=b;if($('kcdTvl'))$('kcdTvl').textContent=t}
 if(res[2].status==='fulfilled')updateSector(res[2].value);
 if(res[1].status==='fulfilled')renderTokens(res[1].value?.candidates||[]);
 else renderTokens([]);
 lastRefresh=Date.now();busy=false;if(refresh)refresh.disabled=false;renderSector();
}

function compareMoney(raw){return fmtMoney(raw)}
function openCompare(){
 let panel=$('kcdCompare');
 if(!panel){
  panel=node('section','kcd-compare');panel.id='kcdCompare';panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','true');panel.setAttribute('aria-label','Confronto token BNB');
  panel.innerHTML='<div class="kcd-compare-head"><div><strong>Confronta token</strong><small>Fino a 4 · prezzi, mercato e andamento reale</small></div><button id="kcdCompareClose" type="button" aria-label="Chiudi confronto">×</button></div><form id="kcdCompareForm"><input id="kcdCompareAddress" autocomplete="off" spellcheck="false" placeholder="Contratto token 0x… sulla BNB Chain" aria-label="Indirizzo contratto da aggiungere"><button type="submit">Aggiungi</button></form><div id="kcdCompareError" role="status" aria-live="polite"></div><div class="kcd-compare-picks" id="kcdComparePicks"></div><div class="kcd-compare-grid" id="kcdCompareRows"></div><p class="kcd-compare-note">Valore posseduto: stima da quantità inserita manualmente, non saldo rilevato dal wallet. Nessun ordine di acquisto o vendita.</p>';
  document.body.append(panel);$('kcdCompareClose').onclick=()=>{panel.hidden=true};$('kcdCompareForm').onsubmit=e=>{e.preventDefault();void addCompare({address:$('kcdCompareAddress').value.trim()})};
  panel.addEventListener('keydown',e=>{if(e.key==='Escape'){panel.hidden=true}});
 }
 panel.hidden=false;
 const host=$('kcdComparePicks');host.replaceChildren();
 for(const t of dailyTokens.slice(0,8)){const b=node('button','kcd-compare-chip','+ '+String(t.symbol||t.name||'Token').slice(0,14));b.type='button';b.title='Aggiungi '+String(t.name||t.symbol||'token');b.onclick=()=>void addCompare(t);host.append(b)}
 renderCompare();
 $('kcdCompareClose').focus();
}
async function addCompare(t){
 const address=String(t.address||'').trim().toLowerCase(),msg=$('kcdCompareError');
 if(!/^0x[a-f0-9]{40}$/.test(address)){msg.textContent='Inserisci un contratto BEP-20 valido.';return}
 if(compareRows.some(r=>r.address===address)){msg.textContent='Token già presente.';return}
 if(compareRows.length>=4){msg.textContent='Massimo 4 token. Rimuovine uno prima di aggiungerne altri.';return}
 msg.textContent='Verifico dati e storico del token…';
 try{
  const data=await json('/api/token-intel-v26?period=7d&address='+encodeURIComponent(address));
  if(!data?.token?.priceUsd||!data?.token?.address)throw Error('Prezzo verificabile non disponibile');
  if(compareRows.some(r=>r.address===address))return;
  compareRows.push({address,data});
  msg.textContent='';$('kcdCompareAddress').value='';renderCompare()
 }catch{msg.textContent='Token non disponibile nelle fonti BNB Chain. Nessun valore inventato.'}
}
function compareSpark(chart,values){
 const points=values.filter(x=>Number.isFinite(x));if(points.length<3)return;
 const min=Math.min(...points),max=Math.max(...points),range=max-min||Math.abs(max)||1;
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 240 65');svg.setAttribute('role','img');svg.setAttribute('aria-label','Andamento del prezzo osservato: ultime candele disponibili');
 const path=document.createElementNS('http://www.w3.org/2000/svg','path');const d=points.map((p,i)=>(i?'L':'M')+(i*239/(points.length-1)).toFixed(1)+' '+(59-(p-min)/range*53).toFixed(1)).join(' ');
 path.setAttribute('d',d);path.setAttribute('fill','none');path.setAttribute('stroke',points.at(-1)>=points[0]?'#5ae0a2':'#fc8895');path.setAttribute('stroke-width','2.5');svg.append(path);chart.append(svg)
}
function renderCompare(){
 const host=$('kcdCompareRows');if(!host)return;host.replaceChildren();
 if(!compareRows.length){host.append(node('p','kcd-empty','Aggiungi dai trend oppure inserisci il contratto di un token BNB Chain.'));return}
 for(const row of compareRows){
  const t=row.data.token,card=node('article','kcd-compare-item');
  const h=node('header','kcd-compare-item-head'),title=node('strong','',t.symbol||t.name||'Token'),close=node('button','','×');close.type='button';close.title='Rimuovi '+(t.symbol||'token');close.onclick=()=>{compareRows=compareRows.filter(r=>r!==row);renderCompare()};h.append(title,close);card.append(h);
  const stats=[['Prezzo',fmtMoney(t.priceUsd)],['24 ore',fmtPct(t.change24h)],['Capitalizzazione',fmtMoney(t.marketCap)],['Volume 24h',fmtMoney(t.volume24h)],['Liquidità',fmtMoney(t.liquidityUsd)],['RSI 14',row.data.technical?.rsi14!=null&&Number.isFinite(Number(row.data.technical.rsi14))?Number(row.data.technical.rsi14).toFixed(1):'—']];
  for(const [k,v] of stats){const line=node('div','kcd-compare-stat'),a=node('span','',k),b=node('b','',v);line.append(a,b);card.append(line)}
  const chart=node('div','kcd-compare-spark');const candles=row.data.chart?.candles||[];
  compareSpark(chart,candles.slice(-48).map(c=>Number(c?.[4])));card.append(chart);
  const field=node('label','kcd-compare-quantity','Quantità posseduta (manuale)');const input=node('input');input.type='number';input.min='0';input.step='any';input.placeholder='0';let saved=0;try{saved=Number(localStorage.getItem('kcd_qty_'+row.address))||0}catch{}
  input.value=saved>0?String(saved):'';const total=node('strong','kcd-compare-total');function recalc(){const q=Number(input.value),p=Number(t.priceUsd);total.textContent=q>0&&Number.isFinite(q)&&q<1e16&&p>0?'Valore stimato '+fmtMoney(q*p):'Valore stimato —';}
  input.addEventListener('input',()=>{try{if(Number(input.value)>=0)localStorage.setItem('kcd_qty_'+row.address,input.value)}catch{}recalc()});field.append(input);card.append(field,total);recalc();host.append(card)
 }
}


function enhanceProfile(){
 const drawer=$('profileDrawer'),button=$('profileBtn');if(!drawer||!button||drawer.dataset.kcdEnhanced)return;
 drawer.dataset.kcdEnhanced='1';
 const before=$('saveProfile'),wrap=node('div','kcd-profile-extra');
 wrap.innerHTML='<label class="kcd-profile-label">Foto profilo (solo in questo browser)<input id="kcdProfilePhoto" type="file" accept="image/png,image/jpeg,image/webp"></label><button type="button" id="kcdProfileRemovePhoto" class="kcd-icon-action">Rimuovi foto</button><label class="kcd-profile-label">Colore personale<input id="kcdProfileAccent" type="color" value="#23bbf6"></label><small>Nome, avatar, descrizione, tema e colore restano modificabili. La foto non viene caricata su server.</small>';
 if(before)before.before(wrap);else drawer.append(wrap);
 const photoKey='kiber_profile_photo',accentKey='kiber_profile_accent';
 function applyPhoto(){
  const a=$('avatar');if(!a)return;
  let data='',color='#23bbf6';try{data=localStorage.getItem(photoKey)||'';color=localStorage.getItem(accentKey)||color}catch{}
  if(!/^#[0-9a-f]{6}$/i.test(color))color='#23bbf6';
  const img=/^data:image\/(jpeg|png|webp);base64,/.test(data);
  a.style.backgroundImage=img?'url('+JSON.stringify(data)+')':'';
  a.style.backgroundPosition='center';a.style.backgroundSize='cover';a.style.backgroundRepeat='no-repeat';
  a.style.color=img?'transparent':'';a.style.minWidth='30px';a.style.minHeight='30px';
  a.style.border='2px solid '+color;
  button.style.borderColor=color;
  $('kcdProfileAccent').value=color;
 }
 $('kcdProfilePhoto').onchange=()=>{
  const file=$('kcdProfilePhoto').files?.[0];if(!file)return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>6000000){alert('Usa JPG, PNG o WebP sotto 6 MB.');return}
  const img=new Image();const url=URL.createObjectURL(file);
  img.onload=()=>{try{
   const cv=document.createElement('canvas');cv.width=128;cv.height=128;
   const ctx=cv.getContext('2d');if(!ctx)throw Error('Canvas unavailable');
   const edge=Math.min(img.width,img.height),sx=(img.width-edge)/2,sy=(img.height-edge)/2;
   ctx.drawImage(img,sx,sy,edge,edge,0,0,128,128);
   localStorage.setItem(photoKey,cv.toDataURL('image/webp',.75));
   applyPhoto();
  }catch{alert('Impossibile salvare la foto in questo browser.')}finally{URL.revokeObjectURL(url)}};
  img.onerror=()=>{URL.revokeObjectURL(url);alert('Immagine non leggibile.')};
  img.src=url
 };
 $('kcdProfileRemovePhoto').onclick=()=>{try{localStorage.removeItem(photoKey)}catch{}applyPhoto();const p=$('avatarSelect')?.value||'🤖';if($('avatar'))$('avatar').textContent=p};
 $('kcdProfileAccent').oninput=e=>{try{localStorage.setItem(accentKey,e.target.value)}catch{}applyPhoto()};
 before?.addEventListener('click',()=>setTimeout(applyPhoto,60));
 window.addEventListener('storage',e=>{if(e.key===photoKey||e.key===accentKey)applyPhoto()});
 applyPhoto();
}

function mount(){
 const home=$('v241Home');if(!home||$(rootId))return false;enhanceProfile();
 const brand=document.querySelector('.brand-shell');if(brand&&!brand.dataset.kcdAi){brand.dataset.kcdAi='1';brand.setAttribute('role','button');brand.tabIndex=0;brand.title='Apri Kiber AI';brand.addEventListener('click',()=>navigate('ai'));brand.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();navigate('ai')}})}
 const box=node('section');box.id=rootId;box.setAttribute('aria-label','Dashboard compatta Kiber');
 box.innerHTML=[
  '<div class="kcd-header"><div><h1>BNB Chain</h1><p>Trend giornalieri e accesso al catalogo token</p></div><button id="kcdRefresh" type="button" class="kcd-icon-action" data-kcd-action="refresh" aria-label="Aggiorna dati">↻</button></div>',
  '<nav class="kcd-nav" aria-label="Analisi principali">',
  '<button type="button" data-kcd-action="bnb" aria-label="Apri il catalogo delle monete BNB Chain"><span class="kcd-nav-icon">⬡</span>BNB Chain</button>',
  '<button type="button" data-kcd-action="new"><span class="kcd-nav-icon">✦</span>Nuovi token</button>',
  '<button type="button" data-kcd-action="defi"><span class="kcd-nav-icon">▱</span>DeFi</button>',
  '<button type="button" data-kcd-action="compare"><span class="kcd-nav-icon">⚖</span>Confronta</button></nav>',
  '<div class="kcd-leader" id="kcdSector" data-tone="unknown"><span class="kcd-leader-symbol" aria-hidden="true">▥</span>',
  '<div class="kcd-leader-main"><small>Settore più forte per crescita del capitale DeFi · 7G</small><strong class="kcd-leader-value" id="kcdSectorText">Verifica in corso…</strong></div>',
  '<span class="kcd-leader-info">7 giorni · TVL ≠ prezzo</span></div>',
  '<section class="kcd-card"><header class="kcd-card-head"><h2>Trend del giorno · 24h</h2><button type="button" data-kcd-action="market">Tutte le monete ›</button></header>',
  '<div class="kcd-list" id="kcdTokens"><div class="kcd-empty">Caricamento delle selezioni disponibili…</div></div><p class="kcd-sample-note">Pool di tendenza BNB Chain, ordinati per variazione 24h e filtrati per liquidità e attività. Non è l’intero mercato.</p></section>',
  '<div class="kcd-metrics" aria-label="Dati di mercato">',
  '<div><span>Prezzo BNB</span><strong id="kcdBnbPrice">—</strong></div>',
  '<div title="Valore degli asset depositati nei protocolli DeFi della BNB Chain; non è capitalizzazione di mercato"><span>TVL DeFi BNB</span><strong id="kcdTvl">—</strong></div>',
  '<div title="Valore totale delle compravendite su exchange decentralizzati BNB Chain nelle ultime 24 ore"><span>Volume DEX 24h</span><strong id="kcdDex">—</strong></div></div>',
  '<p class="kcd-footnote"><span id="kcdUpdated">Caricamento…</span>. Trend BNB da GeckoTerminal; variazioni passate non indicano guadagni futuri.</p>',
  '<nav class="kcd-dock" aria-label="Navigazione rapida">',
  '<button type="button" data-kcd-action="home"><span>⌂</span>Home</button>',
  '<button type="button" data-kcd-action="search"><span>⌕</span>Cerca</button>',
  
  '<button type="button" data-kcd-action="watch"><span>☆</span>Preferiti</button>',
  '<button type="button" data-kcd-action="profile"><span>⚙</span>Profilo</button></nav>',
  
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
