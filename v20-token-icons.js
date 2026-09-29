(()=>{
  const CACHE_KEY='kiber_v20_token_logos';
  const TTL=7*24*60*60*1000;
  const cache=(()=>{try{return JSON.parse(localStorage.getItem(CACHE_KEY)||'{}')}catch{return {}}})();
  const lower=v=>String(v||'').toLowerCase();
  const escAttr=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const initials=(symbol,name)=>String(symbol||name||'?').replace(/[^a-z0-9]/gi,'').slice(0,3).toUpperCase()||'?';
  const directLogo=p=>p?.info?.imageUrl||p?.imageUrl||p?.logoURI||p?.logoUrl||p?.baseToken?.logoURI||p?.baseToken?.imageUrl||p?.baseToken?.image||'';
  const getCached=address=>{const x=cache[lower(address)];return x&&Date.now()-Number(x.at||0)<TTL?x:null};
  const putCached=(address,url,source='DEX Screener')=>{if(!address)return;cache[lower(address)]={url:url||'',source,at:Date.now()};try{localStorage.setItem(CACHE_KEY,JSON.stringify(cache))}catch{}};
  const logoFor=(address,p)=>directLogo(p)||getCached(address)?.url||'';
  const fallback=(symbol,name)=>`<span class="token-logo-fallback" aria-hidden="true">${escAttr(initials(symbol,name))}</span>`;
  const img=(address,symbol,name,p,cls='token-logo')=>{const url=logoFor(address,p);return url?`<img class="${cls}" src="${escAttr(url)}" alt="Logo ${escAttr(symbol||name||'token')}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'token-logo-fallback',textContent:'${escAttr(initials(symbol,name))}'}))">`:fallback(symbol,name)};

  async function resolveBatch(addresses){
    const need=[...new Set((addresses||[]).map(lower).filter(Boolean))].filter(a=>!getCached(a));
    for(let i=0;i<need.length;i+=30){
      const batch=need.slice(i,i+30);
      try{
        const r=await fetch('https://api.dexscreener.com/latest/dex/tokens/'+batch.join(','));
        if(!r.ok)continue;
        const d=await r.json();
        const pairs=Array.isArray(d?.pairs)?d.pairs:[];
        const best={};
        for(const p of pairs){
          if(String(p?.chainId||'').toLowerCase()!=='bsc')continue;
          const a=lower(p?.baseToken?.address);
          const url=directLogo(p);
          if(!a||!url)continue;
          const score=Number(p?.liquidity?.usd||0)+Number(p?.volume?.h24||0)*.1;
          if(!best[a]||score>best[a].score)best[a]={url,score};
        }
        for(const a of batch)putCached(a,best[a]?.url||'',best[a]?.url?'DEX Screener':'nessun logo verificato');
      }catch{}
    }
  }

  function upgradeRows(root=document){
    root.querySelectorAll('.token-row').forEach(row=>{
      const address=row.dataset.address||row.dataset.watch||'';
      const nameBox=row.querySelector('.token-name');
      if(!nameBox||nameBox.querySelector('.token-logo-wrap'))return;
      const b=nameBox.querySelector('b'),small=nameBox.querySelector('small');
      const symbol=b?.textContent?.trim()||'?';
      const name=(small?.textContent||'').split('·')[0].trim();
      const known=state.market?.find?.(p=>lower(p?.baseToken?.address)===lower(address));
      const wrap=document.createElement('span');
      wrap.className='token-logo-wrap';
      wrap.innerHTML=img(address,symbol,name,known);
      nameBox.prepend(wrap);
    });
  }

  async function refreshVisibleLogos(){
    const rows=[...document.querySelectorAll('.token-row')];
    const addresses=rows.map(r=>r.dataset.address||r.dataset.watch).filter(Boolean);
    await resolveBatch(addresses);
    rows.forEach(row=>{
      const address=row.dataset.address||row.dataset.watch||'';
      const box=row.querySelector('.token-logo-wrap');
      const cached=getCached(address);
      if(box&&cached?.url&&!box.querySelector('img')){
        const b=row.querySelector('.token-name b'),small=row.querySelector('.token-name small');
        box.innerHTML=img(address,b?.textContent||'?',(small?.textContent||'').split('·')[0].trim(),null);
      }
    });
  }

  const baseRenderMarket=renderMarket;
  renderMarket=function(){baseRenderMarket();upgradeRows($('marketList'));refreshVisibleLogos()};
  const baseRenderWatch=renderWatch;
  renderWatch=function(){baseRenderWatch();upgradeRows($('watchList'));refreshVisibleLogos()};

  const baseRenderLab=renderLab;
  renderLab=function(){
    baseRenderLab();
    const t=state.selected;if(!t)return;
    let identity=document.querySelector('.lab-token-identity');
    if(!identity){
      identity=document.createElement('div');identity.className='lab-token-identity';
      const h=$('labName');h?.parentNode?.insertBefore(identity,h);
      if(h)identity.appendChild(h);
    }
    const old=identity.querySelector('.lab-token-logo');if(old)old.remove();
    const holder=document.createElement('span');holder.className='lab-token-logo';holder.innerHTML=img(t.address,t.symbol,t.name,t,'token-logo token-logo-large');identity.prepend(holder);
    resolveBatch([t.address]).then(()=>{
      const c=getCached(t.address);if(c?.url){holder.innerHTML=img(t.address,t.symbol,t.name,t,'token-logo token-logo-large')}
    });
  };

  const baseAddWatch=addWatch;
  addWatch=async function(){
    await baseAddWatch();
    const t=state.selected;if(!t)return;
    const w=state.watch.find(x=>lower(x.address)===lower(t.address));
    const known=state.market?.find?.(p=>lower(p?.baseToken?.address)===lower(t.address));
    if(w){w.logo=logoFor(t.address,known)||getCached(t.address)?.url||w.logo||'';}
  };

  function useKiberLogoEverywhere(){
    document.querySelectorAll('.kiber-guide img').forEach(el=>{el.src='assets/kiber-logo-official.webp?v=official-2';el.alt='Kiber';el.classList.add('kiber-logo-mascot')});
  }

  function boot(){
    upgradeRows();refreshVisibleLogos();useKiberLogoEverywhere();
    const mo=new MutationObserver(muts=>{
      let tokenChanged=false,kiberChanged=false;
      for(const m of muts){for(const n of m.addedNodes){if(n.nodeType!==1)continue;if(n.matches?.('.token-row')||n.querySelector?.('.token-row'))tokenChanged=true;if(n.matches?.('.kiber-guide')||n.querySelector?.('.kiber-guide'))kiberChanged=true}}
      if(tokenChanged){upgradeRows();refreshVisibleLogos()}
      if(kiberChanged)useKiberLogoEverywhere();
    });
    mo.observe(document.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();