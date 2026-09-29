(()=>{
  const $=id=>document.getElementById(id);
  const qs=(s,r=document)=>r.querySelector(s);
  const qsa=(s,r=document)=>[...r.querySelectorAll(s)];
  const HERO_TITLE='Capire cosa si muove, quando e perché.';
  const HERO_TEXT='Kiber collega mercato, storico, liquidità, volume e notizie. Il grafico è il centro dell’indagine: seleziona un momento e cerca cosa stava accadendo.';
  const LOGO='assets/kiber-logo-bw.svg?v=bw1';

  function ensureLegacyStatus(){let legacy=$('appStatus');if(!legacy){legacy=document.createElement('span');legacy.id='appStatus';legacy.hidden=true;legacy.setAttribute('aria-hidden','true');legacy.style.display='none';document.body.appendChild(legacy)}return legacy}
  function statusText(){const online=String($('monitorState')?.textContent||'').toLowerCase().includes('online');return online?'V20 · KIBER BNB INTELLIGENCE · MONITOR H24':'V20 · KIBER BNB INTELLIGENCE'}
  function setStatus(){const s=$('v20Status');if(!s)return;const next=statusText();if(s.textContent!==next)s.textContent=next;s.classList.add('brand-live')}
  function enforceHero(){document.title='Kiber BNB Intelligence V20';const hero=qs('.hero');if(!hero)return;const eye=qs('.eyebrow',hero),h1=qs('h1',hero),p=qs(':scope > p',hero);if(eye&&eye.textContent!=='KIBER BNB INTELLIGENCE · V20')eye.textContent='KIBER BNB INTELLIGENCE · V20';if(h1&&h1.textContent!==HERO_TITLE)h1.textContent=HERO_TITLE;if(p&&p.textContent!==HERO_TEXT)p.textContent=HERO_TEXT}
  function loadTokenLogoModule(){if(document.querySelector('script[data-kiber-token-icons]'))return;const s=document.createElement('script');s.src='v20-token-icons.js?v=20-token-2';s.async=false;s.dataset.kiberTokenIcons='1';document.body.appendChild(s)}
  function loadLogoStyle(){if(document.querySelector('link[data-kiber-logo-style]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href='v20-logo-bw.css?v=bw1';l.dataset.kiberLogoStyle='1';document.head.appendChild(l)}

  function bootBrand(){
    ensureLegacyStatus();loadLogoStyle();
    const top=qs('.top > div:first-child');
    if(top){top.className='brand-shell';top.innerHTML='<img class="brand-mark" src="'+LOGO+'" alt="Kiber"><div class="brand-copy"><strong>Kiber</strong><small>BNB Intelligence</small><div class="status brand-live" id="v20Status">V20 · KIBER BNB INTELLIGENCE</div></div>'}
    const hero=qs('.hero');
    if(hero&&!qs('.kiber-origin',hero)){const x=document.createElement('div');x.className='kiber-origin';x.innerHTML='<img src="'+LOGO+'" alt="Kiber"><span>Creato da Kiber · dalla città Kibernetic</span>';const search=qs('.search',hero);hero.insertBefore(x,search||null)}
    const avatar=$('avatar');if(avatar){avatar.textContent='';avatar.style.backgroundImage='url("'+LOGO+'")';avatar.style.backgroundPosition='center';avatar.style.backgroundRepeat='no-repeat';avatar.style.backgroundSize='cover'}
    const kiberBody=qs('#section-kiber .section-body');
    if(kiberBody&&!qs('.kiber-guide',kiberBody)){const g=document.createElement('div');g.className='kiber-guide';g.innerHTML='<img class="kiber-logo-mascot" src="'+LOGO+'" alt="Kiber"><div><span>KIBER INTELLIGENCE</span><b>Chiedi a Kiber</b><p>Mercato, grafico, news e memoria diventano un unico contesto di analisi.</p></div>';kiberBody.prepend(g)}
    const pro=qs('.pro');if(pro){const label=qs('span',pro),title=qs('h2',pro);if(label)label.textContent='KIBER INTELLIGENCE PRO';if(title)title.textContent='Più contesto, meno rumore.'}
    const profile=qs('.profile-btn');if(profile)profile.setAttribute('aria-label','Profilo Kiber BNB Intelligence');
    enforceHero();setStatus();
    const mon=$('monitorState');if(mon)new MutationObserver(setStatus).observe(mon,{childList:true,characterData:true,subtree:true});
    const chat=$('chatMessages');if(chat)new MutationObserver(()=>{document.body.classList.add('kiber-thinking');clearTimeout(window.__kiberBrandTimer);window.__kiberBrandTimer=setTimeout(()=>document.body.classList.remove('kiber-thinking'),1100);qsa('.assistant-msg',chat).forEach(m=>m.dataset.brandInsight='1')}).observe(chat,{childList:true,subtree:true});
    const point=$('pointAnalysis');if(point)new MutationObserver(()=>{if(!point.hidden&&point.textContent.trim()&&!qs('.kiber-insight-label',point)){const l=document.createElement('div');l.className='kiber-insight-label';l.textContent='KIBER RESEARCH';point.prepend(l)}}).observe(point,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
    const changes=$('changesBox');if(changes)new MutationObserver(()=>{if(!changes.hidden&&changes.textContent.trim()&&!qs('.kiber-insight-label',changes)){const l=document.createElement('div');l.className='kiber-insight-label';l.textContent='KIBER CHANGE INTELLIGENCE';changes.prepend(l)}}).observe(changes,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});
    loadTokenLogoModule();
  }

  ensureLegacyStatus();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bootBrand,{once:true});else bootBrand();
})();