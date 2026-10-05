(()=>{
'use strict';
const V='27.2',$=id=>document.getElementById(id),q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const validAddress=x=>/^0x[a-fA-F0-9]{40}$/.test(String(x||'').trim());
const state={health:null,healthAt:0,searchBusy:false};
async function j(url,opt={},timeout=8500){const c=new AbortController(),t=setTimeout(()=>c.abort(),timeout);try{const r=await fetch(url,{...opt,signal:c.signal});let d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d?.error||String(r.status));return d}finally{clearTimeout(t)}}
function mark(){document.body.classList.add('v272');document.documentElement.dataset.kiberVersion=V;const st=q('.brand-live');if(st)st.textContent='V27.2 · ORACLE LAB';}
function watchList(){try{return JSON.parse(localStorage.getItem('kiber_v271_watch')||'[]')}catch{return[]}}
function ensureOverlay(){
  if($('v272Overlay'))return;
  const o=document.createElement('div');o.id='v272Overlay';o.className='v272-overlay';o.innerHTML='<section class="v272-dialog" role="dialog" aria-modal="true"><header><div><span>KIBER V27.2</span><b id="v272Title">Strumento</b></div><button id="v272Close" aria-label="Chiudi">×</button></header><div id="v272Body" class="v272-body"></div></section>';document.body.appendChild(o);
  $('v272Close').onclick=closeOverlay;o.onclick=e=>{if(e.target===o)closeOverlay()};
}
function openOverlay(title,html){ensureOverlay();$('v272Title').textContent=title;$('v272Body').innerHTML=html;$('v272Overlay').classList.add('open')}
function closeOverlay(){$('v272Overlay')?.classList.remove('open')}
function ensureTools(){
  if($('v272Tools'))return;
  const host=$('v266Home')||$('v241Home');if(!host)return;
  const t=document.createElement('section');t.id='v272Tools';t.className='v272-tools';t.innerHTML='<button id="v272Search"><span>⌕</span><div><b>Ricerca universale</b><small>Nome, simbolo o contratto BNB Chain</small></div></button><button id="v272Health"><span id="v272HealthDot" class="v272-dot wait"></span><div><b>Stato sistema</b><small id="v272HealthText">Controllo fonti…</small></div></button>';
  host.insertBefore(t,host.children[1]||null);$('v272Search').onclick=()=>searchDialog('');$('v272Health').onclick=()=>showHealth(true);
}
function searchDialog(seed=''){
  openOverlay('Ricerca token',`<div class="v272-search"><input id="v272SearchInput" placeholder="Cerca token o incolla contratto BNB Chain" value="${esc(seed)}"><button id="v272SearchGo">Analizza</button></div><div id="v272SearchResults" class="v272-results"><div class="v272-note">Cerca una moneta. Kiber userà il contratto BSC quando disponibile e lo storico di mercato come fallback.</div></div>`);
  const go=()=>runSearch($('v272SearchInput')?.value||'');$('v272SearchGo').onclick=go;$('v272SearchInput').onkeydown=e=>{if(e.key==='Enter')go()};setTimeout(()=>$('v272SearchInput')?.focus(),50);if(seed)go();
}
async function runSearch(raw){
  const term=String(raw||'').trim(),box=$('v272SearchResults');if(!term||!box||state.searchBusy)return;
  if(validAddress(term)){closeOverlay();window.kiberOpenToken?.(term);return}
  state.searchBusy=true;box.innerHTML='<div class="v272-loading">Ricerca CoinGecko…</div>';
  try{const d=await j('/api/coingecko?type=find&q='+encodeURIComponent(term)+'&v=272');const items=(d.items||[]).slice(0,12);box.innerHTML=items.length?items.map(x=>`<button class="v272-result" data-v272-id="${esc(x.id)}"><img src="${esc(x.image||'')}" alt=""><div><b>${esc(x.symbol||'')} · ${esc(x.name||'')}</b><small>${x.price==null?'Prezzo —':'$'+Number(x.price).toLocaleString('it-IT',{maximumFractionDigits:Number(x.price)<1?8:2})} · rank ${esc(x.rank??'—')}</small></div><span>Analizza →</span></button>`).join(''):'<div class="v272-note">Nessun risultato abbastanza preciso.</div>';qa('[data-v272-id]',box).forEach(b=>b.onclick=()=>{const id=b.dataset.v272Id;closeOverlay();window.kiberOpenCoin?.(id)})}catch(e){box.innerHTML='<div class="v272-error">Ricerca temporaneamente non disponibile. Riprova tra poco.</div>'}finally{state.searchBusy=false}
}
async function health(force=false){
  if(!force&&state.health&&Date.now()-state.healthAt<60000)return state.health;
  const tests=[
    ['Mercato','/api/coingecko?type=health&v=272'],
    ['BNB Chain','/api/chain?v=272'],
    ['Intelligence','/api/intelligence?v=272'],
    ['News','/api/news-v26?v=272'],
    ['Kiber AI','/api/kiber?v=272']
  ];
  const started=performance.now(),rows=await Promise.all(tests.map(async([name,url])=>{const t=performance.now();try{const d=await j(url,{cache:'no-store'},7000);return{name,ok:true,ms:Math.round(performance.now()-t),detail:name==='Kiber AI'?(d.ai?`IA · ${d.provider||'provider'}`:'fallback deterministico'):(d.source?String(Array.isArray(d.source)?d.source.join(' + '):d.source):'online'),ai:name==='Kiber AI'?!!d.ai:null}}catch(e){return{name,ok:false,ms:Math.round(performance.now()-t),detail:'non disponibile'}}}));
  const dom=[
    ['Scanner token',typeof window.kiberOpenCoin==='function'&&typeof window.kiberOpenToken==='function'],
    ['Ricerca',!!($('tokenSearch')||$('v241MarketInput'))],
    ['Kiber chat',!!$('v268Chat')],
    ['Profilo',!!$('profileBtn')],
    ['Avvisi',!!$('alertsBtn')]
  ].map(([name,ok])=>({name,ok,ms:null,detail:ok?'collegato':'da verificare'}));
  state.health={rows:[...rows,...dom],elapsed:Math.round(performance.now()-started)};state.healthAt=Date.now();syncHealthChip();return state.health;
}
function syncHealthChip(){
  const h=state.health;if(!h)return;const failed=h.rows.filter(x=>!x.ok).length,ai=h.rows.find(x=>x.name==='Kiber AI'),dot=$('v272HealthDot'),txt=$('v272HealthText');if(dot)dot.className='v272-dot '+(failed?'bad':ai&&!ai.ai?'warn':'good');if(txt)txt.textContent=failed?`${failed} moduli da verificare`:ai&&!ai.ai?'Dati attivi · IA esterna in fallback':'Fonti principali operative';
}
async function showHealth(force=false){
  openOverlay('Stato sistema','<div class="v272-loading">Test delle fonti e dei comandi…</div>');const h=await health(force);const box=$('v272Body');if(!box)return;box.innerHTML=`<div class="v272-health-summary"><b>${h.rows.filter(x=>x.ok).length}/${h.rows.length} moduli collegati</b><span>Test completato in ${h.elapsed} ms</span></div><div class="v272-health-list">${h.rows.map(x=>`<div><i class="${x.ok?'ok':'no'}"></i><span><b>${esc(x.name)}</b><small>${esc(x.detail)}${x.ms!=null?' · '+x.ms+' ms':''}</small></span></div>`).join('')}</div><button class="v272-refresh-health" id="v272RefreshHealth">Ricontrolla tutto</button>`;$('v272RefreshHealth').onclick=()=>showHealth(true);
}
function renderWatch(){
  const list=watchList();['v241Watch','watchTotal','watchTotal2','watchCountNav'].forEach(id=>{if($(id))$(id).textContent=String(list.length)});
  const sec=$('section-watch'),body=sec&&q('.section-body',sec);if(!body)return;let box=$('v272WatchBridge');if(!box){box=document.createElement('div');box.id='v272WatchBridge';box.className='v272-watch';body.insertBefore(box,body.firstChild)}
  box.innerHTML=`<div class="v272-watch-head"><div><span>MONITORATI KIBER</span><b>${list.length} asset</b></div><small>Salvati dal nuovo scanner</small></div>${list.length?list.map(x=>`<button data-v272-watch="${esc(x.key)}"><div><b>${esc(x.symbol||'TOKEN')} · ${esc(x.name||'Asset')}</b><small>${x.address?'BNB Chain contract':'CoinGecko market id'}</small></div><span>Apri →</span></button>`).join(''):'<div class="v272-note">Non hai ancora aggiunto monete ai monitorati.</div>'}`;
  qa('[data-v272-watch]',box).forEach((b,i)=>b.onclick=()=>{const x=list[i];if(!x)return;x.id?window.kiberOpenCoin?.(x.id):x.address&&window.kiberOpenToken?.(x.address)});
}
function interceptSearch(e){
  const btn=e.target.closest?.('#searchBtn,#v241MarketGo');if(btn){e.preventDefault();e.stopImmediatePropagation();const raw=$('v241MarketInput')?.value||$('tokenSearch')?.value||'';searchDialog(raw);return}
}
function keys(e){
  if(e.key!=='Enter')return;const el=e.target;if(el?.id==='tokenSearch'||el?.id==='v241MarketInput'){e.preventDefault();e.stopImmediatePropagation();searchDialog(el.value||'')}
}
function boot(){
  mark();ensureOverlay();ensureTools();renderWatch();document.addEventListener('click',interceptSearch,true);document.addEventListener('keydown',keys,true);
  window.addEventListener('storage',renderWatch);window.addEventListener('kiber-watch-change',renderWatch);setTimeout(()=>{ensureTools();renderWatch();health().catch(()=>{})},900);setInterval(()=>{mark();ensureTools();renderWatch()},3500);
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();