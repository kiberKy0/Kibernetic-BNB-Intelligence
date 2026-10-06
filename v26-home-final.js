(()=>{
  const q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],id=x=>document.getElementById(x);
  const S={chain:null,news:null,discovery:null,mode:'bnb',days:30,feed:'news'};
  const n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
  const clamp=(v,a=-100,b=100)=>Math.max(a,Math.min(b,v));
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const money=v=>{v=n(v);if(v===null)return'—';const a=Math.abs(v);if(a>=1e12)return'$'+(v/1e12).toFixed(2)+'T';if(a>=1e9)return'$'+(v/1e9).toFixed(2)+'B';if(a>=1e6)return'$'+(v/1e6).toFixed(2)+'M';if(a>=1e3)return'$'+(v/1e3).toFixed(1)+'K';return'$'+v.toLocaleString('it-IT',{maximumFractionDigits:a<1?6:2})};
  const pct=v=>{v=n(v);return v===null?'—':`${v>=0?'+':''}${v.toLocaleString('it-IT',{maximumFractionDigits:2})}%`};
  const ageHours=d=>{const t=Date.parse(d||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/36e5):null};
  async function j(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(String(r.status));return r.json()}

  function build(){
    const home=id('v241Home');if(!home||id('v26FinalHome'))return false;
    document.body.classList.add('v26-final-home');
    const box=document.createElement('section');box.id='v26FinalHome';box.className='v26f-home';box.innerHTML=`
      <div class="v26f-head"><div><span class="v26f-kicker">BNB CHAIN OGGI</span><h1><span id="v26fBnbPrice">—</span> <small id="v26fBnbMove">—</small></h1><p>Prezzo BNB, capitale DeFi, stablecoin, attività DEX e notizie letti nello stesso quadro.</p></div><div class="v26f-score"><span>Scenario 24-72h</span><b id="v26fDirection">Calcolo…</b><small id="v26fScore">score —</small></div></div>
      <div class="v26f-money"><div><span>Valore BNB</span><b id="v26fCap">—</b><small>market cap della moneta</small></div><div><span>Capitale DeFi (TVL)</span><b id="v26fTvl">—</b><small>capitale bloccato nei protocolli</small></div><div><span>Stablecoin nella rete</span><b id="v26fStable">—</b><small>liquidità stabile presente</small></div><div><span>DEX 24H</span><b id="v26fDex">—</b><small id="v26fDexMove">volume di scambio</small></div></div>
      <div class="v26f-chart-block"><div class="v26f-chart-top"><b>Andamento BNB Chain</b><div class="v26f-switch"><button data-v26f-mode="bnb" class="active">BNB</button><button data-v26f-mode="chain">Chain · TVL</button></div></div><div class="v26f-chart-sub"><span id="v26fGraphTitle">Prezzo BNB</span><div class="v26f-periods"><button data-v26f-days="7">7G</button><button data-v26f-days="30" class="active">30G</button><button data-v26f-days="90">90G</button><button data-v26f-days="365">1A</button><button data-v26f-days="1095">3A</button></div><b id="v26fGraphMove">—</b></div><div class="v26f-chart-wrap"><svg id="v26fChart" class="v26f-chart" viewBox="0 0 1000 360" preserveAspectRatio="none"></svg></div><p class="v26f-reason" id="v26fReason">Aggiornamento motivazioni in corso…</p><div class="v26f-note">TVL indica il capitale DeFi, non il “valore totale” assoluto della rete. Le news sul grafico sono eventi da verificare, non causalità automatiche.</div></div>
      <div class="v26f-scenario"><div class="v26f-scenario-main"><span>Scenario Kiber · 24-72H</span><h2 id="v26fScenarioTitle">In analisi</h2><p id="v26fScenarioWhy">Kiber sta confrontando prezzo, attività DEX, TVL e flusso news.</p><div class="v26f-scorepill" id="v26fScenarioScore">score —</div><div class="v26f-actions"><button class="primary" id="v26fExplain">Spiegami lo scenario</button><button id="v26fIntel">Apri Intelligence</button></div></div><div class="v26f-change"><span>Cosa può cambiare la lettura</span><ul id="v26fChangeList"><li>Attendo dati sufficienti.</li></ul></div></div>
      <div class="v26f-feed"><div class="v26f-feed-tabs"><button data-v26f-feed="news" class="active">Notizie chiave</button><button data-v26f-feed="projects">Progetti da osservare</button></div><div id="v26fFeed" class="v26f-feed-list"><div class="v26-loading">Aggiornamento fonti…</div></div><div class="v26f-feed-foot" id="v26fFeedFoot">Le notizie e i progetti vengono filtrati per rilevanza; non sono segnali automatici di acquisto o vendita.</div></div>`;
    const cards=q('.v241-cards',home);home.insertBefore(box,cards||home.firstChild);
    qa('[data-v26f-mode]',box).forEach(b=>b.onclick=()=>{S.mode=b.dataset.v26fMode;qa('[data-v26f-mode]',box).forEach(x=>x.classList.toggle('active',x===b));renderChart()});
    qa('[data-v26f-days]',box).forEach(b=>b.onclick=()=>{S.days=Number(b.dataset.v26fDays)||30;qa('[data-v26f-days]',box).forEach(x=>x.classList.toggle('active',x===b));renderChart()});
    qa('[data-v26f-feed]',box).forEach(b=>b.onclick=()=>{S.feed=b.dataset.v26fFeed;qa('[data-v26f-feed]',box).forEach(x=>x.classList.toggle('active',x===b));renderFeed()});
    id('v26fExplain').onclick=explainScenario;id('v26fIntel').onclick=openIntelligence;
    return true;
  }

  function scenario(){
    const b=S.chain?.bnb||{},c=S.chain?.chain||{},counts=S.news?.counts||{};let score=0;const why=[];
    const bm=n(b.change24),dm=n(c.dexChange1d),tv7=n(c.tvlChange7d),nb=(n(counts.positive)||0)-(n(counts.negative)||0);
    if(bm!==null){if(bm>=3){score+=24;why.push(`BNB ${pct(bm)} nelle 24h`)}else if(bm>=1){score+=12;why.push(`BNB moderatamente positiva (${pct(bm)})`)}else if(bm<=-3){score-=24;why.push(`BNB ${pct(bm)} nelle 24h`)}else if(bm<=-1){score-=12;why.push(`BNB moderatamente negativa (${pct(bm)})`)}}
    if(dm!==null){if(dm>=10){score+=24;why.push(`volume DEX in accelerazione (${pct(dm)})`)}else if(dm>=3){score+=12;why.push(`attività DEX in crescita (${pct(dm)})`)}else if(dm<=-10){score-=24;why.push(`volume DEX in contrazione (${pct(dm)})`)}else if(dm<=-3){score-=12;why.push(`attività DEX in calo (${pct(dm)})`)}}
    if(tv7!==null){if(tv7>=3){score+=18;why.push(`TVL in crescita a 7 giorni (${pct(tv7)})`)}else if(tv7<=-3){score-=18;why.push(`TVL in calo a 7 giorni (${pct(tv7)})`)}else why.push('TVL relativamente stabile a 7 giorni')}
    score+=clamp(nb*4,-18,18);if(nb>=2)why.push('flusso news prevalentemente positivo');else if(nb<=-2)why.push('flusso news prevalentemente negativo');else if((counts.high||0)>0)why.push('news ad alto impatto presenti ma quadro misto');
    score=clamp(Math.round(score));const abs=Math.abs(score);let direction=score>=25?'Rialzista':score<=-25?'Ribassista':'Neutrale / misto';if(abs>=55)direction+=' forte';else if(abs>=25)direction+=' moderato';
    const changes=score<=-25?['Recupero del volume DEX e ritorno sopra la media recente','TVL che smette di scendere e torna in crescita','Flusso news positivo confermato da prezzo e volumi']:score>=25?['Contrazione netta del volume DEX','Perdita di TVL accompagnata da pressione sul prezzo','News negative confermate da sell flow e perdita dei supporti']:['Convergenza tra prezzo BNB e volume DEX','Direzione chiara del TVL a 7-30 giorni','News forti confermate da liquidità e flussi'];
    return{score,direction,why:why.slice(0,5),changes};
  }

  function series(){
    const raw=S.mode==='bnb'?(S.chain?.history?.bnb||[]):(S.chain?.history?.chainTvl||[]);if(!raw.length)return[];
    const lastT=n(raw.at(-1)?.t)||Date.now(),cut=lastT-S.days*86400000;return raw.filter(x=>(n(x.t)||0)>=cut&&n(x.v)!==null);
  }

  function renderChart(){
    const svg=id('v26fChart');if(!svg)return;const a=series();id('v26fGraphTitle').textContent=S.mode==='bnb'?'Prezzo BNB':'Capitale DeFi della chain (TVL)';
    if(a.length<2){svg.innerHTML='<text x="40" y="180" class="label">Storico non disponibile dalla fonte corrente</text>';id('v26fGraphMove').textContent='—';return}
    const vals=a.map(x=>n(x.v)).filter(x=>x!==null),lo=Math.min(...vals),hi=Math.max(...vals),range=hi-lo||1,W=1000,H=360,L=48,R=22,T=34,B=42,iw=W-L-R,ih=H-T-B;
    const x=i=>L+(i/(a.length-1))*iw,y=v=>T+(hi-v)/range*ih;const pts=a.map((p,i)=>`${x(i).toFixed(1)},${y(n(p.v)).toFixed(1)}`).join(' ');const area=`${L},${H-B} ${pts} ${W-R},${H-B}`;
    let grid='';for(let i=0;i<5;i++){const yy=T+i*ih/4;grid+=`<line class="grid" x1="${L}" y1="${yy}" x2="${W-R}" y2="${yy}"/>`}
    const news=(S.news?.items||[]).filter(z=>{const t=Date.parse(z.published||'');return Number.isFinite(t)&&t>=a[0].t&&t<=a.at(-1).t}).slice(0,5);let marks='';
    for(const z of news){const t=Date.parse(z.published),idx=a.reduce((best,p,i)=>Math.abs(p.t-t)<Math.abs(a[best].t-t)?i:best,0),cx=x(idx),cy=y(n(a[idx].v));marks+=`<circle class="newsmark" cx="${cx}" cy="${cy}" r="7"><title>${esc(z.title)}</title></circle>`}
    const fmt=S.mode==='bnb'?money:(v=>money(v));const first=n(a[0].v),last=n(a.at(-1).v),move=first&&last!==null?(last/first-1)*100:null;id('v26fGraphMove').textContent=`${pct(move)} · ${S.days===365?'1A':S.days===1095?'3A':S.days+'G'}`;
    svg.innerHTML=`<defs><linearGradient id="v26fArea" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#43d4ff" stop-opacity=".22"/><stop offset="100%" stop-color="#43d4ff" stop-opacity="0"/></linearGradient></defs>${grid}<polygon class="area" points="${area}"/><polyline class="line" points="${pts}"/>${marks}<text class="label" x="${L}" y="24">${esc(fmt(hi))}</text><text class="label" x="${L}" y="${H-10}">${esc(fmt(lo))}</text>`;
  }

  function render(){
    if(!id('v26FinalHome'))return;const b=S.chain?.bnb||{},c=S.chain?.chain||{},s=scenario();
    id('v26fBnbPrice').textContent=money(b.price);id('v26fBnbMove').textContent=pct(b.change24);id('v26fCap').textContent=money(b.marketCap);id('v26fTvl').textContent=money(c.tvl);id('v26fStable').textContent=money(c.stablecoins);id('v26fDex').textContent=money(c.dexVolume24);id('v26fDexMove').textContent=n(c.dexChange1d)===null?'volume di scambio':`${pct(c.dexChange1d)} vs periodo precedente`;
    id('v26fDirection').textContent=s.direction;id('v26fScore').textContent=`score ${s.score>=0?'+':''}${s.score}/100`;id('v26fScenarioTitle').textContent=s.direction;id('v26fScenarioWhy').textContent=s.why.join(' · ')||'I segnali non sono ancora abbastanza convergenti.';id('v26fScenarioScore').textContent=`Kiber scenario score ${s.score>=0?'+':''}${s.score}/100`;id('v26fChangeList').innerHTML=s.changes.map(x=>`<li>${esc(x)}</li>`).join('');id('v26fReason').innerHTML=`<b>Perché si muove:</b> ${esc(s.why.slice(0,4).join(' · ')||'non ci sono ancora abbastanza segnali concordi per attribuire una direzione.')}`;renderChart();renderFeed();
  }

  function renderFeed(){
    const box=id('v26fFeed');if(!box)return;if(S.feed==='news'){
      const a=(S.news?.items||[]).slice(0,4);box.innerHTML=a.length?a.map(x=>`<a class="v26f-feed-item" href="${esc(x.url||'#')}" target="_blank" rel="noopener"><div><b>${esc(x.title)}</b><small>${esc(x.source||'Fonte')} · ${x.category?esc(x.category):'Mercato'}${ageHours(x.published)!==null?' · '+Math.round(ageHours(x.published))+'h fa':''}</small></div><em class="${x.impact==='alto'?'high':''}">${esc(x.impact||'basso')} · ${esc(x.tone||'misto')}</em></a>`).join(''):'<div class="v26-empty">Nessuna notizia prioritaria disponibile in questo momento.</div>';id('v26fFeedFoot').textContent='Le notizie vengono ordinate per freschezza, fonte, rilevanza e impatto. Il movimento di prezzo deve comunque confermare la narrativa.';
    }else{
      const a=(S.discovery?.candidates||[]).slice(0,3);box.innerHTML=a.length?a.map(x=>`<button class="v26f-feed-item" data-v26f-token="${esc(x.address)}"><div><b>${esc(x.symbol||'?')} · ${esc(x.name||'Progetto')}</b><small>${money(x.metrics?.marketCap)} market cap · ${money(x.metrics?.liquidityUsd)} liquidità · ${esc((x.why||[]).slice(0,2).join(' · ')||'da approfondire')}</small></div><em class="${n(x.score)>=75?'hot':''}">${n(x.score)??'—'}/100</em></button>`).join(''):'<div class="v26-empty">Nessun progetto emergente supera al momento i filtri minimi.</div>';qa('[data-v26f-token]',box).forEach(b=>b.onclick=()=>openTokenCandidate(b.dataset.v26fToken));id('v26fFeedFoot').textContent='Emergente significa “merita approfondimento”: liquidità, età, market cap e attività vengono filtrati, ma non certificano team o contratto.';
    }
  }

  function openTokenCandidate(address){q('[data-v241-open="market"]')?.click();setTimeout(()=>{q('[data-v241-sub="analysis"]')?.click();setTimeout(()=>{try{if(typeof window.openToken==='function')window.openToken(address);else if(typeof openToken==='function')openToken(address)}catch{}},80)},80)}
  function openIntelligence(){q('[data-v241-open="intelligence"]')?.click();setTimeout(()=>q('[data-v241-sub="chain"]')?.click(),60)}
  function explainScenario(){const s=scenario();q('[data-v241-open="kiber"]')?.click();setTimeout(()=>{const inp=id('chatInput');if(!inp)return;inp.value=`Spiegami lo scenario BNB Chain attuale (${s.direction}, score ${s.score}/100): quali dati lo sostengono, quali notizie possono incidere, cosa lo contraddice e quali segnali cambierebbero la previsione nelle prossime 24-72 ore.`;id('chatSend')?.click()},180)}

  async function load(){
    const r=await Promise.allSettled([j('/api/chain?v=26-final'),j('/api/news-v26?v=26-final'),j('/api/discovery-v26?v=26-final')]);if(r[0].status==='fulfilled')S.chain=r[0].value;if(r[1].status==='fulfilled')S.news=r[1].value;if(r[2].status==='fulfilled')S.discovery=r[2].value;render();
  }

  function cleanNews(){
    const sec=id('section-news');if(!sec)return;const h=q('.section-head h2',sec),p=q('.section-head p',sec);if(h)h.textContent='Notizie & impatto';if(p)p.textContent='Tutte le notizie rilevanti riunite e filtrate per mercato, BNB, token, DeFi, IA, macro e regolamentazione.';
    qa('#newsTabs button',sec).forEach(b=>{if(b.dataset.news==='all'||/^tutte$/i.test(b.textContent.trim()))b.textContent='Generale';if(b.dataset.news==='policy'||/^regole$/i.test(b.textContent.trim()))b.textContent='Regolamentazione';if(b.dataset.news==='macro')b.textContent='Macro'});
    qa('button',sec).forEach(b=>{if(/analizza\s*\+\s*token/i.test(b.textContent||''))b.remove()});
  }

  function cleanChat(){
    const sec=id('section-kiber');if(!sec)return;id('v23AiIntro')?.classList.add('v26-hide-legacy');const h=q('.section-head h2',sec),p=q('.section-head p',sec);if(h)h.textContent='Kiber AI';if(p)p.textContent='Chiedi cosa sta succedendo alla BNB Chain, al mercato o al token aperto.';
    const messages=id('chatMessages');qa('.section-body > *',sec).forEach(el=>{if(el===messages||el.contains(messages)||el.classList.contains('chat-input')||el.id==='chatMode')return;const txt=(el.textContent||'').toLowerCase();if(el.querySelector('img')&&(txt.includes('kiber intelligence')||txt.includes('intelligence center v24')||txt.includes('chiedi a kiber')))el.classList.add('v26-hide-legacy')});
  }

  function profile(){
    const drawer=id('profileDrawer');if(!drawer)return;id('v23ProfilePreview')?.classList.add('v26-hide-legacy');const small=q('.drawer-head small',drawer);if(small)small.textContent='Profilo e preferenze';
    let row=id('v26ProfileCompact');if(!row){row=document.createElement('div');row.id='v26ProfileCompact';row.className='v26-profile-compact';row.innerHTML='<div class="v26-profile-initial" id="v26ProfileInitial">U</div><div class="v26-profile-copy"><b id="v26ProfileName">Profilo</b><small id="v26ProfileMode">Lettura essenziale</small></div>';const first=drawer.querySelector('label');drawer.insertBefore(row,first||drawer.children[1]||null)}
    const name=(id('profileName')?.value||id('profileNameTop')?.textContent||'Profilo').trim()||'Profilo',mode=id('viewMode')?.selectedOptions?.[0]?.textContent||'Essenziale',initial=(name.match(/[A-Za-zÀ-ÿ0-9]/)?.[0]||'U').toUpperCase();id('v26ProfileInitial')&&(id('v26ProfileInitial').textContent=initial);id('v26ProfileName')&&(id('v26ProfileName').textContent=name);id('v26ProfileMode')&&(id('v26ProfileMode').textContent='Lettura '+mode.toLowerCase());const top=id('avatar');if(top){top.textContent=initial;top.classList.add('v26-profile-top')}
    const notif=id('enableNotifications');if(notif&&/attiva notifiche del browser/i.test(notif.textContent))notif.textContent='Notifiche browser';
    if(!drawer.dataset.v26ProfileBound){drawer.dataset.v26ProfileBound='1';id('profileName')?.addEventListener('input',profile);id('viewMode')?.addEventListener('change',profile);id('saveProfile')?.addEventListener('click',()=>setTimeout(profile,80))}
  }

  function boot(){
    const ready=build();if(!ready){setTimeout(boot,180);return}cleanNews();cleanChat();profile();load();setInterval(()=>{cleanNews();cleanChat();profile()},3000);setInterval(load,120000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
