(()=>{
  const V='26.7',q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)],id=x=>document.getElementById(x);
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
  const money=v=>{v=n(v);if(v===null)return'—';const a=Math.abs(v);if(a>=1e12)return'$'+(v/1e12).toFixed(2)+'T';if(a>=1e9)return'$'+(v/1e9).toFixed(2)+'B';if(a>=1e6)return'$'+(v/1e6).toFixed(2)+'M';if(a>=1e3)return'$'+(v/1e3).toFixed(1)+'K';return'$'+v.toLocaleString('it-IT',{maximumFractionDigits:a<1?6:2})};
  const pct=v=>{v=n(v);return v===null?'—':`${v>=0?'+':''}${v.toLocaleString('it-IT',{maximumFractionDigits:2})}%`};
  const state={days:30,points:[],source:'CoinGecko'};

  function removeHomeNoise(){
    ['.v266-sectors','.v266-news','.v266-projects'].forEach(s=>q(s)?.remove());
    document.body.classList.add('v267');
    document.documentElement.dataset.kiberVersion=V;
    document.title='Kiber BNB Chain';
  }

  function openMarketSub(sub){
    const cards=qa('#v241Home .v241-card');
    const market=cards[0];
    if(!market)return;
    const prev=market.dataset.v241Open;
    market.dataset.v241Open='market';
    market.click();
    market.dataset.v241Open=prev||'market';
    if(sub)setTimeout(()=>q(`#v241Subnav [data-v241-sub="${sub}"]`)?.click(),90);
  }

  function rewireFourCards(){
    const cards=qa('#v241Home .v241-card');
    if(cards.length<4||cards[0].dataset.v267==='1')return;
    const data=[
      ['Mercato','Catalogo monete BNB Chain, ricerca e filtri.'],
      ['Scanner Token','Apri una moneta: previsione, grafico e fattori che la muovono.'],
      ['Monitorati','Segui solo le monete che hai scelto e cosa cambia.'],
      ['Intelligence','BNB, Chain, fondamentali e confronto.']
    ];
    cards.slice(0,4).forEach((c,i)=>{c.dataset.v267='1';q('b',c).textContent=data[i][0];q('p',c).textContent=data[i][1];});
    cards[0].dataset.v241Open='market';
    cards[1].onclick=e=>{e.preventDefault();openMarketSub('analysis')};
    cards[2].onclick=e=>{e.preventDefault();openMarketSub('watch')};
    cards[3].dataset.v241Open='intelligence';
  }

  function makeSheet(){
    if(id('v267KiberSheet'))return;
    const s=document.createElement('div');s.id='v267KiberSheet';s.className='v267-kiber-sheet';s.innerHTML=`<section class="v267-kiber-panel" role="dialog" aria-modal="true" aria-label="Kiber AI"><div class="v267-kiber-head"><div class="v267-kiber-title"><img src="assets/kiber-logo.svg?v=267" alt="Kiber"><div><span>KIBER AI</span><b>Analisi diretta</b></div></div><button class="v267-kiber-close" id="v267KiberClose" aria-label="Chiudi">×</button></div><div class="v267-kiber-query" id="v267KiberQuery"></div><div class="v267-kiber-body" id="v267KiberBody">Chiedi a Kiber cosa vuoi analizzare.</div><div class="v267-kiber-follow"><input id="v267Follow" placeholder="Continua a chiedere a Kiber…"><button id="v267FollowSend">→</button></div></section>`;document.body.appendChild(s);
    id('v267KiberClose').onclick=()=>s.classList.remove('open');
    s.addEventListener('click',e=>{if(e.target===s)s.classList.remove('open')});
    const follow=()=>{const v=id('v267Follow')?.value.trim();if(!v)return;const main=id('v266Ask');if(main){main.value=v;id('v267Follow').value='';openSheet(v,true);id('v266Send')?.click()}};
    id('v267FollowSend').onclick=follow;id('v267Follow').onkeydown=e=>e.key==='Enter'&&follow();
  }

  function openSheet(query,loading=false){
    makeSheet();const sheet=id('v267KiberSheet'),body=id('v267KiberBody'),qq=id('v267KiberQuery');
    if(qq)qq.innerHTML=query?`Hai chiesto: <b>${esc(query)}</b>`:'';
    if(body&&loading){body.className='v267-kiber-body loading';body.textContent='Kiber sta incrociando mercato, chain, grafico, token, dati e notizie…'}
    sheet?.classList.add('open');
  }

  function hookKiber(){
    makeSheet();const answer=id('v266Answer');if(!answer||answer.dataset.v267==='1')return;answer.dataset.v267='1';
    const sync=()=>{const text=answer.textContent?.trim();if(!text)return;const body=id('v267KiberBody');if(body){body.className='v267-kiber-body';body.innerHTML=answer.innerHTML||esc(text)}id('v267KiberSheet')?.classList.add('open')};
    new MutationObserver(sync).observe(answer,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:['hidden','class']});
    id('v266Send')?.addEventListener('click',()=>{const v=id('v266Ask')?.value.trim();if(v)openSheet(v,true)},true);
    id('v266Ask')?.addEventListener('keydown',e=>{if(e.key==='Enter'){const v=e.currentTarget.value.trim();if(v)openSheet(v,true)}},true);
  }

  function chartShell(){
    const old=q('.v266-graph');if(!old||old.dataset.v267==='1')return;
    old.dataset.v267='1';old.className='v267-chart';old.innerHTML=`<div class="v267-chart-head"><div><span>BNB · GRAFICO PRINCIPALE</span><h2>Andamento BNB</h2><p>Prezzo storico CoinGecko. Tocca il grafico per leggere un punto.</p></div><div class="v267-periods"><button data-v267-days="1">24H</button><button data-v267-days="7">7G</button><button data-v267-days="30" class="active">30G</button><button data-v267-days="90">90G</button></div></div><div class="v267-chart-summary"><div><span>Adesso</span><b id="v267Now">—</b></div><div><span>Periodo</span><b id="v267Change">—</b></div><div><span>Massimo</span><b id="v267High">—</b></div><div><span>Minimo</span><b id="v267Low">—</b></div></div><div class="v267-chart-box" id="v267ChartWrap"><svg id="v267Chart" viewBox="0 0 1000 360" preserveAspectRatio="none"></svg><div class="v267-tip" id="v267Tip" hidden></div></div><div class="v267-chart-foot"><span>Fonte: <strong id="v267Source">CoinGecko</strong></span><button id="v267ChartWhy">Perché questa previsione?</button></div>`;
    qa('[data-v267-days]',old).forEach(b=>b.onclick=()=>{state.days=+b.dataset.v267Days;qa('[data-v267-days]',old).forEach(x=>x.classList.toggle('active',x===b));loadChart()});
    id('v267ChartWhy').onclick=()=>{const b=q('[data-why="bnb"]');if(b){b.scrollIntoView({behavior:'smooth',block:'center'});setTimeout(()=>b.click(),350)}};
    loadChart();
  }

  async function loadChart(){
    const svg=id('v267Chart');if(!svg)return;svg.innerHTML='<text x="500" y="185" text-anchor="middle" class="axis">Caricamento grafico BNB…</text>';
    try{
      const r=await fetch(`/api/coingecko?type=bnb_chart&days=${state.days}&v=267`,{cache:'no-store'});if(!r.ok)throw Error(String(r.status));const d=await r.json();state.points=(d.points||[]).filter(x=>n(x.p)!==null&&n(x.t)!==null);state.source=d.source||'CoinGecko';renderChart();
    }catch(e){
      try{const r=await fetch('/api/chain?v=267',{cache:'no-store'}),d=await r.json();const cut=Date.now()-Math.max(7,state.days)*864e5;state.points=(d?.history?.bnb||[]).filter(x=>n(x.t)>=cut).map(x=>({t:x.t,p:x.v,volume:d?.bnb?.volume24||null}));state.source='CoinGecko via Kiber';renderChart()}catch{svg.innerHTML='<text x="500" y="185" text-anchor="middle" class="axis">Grafico temporaneamente non disponibile</text>'}
    }
  }

  function renderChart(){
    const svg=id('v267Chart'),wrap=id('v267ChartWrap'),tip=id('v267Tip');if(!svg||!wrap)return;const a=state.points;if(a.length<2){svg.innerHTML='<text x="500" y="185" text-anchor="middle" class="axis">Dati insufficienti</text>';return}
    const vals=a.map(x=>+x.p),lo=Math.min(...vals),hi=Math.max(...vals),rg=hi-lo||1,W=1000,H=360,L=95,R=22,T=24,B=48,iw=W-L-R,ih=H-T-B;
    const X=i=>L+(i/(a.length-1))*iw,Y=v=>T+((hi-v)/rg)*ih;
    const pts=a.map((x,i)=>`${X(i).toFixed(1)},${Y(x.p).toFixed(1)}`).join(' '),first=a[0].p,last=a.at(-1).p,chg=first?((last/first)-1)*100:null;
    let grid='';for(let k=0;k<4;k++){const y=T+k*ih/3,v=hi-k*rg/3;grid+=`<line x1="${L}" y1="${y}" x2="${W-R}" y2="${y}" class="grid"/><text x="${L-12}" y="${y+6}" text-anchor="end" class="axis">${esc(money(v))}</text>`}
    const area=`M ${X(0)} ${H-B} L ${pts.replace(/ /g,' L ')} L ${X(a.length-1)} ${H-B} Z`;
    const dates=[0,Math.floor((a.length-1)/3),Math.floor((a.length-1)*2/3),a.length-1].map(i=>`<text x="${X(i)}" y="${H-13}" text-anchor="middle" class="axis">${new Date(a[i].t).toLocaleDateString('it-IT',{day:'2-digit',month:'2-digit'})}</text>`).join('');
    svg.innerHTML=`<defs><linearGradient id="v267Area" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#59d7ff" stop-opacity=".24"/><stop offset="1" stop-color="#59d7ff" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" class="area"/><polyline points="${pts}" class="price"/>${dates}<line id="v267Cross" x1="0" y1="${T}" x2="0" y2="${H-B}" class="cross" visibility="hidden"/><circle id="v267Dot" r="6" cx="0" cy="0" class="dot" visibility="hidden"/>`;
    id('v267Now').textContent=money(last);id('v267Change').textContent=pct(chg);id('v267High').textContent=money(hi);id('v267Low').textContent=money(lo);id('v267Source').textContent=state.source;
    const cross=id('v267Cross'),dot=id('v267Dot');
    const move=e=>{const rect=svg.getBoundingClientRect(),px=Math.max(0,Math.min(rect.width,e.clientX-rect.left)),i=Math.max(0,Math.min(a.length-1,Math.round(px/rect.width*(a.length-1)))),x=X(i),y=Y(a[i].p);cross.setAttribute('x1',x);cross.setAttribute('x2',x);cross.setAttribute('visibility','visible');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('visibility','visible');if(tip){tip.hidden=false;tip.innerHTML=`<b>${esc(money(a[i].p))}</b><span>${new Date(a[i].t).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</span>`;tip.style.left=(x/W*100)+'%';tip.style.top=(y/H*100)+'%'}};
    svg.onpointermove=move;svg.onpointerdown=move;svg.onpointerleave=()=>{cross.setAttribute('visibility','hidden');dot.setAttribute('visibility','hidden');if(tip)tip.hidden=true};
  }

  function boot(){
    removeHomeNoise();rewireFourCards();hookKiber();chartShell();
    setTimeout(()=>{removeHomeNoise();rewireFourCards();hookKiber();chartShell()},900);
    setInterval(()=>{removeHomeNoise();rewireFourCards();hookKiber()},5000);
  }
  document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();