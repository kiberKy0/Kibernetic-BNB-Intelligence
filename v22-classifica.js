(()=>{
  const CATALOG='https://iytjxruxpvwjjhbndkzo.supabase.co/functions/v1/kibernetic-catalog';
  const byId=new Map();
  const money=v=>Number.isFinite(Number(v))?'$'+Number(v).toLocaleString('it-IT',{maximumFractionDigits:Math.abs(Number(v))<1?8:2}):'—';
  const compact=v=>{const n=Number(v);if(!Number.isFinite(n))return'—';if(Math.abs(n)>=1e12)return'$'+(n/1e12).toFixed(2)+'T';if(Math.abs(n)>=1e9)return'$'+(n/1e9).toFixed(2)+'B';if(Math.abs(n)>=1e6)return'$'+(n/1e6).toFixed(2)+'M';if(Math.abs(n)>=1e3)return'$'+(n/1e3).toFixed(1)+'K';return money(n)};
  const amount=v=>{const n=Number(v);if(!Number.isFinite(n))return'—';return n.toLocaleString('it-IT',{maximumFractionDigits:2})};
  const pct=v=>Number.isFinite(Number(v))?`${Number(v)>=0?'+':''}${Number(v).toLocaleString('it-IT',{maximumFractionDigits:2})}%`:'—';
  const date=v=>{if(!v)return'—';try{return new Date(v).toLocaleDateString('it-IT')}catch{return'—'}};
  const cls=v=>Number(v)>=0?'up':'down';

  function details(x){
    return `<div class="v22-detail-head"><div><b>${x.name||x.symbol}</b><small>Profilo mercato CoinGecko · BNB Chain</small></div><span>#${x.rank||'—'}</span></div>
      <div class="v22-detail-grid">
        <div><small>Prezzo</small><b>${money(x.price)}</b></div>
        <div><small>1 ora</small><b class="${cls(x.change1h)}">${pct(x.change1h)}</b></div>
        <div><small>24 ore</small><b class="${cls(x.change24)}">${pct(x.change24)}</b></div>
        <div><small>7 giorni</small><b class="${cls(x.change7d)}">${pct(x.change7d)}</b></div>
        <div><small>30 giorni</small><b class="${cls(x.change30d)}">${pct(x.change30d)}</b></div>
        <div><small>Market cap</small><b>${compact(x.marketCap)}</b></div>
        <div><small>FDV</small><b>${compact(x.fdv)}</b></div>
        <div><small>Volume 24h</small><b>${compact(x.volume24)}</b></div>
        <div><small>Max 24h</small><b>${money(x.high24)}</b></div>
        <div><small>Min 24h</small><b>${money(x.low24)}</b></div>
        <div><small>Supply circolante</small><b>${amount(x.circulatingSupply)}</b></div>
        <div><small>Supply totale</small><b>${amount(x.totalSupply)}</b></div>
        <div><small>Supply massima</small><b>${amount(x.maxSupply)}</b></div>
        <div><small>ATH</small><b>${money(x.ath)}</b><em>${pct(x.athChange)} · ${date(x.athDate)}</em></div>
        <div><small>ATL</small><b>${money(x.atl)}</b><em>${pct(x.atlChange)} · ${date(x.atlDate)}</em></div>
        <div><small>Market cap 24h</small><b class="${cls(x.marketCapChange24)}">${pct(x.marketCapChange24)}</b></div>
      </div>
      <div class="v22-detail-foot">Aggiornato ${x.lastUpdated?new Date(x.lastUpdated).toLocaleString('it-IT'):'—'} · Fonte CoinGecko</div>`;
  }

  function enhance(row){
    if(row.dataset.v22Enhanced==='1')return;
    const x=byId.get(row.dataset.v21Id);
    if(!x)return;
    const name=row.querySelector('.v21-name>div:last-child');
    if(!name)return;
    const btn=document.createElement('button');
    btn.type='button';btn.className='v22-detail-btn';btn.textContent='Scheda completa';
    const panel=document.createElement('div');
    panel.className='v22-details';panel.hidden=true;panel.innerHTML=details(x);
    btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();panel.hidden=!panel.hidden;btn.textContent=panel.hidden?'Scheda completa':'Chiudi scheda'});
    panel.addEventListener('click',e=>e.stopPropagation());
    name.appendChild(btn);row.appendChild(panel);row.dataset.v22Enhanced='1';
  }

  function enhanceAll(){document.querySelectorAll('#v21CatalogList .v21-row[data-v21-id]').forEach(enhance)}

  async function load(){
    try{
      const r=await fetch(CATALOG+'?type=bsc&per_page=250&page=1',{headers:{Accept:'application/json'}});
      if(!r.ok)return;
      const d=await r.json();
      (d.items||[]).forEach(x=>byId.set(x.id,x));
      enhanceAll();
    }catch{}
  }

  function boot(){
    load();
    const root=document.getElementById('section-market')||document.body;
    new MutationObserver(()=>enhanceAll()).observe(root,{childList:true,subtree:true});
    setInterval(()=>{if(!byId.size)load()},15000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();