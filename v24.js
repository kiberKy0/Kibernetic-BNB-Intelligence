(()=>{
  window.KIBER_V24_ACTIVE=true;
  const V='24.0',q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],id=x=>document.getElementById(x);
  const S={intel:null,chain:null,providers:null,tab:'chain',compare:new Set(),busy:false};
  const n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=v=>{v=n(v);if(v===null)return'—';const a=Math.abs(v);if(a>=1e12)return'$'+(v/1e12).toFixed(2)+'T';if(a>=1e9)return'$'+(v/1e9).toFixed(2)+'B';if(a>=1e6)return'$'+(v/1e6).toFixed(2)+'M';if(a>=1e3)return'$'+(v/1e3).toFixed(1)+'K';return'$'+v.toLocaleString('it-IT',{maximumFractionDigits:2})};
  const pct=v=>{v=n(v);return v===null?'—':`${v>=0?'+':''}${v.toLocaleString('it-IT',{maximumFractionDigits:2})}%`};
  const num=v=>{v=n(v);return v===null?'—':v.toLocaleString('it-IT',{maximumFractionDigits:0})};

  function version(){
    document.documentElement.dataset.kiberVersion=V;document.title=`Kiber BNB Intelligence V${V}`;
    const st=q('.brand-live')||id('v23Status')||id('v22Status')||id('v21Status')||id('v20Status');if(st){st.id='v24Status';st.textContent=`V${V} · KIBER BNB INTELLIGENCE · INTELLIGENCE CENTER`}
    const eye=q('.hero .eyebrow');if(eye)eye.textContent=`KIBER BNB INTELLIGENCE · V${V}`;
  }

  function cleanupProfile(){
    const grid=id('v21AvatarGrid');if(grid)grid.remove();const title=id('v21AvatarTitle');if(title)title.remove();
    qa('.v21-avatar-choice').forEach(x=>x.remove());const sel=id('avatarSelect');if(sel){const lab=sel.closest('label');if(lab)lab.remove()}
    const pv=id('v23ProfileAvatar');if(pv)pv.textContent='🤖';const av=id('avatar');if(av)av.textContent='🤖';
    const small=q('#profileDrawer .drawer-head small');if(small)small.textContent='Nome e modalità di lettura';
  }

  function fixAi(){
    const img=q('#v23AiIntro .v23-ai-head img');if(img){img.src='assets/kiber-logo.svg?v=24';img.className='v24-ai-logo';img.alt='Kiber AI'}
    const title=q('#v23AiIntro .v23-ai-head b');if(title)title.textContent='Kiber AI · Intelligence Center V24';
    const sub=q('#v23AiIntro .v23-ai-head small');if(sub)sub.textContent='Chain, mercato, fondamentali, news e dossier vengono letti nello stesso contesto.';
  }

  function build(){
    if(id('v24Center'))return;
    const main=q('main');if(!main)return;
    const overview=q('.overview');
    const center=document.createElement('section');center.id='v24Center';center.className='v24-center';center.innerHTML=`
      <div class="v24-center-head"><div><span>KIBER INTELLIGENCE CENTER · V24</span><h2>BNB Chain, letta come un sistema.</h2><p>Chain Pulse, nuovi pool, fondamentali e confronto lavorano insieme. I dati non vengono solo mostrati: vengono trasformati in segnali da verificare.</p></div><div class="v24-live">LIVE DATA LAYER</div></div>
      <div id="v24Events" class="v24-events"><div class="v24-loading">Caricamento segnali…</div></div>
      <div class="v24-tabs" id="v24Tabs">
        <button data-v24="chain" class="active">Chain Pulse</button><button data-v24="market">DEX Radar</button><button data-v24="fundamentals">Fundamentals</button><button data-v24="compare">Comparatore</button><button data-v24="connectors">Money & Narrative</button>
      </div>
      <div id="v24Pane-chain" class="v24-pane active"></div><div id="v24Pane-market" class="v24-pane"></div><div id="v24Pane-fundamentals" class="v24-pane"></div><div id="v24Pane-compare" class="v24-pane"></div><div id="v24Pane-connectors" class="v24-pane"></div>`;
    (overview||main.firstElementChild)?.insertAdjacentElement('afterend',center);
    qa('#v24Tabs button').forEach(b=>b.onclick=()=>setTab(b.dataset.v24));
    const hub=id('hubNav');if(hub&&!id('v24HubBtn')){const b=document.createElement('button');b.id='v24HubBtn';b.innerHTML='<b>Intelligence</b><span>V24</span>';b.onclick=()=>center.scrollIntoView({behavior:'smooth',block:'start'});hub.insertBefore(b,hub.children[1]||null)}
  }

  function setTab(k){S.tab=k;qa('#v24Tabs button').forEach(b=>b.classList.toggle('active',b.dataset.v24===k));qa('.v24-pane').forEach(p=>p.classList.toggle('active',p.id===`v24Pane-${k}`));}

  function renderEvents(){
    const box=id('v24Events');if(!box)return;const ev=S.intel?.events||[];box.innerHTML=ev.length?ev.slice(0,3).map(x=>`<article class="v24-event ${esc(x.level||'')}"><b>${esc(x.title)}</b><p>${esc(x.text)}</p></article>`).join(''):'<div class="v24-empty">Nessun segnale aggregato disponibile. Kiber non riempie i buchi con numeri ornamentali.</div>';
  }

  function extendBnb(){
    const p=id('bnbPrice');if(!p||id('v24BnbGrid'))return;const card=p.parentElement;card.classList.add('v24-bnb-extended');card.insertAdjacentHTML('beforeend','<div class="v24-bnb-grid" id="v24BnbGrid"><div><span>Valore BNB</span><b id="v24BnbCap">—</b></div><div><span>TVL BSC</span><b id="v24BnbTvl">—</b></div><div><span>Stablecoin</span><b id="v24BnbStable">—</b></div><div><span>DEX 24h</span><b id="v24BnbDex">—</b></div></div>');
  }

  function renderBnb(){extendBnb();const c=S.chain||{};if(id('bnbPrice')&&n(c.bnb?.price)!==null)id('bnbPrice').textContent=money(c.bnb.price);if(id('bnbChange')&&n(c.bnb?.change24)!==null)id('bnbChange').textContent=`${pct(c.bnb.change24)} · 24h`;if(id('v24BnbCap'))id('v24BnbCap').textContent=money(c.bnb?.marketCap);if(id('v24BnbTvl'))id('v24BnbTvl').textContent=money(c.chain?.tvl);if(id('v24BnbStable'))id('v24BnbStable').textContent=money(c.chain?.stablecoins);if(id('v24BnbDex'))id('v24BnbDex').textContent=money(c.chain?.dexVolume24)}

  function aiButton(mode,label){return `<div class="v24-ai-action"><button type="button" data-v24-ai="${mode}">${esc(label)}</button></div>`}
  function bindAi(root=document){qa('[data-v24-ai]',root).forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.onclick=()=>askAi(b.dataset.v24Ai,b)})}

  function renderChain(){
    const box=id('v24Pane-chain');if(!box)return;const i=S.intel?.chain||{},c=S.chain?.chain||{},b=S.chain?.bnb||{};
    box.innerHTML=`<div class="v24-metrics"><div class="v24-metric"><span>BNB prezzo</span><b>${money(b.price)}</b><small>${pct(b.change24)} 24h</small></div><div class="v24-metric"><span>TVL BSC</span><b>${money(c.tvl??i.tvl)}</b><small>capitale DeFi bloccato</small></div><div class="v24-metric"><span>Stablecoin</span><b>${money(c.stablecoins)}</b><small>liquidità stabile sulla chain</small></div><div class="v24-metric"><span>DEX volume 24h</span><b>${money(c.dexVolume24??i.dexVolume24)}</b><small>${pct(i.dexChange1d)} vs periodo precedente</small></div><div class="v24-metric"><span>Valore BNB</span><b>${money(b.marketCap)}</b><small>market cap BNB</small></div><div class="v24-metric"><span>DEX 7d</span><b>${money(i.dexVolume7d)}</b><small>${pct(i.dexChange7d)} variazione</small></div><div class="v24-metric"><span>TVL / BNB value</span><b>${pct(c.tvlToBnbMarketCapPct)}</b><small>rapporto strutturale</small></div><div class="v24-metric"><span>Volume / TVL</span><b>${pct(c.dexVolumeToTvlPct)}</b><small>intensità di scambio</small></div></div>${aiButton('chain','Kiber: interpreta Chain Pulse')}<small class="v24-source">Fonti aggregate: CoinGecko + DefiLlama. Un rapporto non equivale automaticamente a forza o debolezza: serve contesto.</small><div id="v24Ai-chain"></div>`;bindAi(box);
  }

  function renderMarket(){
    const box=id('v24Pane-market');if(!box)return;const rows=S.intel?.marketRadar?.newPools||[];
    box.innerHTML=`<div class="v24-section-title"><b>Nuovi pool BNB Chain</b><small>ordinati per Attention Score Kiber, non per “compra questo”</small></div><div class="v24-list">${rows.length?rows.slice(0,12).map(x=>`<article class="v24-row"><div class="v24-row-main"><b>${esc(x.name||'Pool')}</b><small>${x.ageHours===null?'età —':Math.round(x.ageHours)+'h'} · ${esc(x.source||'')}</small></div><div class="v24-cell"><span>Liquidità</span><b>${money(x.liquidityUsd)}</b></div><div class="v24-cell"><span>Volume 24h</span><b>${money(x.volume24h)}</b></div><div class="v24-cell"><span>1h</span><b>${pct(x.change1h)}</b></div><div class="v24-score ${x.attentionScore>=70?'hot':''}">${num(x.attentionScore)}/100</div></article>`).join(''):'<div class="v24-empty">Nessun nuovo pool disponibile dalla fonte in questo momento.</div>'}</div>${aiButton('market','Kiber: analizza anomalie DEX')}<small class="v24-source">Fonte: GeckoTerminal. Il punteggio misura attenzione/anomalia da liquidità, volume, variazione, transazioni ed età del pool; non misura rendimento futuro.</small><div id="v24Ai-market"></div>`;bindAi(box);
  }

  function renderFundamentals(){
    const box=id('v24Pane-fundamentals');if(!box)return;const rows=S.intel?.fundamentals?.protocols||[];
    box.innerHTML=`<div class="v24-section-title"><b>Protocolli BSC</b><small>TVL + crescita + fees quando disponibili</small></div><div class="v24-list">${rows.length?rows.slice(0,12).map(x=>`<article class="v24-row"><div class="v24-row-main"><b>${esc(x.name)}</b><small>${esc(x.category||'Altro')}</small></div><div class="v24-cell"><span>TVL</span><b>${money(x.tvl)}</b></div><div class="v24-cell"><span>7d</span><b>${pct(x.change7d)}</b></div><div class="v24-cell"><span>Fees 24h</span><b>${money(x.fees24)}</b></div><div class="v24-score ${x.fundamentalScore>=75?'hot':''}">${num(x.fundamentalScore)}/100</div></article>`).join(''):'<div class="v24-empty">Dati fondamentali temporaneamente non disponibili.</div>'}</div>${aiButton('fundamentals','Kiber: leggi i fondamentali')}<small class="v24-source">Fonte: DefiLlama. Il Fundamentals Score è una metrica Kiber trasparente basata sui dati disponibili, non una valutazione finanziaria certificata.</small><div id="v24Ai-fundamentals"></div>`;bindAi(box);
  }

  function renderCompare(){
    const box=id('v24Pane-compare');if(!box)return;const rows=S.intel?.fundamentals?.protocols||[];if(!S.compare.size)rows.slice(0,3).forEach(x=>S.compare.add(x.slug||x.name));const picks=rows.filter(x=>S.compare.has(x.slug||x.name)).slice(0,3);
    box.innerHTML=`<div class="v24-section-title"><b>Comparatore protocolli</b><small>seleziona massimo 3 protocolli</small></div><div class="v24-compare-controls">${rows.slice(0,10).map(x=>`<button class="v24-chip ${S.compare.has(x.slug||x.name)?'active':''}" data-v24-compare="${esc(x.slug||x.name)}">${esc(x.name)}</button>`).join('')}</div><div class="v24-compare"><table class="v24-table"><thead><tr><th>Protocollo</th><th>Categoria</th><th>TVL</th><th>1d</th><th>7d</th><th>Fees 24h</th><th>Kiber Score</th></tr></thead><tbody>${picks.map(x=>`<tr><td><b>${esc(x.name)}</b></td><td>${esc(x.category||'—')}</td><td>${money(x.tvl)}</td><td>${pct(x.change1d)}</td><td>${pct(x.change7d)}</td><td>${money(x.fees24)}</td><td>${num(x.fundamentalScore)}/100</td></tr>`).join('')||'<tr><td colspan="7">Seleziona un protocollo.</td></tr>'}</tbody></table></div>${aiButton('compare','Kiber: confronta questi protocolli')}<div id="v24Ai-compare"></div>`;
    qa('[data-v24-compare]',box).forEach(b=>b.onclick=()=>{const k=b.dataset.v24Compare;if(S.compare.has(k))S.compare.delete(k);else{if(S.compare.size>=3)S.compare.delete([...S.compare][0]);S.compare.add(k)}renderCompare()});bindAi(box);
  }

  function renderConnectors(){
    const box=id('v24Pane-connectors');if(!box)return;const p=S.providers?.providers||{};const card=(name,x)=>`<div class="v24-connector"><div><b>${esc(name)}</b><small>${esc(x?.role||'')}</small></div><span class="v24-state ${x?.connected?'on':''}">${x?.connected?'COLLEGATO':'API DA COLLEGARE'}</span></div>`;
    box.innerHTML=`<div class="v24-section-title"><b>Money & Narrative Layer</b><small>qui entrano i dati proprietari dei competitor tramite API autorizzate</small></div><div class="v24-connectors"><div class="v24-connector"><div><b>DefiLlama</b><small>Chain + fundamentals</small></div><span class="v24-state public">PUBBLICO</span></div><div class="v24-connector"><div><b>GeckoTerminal</b><small>DEX + nuovi pool</small></div><span class="v24-state public">PUBBLICO</span></div>${card('Etherscan / BscScan',p.etherscan)}${card('Nansen',p.nansen)}${card('Arkham',p.arkham)}${card('LunarCrush',p.lunarcrush)}${card('OpenAI',p.openai)}${card('CoinGecko',p.coingecko)}</div><small class="v24-source">Le chiavi non vengono mai mostrate al browser. V24 espone solo se un connettore è disponibile. Smart Money, entity labels e social intelligence restano disattivati finché non esiste una fonte autorizzata.</small>`;
  }

  function render(){renderEvents();renderBnb();renderChain();renderMarket();renderFundamentals();renderCompare();renderConnectors();version();fixAi()}

  async function askAi(mode,btn){
    if(S.busy)return;S.busy=true;const old=btn.textContent;btn.disabled=true;btn.textContent='Kiber analizza…';const target=id('v24Ai-'+mode);if(target)target.innerHTML='<div class="v24-loading">Collego i dati del modulo con news, dossier e contesto della dashboard…</div>';
    const token=(()=>{try{return state?.selected||null}catch{return null}})();const news=(()=>{try{return (state?.news||[]).slice(0,12)}catch{return[]}})();const dossier=(()=>{try{return {news:(V18?.dossier?.news||[]).slice(0,6),tokens:(V18?.dossier?.tokens||[]).slice(0,6)}}catch{return {news:[],tokens:[]}}})();
    const prompt={chain:'Interpreta il Chain Pulse della BNB Chain. Distingui fatti, segnali, contraddizioni e dati mancanti.',market:'Analizza il DEX Radar e le anomalie dei nuovi pool. Non suggerire acquisti: identifica solo cosa merita attenzione e perché.',fundamentals:'Analizza i protocolli BSC per fondamentali. Confronta TVL, crescita, fees e qualità dei dati; evidenzia cosa manca.',compare:'Confronta i protocolli selezionati nel comparatore. Spiega punti di forza, debolezze e quali dati servono prima di una conclusione.'}[mode]||'Analizza il contesto.';
    try{
      const body={message:prompt,analysisMode:mode,bnb:S.chain?.bnb||{},chain:S.chain?.chain||{},intelligence:{chain:S.intel?.chain||{},marketRadar:{attention:(S.intel?.marketRadar?.attention||[]).slice(0,8)},fundamentals:{protocols:(mode==='compare'?(S.intel?.fundamentals?.protocols||[]).filter(x=>S.compare.has(x.slug||x.name)):(S.intel?.fundamentals?.protocols||[]).slice(0,10))}},token,news,dossier};
      const r=await fetch('/api/kiber',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});const d=await r.json();if(!r.ok||!d.answer)throw new Error(d.error||'AI unavailable');if(target)target.innerHTML=`<div class="v24-event medium" style="margin-top:12px"><b>Kiber AI</b><p>${esc(d.answer).replace(/\n/g,'<br>')}</p></div>`;
    }catch(e){if(target)target.innerHTML='<div class="v24-event"><b>Dati disponibili, AI non raggiungibile</b><p>Il modulo continua a funzionare con i dati live; la spiegazione AI verrà riprovata quando il backend sarà disponibile.</p></div>'}
    btn.disabled=false;btn.textContent=old;S.busy=false;
  }

  async function load(){
    const [intel,chain,providers]=await Promise.allSettled([fetch('/api/intelligence?v=24',{cache:'no-store'}).then(r=>r.json()),fetch('/api/chain?v=24',{cache:'no-store'}).then(r=>r.json()),fetch('/api/provider-status?v=24',{cache:'no-store'}).then(r=>r.json())]);
    if(intel.status==='fulfilled'&&!intel.value.error)S.intel=intel.value;if(chain.status==='fulfilled'&&!chain.value.error)S.chain=chain.value;if(providers.status==='fulfilled'&&!providers.value.error)S.providers=providers.value;window.KIBER_V24_CONTEXT={intelligence:S.intel,chain:S.chain};render();
  }

  function boot(){version();cleanupProfile();fixAi();build();extendBnb();render();load();setTimeout(()=>{version();cleanupProfile();fixAi();render()},1900);setInterval(load,120000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
