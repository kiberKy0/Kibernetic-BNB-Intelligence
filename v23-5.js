(()=>{
  const VERSION='23.5';
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const byId=id=>document.getElementById(id);
  const n=v=>Number.isFinite(Number(v))?Number(v):null;
  const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=v=>{
    v=n(v); if(v===null)return'—';
    const a=Math.abs(v);
    if(a>=1e12)return'$'+(v/1e12).toFixed(2)+'T';
    if(a>=1e9)return'$'+(v/1e9).toFixed(2)+'B';
    if(a>=1e6)return'$'+(v/1e6).toFixed(2)+'M';
    if(a>=1e3)return'$'+(v/1e3).toFixed(1)+'K';
    return'$'+v.toLocaleString('it-IT',{maximumFractionDigits:2});
  };
  const price=v=>{v=n(v);return v===null?'—':'$'+v.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2})};
  const pct=v=>{v=n(v);return v===null?'—':`${v>=0?'+':''}${v.toLocaleString('it-IT',{maximumFractionDigits:2})}%`};
  const S={chain:null,busy:false,observer:null};

  function enforceVersion(){
    document.documentElement.dataset.kiberVersion=VERSION;
    document.title=`Kiber BNB Intelligence V${VERSION}`;
    const status=q('.brand-live')||byId('v23Status')||byId('v22Status')||byId('v21Status')||byId('v20Status');
    if(status){
      status.id='v235Status';
      const wanted=`V${VERSION} · KIBER BNB INTELLIGENCE · CHAIN AI`;
      if(status.textContent!==wanted)status.textContent=wanted;
    }
    const eye=q('.hero .eyebrow');
    if(eye&&eye.textContent!==`KIBER BNB INTELLIGENCE · V${VERSION}`)eye.textContent=`KIBER BNB INTELLIGENCE · V${VERSION}`;
  }

  function removeLegacyAvatars(){
    const grid=byId('v21AvatarGrid');
    if(grid)grid.hidden=true;
    qa('.v21-avatar-choice').forEach(x=>x.hidden=true);
    const title=byId('v21AvatarTitle');
    if(title)title.hidden=true;
    const select=byId('avatarSelect');
    if(select){
      if([...select.options].some(o=>o.value==='🤖'))select.value='🤖';
      const label=select.closest('label');
      if(label)label.hidden=true;
    }
    const previewAvatar=byId('v23ProfileAvatar');
    if(previewAvatar){previewAvatar.textContent='🤖';previewAvatar.classList.add('v235-neutral-avatar')}
    const topAvatar=byId('avatar');
    if(topAvatar&&topAvatar.textContent!=='🤖')topAvatar.textContent='🤖';
    const drawer=byId('profileDrawer');
    const small=q('.drawer-head small',drawer||document);
    if(small&&/personaggio|identit/i.test(small.textContent))small.textContent='Nome e modalità di lettura';
  }

  function fixAiLogo(){
    const img=q('#v23AiIntro .v23-ai-head img')||q('.v23-ai-head img');
    if(!img)return;
    const src='assets/kiber-logo.svg?v=23-5';
    if(!img.src.includes('kiber-logo.svg'))img.src=src;
    img.className='v235-ai-logo';
    img.alt='Kiber AI';
    img.removeAttribute('style');
    const head=img.closest('.v23-ai-head');
    if(head)head.classList.add('v235-ai-head');
  }

  function chainMarkup(){
    return `<div id="v235ChainMetrics" class="v235-chain-metrics">
      <div><span>Valore BNB</span><b id="v235MarketCap">—</b></div>
      <div><span>TVL BSC</span><b id="v235Tvl">—</b></div>
      <div><span>Stablecoin</span><b id="v235Stable">—</b></div>
      <div><span>DEX 24h</span><b id="v235Dex">—</b></div>
      <div><span>TVL / valore BNB</span><b id="v235Ratio">—</b></div>
    </div><small id="v235ChainSource" class="v235-chain-source">BNB Chain: caricamento dati complessivi…</small>`;
  }

  function setupChainOverview(){
    const p=byId('bnbPrice');
    if(!p)return;
    const card=p.parentElement;
    card.classList.add('v235-bnb-card');
    let label=card.querySelector(':scope > span');
    if(label)label.textContent='BNB · prezzo';
    if(!byId('v235ChainMetrics'))card.insertAdjacentHTML('beforeend',chainMarkup());
    loadChain();
  }

  async function loadChain(){
    const source=byId('v235ChainSource');
    try{
      const r=await fetch('/api/chain?v=23-5',{cache:'no-store'});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'chain unavailable');
      S.chain=d;
      window.KIBER_CHAIN_METRICS=d;
      if(byId('bnbPrice')&&n(d.bnb?.price)!==null)byId('bnbPrice').textContent=price(d.bnb.price);
      if(byId('bnbChange')&&n(d.bnb?.change24)!==null){
        byId('bnbChange').textContent=`${pct(d.bnb.change24)} · 24h`;
        byId('bnbChange').classList.toggle('up',d.bnb.change24>=0);
        byId('bnbChange').classList.toggle('down',d.bnb.change24<0);
      }
      const set=(id,val)=>{const e=byId(id);if(e)e.textContent=val};
      set('v235MarketCap',money(d.bnb?.marketCap));
      set('v235Tvl',money(d.chain?.tvl));
      set('v235Stable',money(d.chain?.stablecoins));
      set('v235Dex',money(d.chain?.dexVolume24));
      set('v235Ratio',n(d.chain?.tvlToBnbMarketCapPct)===null?'—':pct(d.chain.tvlToBnbMarketCapPct));
      if(source)source.textContent=`Dati complessivi BNB Smart Chain · ${d.source||'CoinGecko + DefiLlama'} · aggiornati ${new Date(d.updatedAt||Date.now()).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'})}`;
    }catch(e){
      if(source)source.textContent='Dati chain parziali: il prezzo BNB resta disponibile, metriche aggregate in aggiornamento.';
    }
  }

  function historySummary(){
    try{
      const rows=Array.isArray(state?.history)?state.history:[];
      const a=rows.map(x=>n(x?.[4])).filter(x=>x!==null&&x>0);
      if(a.length<2)return null;
      let peak=a[0],dd=0;
      for(const x of a){peak=Math.max(peak,x);dd=Math.min(dd,(x/peak-1)*100)}
      return {period:state.period||'24h',points:a.length,movePct:(a.at(-1)/a[0]-1)*100,maxDrawdownPct:dd,min:Math.min(...a),max:Math.max(...a)};
    }catch{return null}
  }

  function dossierContext(){
    try{return {news:(V18?.dossier?.news||[]).slice(0,8),tokens:(V18?.dossier?.tokens||[]).slice(0,8)}}catch{return {news:[],tokens:[]}}
  }

  function selectedToken(){
    try{return state?.selected||null}catch{return null}
  }

  function stateNews(){
    try{return Array.isArray(state?.news)?state.news:[]}catch{return []}
  }

  function profile(){
    return {name:(byId('profileName')?.value||'').trim(),avatar:'🤖',mode:byId('viewMode')?.value||'simple'};
  }

  function mapToken(t){
    if(!t)return null;
    return {symbol:t.symbol,name:t.name,address:t.address,priceUsd:t.priceUsd??t.price,change24:t.change24,liquidityUsd:t.liquidityUsd??t.liquidity,volume24hUsd:t.volume24hUsd??t.volume,marketCap:t.marketCap,riskScore:t.riskScore,pairCount:t.pairCount,dexes:t.dexes,buys24h:t.buys24h,sells24h:t.sells24h,sector:t.sector,subsector:t.subsector};
  }

  function chainPromptContext(){
    const d=S.chain||window.KIBER_CHAIN_METRICS||{};
    return {
      price:d.bnb?.price??null,change24:d.bnb?.change24??null,marketCap:d.bnb?.marketCap??null,volume24:d.bnb?.volume24??null,
      tvl:d.chain?.tvl??null,stablecoins:d.chain?.stablecoins??null,dexVolume24:d.chain?.dexVolume24??null,dexVolume7d:d.chain?.dexVolume7d??null,
      tvlToBnbMarketCapPct:d.chain?.tvlToBnbMarketCapPct??null,stablecoinsToTvlPct:d.chain?.stablecoinsToTvlPct??null
    };
  }

  function promptFor(mode){
    const t=selectedToken();
    const subject=t?`${t.name||t.symbol} (${t.symbol||''})`:'BNB Smart Chain nel suo complesso';
    const common=`Analizza ${subject}. Usa soltanto i dati presenti nella dashboard e nel contesto ricevuto. Distingui fatti, ipotesi e dati mancanti. Non attribuire una causa solo perché una notizia è vicina temporalmente.`;
    if(mode==='movement')return `${common} MOTORE MOVIMENTO V23.5: spiega cosa si sta muovendo, quanto il movimento è sostenuto da volume/liquidità/flussi/storico, quali notizie possono essere collegate e quali segnali indeboliscono l'ipotesi. Chiudi con i prossimi controlli concreti.`;
    if(mode==='news')return `${common} MOTORE NEWS V23.5: collega le notizie recenti al movimento. Per ogni collegamento indica se l'evidenza è forte, moderata, debole o insufficiente e perché. Scarta le coincidenze senza supporto nei dati.`;
    if(mode==='risk')return `${common} MOTORE RISCHIO V23.5: individua solo rischi supportati dai dati disponibili: liquidità, volume, volatilità, drawdown, flussi, concentrazione se disponibile, qualità delle fonti e rischio di narrativa. Se un dato necessario manca, dichiaralo.`;
    return `${common} MOTORE SINTESI V23.5: crea una sintesi unica tra prezzo, market cap, TVL BSC, stablecoin, volume DEX, token aperto, storico, news, watchlist e dossier. Separa: cosa sappiamo, cosa è probabile ma non provato, cosa contraddice la lettura e cosa controllare dopo.`;
  }

  function localMovement(t,c){
    if(t){
      const ch=n(t.change24),liq=n(t.liquidityUsd??t.liquidity),vol=n(t.volume24hUsd??t.volume),buys=n(t.buys24h),sells=n(t.sells24h);
      const ratio=liq&&vol!==null?vol/liq:null;
      const obs=[`${t.symbol||t.name}: 24h ${pct(ch)}`,`liquidità ${money(liq)}`,`volume ${money(vol)}`];
      if(buys!==null||sells!==null)obs.push(`buy/sell ${buys??'—'}/${sells??'—'}`);
      let read='Il movimento non ha ancora una causa dimostrata.';
      if(ch!==null&&Math.abs(ch)>=8&&ratio!==null&&ratio>=1)read='Movimento ampio accompagnato da attività elevata rispetto alla liquidità: il segnale è più consistente, ma la causa va collegata alle fonti.';
      else if(ch!==null&&Math.abs(ch)>=8)read='Movimento ampio, ma i dati disponibili non bastano a dimostrare cosa lo stia causando.';
      else if(ratio!==null&&ratio>=1)read='Attività elevata rispetto alla liquidità con prezzo meno direzionale: possibile fase di rotazione o assorbimento.';
      return `${obs.join(' · ')}\n${read}`;
    }
    return `BNB ${price(c.price)} (${pct(c.change24)} 24h). Valore BNB ${money(c.marketCap)}, TVL BSC ${money(c.tvl)}, stablecoin ${money(c.stablecoins)}, volume DEX 24h ${money(c.dexVolume24)}. Senza un token aperto il motore legge la chain: prezzo, capitale, liquidità DeFi e attività DEX; nessuna singola metrica prova da sola la causa del movimento.`;
  }

  function localNews(t){
    const news=stateNews();
    const keys=t?[t.symbol,t.name].filter(Boolean).map(x=>String(x).toLowerCase()):['bnb','bsc','binance smart chain'];
    const hits=news.filter(x=>keys.some(k=>`${x.title||''} ${x.category||''} ${x.why||x.why_it_matters||''}`.toLowerCase().includes(k))).slice(0,5);
    if(!hits.length)return 'Non trovo nel feed corrente notizie abbastanza specifiche da collegare con sicurezza al movimento. Questo è un risultato utile: evitare di inventare una causa.';
    return hits.map((x,i)=>`${i+1}. ${x.title||'Notizia'}${x.source?` · ${x.source}`:''}`).join('\n')+'\nQuesti sono collegamenti tematici; per parlare di causa servono anche coincidenza temporale e conferma nei dati di mercato.';
  }

  function localRisk(t,c){
    const out=[];
    if(t){
      const liq=n(t.liquidityUsd??t.liquidity),vol=n(t.volume24hUsd??t.volume),ch=n(t.change24),risk=n(t.riskScore);
      if(risk!==null)out.push(`Risk score disponibile: ${risk}`);
      if(liq!==null)out.push(`Liquidità osservata: ${money(liq)}`);
      if(vol!==null)out.push(`Volume 24h: ${money(vol)}`);
      if(ch!==null&&Math.abs(ch)>=10)out.push(`Volatilità 24h elevata: ${pct(ch)}`);
      if(liq&&vol!==null&&vol/liq>=2)out.push('Volume molto alto rispetto alla liquidità: aumenta il rischio di movimenti rapidi e slippage.');
      if(!out.length)out.push('I dati di rischio disponibili sono incompleti: non assegno rischi non misurati.');
    }else{
      out.push(`TVL BSC ${money(c.tvl)}`,`Stablecoin ${money(c.stablecoins)}`,`DEX 24h ${money(c.dexVolume24)}`);
      out.push('Per il rischio chain servono anche trend temporali, bridge flow e concentrazione per protocollo; se mancano non vengono inventati.');
    }
    return out.join('\n');
  }

  function localSummary(t,c){
    const a=[`BNB ${price(c.price)} · ${pct(c.change24)} 24h`,`Valore BNB ${money(c.marketCap)}`,`TVL BSC ${money(c.tvl)}`,`Stablecoin ${money(c.stablecoins)}`,`DEX 24h ${money(c.dexVolume24)}`];
    if(t)a.push(`Token aperto ${t.symbol||t.name}: ${pct(t.change24)} 24h · liquidità ${money(t.liquidityUsd??t.liquidity)} · volume ${money(t.volume24hUsd??t.volume)}`);
    a.push(`News caricate: ${stateNews().length}`);
    return a.join('\n')+'\nSintesi locale: i numeri sopra sono fatti osservati. La spiegazione del movimento resta un’ipotesi finché news, tempi e dati di mercato non convergono.';
  }

  function localAnswer(mode){
    const t=selectedToken(),c=chainPromptContext();
    if(mode==='movement')return localMovement(t,c);
    if(mode==='news')return localNews(t);
    if(mode==='risk')return localRisk(t,c);
    return localSummary(t,c);
  }

  function renderAiResult(mode,text,isLocal=false){
    const box=byId('v235AiResult');
    if(!box)return;
    const labels={movement:'Perché si muove',news:'News collegate',risk:'Rischi',summary:'Sintesi intelligente'};
    box.classList.remove('loading');
    box.innerHTML=`<div class="v235-ai-result-head"><span>${safe(labels[mode]||'Analisi')}</span><small>${isLocal?'Motore locale V23.5':'Kiber AI V23.5 · dati contestuali'}</small></div><div class="v235-ai-result-text">${safe(text).replace(/\n/g,'<br>')}</div>`;
  }

  function appendChat(text){
    const chat=byId('chatMessages');
    if(!chat)return;
    const msg=document.createElement('div');
    msg.className='assistant-msg v235-engine-msg';
    msg.textContent=text;
    chat.appendChild(msg);
    chat.scrollTop=chat.scrollHeight;
  }

  async function runEngine(mode,button){
    if(S.busy)return;
    S.busy=true;
    qa('.v23-ai-prompts button').forEach(b=>b.classList.toggle('v235-active',b===button));
    const box=byId('v235AiResult');
    if(box){box.classList.add('loading');box.innerHTML='<div class="v235-ai-loading">Kiber collega chain, token, grafico, notizie e dossier…</div>'}
    const t=selectedToken();
    const chain=S.chain||{};
    let answer='',isLocal=false;
    try{
      const body={
        message:promptFor(mode),analysisMode:mode,profile:profile(),bnb:chain.bnb||{},chain:chain.chain||{},token:mapToken(t),
        watchlist:(()=>{try{return (state?.watch||[]).slice(0,18)}catch{return[]}})(),
        news:stateNews().slice(0,15).map(x=>({title:x.title,source:x.sources?.[0]?.name||x.source,category:x.category,impact:x.impact_label||x.impact,why:x.why_it_matters||x.why,published:x.published_at||x.published,token_addresses:x.token_addresses||[]})),
        analysis:{history:historySummary(),dossier:dossierContext()},conversation:[]
      };
      const r=await fetch('/api/kiber',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const d=await r.json();
      if(!r.ok||!String(d.answer||'').trim())throw new Error(d.error||'AI unavailable');
      answer=String(d.answer).trim();
      const modeLine=byId('chatMode');
      if(modeLine)modeLine.textContent=`Kiber AI V${VERSION} · motore ${mode} · chain + token + news + dossier`;
    }catch(e){answer=localAnswer(mode);isLocal=true}
    renderAiResult(mode,answer,isLocal);
    appendChat(answer);
    S.busy=false;
  }

  function setupAiEngines(){
    fixAiLogo();
    const intro=byId('v23AiIntro');
    if(!intro)return;
    const prompts=q('.v23-ai-prompts',intro);
    if(!prompts)return;
    const buttons=qa('button',prompts);
    const modes=['movement','news','risk','summary'];
    buttons.slice(0,4).forEach((b,i)=>{
      b.dataset.v235Mode=modes[i];
      b.onclick=e=>{e.preventDefault();runEngine(modes[i],b)};
    });
    if(!byId('v235AiResult'))prompts.insertAdjacentHTML('afterend','<div id="v235AiResult" class="v235-ai-result"><div class="v235-ai-result-empty">Scegli un motore: il risultato apparirà qui, senza farti inseguire la risposta per mezza pagina.</div></div>');
    const title=q('.v23-ai-head b',intro);
    if(title)title.textContent='Analisi interattiva V23.5 · quattro motori attivi';
    const sub=q('.v23-ai-head small',intro);
    if(sub)sub.textContent='Movimento, news, rischio e sintesi lavorano sullo stesso contesto: chain, token, grafico, dossier e feed.';
  }

  function maintain(){
    enforceVersion();
    removeLegacyAvatars();
    fixAiLogo();
    setupAiEngines();
    if(byId('bnbPrice')&&!byId('v235ChainMetrics'))setupChainOverview();
  }

  function boot(){
    maintain();
    setTimeout(maintain,250);
    setTimeout(maintain,900);
    setTimeout(maintain,1800);
    setTimeout(loadChain,2200);
    setInterval(loadChain,120000);
    let queued=false;
    S.observer=new MutationObserver(()=>{
      if(queued)return;
      queued=true;
      requestAnimationFrame(()=>{queued=false;maintain()});
    });
    S.observer.observe(document.body,{childList:true,subtree:true,characterData:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
