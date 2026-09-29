(()=>{
  const $=id=>document.getElementById(id);
  const q=(s,r=document)=>r.querySelector(s);
  const qa=(s,r=document)=>[...r.querySelectorAll(s)];
  const compact=v=>{v=Number(v)||0;return v>=1e12?'$'+(v/1e12).toFixed(2)+'T':v>=1e9?'$'+(v/1e9).toFixed(2)+'B':v>=1e6?'$'+(v/1e6).toFixed(2)+'M':v>=1e3?'$'+(v/1e3).toFixed(1)+'K':v>0?'$'+v.toLocaleString('it-IT',{maximumFractionDigits:2}):'—'};
  const AVATARS=['🤖','🦊','🐺','🦁','🐯','🦉','🐼','🐉','🐱','🐶','🐰','🐧','🦄','🐻','🐸','🦅','🐨','🦝','🦋','🦖'];

  function simplifyCatalog(){
    const h=q('#section-market .section-head h2');
    const p=q('#section-market .section-head p');
    if(h)h.textContent='Mercato BNB';
    if(p)p.textContent='Scegli tra classifica di mercato e attività on-chain della BNB Chain.';
    const cat=q('[data-v21="catalog"]'),chain=q('[data-v21="chain"]');
    if(cat)cat.textContent='Classifica';
    if(chain)chain.textContent='On-chain';
    const sort=q('.v21-sortline');
    if(sort){const a=sort.querySelector('a');if(a)a.remove();}
    let help=$('v21ModeHelp');
    if(!help&&q('#v21Tools')){help=document.createElement('div');help.id='v21ModeHelp';help.className='v21-mode-help';q('#v21Tools').insertBefore(help,q('.v21-sortline'));}
    const src=q('.v21-source');
    if(src&&src.firstElementChild)src.firstElementChild.innerHTML='<b>Dati di mercato:</b> CoinGecko';
    const update=()=>{const active=q('[data-v21].active')?.dataset.v21||'catalog';if(help)help.textContent=active==='catalog'?'Classifica: posizione globale, market cap, prezzo, variazione e volume.':'On-chain: liquidità, volume DEX, pool, rischio e movimento reale sulla BNB Chain.';if(sort)sort.style.display=active==='catalog'?'flex':'none';if(src)src.style.display=active==='catalog'?'flex':'none'};
    qa('[data-v21]').forEach(b=>b.addEventListener('click',()=>setTimeout(update,0)));
    update();
  }

  function setupAvatarPicker(){
    const sel=$('avatarSelect');
    if(!sel)return;
    const saved=sel.value||state?.profile?.avatar||'🤖';
    sel.innerHTML=AVATARS.map(v=>`<option value="${v}">${v}</option>`).join('');
    sel.value=AVATARS.includes(saved)?saved:'🤖';
    const theme=$('themeSelect');
    const themeLabel=theme?.closest('label');
    if(themeLabel)themeLabel.remove();
    const sub=q('#profileDrawer .drawer-head small');
    if(sub)sub.textContent='Profilo e personaggio';
    let label=sel.closest('label');
    if(!label)return;
    label.classList.add('v21-avatar-label');
    for(const n of [...label.childNodes])if(n.nodeType===3&&n.nodeValue.trim())n.remove();
    sel.style.display='none';
    if(!$('v21AvatarTitle')){const title=document.createElement('div');title.id='v21AvatarTitle';title.className='v21-avatar-title';title.textContent='Scegli il personaggio';label.insertBefore(title,sel)}
    let grid=$('v21AvatarGrid');
    if(!grid){grid=document.createElement('div');grid.id='v21AvatarGrid';grid.className='v21-avatar-grid';label.insertBefore(grid,sel)}
    const current=()=>sel.value||state?.profile?.avatar||'🤖';
    const draw=()=>{grid.innerHTML=AVATARS.map(v=>`<button type="button" class="v21-avatar-choice${v===current()?' active':''}" data-avatar="${v}" aria-label="Seleziona personaggio">${v}</button>`).join('');qa('[data-avatar]',grid).forEach(b=>b.onclick=()=>{sel.value=b.dataset.avatar;sel.dispatchEvent(new Event('change',{bubbles:true}));qa('[data-avatar]',grid).forEach(x=>x.classList.toggle('active',x===b));const top=$('avatar');if(top){top.style.backgroundImage='none';top.textContent=b.dataset.avatar}})};
    draw();
  }

  function patchDossier(){
    try{if(typeof ensureDossierPanel==='function')ensureDossierPanel()}catch{}
    const sec=$('section-dossier');
    if(!sec)return;
    if(!sec.dataset.v21RemoveFixed){
      sec.dataset.v21RemoveFixed='1';
      sec.addEventListener('click',e=>{
        const b=e.target.closest('[data-dossier-token]');
        if(!b||!sec.contains(b)||typeof V18==='undefined')return;
        const address=String(b.dataset.dossierToken||'').toLowerCase();
        const i=(V18.dossier?.tokens||[]).findIndex(x=>String(x.address||'').toLowerCase()===address);
        if(i<0)return;
        e.preventDefault();e.stopImmediatePropagation();
        V18.dossier.tokens.splice(i,1);
        if(typeof v18SaveDossier==='function')v18SaveDossier();
      },true);
    }
    const decorate=()=>qa('#dossierTokens [data-dossier-token]').forEach(b=>{const a=String(b.dataset.dossierToken||'').toLowerCase();const t=(V18.dossier?.tokens||[]).find(x=>String(x.address||'').toLowerCase()===a);if(!t)return;b.textContent=(t.symbol||t.name||'Token')+' ';const s=document.createElement('span');s.className='v21-remove-label';s.textContent='Rimuovi';b.appendChild(s)});
    decorate();
    if(typeof renderDossier==='function'&&!window.__v21DossierWrapped){window.__v21DossierWrapped=true;const base=renderDossier;renderDossier=function(){base();decorate()};}
  }

  function addOnChainMarketCap(){
    if(typeof renderMarket!=='function'||window.__v21MarketCapWrapped)return;
    window.__v21MarketCapWrapped=true;
    const base=renderMarket;
    renderMarket=function(){base();const rows=qa('#marketList .token-row'),items=(state.filtered||[]).slice(0,70);rows.forEach((row,i)=>{if(row.querySelector('.v21-onchain-cap'))return;const p=items[i];if(!p)return;const d=document.createElement('div');d.className='v21-onchain-cap';const mc=Number(p.marketCap)||0,fdv=Number(p.fdv)||0,label=mc?'Market cap':fdv?'FDV':'Market cap';d.innerHTML='<small>'+label+'</small><b>'+compact(mc||fdv)+'</b>';row.appendChild(d)})};
    try{renderMarket()}catch{}
  }

  function keepCatalogDefault(){
    const cat=q('[data-v21="catalog"]');
    if(cat&&!cat.classList.contains('active'))cat.click();
  }

  function boot(){simplifyCatalog();setupAvatarPicker();patchDossier();addOnChainMarketCap();setTimeout(patchDossier,500);setTimeout(()=>{simplifyCatalog();patchDossier();keepCatalogDefault()},1300)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();