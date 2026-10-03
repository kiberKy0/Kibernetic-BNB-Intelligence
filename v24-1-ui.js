(()=>{
  const V='24.1',q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],id=x=>document.getElementById(x);
  const S={chain:null,intel:null,view:'home',sub:null};
  const n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
  const money=v=>{v=n(v);if(v===null)return'—';const a=Math.abs(v);if(a>=1e12)return'$'+(v/1e12).toFixed(2)+'T';if(a>=1e9)return'$'+(v/1e9).toFixed(2)+'B';if(a>=1e6)return'$'+(v/1e6).toFixed(2)+'M';if(a>=1e3)return'$'+(v/1e3).toFixed(1)+'K';return'$'+v.toLocaleString('it-IT',{maximumFractionDigits:2})};
  const pct=v=>{v=n(v);return v===null?'—':`${v>=0?'+':''}${v.toLocaleString('it-IT',{maximumFractionDigits:2})}%`};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

  function forceVersion(){
    document.documentElement.dataset.kiberVersion=V;
    document.title=`Kiber BNB Intelligence V${V}`;
    const st=q('.brand-live')||id('v24Status')||id('v23Status')||id('v22Status')||id('v21Status')||id('v20Status');
    if(st){st.id='v241Status';st.textContent=`V${V} · KIBER BNB INTELLIGENCE`}
    const eye=q('.hero .eyebrow');if(eye)eye.textContent=`KIBER BNB INTELLIGENCE · V${V}`;
  }

  function buildHome(){
    if(id('v241Home'))return;
    const main=q('main');if(!main)return;
    const home=document.createElement('section');home.id='v241Home';home.className='v241-home';home.innerHTML=`
      <div class="v241-brief">
        <span class="v241-kicker">KIBER OGGI</span>
        <h1 id="v241Headline">Sto leggendo la BNB Chain…</h1>
        <p class="v241-brief-summary" id="v241Summary">Prezzo, attività DEX e segnali stanno venendo collegati in una sola lettura.</p>
        <div class="v241-brief-signal"><span class="v241-dot" id="v241Dot"></span><span id="v241Signal">Preparazione sintesi…</span></div>
        <div class="v241-brief-actions"><button class="v241-btn primary" id="v241Why">Analizza perché</button><button class="v241-btn" id="v241Details">Apri dettagli</button></div>
      </div>
      <div class="v241-metrics">
        <div class="v241-metric"><span>BNB</span><b id="v241Bnb">—</b><small id="v241BnbMove">prezzo live</small></div>
        <div class="v241-metric"><span>TVL BSC</span><b id="v241Tvl">—</b><small>capitale DeFi</small></div>
        <div class="v241-metric"><span>DEX 24H</span><b id="v241Dex">—</b><small id="v241DexMove">attività on-chain</small></div>
        <div class="v241-metric"><span>Segnali</span><b id="v241Signals">—</b><small>eventi rilevanti</small></div>
      </div>
      <div class="v241-cards">
        <button class="v241-card" data-v241-open="market"><span class="v241-card-icon">◫</span><b>Mercato</b><p>Token, ricerca, DEX Radar e monitorati.</p><em>→</em></button>
        <button class="v241-card" data-v241-open="intelligence"><span class="v241-card-icon">◎</span><b>Intelligence</b><p>Chain Pulse, fondamentali, confronto e dossier.</p><em>→</em></button>
        <button class="v241-card" data-v241-open="news"><span class="v241-card-icon">◉</span><b>News & Eventi</b><p>Crypto, macro, SEC e collegamenti al mercato.</p><em>→</em></button>
        <button class="v241-card" data-v241-open="kiber"><span class="v241-card-icon">K</span><b>Kiber AI</b><p>Chiedi cosa sta succedendo, perché e cosa controllare.</p><em>→</em></button>
      </div>
      <div class="v241-statusline"><span>Monitorati <b id="v241Watch">0</b></span><i></i><span>Alert <b id="v241Alerts">0</b></span><i></i><span id="v241Updated">Dati in aggiornamento</span></div>`;
    main.insertBefore(home,main.firstElementChild);
    qa('[data-v241-open]',home).forEach(b=>b.onclick=()=>show(b.dataset.v241Open));
    id('v241Why').onclick=()=>askWhy();
    id('v241Details').onclick=()=>show('intelligence','chain');
  }

  function buildWorkbar(){
    if(id('v241Workbar'))return;
    const main=q('main');if(!main)return;
    const bar=document.createElement('div');bar.id='v241Workbar';bar.className='v241-workbar';bar.innerHTML=`<div class="v241-workbar-left"><button class="v241-back" id="v241Back" aria-label="Torna alla home">←</button><div class="v241-worktitle"><span>KIBER</span><b id="v241WorkTitle">Mercato</b></div></div><div class="v241-subnav" id="v241Subnav"></div>`;
    const home=id('v241Home');home?.insertAdjacentElement('afterend',bar);
    id('v241Back').onclick=()=>show('home');
  }

  function setPanel(panel){
    qa('.panel.v241-show,#v24Center.v241-show').forEach(x=>x.classList.remove('v241-show'));
    if(panel){panel.classList.add('v241-show');if(panel.classList.contains('panel'))panel.classList.add('open')}
  }

  function subnav(items,active){
    const box=id('v241Subnav');if(!box)return;
    box.innerHTML=items.map(x=>`<button data-v241-sub="${x.key}" class="${x.key===active?'active':''}">${esc(x.label)}</button>`).join('');
    qa('[data-v241-sub]',box).forEach(b=>b.onclick=()=>show(S.view,b.dataset.v241Sub));
  }

  function ensureMarketSearch(panel){
    if(!panel||id('v241MarketSearch'))return;
    const body=q('.section-body',panel);if(!body)return;
    const s=document.createElement('div');s.id='v241MarketSearch';s.className='v241-market-search';s.innerHTML='<input id="v241MarketInput" placeholder="Cerca token o contract BNB Chain"><button type="button" id="v241MarketGo">Cerca</button>';
    body.insertBefore(s,body.firstChild);
    const go=()=>{const v=id('v241MarketInput')?.value.trim();if(!v)return;const old=id('tokenSearch');if(old)old.value=v;id('searchBtn')?.click()};
    id('v241MarketGo').onclick=go;id('v241MarketInput').onkeydown=e=>{if(e.key==='Enter')go()};
  }

  function show(view,sub){
    S.view=view||'home';S.sub=sub||null;document.body.dataset.v241View=S.view;
    const title=id('v241WorkTitle');
    if(S.view==='home'){setPanel(null);if(title)title.textContent='Home';return}
    if(S.view==='market'){
      const key=S.sub||'catalog';const items=[{key:'catalog',label:'Mercato'},{key:'analysis',label:'Analisi token'},{key:'watch',label:'Monitorati'}];subnav(items,key);
      let panel=key==='analysis'?id('section-lab'):key==='watch'?id('section-watch'):id('section-market');setPanel(panel);if(title)title.textContent=key==='analysis'?'Analisi token':key==='watch'?'Monitorati':'Mercato';if(key==='catalog')ensureMarketSearch(panel);
    }else if(S.view==='intelligence'){
      const key=S.sub||'chain';const items=[{key:'chain',label:'Chain Pulse'},{key:'market',label:'DEX Radar'},{key:'fundamentals',label:'Fondamentali'},{key:'compare',label:'Confronta'},{key:'sectors',label:'Settori'},{key:'dossier',label:'Dossier'}];subnav(items,key);
      if(key==='sectors'){setPanel(id('section-sectors'));if(title)title.textContent='Intelligence · Settori'}
      else if(key==='dossier'&&id('section-dossier')){setPanel(id('section-dossier'));if(title)title.textContent='Intelligence · Dossier'}
      else{const center=id('v24Center');setPanel(center);if(center){qa('#v24Tabs button').forEach(b=>{if(b.dataset.v24===key)b.click()})}if(title)title.textContent='Intelligence'}
    }else if(S.view==='news'){
      const key=S.sub||'news';subnav([{key:'news',label:'News'},{key:'macro',label:'Macro & SEC'}],key);setPanel(key==='macro'?id('section-macro'):id('section-news'));if(title)title.textContent=key==='macro'?'Macro & SEC':'News & Eventi';
    }else if(S.view==='kiber'){
      subnav([{key:'chat',label:'Chiedi a Kiber'}],'chat');setPanel(id('section-kiber'));if(title)title.textContent='Kiber AI';
    }
    setTimeout(()=>id('v241Workbar')?.scrollIntoView({behavior:'smooth',block:'start'}),30);
  }

  async function loadSummary(){
    try{
      const [cr,ir]=await Promise.allSettled([fetch('/api/chain?v=241',{cache:'no-store'}),fetch('/api/intelligence?v=241',{cache:'no-store'})]);
      if(cr.status==='fulfilled'&&cr.value.ok)S.chain=await cr.value.json();
      if(ir.status==='fulfilled'&&ir.value.ok)S.intel=await ir.value.json();
    }catch{}
    renderSummary();
  }

  function renderSummary(){
    const b=S.chain?.bnb||{},c=S.chain?.chain||{},i=S.intel?.chain||{},events=S.intel?.events||[];
    const bp=n(b.price),bm=n(b.change24),dex=n(c.dexVolume24??i.dexVolume24),dexMove=n(i.dexChange1d),tvl=n(c.tvl??i.tvl);
    if(id('v241Bnb'))id('v241Bnb').textContent=money(bp);if(id('v241BnbMove'))id('v241BnbMove').textContent=bm===null?'24h —':pct(bm)+' · 24h';
    if(id('v241Tvl'))id('v241Tvl').textContent=money(tvl);if(id('v241Dex'))id('v241Dex').textContent=money(dex);if(id('v241DexMove'))id('v241DexMove').textContent=dexMove===null?'attività DEX':pct(dexMove)+' · attività';if(id('v241Signals'))id('v241Signals').textContent=String(events.length);
    let tone='mixed',headline='BNB Chain sotto osservazione',signal='Dati misti: serve leggere i segnali insieme.';
    if(bm!==null&&dexMove!==null&&bm>0&&dexMove>0){tone='up';headline='BNB e attività DEX stanno accelerando';signal='Prezzo e attività DEX si muovono nella stessa direzione.'}
    else if(bm!==null&&dexMove!==null&&bm<0&&dexMove<0){tone='down';headline='BNB e attività DEX stanno rallentando';signal='Prezzo e attività DEX mostrano pressione nello stesso verso.'}
    else if(bm!==null){headline=bm>=0?'BNB è positiva, ma il quadro va confermato':'BNB è sotto pressione, ma il quadro va contestualizzato';signal=`BNB ${pct(bm)} nelle 24h${events.length?` · ${events.length} segnali rilevati`:''}.`}
    if(id('v241Headline'))id('v241Headline').textContent=headline;
    if(id('v241Summary'))id('v241Summary').textContent=`BNB ${money(bp)} · TVL BSC ${money(tvl)} · DEX 24h ${money(dex)}. Kiber mostra qui solo il quadro essenziale; i dettagli restano nelle sezioni interne.`;
    const dot=id('v241Dot');if(dot)dot.className='v241-dot '+tone;if(id('v241Signal'))id('v241Signal').textContent=signal;
    if(id('v241Updated'))id('v241Updated').textContent='Aggiornato '+new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
    refreshCounts();
  }

  function refreshCounts(){
    const w=id('watchTotal')?.textContent||id('watchTotal2')?.textContent||'0',a=id('alertCount')?.textContent||'0';if(id('v241Watch'))id('v241Watch').textContent=w;if(id('v241Alerts'))id('v241Alerts').textContent=a;
  }

  function askWhy(){
    show('kiber');
    setTimeout(()=>{
      const input=id('chatInput');if(!input)return;input.value='Analizza il quadro attuale della BNB Chain: cosa si sta muovendo, quali dati lo sostengono, cosa potrebbe spiegarlo, cosa contraddice la lettura e cosa devo controllare dopo.';id('chatSend')?.click();
    },180);
  }

  function cleanup(){
    document.body.classList.add('v241-simple');
    qa('.pro').forEach(x=>x.remove());
    forceVersion();
  }

  function boot(){
    cleanup();buildHome();buildWorkbar();show('home');loadSummary();refreshCounts();
    setInterval(refreshCounts,2500);setInterval(forceVersion,1600);setInterval(loadSummary,120000);
    const mo=new MutationObserver(()=>{cleanup();if(!id('v241Home'))buildHome();if(!id('v241Workbar'))buildWorkbar()});mo.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
