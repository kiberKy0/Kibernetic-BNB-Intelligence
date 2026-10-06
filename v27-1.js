(()=>{
'use strict';
const V='27.1',$=id=>document.getElementById(id),q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const money=v=>{v=n(v);if(v===null)return'—';const a=Math.abs(v);if(a>=1e12)return'$'+(v/1e12).toFixed(2)+'T';if(a>=1e9)return'$'+(v/1e9).toFixed(2)+'B';if(a>=1e6)return'$'+(v/1e6).toFixed(2)+'M';if(a>=1e3)return'$'+v.toLocaleString('it-IT',{maximumFractionDigits:2});return'$'+v.toLocaleString('it-IT',{maximumFractionDigits:a<1?8:2})};
const pct=v=>{v=n(v);return v===null?'—':`${v>=0?'+':''}${v.toLocaleString('it-IT',{maximumFractionDigits:2})}%`};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const S={seq:0,chartSeq:0,coin:null,intel:null,news:null,chartData:null,days:30,chart:null,series:null,volume:null,mode:'id',source:'—',aiBusy:false};

function mark(){document.body.classList.add('v271');document.documentElement.dataset.kiberVersion=V;document.title='Kiber BNB Chain'}
async function json(url,opt){const r=await fetch(url,opt);let d={};try{d=await r.json()}catch{}if(!r.ok)throw new Error(d?.error||String(r.status));return d}
function validAddress(x){return /^0x[a-fA-F0-9]{40}$/.test(String(x||''))}
function periodForIntel(days){return days<=1?'24h':days<=7?'7d':'30d'}
function watchKey(){const c=S.coin||{};return c.id?`id:${c.id}`:c.address?`address:${String(c.address).toLowerCase()}`:''}
function watchList(){try{return JSON.parse(localStorage.getItem('kiber_v271_watch')||'[]')}catch{return[]}}
function setWatchList(a){try{localStorage.setItem('kiber_v271_watch',JSON.stringify(a.slice(0,120)))}catch{}}

function ensurePanel(){
  if($('v271TokenView'))return;
  const el=document.createElement('section');el.id='v271TokenView';el.className='v271-token-view';el.setAttribute('aria-label','Analisi moneta Kiber');
  el.innerHTML=`<div class="v271-shell">
    <header class="v271-top"><button id="v271Back" class="v271-icon" aria-label="Indietro">‹</button><div class="v271-top-title"><span>KIBER · TOKEN SCANNER</span><b id="v271TopName">Moneta</b></div><div class="v271-top-actions"><button id="v271Refresh" class="v271-icon" aria-label="Aggiorna">↻</button><button id="v271Close" class="v271-icon" aria-label="Chiudi">×</button></div></header>
    <main class="v271-main">
      <section class="v271-hero"><div class="v271-identity"><div class="v271-logo"><img id="v271Logo" alt=""></div><div><span id="v271Symbol">—</span><h1 id="v271Name">Caricamento…</h1><p id="v271Meta">Recupero dati verificabili…</p></div></div><div id="v271Forecast" class="v271-pill neutral">🟡 NEUTRALE</div></section>
      <section class="v271-metrics"><div><span>PREZZO</span><b id="v271Price">—</b></div><div><span>24H</span><b id="v27124">—</b></div><div><span>7G</span><b id="v2717">—</b></div><div><span>MARKET CAP</span><b id="v271Cap">—</b></div><div><span>VOLUME 24H</span><b id="v271Vol24">—</b></div><div><span>LIQUIDITÀ BSC</span><b id="v271Liq">—</b></div></section>

      <details class="v271-box v271-pred" open><summary><div><span>1 · PREVISIONE</span><b>Direzione prima dei dettagli</b></div><i>⌄</i></summary><div class="v271-box-body"><div id="v271Why" class="v271-why">Kiber sta incrociando dati di mercato e on-chain.</div><div class="v271-inline-actions"><button id="v271WhyAi">Chiedi a Kiber perché</button><button id="v271Monitor">☆ Monitorizza</button></div></div></details>

      <details class="v271-box v271-chart-box" open><summary><div><span>2 · GRAFICO</span><b id="v271ChartTitle">Andamento prezzo</b></div><i>⌄</i></summary><div class="v271-box-body"><div class="v271-periods"><button data-v271-days="1">24H</button><button data-v271-days="7">7G</button><button data-v271-days="30" class="active">30G</button><button data-v271-days="90">90G</button><button data-v271-days="365">1A</button><button data-v271-days="1095">3A</button></div><div class="v271-chart-stats"><div><span>MAX</span><b id="v271High">—</b></div><div><span>MIN</span><b id="v271Low">—</b></div><div><span>PERIODO</span><b id="v271PeriodChange">—</b></div><div><span>FONTE</span><b id="v271Source">—</b></div></div><div id="v271Chart" class="v271-chart"><div class="v271-loading">Caricamento grafico…</div></div></div></details>

      <details class="v271-box" id="v271FactorsBox"><summary><div><span>3 · COSA LA IMPATTA</span><b>Dati, livelli, flussi e notizie collegate</b></div><i>⌄</i></summary><div class="v271-box-body"><div id="v271Factors" class="v271-factor-grid"><div class="v271-loading">Incrocio fattori…</div></div><div id="v271News" class="v271-news"></div></div></details>

      <details class="v271-box" id="v271KiberBox"><summary><div><span>4 · KIBER AI</span><b>Analisi della moneta</b></div><i>⌄</i></summary><div class="v271-box-body"><div class="v271-ai-actions"><button data-v271-ai="token360">Analisi completa</button><button data-v271-ai="scenario">Scenario 24-72h</button><button data-v271-ai="risk">Rischi</button><button data-v271-ai="newsimpact">Cosa la impatta</button></div><div id="v272Evidence" class="v272-evidence"></div><div id="v271AiAnswer" class="v271-ai-answer">Scegli un'analisi. Kiber riceverà i dati della moneta, il grafico, l'on-chain e le notizie disponibili.</div></div></details>
      <div class="v271-foot">Le previsioni sono stime condizionate basate sui dati disponibili, non certezze né ordini di acquisto.</div>
    </main>
  </div>`;
  document.body.appendChild(el);
  $('v271Back').onclick=closePanel;$('v271Close').onclick=closePanel;$('v271Refresh').onclick=()=>reloadAll();
  qa('[data-v271-days]',el).forEach(b=>b.onclick=()=>changePeriod(+b.dataset.v271Days));
  qa('[data-v271-ai]',el).forEach(b=>b.onclick=()=>askKiber(b.dataset.v271Ai));
  $('v271WhyAi').onclick=()=>askKiber('scenario');$('v271Monitor').onclick=toggleWatch;
}
function openPanel(){ensurePanel();$('v271TokenView').classList.add('open');document.body.classList.add('v271-detail-open');}
function closePanel(){$('v271TokenView')?.classList.remove('open');document.body.classList.remove('v271-detail-open');destroyChart()}
function loading(label){openPanel();$('v271Name').textContent=label||'Caricamento…';$('v271Symbol').textContent='KIBER';$('v271Meta').textContent='Recupero dati verificabili…';$('v271Forecast').className='v271-pill neutral';$('v271Forecast').textContent='🟡 ANALISI';$('v271Chart').innerHTML='<div class="v271-loading">Caricamento grafico…</div>';$('v271Factors').innerHTML='<div class="v271-loading">Incrocio fattori…</div>';$('v271News').innerHTML='';$('v271AiAnswer').textContent='Scegli un\'analisi. Kiber riceverà tutti i dati disponibili.';if($('v272Evidence'))$('v272Evidence').innerHTML='';}

function basicForecast(){
  const c=S.coin||{},i=S.intel||{};let score=0,reasons=[];
  const add=(value,mult,max,label)=>{value=n(value);if(value===null)return;score+=clamp(value*mult,-max,max);reasons.push(label.replace('{v}',pct(value)))};
  add(c.change24,4,24,'Prezzo 24h {v}');add(c.change7d,1.4,22,'Prezzo 7g {v}');add(c.change30d,.55,18,'Prezzo 30g {v}');
  const os=n(i?.outlook?.score);if(os!==null){score+=os*.48;const d=(i.outlook.drivers||[])[0],w=(i.outlook.warnings||[])[0];if(d)reasons.push(d);if(w)reasons.push(w)}
  const rsi=n(i?.technical?.rsi14);if(rsi!==null){if(rsi>=52&&rsi<=70){score+=7;reasons.push(`RSI ${rsi.toFixed(0)} costruttivo`)}else if(rsi<42){score-=7;reasons.push(`RSI ${rsi.toFixed(0)} debole`)}else if(rsi>76){score-=3;reasons.push(`RSI ${rsi.toFixed(0)} molto tirato`)}}
  const pos=n(S.news?.counts?.positive)||0,neg=n(S.news?.counts?.negative)||0;if(pos||neg){const d=pos-neg;score+=clamp(d*2,-8,8);if(Math.abs(d)>=2)reasons.push(d>0?'News recenti più costruttive':'News recenti più sfavorevoli')}
  score=Math.round(clamp(score,-100,100));
  const label=score>=22?'RIALZISTA':score<=-22?'RIBASSISTA':'NEUTRALE',cls=label==='RIALZISTA'?'up':label==='RIBASSISTA'?'down':'neutral',icon=cls==='up'?'🟢':cls==='down'?'🔴':'🟡';
  return{score,label,cls,icon,reasons:[...new Set(reasons)].slice(0,4)};
}
function evidenceMeta(){
  const c=S.coin||{},i=S.intel||{},vals=[c.change24,c.change7d,c.change30d,i?.outlook?.score,i?.technical?.rsi14,i?.token?.liquidityUsd,i?.projectQuality?.score,(S.news?.counts?.positive||0)+(S.news?.counts?.negative||0)];
  const present=vals.reduce((a,v,idx)=>a+((idx===7?Number(v)>0:n(v)!==null)?1:0),0),quality=Math.round(present/vals.length*100),votes=[];
  [[c.change24,1],[c.change7d,1],[i?.outlook?.score,1]].forEach(([v])=>{v=n(v);if(v!==null&&Math.abs(v)>.01)votes.push(Math.sign(v))});
  const nd=(n(S.news?.counts?.positive)||0)-(n(S.news?.counts?.negative)||0);if(nd)votes.push(Math.sign(nd));
  const pos=votes.filter(x=>x>0).length,neg=votes.filter(x=>x<0).length,agree=votes.length?Math.max(pos,neg)/votes.length:0,convergence=quality<38?'BASSA':agree>=.75?'ALTA':agree>=.55?'MEDIA':'BASSA';
  return{quality,convergence};
}
function renderForecast(){const f=basicForecast(),m=evidenceMeta(),pill=$('v271Forecast');pill.className='v271-pill '+f.cls;pill.textContent=`${f.icon} ${f.label}`;const why=f.reasons.length?f.reasons.join(' · '):'I segnali disponibili non convergono abbastanza per forzare una direzione.';$('v271Why').innerHTML=`<b>${esc(f.label)}</b><span>${esc(why)}</span><small>Kiber score ${f.score>=0?'+':''}${f.score}/100 · Qualità dati ${m.quality}/100 · Convergenza ${m.convergence}. Indicatori interni, non probabilità.</small>`}
function renderCoin(){
  const c=S.coin||{};$('v271TopName').textContent=c.symbol?`${c.symbol} · ${c.name||'Token'}`:(c.name||'Token');$('v271Name').textContent=c.name||'Token';$('v271Symbol').textContent=c.symbol||'TOKEN';
  const img=$('v271Logo');if(c.image){img.src=c.image;img.alt=c.symbol||c.name||'Token';img.hidden=false}else{img.removeAttribute('src');img.alt='';img.hidden=true}
  const network=c.address?'Contratto BNB Chain verificabile':'Dati di mercato · contratto BSC non disponibile dalla fonte';$('v271Meta').textContent=`${c.rank?'#'+c.rank+' · ':''}${network}`;
  $('v271Price').textContent=money(c.price);$('v27124').textContent=pct(c.change24);$('v2717').textContent=pct(c.change7d);$('v271Cap').textContent=money(c.marketCap);$('v271Vol24').textContent=money(c.volume24);$('v271Liq').textContent=money(S.intel?.token?.liquidityUsd);
  renderForecast();renderFactors();syncWatchButton();
}
function factor(label,value,note){return `<div class="v271-factor"><span>${esc(label)}</span><b>${esc(value)}</b>${note?`<small>${esc(note)}</small>`:''}</div>`}
function renderFactors(){
  const c=S.coin||{},i=S.intel||{},t=i.technical||{},o=i.outlook||{};let h='';
  h+=factor('Variazione 24h',pct(c.change24),'movimento prezzo');h+=factor('Variazione 7g',pct(c.change7d),'trend breve');
  h+=factor('RSI 14',n(t.rsi14)===null?'—':Number(t.rsi14).toFixed(1),'momentum tecnico');h+=factor('Supporto',money(t.support),'livello osservato');h+=factor('Resistenza',money(t.resistance),'livello osservato');h+=factor('Liquidità BSC',money(i?.token?.liquidityUsd),'profondità del pool');
  const drivers=(o.drivers||[]).slice(0,3),warnings=(o.warnings||[]).slice(0,3);if(drivers.length||warnings.length)h+=`<div class="v271-factor wide"><span>LETTURA ON-CHAIN</span><b>${esc([...drivers,...warnings].join(' · '))}</b><small>DEX Screener + GeckoTerminal</small></div>`;
  $('v271Factors').innerHTML=h;
  const items=(S.news?.items||[]).slice(0,5);$('v271News').innerHTML=items.length?`<div class="v271-news-title">Notizie collegate alla moneta</div>${items.map(x=>`<a href="${esc(x.url||'#')}" target="_blank" rel="noopener"><b>${esc(x.title||'Notizia')}</b><span>${esc(x.source||'Fonte')} · ${esc(x.impact||'basso')} impatto · ${esc(x.tone||'misto')}</span></a>`).join('')}`:'<div class="v271-news-empty">Nessuna notizia specifica abbastanza rilevante trovata adesso.</div>';
}

function destroyChart(){try{S._ro?.disconnect()}catch{}S._ro=null;try{S.chart?.remove()}catch{}S.chart=S.series=S.volume=null}
function loadLib(){return new Promise((ok,no)=>{if(window.LightweightCharts)return ok();const existing=q('script[data-v271-chartlib]');if(existing){existing.addEventListener('load',ok,{once:true});existing.addEventListener('error',no,{once:true});return}const s=document.createElement('script');s.dataset.v271Chartlib='1';s.src='https://cdn.jsdelivr.net/npm/lightweight-charts@5.0.9/dist/lightweight-charts.standalone.production.js';s.async=true;s.onload=ok;s.onerror=no;document.head.appendChild(s)})}
function chartMetrics(points){
  const prices=points.map(x=>n(x.p??x.close)).filter(v=>v!==null);if(!prices.length)return;const first=prices[0],last=prices.at(-1),hi=Math.max(...prices),lo=Math.min(...prices),chg=first?((last/first)-1)*100:null;$('v271High').textContent=money(hi);$('v271Low').textContent=money(lo);$('v271PeriodChange').textContent=pct(chg)
}
function renderFallbackChart(){
  const el=$('v271Chart');if(!el)return;const candles=(S.intel?.technical?.candles||[]).map(x=>({t:Number(x?.[0])*1000,p:n(x?.[4])})).filter(x=>Number.isFinite(x.t)&&x.p!==null),market=(S.chartData?.points||[]).map(x=>({t:Number(x.t),p:n(x.p)})).filter(x=>Number.isFinite(x.t)&&x.p!==null),a=(candles.length>=4&&S.days<=30?candles:market);
  if(a.length<2){el.innerHTML='<div class="v271-error">Storico non disponibile per questo periodo.</div>';return}
  const vals=a.map(x=>x.p),lo=Math.min(...vals),hi=Math.max(...vals),rg=hi-lo||1,W=1000,H=360,L=70,R=20,T=20,B=42,X=i=>L+i/(a.length-1)*(W-L-R),Y=v=>T+(hi-v)/rg*(H-T-B),pts=a.map((x,i)=>`${X(i).toFixed(1)},${Y(x.p).toFixed(1)}`).join(' ');
  el.innerHTML=`<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" style="width:100%;height:100%;display:block"><line x1="${L}" y1="${H-B}" x2="${W-R}" y2="${H-B}" stroke="rgba(120,160,185,.18)"/><polyline points="${pts}" fill="none" stroke="#59d7ff" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>`;chartMetrics(a);$('v271Source').textContent=(candles.length>=4&&S.days<=30?'GeckoTerminal':'CoinGecko')+' · fallback';$('v271ChartTitle').textContent='Grafico resiliente · fallback locale';
}
function renderChart(){
  const el=$('v271Chart');if(!el)return;const LC=window.LightweightCharts;if(!LC){renderFallbackChart();return}destroyChart();el.innerHTML='';
  S.chart=LC.createChart(el,{width:el.clientWidth,height:390,layout:{background:{type:'solid',color:'#04111d'},textColor:'#7895aa',fontFamily:'system-ui,-apple-system,sans-serif'},grid:{vertLines:{color:'rgba(110,150,175,.06)'},horzLines:{color:'rgba(110,150,175,.08)'}},rightPriceScale:{borderColor:'rgba(110,150,175,.15)'},timeScale:{borderColor:'rgba(110,150,175,.15)',timeVisible:S.days<=7,secondsVisible:false},crosshair:{mode:LC.CrosshairMode?.Normal??0},localization:{locale:'it-IT',priceFormatter:p=>money(p)}});
  const candles=(S.intel?.technical?.candles||[]).map(x=>({time:Number(x?.[0]),open:n(x?.[1]),high:n(x?.[2]),low:n(x?.[3]),close:n(x?.[4]),volume:n(x?.[5])})).filter(x=>Number.isFinite(x.time)&&[x.open,x.high,x.low,x.close].every(v=>v!==null));
  const useCandles=candles.length>=4&&S.days<=30;
  if(useCandles){
    S.series=S.chart.addSeries(LC.CandlestickSeries,{upColor:'#26a69a',downColor:'#ef5350',borderVisible:false,wickUpColor:'#26a69a',wickDownColor:'#ef5350',priceLineVisible:true,lastValueVisible:true});S.series.setData(candles.map(({time,open,high,low,close})=>({time,open,high,low,close})));
    S.volume=S.chart.addSeries(LC.HistogramSeries,{priceFormat:{type:'volume'},priceScaleId:'',lastValueVisible:false,priceLineVisible:false});S.volume.priceScale().applyOptions({scaleMargins:{top:.82,bottom:0}});S.volume.setData(candles.map(x=>({time:x.time,value:x.volume||0,color:x.close>=x.open?'rgba(38,166,154,.30)':'rgba(239,83,80,.28)'})));chartMetrics(candles);$('v271Source').textContent='GeckoTerminal';$('v271ChartTitle').textContent='Candele DEX · prezzo reale del pool';
  }else{
    const pts=(S.chartData?.points||[]).map(x=>({time:Math.floor(Number(x.t)/1000),value:n(x.p),p:n(x.p),volume:n(x.volume)})).filter(x=>Number.isFinite(x.time)&&x.value!==null);if(pts.length<2){el.innerHTML='<div class="v271-error">Storico non disponibile per questo periodo.</div>';return}
    S.series=S.chart.addSeries(LC.AreaSeries,{lineColor:'#59d7ff',topColor:'rgba(89,215,255,.28)',bottomColor:'rgba(89,215,255,.02)',lineWidth:2,priceLineVisible:true,lastValueVisible:true});S.series.setData(pts.map(x=>({time:x.time,value:x.value})));
    S.volume=S.chart.addSeries(LC.HistogramSeries,{priceFormat:{type:'volume'},priceScaleId:'',lastValueVisible:false,priceLineVisible:false});S.volume.priceScale().applyOptions({scaleMargins:{top:.82,bottom:0}});S.volume.setData(pts.map(x=>({time:x.time,value:x.volume||0,color:'rgba(73,151,194,.22)'})));chartMetrics(pts);$('v271Source').textContent=S.chartData?.source||'CoinGecko';$('v271ChartTitle').textContent='Prezzo di mercato · storico verificabile';
  }
  S.chart.timeScale().fitContent();S._ro=new ResizeObserver(()=>S.chart?.applyOptions({width:el.clientWidth}));S._ro.observe(el);
}
async function loadChart(){
  const token=++S.chartSeq,el=$('v271Chart');if(!el)return;el.innerHTML='<div class="v271-loading">Aggiornamento grafico…</div>';
  try{
    if(S.coin?.id)S.chartData=await json(`/api/coingecko?type=coin_chart&id=${encodeURIComponent(S.coin.id)}&days=${S.days}&v=271`,{cache:'no-store'});else S.chartData=null;
    if(S.coin?.address&&S.days<=30){try{S.intel=await json(`/api/token-intel-v26?address=${encodeURIComponent(S.coin.address)}&period=${periodForIntel(S.days)}&v=271`,{cache:'no-store'})}catch{}}
    if(token!==S.chartSeq)return;renderCoin();await loadLib();if(token!==S.chartSeq)return;renderChart();
  }catch(e){if(token!==S.chartSeq)return;try{await loadLib();renderChart()}catch{renderFallbackChart()}}
}
function changePeriod(days){if(![1,7,30,90,365,1095].includes(days))return;S.days=days;qa('[data-v271-days]').forEach(b=>b.classList.toggle('active',+b.dataset.v271Days===days));if(!S.coin?.id&&days>30){S.days=30;qa('[data-v271-days]').forEach(b=>b.classList.toggle('active',+b.dataset.v271Days===30));const el=$('v271Chart');if(el)el.innerHTML='<div class="v271-error">Storico 1A/3A non disponibile per questo contratto dalle fonti DEX correnti. Kiber usa 30G finché non colleghiamo uno storico più profondo.</div>';setTimeout(loadChart,900);return}loadChart()}

async function loadSecondary(seq){
  const c=S.coin||{},jobs=[];
  jobs.push(json(`/api/news-v26?symbol=${encodeURIComponent(c.symbol||'')}&name=${encodeURIComponent(c.name||'')}&v=271`,{cache:'no-store'}).then(x=>{if(seq===S.seq)S.news=x}).catch(()=>{}));
  if(validAddress(c.address))jobs.push(json(`/api/token-intel-v26?address=${encodeURIComponent(c.address)}&period=${periodForIntel(S.days)}&v=271`,{cache:'no-store'}).then(x=>{if(seq===S.seq)S.intel=x}).catch(()=>{}));
  await Promise.allSettled(jobs);if(seq!==S.seq)return;renderCoin();renderForecast();renderFactors();
}
async function openById(id){
  id=String(id||'').trim();if(!id)return;const seq=++S.seq;S.mode='id';S.coin=S.intel=S.news=S.chartData=null;S.days=30;loading(id);qa('[data-v271-days]').forEach(b=>b.classList.toggle('active',+b.dataset.v271Days===30));
  try{const d=await json(`/api/coingecko?type=coin_detail&id=${encodeURIComponent(id)}&v=271`,{cache:'no-store'});if(seq!==S.seq)return;S.coin=d.coin;renderCoin();await Promise.allSettled([loadSecondary(seq),loadChart()]);if(seq!==S.seq)return;renderCoin()}catch(e){if(seq!==S.seq)return;showFatal('Non riesco ad aprire questa moneta dai dati CoinGecko.','Il catalogo resta disponibile: puoi tornare indietro e provare un altro asset.')}
}
async function openByAddress(address){
  address=String(address||'').trim();if(!validAddress(address))return;const seq=++S.seq;S.mode='address';S.coin=S.intel=S.news=S.chartData=null;S.days=7;loading('Token BNB Chain');qa('[data-v271-days]').forEach(b=>b.classList.toggle('active',+b.dataset.v271Days===7));
  try{const i=await json(`/api/token-intel-v26?address=${encodeURIComponent(address)}&period=7d&v=271`,{cache:'no-store'});if(seq!==S.seq)return;S.intel=i;const t=i.token||{};S.coin={id:null,address,name:t.name||'Token',symbol:t.symbol||'TOKEN',image:t.imageUrl||'',rank:null,price:n(t.priceUsd),marketCap:n(t.marketCap),volume24:n(t.volume24h),change24:n(t.change24h),change7d:null,change30d:null};renderCoin();await loadSecondary(seq);if(seq!==S.seq)return;await loadLib();renderChart();renderCoin()}catch(e){if(seq!==S.seq)return;showFatal('Analisi on-chain non disponibile per questo contratto.','Il token potrebbe non avere un pool BNB Chain rilevato dalle fonti correnti.')}
}
function showFatal(title,text){$('v271Name').textContent=title;$('v271Meta').textContent=text;$('v271Forecast').textContent='🟡 DATI INSUFFICIENTI';$('v271Forecast').className='v271-pill neutral';$('v271Chart').innerHTML='<div class="v271-error">Nessun grafico disponibile.</div>';$('v271Factors').innerHTML='<div class="v271-error">Nessun dato sufficiente per una previsione affidabile.</div>'}
async function reloadAll(){const c=S.coin;if(!c)return;if(c.id)openById(c.id);else if(c.address)openByAddress(c.address)}

function syncWatchButton(){const k=watchKey(),a=watchList(),on=!!k&&a.some(x=>x.key===k),b=$('v271Monitor');if(b)b.textContent=on?'★ Monitorata':'☆ Monitorizza'}
function toggleWatch(){const k=watchKey();if(!k)return;let a=watchList(),i=a.findIndex(x=>x.key===k);if(i>=0)a.splice(i,1);else a.unshift({key:k,id:S.coin?.id||null,address:S.coin?.address||null,symbol:S.coin?.symbol||'',name:S.coin?.name||'',at:Date.now()});setWatchList(a);syncWatchButton();window.dispatchEvent(new CustomEvent('kiber-watch-change'))}
async function askKiber(mode){
  if(S.aiBusy||!S.coin)return;S.aiBusy=true;const box=$('v271KiberBox'),ans=$('v271AiAnswer');box.open=true;ans.className='v271-ai-answer loading';ans.textContent='Kiber sta incrociando prezzo, grafico, on-chain e notizie…';const c=S.coin,f=basicForecast();
  const prompts={token360:`Analizza ${c.name} (${c.symbol}) in modo completo. Parti dalla previsione ${f.label} e spiegami perché, cosa la conferma, cosa la contraddice e cosa monitorare.`,scenario:`Spiegami perché la previsione di ${c.name} (${c.symbol}) è ${f.label}. Dammi scenario 24-72h, conferme e invalidazioni senza inventare target.`,risk:`Analizza i rischi di ${c.name} (${c.symbol}) usando solo i dati disponibili: liquidità, volatilità, flussi, livelli e dati mancanti.`,newsimpact:`Dimmi cosa può impattare ${c.name} (${c.symbol}) adesso. Collega le notizie disponibili ai dati di prezzo e on-chain senza confondere coincidenza e causalità.`};
  try{const r=await json('/api/kiber',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({analysisMode:mode==='risk'?'risk':mode,message:prompts[mode]||prompts.token360,token:{symbol:c.symbol,name:c.name,address:c.address||'',price:c.price,change24:c.change24,change7d:c.change7d,change30d:c.change30d,marketCap:c.marketCap,volume24:c.volume24,rank:c.rank,categories:c.categories||[]},tokenIntel:S.intel,marketNews:S.news,analysis:{chart:{days:S.days,source:$('v271Source')?.textContent||'',periodChange:$('v271PeriodChange')?.textContent||''}}})});ans.className='v271-ai-answer';ans.textContent=r.answer||'Analisi non disponibile.';const a=r.assessment,ev=$('v272Evidence');if(ev&&a)ev.innerHTML=`<span>Qualità dati ${Math.round(Number(a.dataQuality)||0)}/100</span><span>Convergenza ${esc(a.convergence||'—')}</span><span>Evidenze ${Math.round(Number(a.evidenceCount)||0)}</span>`}catch(e){ans.className='v271-ai-answer';ans.textContent=`${f.icon} ${f.label}\n\nPerché: ${f.reasons.join(' · ')||'segnali non abbastanza convergenti.'}\n\nKiber AI esterna non è disponibile in questo momento, quindi questa è la lettura deterministica sui dati caricati.`}finally{S.aiBusy=false}}

function intercept(e){
  if(e.defaultPrevented)return;
  const cg=e.target.closest?.('#v21CatalogList [data-v21-id]');if(cg){e.preventDefault();e.stopImmediatePropagation();openById(cg.dataset.v21Id);return}
  const chain=e.target.closest?.('#marketList .token-row[data-address]');if(chain){e.preventDefault();e.stopImmediatePropagation();openByAddress(chain.dataset.address);return}
  const emerg=e.target.closest?.('[data-v26-token]');if(emerg&&!emerg.closest('#v271TokenView')){e.preventDefault();e.stopImmediatePropagation();openByAddress(emerg.dataset.v26Token)}
}
function boot(){mark();ensurePanel();document.addEventListener('click',intercept,true);window.openToken=address=>openByAddress(address);window.kiberOpenCoin=id=>openById(id);window.kiberOpenToken=address=>openByAddress(address);window.kiberTokenContext=()=>({coin:S.coin,intel:S.intel,news:S.news,chartData:S.chartData,days:S.days,forecast:basicForecast()})}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();