(()=>{
  const $=id=>document.getElementById(id);
  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const LOGO='assets/kiber-logo.svg?v=v20-logo-exact-2';
  const HERO_TITLE='Capire cosa si muove, quando e perché.';
  const HERO_TEXT='Kiber collega mercato, storico, liquidità, volume e notizie. Il grafico è il centro dell’indagine: seleziona un momento e cerca cosa stava accadendo.';
  const AVATARS=[['🤖','Robot'],['🦊','Volpe'],['🐺','Lupo'],['🦁','Leone'],['🐯','Tigre'],['🦉','Gufo'],['🐼','Panda'],['🐉','Drago']];

  function ensureLegacyStatus(){let legacy=$('appStatus');if(!legacy){legacy=document.createElement('span');legacy.id='appStatus';legacy.hidden=true;legacy.setAttribute('aria-hidden','true');legacy.style.display='none';document.body.appendChild(legacy)}return legacy}
  function statusText(){const online=String($('monitorState')?.textContent||'').toLowerCase().includes('online');return online?'V20 · KIBER BNB INTELLIGENCE · MONITOR H24':'V20 · KIBER BNB INTELLIGENCE'}
  function setStatus(){const s=$('v20Status');if(!s)return;const next=statusText();if(s.textContent!==next)s.textContent=next;s.classList.add('brand-live')}
  function enforceHero(){document.title='Kiber BNB Intelligence V20';const hero=qs('.hero');if(!hero)return;const eye=qs('.eyebrow',hero),h1=qs('h1',hero),p=qs(':scope > p',hero);if(eye)eye.textContent='KIBER BNB INTELLIGENCE · V20';if(h1)h1.textContent=HERO_TITLE;if(p)p.textContent=HERO_TEXT}
  function loadTokenLogoModule(){if(document.querySelector('script[data-kiber-token-icons]'))return;const s=document.createElement('script');s.src='v20-token-icons.js?v=20-token-4';s.async=false;s.dataset.kiberTokenIcons='1';document.body.appendChild(s)}
  function loadLogoStyle(){if(document.querySelector('link[data-kiber-logo-style]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='v20-logo-bw.css?v=logo-exact-2';l.dataset.kiberLogoStyle='1';document.head.appendChild(l)}

  function setLabelText(label,text){if(!label)return;for(const n of label.childNodes){if(n.nodeType===3&&n.nodeValue.trim()){n.nodeValue=text;return}}label.insertBefore(document.createTextNode(text),label.firstChild)}
  function setupProfile(){
    const sel=$('avatarSelect');
    if(sel){const current=state.profile?.avatar||sel.value||'🤖';sel.innerHTML=AVATARS.map(([v,n])=>`<option value="${v}">${v} ${n}</option>`).join('');sel.value=AVATARS.some(x=>x[0]===current)?current:'🤖'}
    const theme=$('themeSelect');if(theme){theme.value='dark';const lab=theme.closest('label');if(lab)lab.hidden=true}
    const aLab=sel?.closest('label');setLabelText(aLab,'Personaggio');
    const nLab=$('profileName')?.closest('label');setLabelText(nLab,'Nome profilo');
    const lLab=$('viewMode')?.closest('label');setLabelText(lLab,'Livello di dettaglio');
    if($('saveProfile'))$('saveProfile').textContent='Salva profilo';
    if($('enableNotifications'))$('enableNotifications').textContent='Attiva notifiche del browser';
    if(state.profile){state.profile.theme='dark';localStorage.setItem('kiber_v17_profile',JSON.stringify(state.profile))}
    document.body.className='theme-dark';
    applyV20Profile();
    if(sel)sel.onchange=()=>previewAvatar(sel.value);
    if($('saveProfile'))$('saveProfile').onclick=saveV20Profile;
  }
  function previewAvatar(v){const av=$('avatar');if(!av)return;av.style.backgroundImage='none';av.textContent=v||'🤖';av.classList.add('profile-avatar-emoji')}
  function applyV20Profile(){const p=state.profile||{};if($('profileName'))$('profileName').value=p.name||'';if($('avatarSelect'))$('avatarSelect').value=p.avatar||'🤖';if($('viewMode'))$('viewMode').value=p.mode||'simple';if($('themeSelect'))$('themeSelect').value='dark';previewAvatar(p.avatar||'🤖');if($('profileNameTop'))$('profileNameTop').textContent=p.name||'Profilo';document.body.className='theme-dark';document.body.dataset.mode=p.mode||'simple'}
  function saveV20Profile(){state.profile={name:$('profileName')?.value.trim()||'',avatar:$('avatarSelect')?.value||'🤖',theme:'dark',mode:$('viewMode')?.value||'simple'};localStorage.setItem('kiber_v17_profile',JSON.stringify(state.profile));applyV20Profile();$('profileDrawer')?.classList.remove('show')}

  function translateStatic(){
    const pairs=[
      ['#section-news .section-head h2','Analisi delle notizie'],
      ['#section-news .section-head p','Eventi deduplicati, impatto, motivazioni. Monitora o combina una notizia con uno o più token.'],
      ['#section-macro .section-head h2','Dollaro, macroeconomia e SEC'],
      ['#section-macro .section-head p','Contesto globale e comunicati ufficiali, separati dalle interpretazioni.'],
      ['#section-kiber .section-head p','Usa token, grafico, monitorati, notizie e storico come contesto.'],
      ['#chatMode','Analisi locale; IA completa quando viene collegata la chiave server.'],
      ['#changedBtn','Cosa è cambiato e perché?']
    ];
    for(const [s,t] of pairs){const e=qs(s);if(e)e.textContent=t}
    qsa('.overview > div > span').forEach(e=>{if(e.textContent.trim()==='Watchlist')e.textContent='Monitorati';if(e.textContent.trim()==='News alto impatto')e.textContent='Notizie ad alto impatto'});
    qsa('.overview > div > small').forEach(e=>{if(e.textContent.trim()==='feed elaborato')e.textContent='flusso elaborato'});
    const flow=qsa('#section-lab .metrics span').find(e=>e.textContent.trim()==='Buy / Sell');if(flow)flow.textContent='Acquisti / Vendite';
    const usd=qsa('#section-macro .metrics span').find(e=>e.textContent.trim()==='USD Strength Proxy');if(usd)usd.textContent='Indicatore forza USD';
    const map={Gaming:'Giochi',Infrastructure:'Infrastruttura',Data:'Dati','Layer 1':'Livello 1',AI:'IA'};
    qsa('#filterSector option').forEach(o=>{if(map[o.textContent])o.textContent=map[o.textContent]});
    qsa('#newsTabs button').forEach(b=>{const m={all:'Tutte',bnb:'BNB',token:'Token',defi:'DeFi',ai:'IA',macro:'Macroeconomia',policy:'Regole'};if(m[b.dataset.news])b.textContent=m[b.dataset.news]});
    qsa('#section-lab .subnav button').forEach(b=>{if(b.dataset.tab==='tokennews')b.textContent='Notizie';if(b.dataset.tab==='risk')b.textContent='Rischio';if(b.dataset.tab==='project')b.textContent='Progetto';if(b.dataset.tab==='memory')b.textContent='Memoria'});
    const pro=qs('.pro p');if(pro)pro.textContent='Memoria storica, avvisi H24, grafico investigativo, dossier multifonte e Kiber IA.';
  }
  function translateDynamic(root=document){
    const exact=new Map([
      ['News temporaneamente non disponibili.','Notizie temporaneamente non disponibili.'],
      ['Nessuna news direttamente collegata nel feed corrente.','Nessuna notizia direttamente collegata nel flusso corrente.'],
      ['NEWS INTELLIGENCE','ANALISI DELLE NOTIZIE'],
      ['Up','Rialzo'],['Down','Calo'],['AI','IA'],['Gaming','Giochi'],['Infrastructure','Infrastruttura'],['Data','Dati'],['Layer 1','Livello 1']
    ]);
    const walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=walker.nextNode()){const t=n.nodeValue.trim();if(exact.has(t))n.nodeValue=n.nodeValue.replace(t,exact.get(t))}
  }

  function setupWatchRemoval(){
    const baseRenderWatch=renderWatch;
    renderWatch=function(){
      baseRenderWatch();
      const up=state.watch.filter(x=>Number(x.change24)>0).length,down=state.watch.filter(x=>Number(x.change24)<0).length;
      if($('watchBreadth'))$('watchBreadth').textContent=`Rialzo ${up} / Calo ${down}`;
      qsa('#watchList .token-row').forEach(row=>{
        row.classList.add('watch-row-v20');
        if(row.querySelector('.remove-watch-btn'))return;
        const btn=document.createElement('button');btn.className='remove-watch-btn';btn.type='button';btn.textContent='Rimuovi';btn.setAttribute('aria-label','Rimuovi token dai monitorati');
        btn.onclick=async e=>{e.stopPropagation();await removeWatch(row.dataset.watch)};
        row.appendChild(btn);
      });
    };
    const baseRenderLab=renderLab;
    renderLab=function(){baseRenderLab();updateWatchButton()};
    const baseAddWatch=addWatch;
    async function toggleWatch(){const t=state.selected;if(!t)return;const found=state.watch.some(x=>String(x.address||'').toLowerCase()===String(t.address||'').toLowerCase());if(found)await removeWatch(t.address);else await baseAddWatch();updateWatchButton()}
    async function removeWatch(address){const i=state.watch.findIndex(x=>String(x.address||'').toLowerCase()===String(address||'').toLowerCase());if(i<0)return;state.watch.splice(i,1);await syncCloud();renderWatch();updateWatchButton()}
    function updateWatchButton(){const t=state.selected,b=$('watchBtn');if(!t||!b)return;const found=state.watch.some(x=>String(x.address||'').toLowerCase()===String(t.address||'').toLowerCase());b.textContent=found?'Rimuovi dai monitorati':'Aggiungi ai monitorati';b.classList.toggle('danger',found)}
    if($('watchBtn'))$('watchBtn').onclick=toggleWatch;
    renderWatch();updateWatchButton();
  }

  function wrapItalianRenders(){
    const bNews=renderNews;renderNews=function(){bNews();translateDynamic($('newsList'))};
    const bTokenNews=renderTokenNews;renderTokenNews=function(){bTokenNews();translateDynamic($('tokenNewsList'))};
    const bSectors=renderSectors;renderSectors=function(){bSectors();qsa('#sectorCards [data-sector-card]').forEach(c=>{const h=c.querySelector('h3');if(!h)return;const m={Gaming:'Giochi',Infrastructure:'Infrastruttura',Data:'Dati','Layer 1':'Livello 1',AI:'IA'};if(m[c.dataset.sectorCard])h.textContent=m[c.dataset.sectorCard]});translateDynamic($('sectorCards'))};
    const bOpenNews=openNews;openNews=function(i){bOpenNews(i);translateDynamic($('modalBody'))};
    const bLocalKiber=localKiber;localKiber=function(q){return bLocalKiber(q).replace(/\bnews\b/gi,'notizie').replace(/watchlist/gi,'lista monitorati')};
  }

  function bootBrand(){
    ensureLegacyStatus();loadLogoStyle();
    const top=qs('.top > div:first-child');if(top){top.className='brand-shell';top.innerHTML='<img class="brand-mark" src="'+LOGO+'" alt="Kiber"><div class="brand-copy"><strong>Kiber</strong><small>BNB Intelligence</small><div class="status brand-live" id="v20Status">V20 · KIBER BNB INTELLIGENCE</div></div>'}
    const hero=qs('.hero');if(hero&&!qs('.kiber-origin',hero)){const x=document.createElement('div');x.className='kiber-origin';x.innerHTML='<img src="'+LOGO+'" alt="Kiber"><span>Creato da Kiber · dalla città Kibernetic</span>';const search=qs('.search',hero);hero.insertBefore(x,search||null)}
    const kiberBody=qs('#section-kiber .section-body');if(kiberBody&&!qs('.kiber-guide',kiberBody)){const g=document.createElement('div');g.className='kiber-guide';g.innerHTML='<img class="kiber-logo-mascot" src="'+LOGO+'" alt="Kiber"><div><span>KIBER INTELLIGENCE</span><b>Chiedi a Kiber</b><p>Mercato, grafico, notizie e memoria diventano un unico contesto di analisi.</p></div>';kiberBody.prepend(g)}
    const pro=qs('.pro');if(pro){const label=qs('span',pro),title=qs('h2',pro);if(label)label.textContent='KIBER INTELLIGENCE PRO';if(title)title.textContent='Più contesto, meno rumore.'}
    enforceHero();setupProfile();translateStatic();wrapItalianRenders();setupWatchRemoval();setStatus();loadTokenLogoModule();
    const mon=$('monitorState');if(mon)new MutationObserver(setStatus).observe(mon,{childList:true,characterData:true,subtree:true});
    const chat=$('chatMessages');if(chat)new MutationObserver(()=>{document.body.classList.add('kiber-thinking');clearTimeout(window.__kiberBrandTimer);window.__kiberBrandTimer=setTimeout(()=>document.body.classList.remove('kiber-thinking'),1100);qsa('.assistant-msg',chat).forEach(m=>m.dataset.brandInsight='1');translateDynamic(chat)}).observe(chat,{childList:true,subtree:true});
    const point=$('pointAnalysis');if(point)new MutationObserver(()=>{if(!point.hidden&&point.textContent.trim()&&!qs('.kiber-insight-label',point)){const l=document.createElement('div');l.className='kiber-insight-label';l.textContent='RICERCA KIBER';point.prepend(l)}}).observe(point,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
    const changes=$('changesBox');if(changes)new MutationObserver(()=>{if(!changes.hidden&&changes.textContent.trim()&&!qs('.kiber-insight-label',changes)){const l=document.createElement('div');l.className='kiber-insight-label';l.textContent='ANALISI CAMBIAMENTI KIBER';changes.prepend(l)}translateDynamic(changes)}).observe(changes,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
    const uiObs=new MutationObserver(ms=>ms.forEach(m=>m.addedNodes.forEach(n=>{if(n.nodeType===1)translateDynamic(n)})));uiObs.observe(document.body,{childList:true,subtree:true});
  }

  ensureLegacyStatus();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootBrand,{once:true});else bootBrand();
})();