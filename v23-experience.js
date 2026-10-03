(()=>{
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const byId=id=>document.getElementById(id);
  const escHtml=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const num=v=>Number.isFinite(Number(v))?Number(v):0;
  const fmtPct=v=>`${num(v)>=0?'+':''}${num(v).toLocaleString('it-IT',{maximumFractionDigits:2})}%`;
  const compact=v=>{v=num(v);if(!v)return'—';if(v>=1e12)return'$'+(v/1e12).toFixed(2)+'T';if(v>=1e9)return'$'+(v/1e9).toFixed(2)+'B';if(v>=1e6)return'$'+(v/1e6).toFixed(2)+'M';if(v>=1e3)return'$'+(v/1e3).toFixed(1)+'K';return'$'+v.toLocaleString('it-IT',{maximumFractionDigits:4})};
  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const CHAT_KEY='kiber_v23_chat';
  const V23={conversation:[],busy:false};

  try{V23.conversation=JSON.parse(localStorage.getItem(CHAT_KEY)||'[]');if(!Array.isArray(V23.conversation))V23.conversation=[]}catch{V23.conversation=[]}

  function setVersion(){
    document.title='Kiber BNB Intelligence V23';
    const st=byId('v21Status')||byId('v20Status');
    if(st)st.textContent='V23 · KIBER BNB INTELLIGENCE · CONTEXT AI';
    const eye=q('.hero .eyebrow');
    if(eye)eye.textContent='KIBER BNB INTELLIGENCE · V23';
  }

  function removePro(){
    q('.pro')?.remove();
    const mode=byId('viewMode');
    if(mode){
      qa('option',mode).forEach(o=>{if(String(o.value).toLowerCase()==='pro'||/pro/i.test(o.textContent))o.remove()});
      if(mode.value==='pro')mode.value='advanced';
      const simple=mode.querySelector('option[value="simple"]');
      const advanced=mode.querySelector('option[value="advanced"]');
      if(simple)simple.textContent='Essenziale';
      if(advanced)advanced.textContent='Completa';
      const label=mode.closest('label');
      if(label){
        const texts=[...label.childNodes].filter(n=>n.nodeType===3&&n.nodeValue.trim());
        if(texts[0])texts[0].nodeValue='Modalità di lettura ';
      }
    }
  }

  function profileValues(){
    return {
      name:(byId('profileName')?.value||'').trim(),
      avatar:byId('avatarSelect')?.value||'🦊',
      mode:byId('viewMode')?.value||'simple'
    };
  }

  function updateProfilePreview(){
    const p=profileValues();
    const avatar=byId('v23ProfileAvatar');
    const name=byId('v23ProfileName');
    const mode=byId('v23ProfileMode');
    if(avatar)avatar.textContent=p.avatar;
    if(name)name.textContent=p.name||'Il mio profilo';
    if(mode)mode.textContent=p.mode==='advanced'?'Lettura completa':'Lettura essenziale';
    const topA=byId('avatar');
    const topN=byId('profileNameTop');
    if(topA)topA.textContent=p.avatar;
    if(topN&&p.name)topN.textContent=p.name;
  }

  function setupProfile(){
    removePro();
    const drawer=byId('profileDrawer');
    const nameInput=byId('profileName');
    const grid=byId('v21AvatarGrid');
    if(!drawer||!nameInput)return;
    nameInput.placeholder='Come vuoi comparire';
    const save=byId('saveProfile');
    if(save)save.textContent='Salva profilo';
    const headSmall=q('.drawer-head small',drawer);
    if(headSmall)headSmall.textContent='Nome, personaggio e identità visiva';
    if(!byId('v23ProfilePreview')){
      const preview=document.createElement('div');
      preview.id='v23ProfilePreview';
      preview.className='v23-profile-preview';
      preview.innerHTML='<div id="v23ProfileAvatar" class="v23-profile-avatar">🦊</div><div><span>PROFILO ATTIVO</span><b id="v23ProfileName">Il mio profilo</b><small id="v23ProfileMode">Lettura essenziale</small></div>';
      const firstLabel=drawer.querySelector('label');
      drawer.insertBefore(preview,firstLabel||drawer.children[1]||null);
    }
    const title=byId('v21AvatarTitle');
    if(title)title.textContent='Scegli il tuo personaggio';
    qa('.v21-avatar-choice',grid||document).forEach(b=>{b.title='Usa '+b.textContent.trim()+' come personaggio del profilo'});
    const rerender=()=>{
      setTimeout(()=>{
        const selected=byId('avatarSelect')?.value;
        qa('.v21-avatar-choice').forEach(b=>b.classList.toggle('active',b.dataset.avatar===selected));
        updateProfilePreview();
      },0);
    };
    nameInput.addEventListener('input',updateProfilePreview);
    byId('avatarSelect')?.addEventListener('change',rerender);
    byId('viewMode')?.addEventListener('change',updateProfilePreview);
    grid?.addEventListener('click',rerender);
    save?.addEventListener('click',()=>setTimeout(updateProfilePreview,40));
    updateProfilePreview();
  }

  function markFocused(){
    qa('.panel').forEach(p=>p.classList.toggle('v23-current',p.classList.contains('open')));
  }

  function patchPanelHead(panel){
    const head=q(':scope > .section-head',panel);
    if(!head||head.dataset.v23Focus)return;
    head.dataset.v23Focus='1';
    if(!q('.v23-open-badge',head)){
      const badge=document.createElement('small');
      badge.className='v23-open-badge';
      badge.textContent='IN LETTURA';
      head.querySelector('div')?.appendChild(badge);
    }
    head.onclick=e=>{
      e.preventDefault();
      const opening=!panel.classList.contains('open');
      qa('.panel.open').forEach(p=>{if(p!==panel)p.classList.remove('open')});
      panel.classList.toggle('open',opening);
      markFocused();
      if(opening)setTimeout(()=>panel.scrollIntoView({behavior:'smooth',block:'start'}),30);
    };
  }

  function setupFocusPanels(){
    qa('.panel').forEach(patchPanelHead);
    markFocused();
    try{
      const baseOpen=window.openSection;
      if(typeof baseOpen==='function'&&!window.__v23OpenWrapped){
        window.__v23OpenWrapped=true;
        window.openSection=function(key){const r=baseOpen(key);setTimeout(markFocused,0);return r};
        try{openSection=window.openSection}catch{}
      }
    }catch{}
    const mo=new MutationObserver(()=>qa('.panel').forEach(patchPanelHead));
    mo.observe(document.body,{childList:true,subtree:true});
  }

  function historySummary(){
    const a=(typeof state!=='undefined'&&Array.isArray(state.history)?state.history:[]).map(x=>num(x?.[4])).filter(x=>x>0);
    if(a.length<2)return null;
    let peak=a[0],dd=0;
    for(const x of a){peak=Math.max(peak,x);dd=Math.min(dd,(x/peak-1)*100)}
    return {period:state.period||'24h',points:a.length,movePct:(a.at(-1)/a[0]-1)*100,maxDrawdownPct:dd,min:Math.min(...a),max:Math.max(...a)};
  }

  function dossierContext(){
    try{return {news:(V18?.dossier?.news||[]).slice(0,8),tokens:(V18?.dossier?.tokens||[]).slice(0,8)}}catch{return {news:[],tokens:[]}}
  }

  function saveConversation(){
    V23.conversation=V23.conversation.slice(-16);
    try{localStorage.setItem(CHAT_KEY,JSON.stringify(V23.conversation))}catch{}
  }

  function appendMessage(role,text,thinking=false){
    const messages=byId('chatMessages');
    if(!messages)return null;
    const div=document.createElement('div');
    div.className=(role==='user'?'user-msg':'assistant-msg')+(thinking?' v23-thinking':'');
    div.innerHTML=escHtml(text).replace(/\n/g,'<br>');
    messages.appendChild(div);
    messages.scrollTop=messages.scrollHeight;
    return div;
  }

  async function universalAsk(prefill){
    if(V23.busy)return;
    const input=byId('chatInput');
    const question=String(prefill||input?.value||'').trim();
    if(!question)return;
    if(input)input.value='';
    appendMessage('user',question);
    V23.conversation.push({role:'user',content:question});
    saveConversation();
    const thinking=appendMessage('assistant','Kiber sta collegando mercato, storico, notizie e dossier…',true);
    V23.busy=true;
    const send=byId('chatSend');
    if(send)send.disabled=true;
    const t=typeof state!=='undefined'?state.selected:null;
    const sector=window.KIBER_SECTOR_CONTEXT||null;
    const body={
      message:question,
      profile:profileValues(),
      sector:sector?{title:sector.title,text:sector.text,metrics:sector.metrics,risks:sector.risks}:null,
      token:t?{
        symbol:t.symbol,name:t.name,address:t.address,priceUsd:t.priceUsd,change24:t.change24,
        liquidityUsd:t.liquidityUsd,volume24hUsd:t.volume24hUsd,marketCap:t.marketCap,riskScore:t.riskScore,
        pairCount:t.pairCount,dexes:t.dexes,buys24h:t.buys24h,sells24h:t.sells24h,sector:t.sector,subsector:t.subsector
      }:null,
      watchlist:typeof state!=='undefined'?(state.watch||[]).slice(0,18):[],
      news:typeof state!=='undefined'?(state.news||[]).slice(0,15).map(n=>({title:n.title,source:n.sources?.[0]?.name||n.source,category:n.category,impact:n.impact_label||n.impact,why:n.why_it_matters||n.why,published:n.published_at||n.published,token_addresses:n.token_addresses||[]})):[],
      analysis:{history:historySummary(),dossier:dossierContext()},
      conversation:V23.conversation.slice(-10)
    };
    let answer='';
    let model='';
    try{
      const r=await fetch('/api/kiber',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Kiber AI non disponibile');
      answer=String(d.answer||'').trim();
      model=d.model||'OpenAI';
      if(!answer)throw new Error('Risposta vuota');
      const mode=byId('chatMode');
      if(mode)mode.textContent=`Kiber AI · ${model} · contesto live della dashboard`;
    }catch(e){
      try{answer=(typeof localKiber==='function'?localKiber(question):'Kiber AI non è raggiungibile dal server in questo momento.');}catch{answer='Kiber AI non è raggiungibile dal server in questo momento.'}
      answer='Modalità locale: '+answer;
      const mode=byId('chatMode');
      if(mode)mode.textContent='Kiber locale · collegamento OpenAI non disponibile in questa richiesta';
    }
    if(thinking){thinking.classList.remove('v23-thinking');thinking.innerHTML=escHtml(answer).replace(/\n/g,'<br>')}
    V23.conversation.push({role:'assistant',content:answer});
    saveConversation();
    V23.busy=false;
    if(send)send.disabled=false;
    byId('chatMessages')?.scrollTo({top:byId('chatMessages').scrollHeight,behavior:'smooth'});
  }

  function updateAiContext(){
    const box=byId('v23AiContext');
    if(!box||typeof state==='undefined')return;
    const t=state.selected;
    const d=dossierContext();
    box.innerHTML=`<span>${t?'Token: '+escHtml(t.symbol||t.name):'Nessun token aperto'}</span><span>${(state.watch||[]).length} monitorati</span><span>${(state.news||[]).length} news</span><span>${d.news.length+d.tokens.length} elementi dossier</span>`;
  }

  function setupKiberAI(){
    const sec=byId('section-kiber');
    if(!sec)return;
    const h=q('.section-head h2',sec),p=q('.section-head p',sec),body=q('.section-body',sec);
    if(h)h.textContent='Kiber AI';
    if(p)p.textContent='OpenAI + mercato + grafico + notizie + memoria + dossier, nello stesso contesto.';
    if(body&&!byId('v23AiIntro')){
      const intro=document.createElement('div');
      intro.id='v23AiIntro';
      intro.className='v23-ai-intro';
      intro.innerHTML='<div class="v23-ai-head"><img src="assets/kiber-logo-official.webp" alt="Kiber"><div><span>KIBER AI</span><b>Analisi interattiva, non una risposta isolata</b><small>Ricorda il contesto della sessione e distingue dati, ipotesi e informazioni mancanti.</small></div></div><div id="v23AiContext" class="v23-ai-context"></div><div class="v23-ai-prompts"><button type="button" data-v23-prompt="Spiegami cosa sta muovendo il token aperto e quali dati sostengono questa lettura.">Perché si muove?</button><button type="button" data-v23-prompt="Collega le notizie recenti al token aperto: cosa è plausibile, cosa è solo coincidenza e cosa manca da verificare?">News collegate</button><button type="button" data-v23-prompt="Quali sono i rischi principali del token aperto e quali segnali devo monitorare per primi?">Rischi</button><button type="button" data-v23-prompt="Fammi un riepilogo operativo del contesto attuale: fatti osservati, possibili cause, dati contrari e prossimi controlli.">Sintesi intelligente</button></div>';
      body.insertBefore(intro,body.firstChild);
      qa('[data-v23-prompt]',intro).forEach(b=>b.onclick=()=>universalAsk(b.dataset.v23Prompt));
    }
    const messages=byId('chatMessages');
    if(messages&&!messages.dataset.v23){
      messages.dataset.v23='1';
      const first=q('.assistant-msg',messages);
      if(first)first.textContent='Sono Kiber. Apri un token, una notizia o un dossier e chiedimi cosa sta succedendo, quali dati lo sostengono e cosa manca per confermarlo.';
    }
    const mode=byId('chatMode');
    if(mode)mode.textContent='Kiber AI usa OpenAI tramite server e il contesto della dashboard; non inventa dati mancanti.';
    const send=byId('chatSend'),input=byId('chatInput');
    if(send)send.onclick=()=>universalAsk();
    if(input)input.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();universalAsk()}};
    try{window.sendChat=universalAsk;sendChat=universalAsk}catch{}
    updateAiContext();
    setInterval(updateAiContext,2500);
  }

  function setupAddressAdd(){
    const sec=byId('section-watch');
    const body=q('.section-body',sec||document);
    if(!body||byId('v23AddToken'))return;
    const box=document.createElement('div');
    box.id='v23AddToken';
    box.className='v23-add-token';
    box.innerHTML='<div><span>AGGIUNGI TOKEN</span><b>Incolla il contract address BNB Chain</b><small>Puoi copiarlo da CoinGecko, BscScan, DexScreener o dalla fonte che stai usando.</small></div><div class="v23-add-token-row"><input id="v23TokenAddress" autocomplete="off" spellcheck="false" placeholder="0x…"><button type="button" class="primary" id="v23AddTokenBtn">Verifica e aggiungi</button></div><div id="v23AddTokenState" class="v23-add-token-state">Il contratto viene verificato prima di entrare nei monitorati.</div>';
    const summary=q('.watch-summary',body);
    if(summary)summary.insertAdjacentElement('afterend',box);else body.insertBefore(box,body.firstChild);
    const add=async()=>{
      const input=byId('v23TokenAddress'),status=byId('v23AddTokenState'),btn=byId('v23AddTokenBtn');
      const address=(input?.value||'').trim();
      if(!/^0x[a-fA-F0-9]{40}$/.test(address)){status.textContent='Address non valido: serve un contract 0x di 42 caratteri.';status.className='v23-add-token-state error';return}
      btn.disabled=true;status.textContent='Verifica contratto e dati BNB Chain…';status.className='v23-add-token-state';
      try{
        if(typeof openToken!=='function'||typeof addWatch!=='function')throw new Error('funzioni non pronte');
        await openToken(address);
        await sleep(80);
        const selected=typeof state!=='undefined'?state.selected:null;
        if(!selected?.address||selected.address.toLowerCase()!==address.toLowerCase())throw new Error('token non trovato');
        await addWatch();
        status.textContent=`${selected.symbol||selected.name||'Token'} verificato e aggiunto ai monitorati.`;
        status.className='v23-add-token-state ok';
        input.value='';
        if(typeof openSection==='function')openSection('watch');
      }catch(e){status.textContent='Non riesco a verificare questo contratto sulla BNB Chain. Controlla address e riprova.';status.className='v23-add-token-state error'}
      finally{btn.disabled=false;updateAiContext()}
    };
    byId('v23AddTokenBtn').onclick=add;
    byId('v23TokenAddress').onkeydown=e=>{if(e.key==='Enter')add()};
  }

  function movementFacts(t){
    const change=num(t?.change24),liq=num(t?.liquidityUsd),vol=num(t?.volume24hUsd),buys=num(t?.buys24h),sells=num(t?.sells24h),ratio=liq>0?vol/liq:0;
    const parts=[`Prezzo 24h ${fmtPct(change)}`,`liquidità ${compact(liq)}`,`volume ${compact(vol)}`];
    if(buys||sells)parts.push(`buy/sell ${Math.round(buys)}/${Math.round(sells)}`);
    let reading='Movimento da leggere insieme a news, liquidità e flussi.';
    if(Math.abs(change)>=8&&ratio>=1)reading='Movimento ampio accompagnato da attività elevata rispetto alla liquidità.';
    else if(Math.abs(change)>=8)reading='Movimento ampio, ma il volume relativo non basta da solo a spiegarne la causa.';
    else if(ratio>=1)reading='Attività elevata rispetto alla liquidità, con prezzo ancora meno direzionale.';
    if(buys>sells*1.2)reading+=' I buy prevalgono nei dati disponibili.';
    else if(sells>buys*1.2)reading+=' I sell prevalgono nei dati disponibili.';
    return {parts,reading};
  }

  async function analyzeDossierV23(){
    try{if(typeof ensureDossierPanel==='function')ensureDossierPanel()}catch{}
    const out=byId('dossierOutput');
    if(!out)return;
    const dossier=dossierContext();
    if(!dossier.news.length&&!dossier.tokens.length){out.innerHTML='<div class="muted">Aggiungi almeno una notizia o un token al dossier.</div>';return}
    out.innerHTML='<div class="research-loading">Kiber collega movimento, dati live, notizie e fonti…</div>';
    try{
      const [research,liveSettled]=await Promise.all([
        j(RESEARCH+'?type=dossier',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({tokens:dossier.tokens,news:dossier.news})}),
        Promise.allSettled(dossier.tokens.slice(0,8).map(t=>j(INTEL+'?type=token&address='+encodeURIComponent(t.address))))
      ]);
      const live=liveSettled.map((r,i)=>r.status==='fulfilled'?(r.value.token||r.value):{...dossier.tokens[i]}).filter(Boolean);
      const movement=live.length?`<div class="v23-dossier-block"><div class="v23-dossier-title"><span>1</span><div><b>Movimento osservato</b><small>Prima i fatti, poi le spiegazioni.</small></div></div><div class="v23-move-grid">${live.map(t=>{const f=movementFacts(t);return`<article class="v23-move-card"><div><b>${escHtml(t.symbol||t.name||'Token')}</b><strong class="${num(t.change24)>=0?'up':'down'}">${fmtPct(t.change24)}</strong></div><p>${f.parts.map(escHtml).join(' · ')}</p><small>${escHtml(f.reading)}</small></article>`}).join('')}</div></div>`:'';
      const themes=(research.themes||research.factors||[]).slice(0,6);
      const articles=(research.articles||[]).slice(0,10);
      const explanation=`<div class="v23-dossier-block"><div class="v23-dossier-title"><span>2</span><div><b>Perché potrebbe accadere</b><small>Connessioni supportate dalle fonti disponibili, non causalità inventata.</small></div></div><div class="v23-conclusion"><b>${escHtml(research.conclusion||'Nessuna causa dominante identificata con sufficiente evidenza.')}</b><span>Confidenza ricerca ${Math.round(num(research.confidence)*100)}%</span></div><div class="research-factors">${themes.map(x=>`<span>${escHtml(x.label||x.name||'Fattore')} · ${num(x.count)||1}</span>`).join('')||'<span>Nessun fattore forte trovato</span>'}</div></div>`;
      const evidence=`<div class="v23-dossier-block"><div class="v23-dossier-title"><span>3</span><div><b>Prove da leggere</b><small>Fonti e notizie che hanno generato la connessione.</small></div></div><div class="research-results">${articles.map(x=>`<a href="${escHtml(x.url||'#')}" target="_blank" rel="noopener"><b>${escHtml(x.title||'Fonte')}</b><small>${escHtml(x.source||x.sources?.join(', ')||'Fonte')} ${x.factor?'· '+escHtml(x.factor):''}</small></a>`).join('')||'<div class="muted">Nessuna fonte abbastanza pertinente nel periodo analizzato.</div>'}</div></div>`;
      const takeaway=`<div class="v23-takeaway"><span>COSA PORTARSI VIA</span><b>${escHtml(research.conclusion||'Il movimento va ancora verificato con dati e fonti aggiuntive.')}</b><p>Per rafforzare o smentire questa lettura, controlla se volume, liquidità e flusso buy/sell continuano nella stessa direzione dopo la notizia. La coincidenza temporale da sola non prova la causa.</p></div>`;
      out.innerHTML=movement+explanation+evidence+takeaway;
    }catch(e){out.innerHTML='<div class="muted">Analisi dossier non disponibile in questo momento. I dati già salvati nel dossier restano intatti.</div>'}
  }

  function setupDossier(){
    try{if(typeof ensureDossierPanel==='function')ensureDossierPanel()}catch{}
    const sec=byId('section-dossier');
    if(sec){
      const h=q('.section-head h2',sec),p=q('.section-head p',sec);
      if(h)h.textContent='Dossier · Movimento & Cause';
      if(p)p.textContent='Collega token, notizie e dati di mercato per capire cosa si muove e quali spiegazioni hanno davvero supporto.';
      patchPanelHead(sec);
    }
    const run=byId('runDossier');
    if(run){run.textContent='Collega movimento e notizie';run.onclick=analyzeDossierV23}
    try{window.analyzeDossier=analyzeDossierV23;analyzeDossier=analyzeDossierV23}catch{}
  }

  function enhanceNewsModal(){
    try{
      const base=window.openNews||openNews;
      if(typeof base!=='function'||window.__v23NewsWrapped)return;
      window.__v23NewsWrapped=true;
      const wrapped=function(i){
        base(i);
        const n=typeof state!=='undefined'?state.news?.[i]:null;
        const t=typeof state!=='undefined'?state.selected:null;
        const modal=byId('modalBody');
        if(!n||!modal)return;
        const facts=t?movementFacts(t):null;
        const card=document.createElement('div');
        card.className='v23-news-connection';
        card.innerHTML=t?`<span>COLLEGAMENTO AL MOVIMENTO</span><b>${escHtml(t.symbol||t.name)} · ${fmtPct(t.change24)} nelle 24h</b><p>${escHtml(facts.reading)}</p><small>Questa notizia può essere confrontata con il movimento, ma non viene dichiarata automaticamente come causa.</small>`:`<span>COLLEGAMENTO AL MOVIMENTO</span><b>Apri un token per confrontare questa notizia con prezzo, volume, liquidità e flussi.</b>`;
        const source=q('.source-list',modal);
        if(source)modal.insertBefore(card,source);else modal.appendChild(card);
      };
      window.openNews=wrapped;
      try{openNews=wrapped}catch{}
    }catch{}
  }

  function boot(){
    setVersion();
    removePro();
    setupProfile();
    setupFocusPanels();
    setupKiberAI();
    setupAddressAdd();
    setupDossier();
    enhanceNewsModal();
    setTimeout(()=>{removePro();setupProfile();setupAddressAdd();setupDossier();enhanceNewsModal();updateAiContext()},800);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
