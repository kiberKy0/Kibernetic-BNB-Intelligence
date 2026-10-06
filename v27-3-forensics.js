(()=>{
"use strict";
const $=i=>document.getElementById(i),q=(s,r=document)=>r.querySelector(s);
const num=v=>v===null||v===undefined||v===""?null:(Number.isFinite(Number(v))?Number(v):null);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const pct=v=>{v=num(v);return v===null?"—":(v>=0?"+":"")+v.toFixed(2)+"%"};
const money=v=>{v=num(v);if(v===null)return"—";const a=Math.abs(v);if(a>=1e9)return"$"+(v/1e9).toFixed(2)+"B";if(a>=1e6)return"$"+(v/1e6).toFixed(2)+"M";if(a>=1e3)return"$"+v.toLocaleString("it-IT",{maximumFractionDigits:2});return"$"+v.toLocaleString("it-IT",{maximumFractionDigits:a<1?8:2})};
const F={sig:"",series:[],events:[],selected:null,busy:false,lastSnap:0};
function C(){try{return typeof window.kiberTokenContext==="function"?window.kiberTokenContext():null}catch{return null}}
function key(c){return c?.id?"id:"+c.id:c?.address?"address:"+String(c.address).toLowerCase():""}
function avg(a){a=a.filter(Number.isFinite);return a.length?a.reduce((s,x)=>s+x,0)/a.length:null}
function med(a){a=a.filter(Number.isFinite).sort((x,y)=>x-y);if(!a.length)return 0;const m=Math.floor(a.length/2);return a.length%2?a[m]:(a[m-1]+a[m])/2}
function when(t){return Number.isFinite(t)?new Date(t).toLocaleString("it-IT",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"}):"—"}
function dur(h){if(!Number.isFinite(h))return"—";return h<24?h.toFixed(h<10?1:0)+" h":(h/24).toFixed(1)+" g"}
function ntime(x){const v=x?.publishedAt??x?.published_at??x?.published??x?.date??x?.datetime??x?.time??x?.timestamp;if(v===null||v===undefined)return null;if(Number.isFinite(Number(v))){const z=Number(v);return z>1e12?z:z>1e9?z*1000:null}const d=Date.parse(v);return Number.isFinite(d)?d:null}
function series(){
 const c=C();if(!c)return[];
 const a=(c.intel?.technical?.candles||[]).map(x=>({t:Number(x?.[0])*1000,p:num(x?.[4]),v:num(x?.[5])})).filter(x=>Number.isFinite(x.t)&&x.p!==null);
 const b=(c.chartData?.points||[]).map(x=>({t:Number(x?.t),p:num(x?.p),v:num(x?.volume)})).filter(x=>Number.isFinite(x.t)&&x.p!==null);
 const z=(a.length>=8&&(c.days||30)<=30?a:b).sort((x,y)=>x.t-y.t),out=[];for(const x of z){if(!out.length||x.t!==out.at(-1).t)out.push(x);else out[out.length-1]=x}return out;
}
function threshold(a){const r=[];for(let i=1;i<a.length;i++)if(a[i-1].p>0)r.push(Math.abs((a[i].p/a[i-1].p-1)*100));return clamp(med(r)*4.5,2.5,12)}
function event(a,type,s,e,th){if(e<=s)return null;const x=a[s],y=a[e],ch=(y.p/x.p-1)*100,L=e-s+1,vs=a.slice(s,e+1).map(z=>z.v),pre=a.slice(Math.max(0,s-L),s).map(z=>z.v),av=avg(vs),base=avg(pre);return{id:type+":"+x.t+":"+y.t,type,start:s,end:e,startTime:x.t,endTime:y.t,startPrice:x.p,endPrice:y.p,change:ch,hours:(y.t-x.t)/36e5,avgVol:av,baseVol:base,volRatio:av!==null&&base&&base>0?av/base:null,threshold:th}}
function detect(a){
 if(a.length<8)return[];const th=threshold(a),out=[];let trend=0,start=0,ext=0,hi=0,lo=0;
 for(let i=1;i<a.length;i++){const p=a[i].p;if(!trend){if(p>a[hi].p)hi=i;if(p<a[lo].p)lo=i;const up=(p/a[lo].p-1)*100,dn=(p/a[hi].p-1)*100;if(up>=th){trend=1;start=lo;ext=i}else if(dn<=-th){trend=-1;start=hi;ext=i}}else if(trend>0){if(p>a[ext].p)ext=i;if((p/a[ext].p-1)*100<=-th){const ev=event(a,"UP",start,ext,th);if(ev)out.push(ev);trend=-1;start=ext;ext=i}}else{if(p<a[ext].p)ext=i;if((p/a[ext].p-1)*100>=th){const ev=event(a,"DOWN",start,ext,th);if(ev)out.push(ev);trend=1;start=ext;ext=i}}}
 const last=event(a,trend>0?"UP":"DOWN",start,ext,th);if(trend&&last&&Math.abs(last.change)>=th)out.push(last);return out.slice(-40);
}
function stats(a){const gap=list=>{const x=list.map(e=>e.startTime).sort((a,b)=>a-b),g=[];for(let i=1;i<x.length;i++)g.push((x[i]-x[i-1])/36e5);return avg(g)},up=a.filter(e=>e.type==="UP"),dn=a.filter(e=>e.type==="DOWN");return{up:up.length,dn:dn.length,upAvg:avg(up.map(e=>e.change)),dnAvg:avg(dn.map(e=>e.change)),gap:gap(a),upGap:gap(up),dnGap:gap(dn),duration:avg(a.map(e=>e.hours)),th:a[0]?.threshold||threshold(F.series)}}
function snaps(){try{return JSON.parse(localStorage.getItem("kiber_forensics_v273")||"[]")}catch{return[]}}
function save(){
 const c=C(),coin=c?.coin,k=key(coin),now=Date.now();if(!coin||!k||now-F.lastSnap<30000)return;F.lastSnap=now;let a=snaps(),last=a.find(x=>x.k===k);if(last&&now-last.t<1800000)return;
 a.unshift({k,t:now,price:num(coin.price),liq:num(c.intel?.token?.liquidityUsd),vol:num(coin.volume24),buys:num(c.intel?.token?.buys24h),sells:num(c.intel?.token?.sells24h),support:num(c.intel?.technical?.support),resistance:num(c.intel?.technical?.resistance)});
 const keep=[],count={};for(const x of a){count[x.k]=(count[x.k]||0)+1;if(count[x.k]<=180)keep.push(x);if(keep.length>=1800)break}try{localStorage.setItem("kiber_forensics_v273",JSON.stringify(keep))}catch{}
}
function snap(ev){const k=key(C()?.coin),a=snaps().filter(x=>x.k===k&&num(x.liq)!==null);let best=null,d=Infinity;for(const x of a){const z=Math.min(Math.abs(x.t-ev.startTime),Math.abs(x.t-ev.endTime));if(z<d){d=z;best=x}}return best&&d<=18*36e5?{...best,dist:d/36e5}:null}
function news(ev){const mid=(ev.startTime+ev.endTime)/2,out=[];for(const x of C()?.news?.items||[]){const t=ntime(x);if(!t)continue;const h=Math.abs(t-mid)/36e5;if(h<=36)out.push({...x,_t:t,_h:h})}return out.sort((a,b)=>a._h-b._h).slice(0,4)}
function cause(ev){const a=[],nw=news(ev),ss=snap(ev);let score=0;if(ev.volRatio!==null&&ev.volRatio>=1.5){a.push("volume "+ev.volRatio.toFixed(1)+"× la finestra precedente");score++}if(nw.length){a.push(nw.length+" news/eventi entro ±36h");score++}if(ss){a.push("liquidità Kiber vicina all'evento "+money(ss.liq));score++}return{label:score>=3?"PROBABILE":score>=1?"CORRELATA":"SCONOSCIUTA",factors:a,news:nw,snap:ss}}
function phases(ev){const a=F.series.slice(ev.start,ev.end+1);if(a.length<3)return[];const cut=[0,Math.floor((a.length-1)*.33),Math.floor((a.length-1)*.66),a.length-1],lab=["Innesco","Accelerazione","Conferma"],r=[];for(let i=0;i<3;i++){const x=a[cut[i]],y=a[cut[i+1]];r.push({label:lab[i],change:(y.p/x.p-1)*100,vol:avg(a.slice(cut[i],cut[i+1]+1).map(z=>z.v))})}return r}
function ensure(){
 const token=$("v271TokenView");if(!token||$("v273Forensics"))return!!$("v273Forensics");const chart=q(".v271-chart-box",token);if(!chart)return false;
 const d=document.createElement("details");d.id="v273Forensics";d.className="v271-box v273-forensics";d.open=true;d.innerHTML='<summary><div><span>3 · EVENT FORENSICS</span><b>UP/DOWN, movente, frequenza e punti del grafico</b></div><i>⌄</i></summary><div class="v271-box-body"><div id="v273Head" class="v273-head"></div><div id="v273Stats" class="v273-stats"></div><div class="v273-tip">Tocca un punto del grafico per analizzarlo.</div><div id="v273Events" class="v273-events"></div><div id="v273Sel" class="v273-sel">Seleziona un evento o un punto del grafico.</div></div>';chart.insertAdjacentElement("afterend",d);
 const f=q("#v271FactorsBox summary span"),k=q("#v271KiberBox summary span");if(f)f.textContent="4 · COSA LA IMPATTA";if(k)k.textContent="5 · KIBER AI";
 $("v273Events").onclick=e=>{const b=e.target.closest("[data-ev]");if(b)select(b.dataset.ev,null)};$("v273Sel").onclick=e=>{const b=e.target.closest("[data-ai]");if(b)ask(b.dataset.ai)};return true;
}
function render(){
 if(!ensure())return;const c=C();if(!c?.coin)return;save();F.series=series();F.events=detect(F.series);const s=stats(F.events);
 $("v273Head").innerHTML='<b>'+F.events.length+' movimenti significativi</b><span>Soglia adattiva '+s.th.toFixed(1)+'% · '+(c.days||"—")+' giorni</span>';
 $("v273Stats").innerHTML='<div><span>UP</span><b>'+s.up+'</b><small>media '+pct(s.upAvg)+'</small></div><div><span>DOWN</span><b>'+s.dn+'</b><small>media '+pct(s.dnAvg)+'</small></div><div><span>INTERVALLO</span><b>'+dur(s.gap)+'</b><small>media tra eventi</small></div><div><span>DURATA</span><b>'+dur(s.duration)+'</b><small>media processo</small></div>';
 const a=[...F.events].reverse().slice(0,8);$("v273Events").innerHTML=a.length?a.map(e=>'<button class="'+(e.type==="UP"?"up":"down")+'" data-ev="'+esc(e.id)+'"><span>'+(e.type==="UP"?"▲ UP":"▼ DOWN")+'</span><b>'+pct(e.change)+'</b><small>'+when(e.startTime)+' → '+when(e.endTime)+' · '+dur(e.hours)+'</small></button>').join(""):'<div class="v273-empty">Nessun movimento sopra la soglia adattiva.</div>';
}
function point(i){const a=F.series,p=a[i];if(!p)return null;const b=a[Math.max(0,i-3)],z=a[Math.min(a.length-1,i+3)];return{time:p.t,price:p.p,before:(p.p/b.p-1)*100,after:(z.p/p.p-1)*100,volume:p.v,index:i}}
function select(id,i){const ev=F.events.find(x=>x.id===id);if(!ev)return;F.selected={id,point:i};show(ev,i);$("v273Forensics").open=true;$("v273Sel")?.scrollIntoView({behavior:"smooth",block:"nearest"})}
function show(ev,i){
 const s=stats(F.events),ca=cause(ev),ss=ca.snap,ph=phases(ev),p=i===null?null:point(i),same=F.events.filter(x=>x.type===ev.type),gap=ev.type==="UP"?s.upGap:s.dnGap;
 $("v273Sel").innerHTML='<div class="v273-title"><div><span>'+(ev.type==="UP"?"▲ UP":"▼ DOWN")+' · '+when(ev.startTime)+'</span><b>'+pct(ev.change)+' in '+dur(ev.hours)+'</b></div><strong class="'+ca.label.toLowerCase()+'">'+ca.label+'</strong></div>'+
 (p?'<div class="v273-point"><span>PUNTO SELEZIONATO</span><b>'+when(p.time)+' · '+money(p.price)+'</b><small>prima '+pct(p.before)+' · dopo '+pct(p.after)+(p.volume!==null?' · volume '+money(p.volume):'')+'</small></div>':'')+
 '<div class="v273-grid"><div><span>MOVENTE</span><b>'+esc(ca.factors.join(" · ")||"Non dimostrato dai dati disponibili")+'</b><small>Correlazione non significa causalità certa.</small></div><div><span>VOLUME EVENTO</span><b>'+(ev.volRatio===null?"—":ev.volRatio.toFixed(2)+"× baseline")+'</b><small>'+(ev.avgVol===null?"storico volume assente":"media "+money(ev.avgVol))+'</small></div><div><span>LIQUIDITÀ ALL EVENTO</span><b>'+(ss?money(ss.liq):"Non archiviata")+'</b><small>'+(ss?"snapshot a "+ss.dist.toFixed(1)+"h":"Kiber inizia a salvarla da ora")+'</small></div><div><span>RICORRENZA '+ev.type+'</span><b>'+same.length+' casi</b><small>'+(gap===null?"intervallo non calcolabile":"ogni "+dur(gap)+" in media")+'</small></div></div>'+
 '<div class="v273-phases">'+ph.map(x=>'<div><span>'+x.label+'</span><b>'+pct(x.change)+'</b><small>'+(x.vol===null?"volume —":"vol "+money(x.vol))+'</small></div>').join("")+'</div>'+
 (ca.news.length?'<div class="v273-news"><span>NEWS / EVENTI VICINI</span>'+ca.news.map(x=>'<a href="'+esc(x.url||"#")+'" target="_blank" rel="noopener"><b>'+esc(x.title||"Notizia")+'</b><small>'+when(x._t)+' · '+x._h.toFixed(1)+'h · correlazione temporale</small></a>').join("")+'</div>':'')+
 '<div class="v273-actions"><button data-ai="eventforensics">Perché è successo?</button><button data-ai="cycles">Casi simili</button><button data-ai="futureimpact">Cosa dopo?</button></div><pre id="v273AI">Kiber può analizzare questo evento con dati, processo, news e liquidità osservata.</pre>';
}
function payload(){const ev=F.events.find(x=>x.id===F.selected?.id);if(!ev)return null;const s=stats(F.events),ca=cause(ev);return{event:{type:ev.type,startTime:new Date(ev.startTime).toISOString(),endTime:new Date(ev.endTime).toISOString(),startPrice:ev.startPrice,endPrice:ev.endPrice,changePct:ev.change,durationHours:ev.hours,volumeRatio:ev.volRatio,avgVolume:ev.avgVol,baselineVolume:ev.baseVol},point:F.selected.point===null?null:point(F.selected.point),attribution:{classification:ca.label,factors:ca.factors,historicalLiquidity:ca.snap?.liq??null,linkedNews:ca.news.map(x=>({title:x.title,source:x.source,publishedAt:new Date(x._t).toISOString(),distanceHours:x._h}))},phases:phases(ev),cycles:{eventCount:F.events.length,sameTypeCount:F.events.filter(x=>x.type===ev.type).length,avgGapHours:s.gap,sameTypeAvgGapHours:ev.type==="UP"?s.upGap:s.dnGap,avgDurationHours:s.duration,avgUpPct:s.upAvg,avgDownPct:s.dnAvg,adaptiveThresholdPct:s.th}}}
async function ask(mode){
 if(F.busy)return;const c=C(),p=payload(),box=$("v273AI");if(!c?.coin||!p||!box)return;F.busy=true;box.textContent="Kiber sta ricostruendo movente e processo…";
 const msg=mode==="cycles"?"Confronta questo evento con i casi UP/DOWN simili. Spiega cosa si ripete, ogni quanto e con quali limiti statistici.":mode==="futureimpact"?"Partendo da questo evento, dimmi cosa può impattare il prossimo movimento e cosa conferma o invalida lo scenario.":"Ricostruisci questo evento: cosa è successo, movente più supportato, cosa è solo correlato, processo UP/DOWN e dati mancanti.";
 try{const r=await fetch("/api/kiber",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({analysisMode:mode,message:msg,token:{symbol:c.coin.symbol,name:c.coin.name,address:c.coin.address||"",price:c.coin.price,change24:c.coin.change24,change7d:c.coin.change7d,change30d:c.coin.change30d,marketCap:c.coin.marketCap,volume24:c.coin.volume24,categories:c.coin.categories||[]},tokenIntel:c.intel,marketNews:c.news,analysis:{forensics:p,chart:{days:c.days,source:c.chartData?.source||"",pointCount:F.series.length}}})});const d=await r.json();if(!r.ok)throw Error(d?.error||r.status);box.textContent=d.answer||"Analisi non disponibile."}catch{box.textContent="IA temporaneamente non disponibile. I calcoli forensi sopra restano validi sui dati caricati."}finally{F.busy=false}
}
function clickChart(e){const el=e.target.closest?.("#v271Chart");if(!el||!F.series.length)return;const r=el.getBoundingClientRect(),i=Math.round(clamp((e.clientX-r.left)/Math.max(1,r.width),0,1)*(F.series.length-1));let ev=F.events.find(x=>i>=x.start&&i<=x.end);if(!ev&&F.events.length)ev=[...F.events].sort((a,b)=>Math.min(Math.abs(i-a.start),Math.abs(i-a.end))-Math.min(Math.abs(i-b.start),Math.abs(i-b.end)))[0];if(ev)select(ev.id,i)}
function sig(){const c=C();if(!c?.coin)return"";const a=series();return key(c.coin)+"|"+c.days+"|"+a.length+"|"+(a.at(-1)?.t||0)+"|"+(c.intel?.token?.liquidityUsd||"")}
function tick(){ensure();const s=sig();if(s&&s!==F.sig){F.sig=s;F.selected=null;render()}else if(s)save()}
function boot(){document.body.classList.add("v273");window.kiberForensicsContext=()=>payload();document.addEventListener("click",clickChart,true);setInterval(tick,1200);setTimeout(tick,350)}
document.readyState==="loading"?document.addEventListener("DOMContentLoaded",boot,{once:true}):boot();
})();