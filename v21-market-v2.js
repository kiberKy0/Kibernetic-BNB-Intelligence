(()=>{
  const CATALOG='/api/coingecko';
  const DIRECT='https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&category=binance-smart-chain&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=24h';
  const CACHE_KEY='kiber_v21_catalog_cache';
  const V21={items:[],visible:60,mode:'catalog',sort:'rank',selected:null,source:'CoinGecko',page:1,hasMore:true,loadingMore:false,sectorFilter:'all'};
  const $=id=>document.getElementById(id);
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(+v)?'$'+(+v).toLocaleString('it-IT',{maximumFractionDigits:+v<1?8:2}):'—';
  const compact=v=>{if(v===null||v===undefined||v===''||!Number.isFinite(Number(v)))return '—';v=Number(v);return v>=1e12?'$'+(v/1e12).toFixed(2)+'T':v>=1e9?'$'+(v/1e9).toFixed(2)+'B':v>=1e6?'$'+(v/1e6).toFixed(2)+'M':v>=1e3?'$'+(v/1e3).toFixed(1)+'K':money(v)};
  const pct=v=>v===null||v===undefined||v===''||!Number.isFinite(Number(v))?'—':`${Number(v)>=0?'+':''}${Number(v).toLocaleString('it-IT',{maximumFractionDigits:2})}%`;
  const get=async url=>{const r=await fetch(url,{headers:{Accept:'application/json'}});if(!r.ok)throw new Error(String(r.status));return r.json()};
  const directRow=x=>({id:x.id,symbol:String(x.symbol||'').toUpperCase(),name:x.name||'',image:x.image||'',rank:x.market_cap_rank??null,marketCap:x.market_cap??null,price:x.current_price??null,change24:x.price_change_percentage_24h??null,volume24:x.total_volume??null,address:'',representation:'BNB Chain Ecosystem'});

  function hardenProfile(){
    const theme=$('themeSelect');
    if(theme){const label=theme.closest('label');if(label){label.hidden=true;label.style.display='none'}}
    const drawer=q('#profileDrawer .drawer-head small');if(drawer)drawer.textContent='Preferenze profilo';
  }

  function cleanupLegacy(){
    qa('#v21CatalogTools,.market-catalog-tools').forEach(x=>x.remove());
    const oldList=$('v21CatalogList');if(oldList&&oldList.dataset.owner!=='v21v2')oldList.remove();
  }

  function setVersion(){document.title='Kiber BNB Intelligence V21';const st=$('v20Status')||$('v21Status');if(st){st.id='v21Status';st.textContent='V21 · KIBER BNB INTELLIGENCE · CATALOGO MERCATO'}const eye=q('.hero .eyebrow');if(eye)eye.textContent='KIBER BNB INTELLIGENCE · V21'}

  function ensureDossier(){
    try{if(typeof ensureDossierPanel==='function')ensureDossierPanel()}catch{}
    const btn=q('#hubNav [data-section="dossier"]');if(btn){const b=btn.querySelector('b');if(b)b.textContent='🗂️ Dossier';const s=btn.querySelector('span');if(s&&!s.textContent.trim())s.textContent='Apri'}
  }

  function buildCatalog(){
    cleanupLegacy();const body=q('#section-market .section-body');if(!body)return;
    const h=q('#section-market .section-head h2'),p=q('#section-market .section-head p');if(h)h.textContent='Catalogo Mercato';if(p)p.textContent='Catalogo dell’ecosistema BNB, non elenco di tutti i contratti BSC. Il contratto viene verificato nella scheda.';
    let tools=$('v21Tools');if(!tools){tools=document.createElement('div');tools.id='v21Tools';tools.innerHTML=`<div class="v21-tabs"><button type="button" data-v21="catalog" class="active">Classifica BNB</button><button type="button" data-v21="chain">Mercato on-chain</button></div><div class="v21-sortline"><select id="v21Sort"><option value="rank">Posizione globale</option><option value="marketCap">Capitalizzazione</option><option value="volume24">Volume 24h</option><option value="change24">Variazione 24h</option></select><a href="https://www.coingecko.com/en/categories/binance-smart-chain" target="_blank" rel="noopener">Apri CoinGecko ↗</a></div><div class="v21-source"><span><b>Fonte:</b> CoinGecko · BNB Chain Ecosystem</span><span id="v21Meta">Caricamento…</span></div>`;body.insertBefore(tools,body.firstChild);qa('[data-v21]',tools).forEach(b=>b.onclick=()=>setMode(b.dataset.v21));$('v21Sort').onchange=e=>{V21.sort=e.target.value;renderCatalog()}}
    if($('v21Tools')&&!$('v21SectorFilter')){
      const wrap=document.createElement('div');wrap.id='v21SectorFilters';wrap.className='v21-sector-filters';
      const label=document.createElement('label');label.htmlFor='v21SectorFilter';label.textContent='Filtra settore';
      const sel=document.createElement('select');sel.id='v21SectorFilter';sel.setAttribute('aria-label','Filtra i token per settore');
      const opts=[['all','Tutti i settori'],...(window.KiberSector?.taxonomy||[]).map(x=>[x.name,x.name]),['Da verificare','Da verificare']];
      opts.forEach(([value,text])=>{const opt=document.createElement('option');opt.value=value;opt.textContent=text;sel.appendChild(opt)});
      sel.value='all';sel.addEventListener('change',()=>{V21.sectorFilter=sel.value;V21.visible=60;renderCatalog()});
      const quick=document.createElement('div');quick.className='v21-sector-chips';quick.setAttribute('aria-label','Settori principali');
      [['all','Tutti'],['Meme coin','Meme coin'],['Gaming & Metaverse','Gaming'],['AI & Compute','IA'],['Data & Oracle','Oracoli'],['DeFi','DeFi'],['Layer 1','Layer 1'],['Stablecoin','Stablecoin'],['RWA','RWA']].forEach(([value,name])=>{
        const b=document.createElement('button');b.type='button';b.dataset.v21Sector=value;b.textContent=name;b.setAttribute('aria-pressed',value==='all'?'true':'false');
        b.addEventListener('click',()=>{V21.sectorFilter=value;sel.value=value;V21.visible=60;renderCatalog()});
        quick.appendChild(b);
      });
      const note=document.createElement('small');note.id='v21SectorCoverage';note.className='v21-sector-coverage';note.textContent='Categorie in caricamento…';
      wrap.append(label,sel,quick,note);$('v21Tools').appendChild(wrap);
    }
    if($('v21Tools')&&!$('v21SectorSourceNote')){const note=document.createElement('p');note.id='v21SectorSourceNote';note.className='v21-sector-source-note';note.textContent='Settori: categorie CoinGecko o progetti identificati. “Da verificare” indica che la fonte non ha fornito una categoria attendibile.';$('v21Tools').after(note)}
    let list=$('v21CatalogList');if(!list){list=document.createElement('div');list.id='v21CatalogList';list.dataset.owner='v21v2';list.className='token-list v21-catalog-list';const old=$('marketList');old.parentNode.insertBefore(list,old)}
  }

  function sorted(items=V21.items){const a=[...items];if(V21.sort==='marketCap')a.sort((x,y)=>(y.marketCap||0)-(x.marketCap||0));else if(V21.sort==='volume24')a.sort((x,y)=>(y.volume24||0)-(x.volume24||0));else if(V21.sort==='change24')a.sort((x,y)=>(y.change24||0)-(x.change24||0));else a.sort((x,y)=>(x.rank??999999)-(y.rank??999999));return a}

  function rowHtml(x){const sector=window.KiberSector?.classify(x)||{name:'Da verificare',detail:'Metadati non disponibili',source:'Da verificare'};const c=x.change24==null?null:Number(x.change24),rank=x.rank?`#${x.rank}`:'—',logo=x.image?`<img src="${safe(x.image)}" alt="Logo ${safe(x.symbol)}" loading="lazy" decoding="async" referrerpolicy="no-referrer">`:`<span>${safe(String(x.symbol||'?').slice(0,3))}</span>`;return `<article class="v21-row" data-v21-id="${safe(x.id)}"><div class="v21-rank"><small>Rank</small><b>${rank}</b></div><div class="v21-name"><div class="v21-logo">${logo}</div><div><b>${safe(x.name)}</b><small>${safe(x.symbol)} · ecosistema BNB</small></div></div><div class="v21-stat v21-price"><small>Prezzo</small><b>${money(x.price)}</b></div><div class="v21-stat v21-cap"><small>Market cap</small><b>${compact(x.marketCap)}</b></div><div class="v21-stat v21-change"><small>24h</small><b class="${c>=0?'up':'down'}">${pct(c)}</b></div><div class="v21-stat v21-volume"><small>Volume 24h</small><b>${compact(x.volume24)}</b></div><div class="v21-sector" title="${safe(sector.source)}"><small>Settore</small><b>${safe(sector.name)}</b><em>${safe(sector.detail||sector.source)}</em></div><button type="button" class="v21-analyze">Apri token</button></article>`}

  function bindRows(){qa('#v21CatalogList [data-v21-id]').forEach(r=>{const x=V21.items.find(z=>z.id===r.dataset.v21Id);if(!x)return;const go=e=>{e?.stopPropagation();analyzeItem(x)};r.onclick=go;r.querySelector('.v21-analyze')?.addEventListener('click',go)})}

  function renderCatalog(items=V21.items){
    const list=$('v21CatalogList');if(!list)return;
    const filter=V21.sectorFilter||'all',source=sorted(items);
    const a=filter==='all'?source:source.filter(x=>(window.KiberSector?.classify(x).name||'Da verificare')===filter);
    const shown=a.slice(0,V21.visible);
    list.innerHTML=shown.length?shown.map(rowHtml).join(''):'<div class="v21-empty">Nessun token classificato in questo settore tra le monete attualmente caricate. Non significa che il settore non esista nella BNB Chain.</div>';
    if(a.length>shown.length){
      const b=document.createElement('button');b.className='secondary v21-more';b.type='button';b.textContent='Mostra altri '+Math.min(60,a.length-shown.length)+' token';b.onclick=()=>{V21.visible+=60;renderCatalog(items)};list.appendChild(b);
    }else if(items===V21.items&&V21.hasMore&&V21.page<5){
      const b=document.createElement('button');b.className='secondary v21-more';b.type='button';b.disabled=V21.loadingMore;b.textContent=V21.loadingMore?'Caricamento…':'Cerca altri token nel catalogo (pagina '+(V21.page+1)+')';b.onclick=loadMoreCatalog;list.appendChild(b);
    }
    bindRows();
    if(!sectorTimer)sectorTimer=setInterval(verifyVisibleSectors,17500);
    setTimeout(verifyVisibleSectors,1000);
    const coverage=$('v21SectorCoverage');
    const numUnknown=V21.items.filter(x=>window.KiberSector?.classify(x).verified!==true).length;
    if(coverage)coverage.textContent=(filter==='all'?'Settori nel catalogo':filter)+': '+a.length+' token caricati · '+numUnknown+' ancora da verificare. I numeri riguardano solo il campione disponibile.';
    qa('#v21SectorFilters [data-v21-sector]').forEach(b=>{const active=b.dataset.v21Sector===filter;b.classList.toggle('active',active);b.setAttribute('aria-pressed',String(active))});
    const sel=$('v21SectorFilter');if(sel&&sel.value!==filter)sel.value=filter;
    if($('marketCount'))$('marketCount').textContent=a.length+' token';
    if($('v21Meta'))$('v21Meta').textContent=shown.length+'/'+a.length+' token · '+V21.source;
  }

    let sectorTimer=null;
  const checkedSectors=new Set();
  function updateSectorRow(id){
    const row=qa('#v21CatalogList .v21-row').find(x=>x.dataset.v21Id===id);if(!row)return;
    const coin=V21.items.find(x=>x.id===id);if(!coin)return;
    const c=window.KiberSector?.classify(coin);if(!c)return;
    const sector=row.querySelector('.v21-sector');if(!sector)return;
    sector.title=c.source;
    const name=sector.querySelector('b'),detail=sector.querySelector('em');
    if(name)name.textContent=c.name;if(detail)detail.textContent=c.detail||c.source;
    if(V21.sectorFilter!=='all'&&c.name!==V21.sectorFilter)renderCatalog();
  }
  function verifyVisibleSectors(){
    if(document.hidden||!window.KiberSector)return;
    for(const row of qa('#v21CatalogList .v21-row')){
      const rect=row.getBoundingClientRect();
      if(rect.bottom<0||rect.top>window.innerHeight+200)continue;
      const item=V21.items.find(x=>x.id===row.dataset.v21Id);
      if(!item||checkedSectors.has(item.id)||window.KiberSector.classify(item).verified)continue;
      checkedSectors.add(item.id);
      void window.KiberSector.enrich(item).then(()=>updateSectorRow(item.id));
      break;
    }
  }

  function saveCache(items){try{localStorage.setItem(CACHE_KEY,JSON.stringify({at:Date.now(),items:items.slice(0,1250)}))}catch{}}
  function loadCache(){try{const d=JSON.parse(localStorage.getItem(CACHE_KEY)||'null');return Array.isArray(d?.items)?d:null}catch{return null}}

  async function proxyCatalog(){const d=await get(CATALOG+'?type=bsc&per_page=250&page=1');if(!Array.isArray(d.items)||!d.items.length)throw new Error('vuoto');return {items:d.items,source:d.stale?'CoinGecko cache server':'CoinGecko'}}
  async function directCatalog(){const d=await get(DIRECT);if(!Array.isArray(d)||!d.length)throw new Error('vuoto');return {items:d.map(directRow),source:'CoinGecko diretto'}}


  async function loadMoreCatalog(){
    if(V21.loadingMore||!V21.hasMore||V21.page>=5)return;
    V21.loadingMore=true;
    renderCatalog();
    const nextPage=V21.page+1;
    try{
      const d=await get(CATALOG+'?type=bsc&per_page=250&page='+nextPage);
      if(!Array.isArray(d.items))throw Error('Formato inatteso');
      const known=new Set(V21.items.map(x=>x.id)),fresh=d.items.filter(x=>x&&x.id&&!known.has(x.id));
      V21.page=nextPage;
      V21.hasMore=nextPage<5&&d.items.length===250&&fresh.length>0;
      V21.items=[...V21.items,...fresh];
      V21.visible=Math.min(V21.visible+60,V21.items.length);
      V21.source='CoinGecko · '+V21.page+' pagine caricate';
      saveCache(V21.items);
      if(!fresh.length) V21.source='CoinGecko · altre monete non disponibili';
    }catch(e){
      const reason=String(e?.message||'');
      V21.source='CoinGecko · altre pagine non disponibili'+(reason==='503'?' (limite API)':'');
    }finally{V21.loadingMore=false;renderCatalog()}
  }

  async function loadCatalog(){setMode('catalog',false);const list=$('v21CatalogList');if(list)list.innerHTML='<div class="muted">Caricamento catalogo ecosistema BNB…</div>';let result=null;try{result=await proxyCatalog()}catch{try{result=await directCatalog()}catch{const c=loadCache();if(c)result={items:c.items,source:'ultima cache valida'}}}if(result){V21.items=result.items;V21.source=result.source;V21.visible=60;V21.page=1;V21.hasMore=V21.items.length>=250;saveCache(V21.items);renderCatalog();return}if(list)list.innerHTML='<div class="v21-empty">CoinGecko non risponde in questo momento. Il Mercato on-chain resta disponibile e non vengono mostrati valori inventati.</div>';if($('v21Meta'))$('v21Meta').textContent='Fonte temporaneamente non disponibile'}

  function setMode(mode,rerender=true){V21.mode=mode==='chain'?'chain':'catalog';const isCatalog=V21.mode==='catalog';for(const el of qa('#v21Tools .v21-sortline,#v21Tools .v21-source,#v21SectorFilters')){el.hidden=!isCatalog;el.style.display=isCatalog?'flex':'none'}const help=$('v21ModeHelp');if(help)help.textContent=isCatalog?'Classifica: prezzo, capitalizzazione, variazione e volume.':'On-chain: pool di scambio, liquidità e attività sulla BNB Chain.';qa('#v21Tools [data-v21]').forEach(b=>b.classList.toggle('active',b.dataset.v21===V21.mode));const old=$('marketList'),catalog=$('v21CatalogList'),filters=q('#section-market .filters');if(V21.mode==='catalog'){if(old)old.style.display='none';if(filters)filters.style.display='none';if(catalog)catalog.style.display='';if(rerender)renderCatalog()}else{if(catalog)catalog.style.display='none';if(old)old.style.display='';if(filters)filters.style.display='';try{if(typeof applyFilters==='function')applyFilters()}catch{}}}

  async function resolveAddress(x){
    const valid=a=>/^0x[a-f0-9]{40}$/i.test(String(a||''));
    if(valid(x.address))return x.address;
    // A ticker symbol is not a unique on-chain identity. Never guess the contract.
    try{
      const r=await get(CATALOG+'?type=resolve&id='+encodeURIComponent(x.id));
      if(r.onBsc&&valid(r.address))return r.address;
    }catch{}
    return '';
  }

  async function analyzeItem(x){V21.selected=x;const btn=q(`[data-v21-id="${CSS.escape(x.id)}"] .v21-analyze`);if(btn){btn.disabled=true;btn.textContent='Apro…'}try{const address=await resolveAddress(x);if(address&&typeof openToken==='function'){await openToken(address);decorateLab(x);if(typeof openSection==='function')openSection('lab');return}const input=$('tokenSearch');if(input)input.value=x.symbol||x.name;setMode('chain');if(typeof searchToken==='function')await searchToken()}finally{if(btn){btn.disabled=false;btn.textContent='Apri token'}}}

  function decorateLab(x=V21.selected){if(!x)return;const sub=$('labSub');if(!sub)return;let box=q('.v21-lab-meta',sub.parentElement);if(!box){box=document.createElement('div');box.className='v21-lab-meta';sub.insertAdjacentElement('afterend',box)}box.innerHTML=`<span>Posizione globale <b>${x.rank?'#'+x.rank:'—'}</b></span><span>Market cap <b>${compact(x.marketCap)}</b></span><span>Volume globale 24h <b>${compact(x.volume24)}</b></span><span>Fonte <b>CoinGecko</b></span>`}

  async function searchCatalog(){const t=$('tokenSearch')?.value.trim()||'';if(!t)return;if(/^0x[a-fA-F0-9]{40}$/.test(t)){setMode('chain');try{await searchToken()}catch{}return}setMode('catalog',false);V21.sectorFilter='all';const list=$('v21CatalogList');if(list)list.innerHTML='<div class="muted">Ricerca CoinGecko…</div>';try{const d=await get(CATALOG+'?type=find&q='+encodeURIComponent(t)),a=d.items||[];if(a.length){const merged=new Map([...a,...V21.items].map(x=>[x.id,x]));V21.items=[...merged.values()];list.innerHTML='<div class="v21-search-note">Risultati CoinGecko</div>'+a.map(rowHtml).join('');bindRows();if($('marketCount'))$('marketCount').textContent=a.length+' risultati';if($('v21Meta'))$('v21Meta').textContent='Ricerca CoinGecko';return}}catch{}setMode('chain');try{await searchToken()}catch{}}

  function bindSearch(){const b=$('searchBtn'),i=$('tokenSearch');if(b)b.onclick=searchCatalog;if(i)i.onkeydown=e=>{if(e.key==='Enter')searchCatalog()}}

  window.kiberCatalogContext=()=>V21.items.map(x=>({...x}));
  function boot(){hardenProfile();setVersion();buildCatalog();ensureDossier();bindSearch();setTimeout(()=>{hardenProfile();ensureDossier()},400);setTimeout(()=>{hardenProfile();ensureDossier()},1200);loadCatalog()}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();