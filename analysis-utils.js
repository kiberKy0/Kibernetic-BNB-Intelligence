(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.KiberAnalysis=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const avg=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:null;
const median=a=>{a=a.filter(Number.isFinite).sort((a,b)=>a-b);return a.length?a.length%2?a[a.length>>1]:(a[(a.length>>1)-1]+a[a.length>>1])/2:null};
function clean(a){const m=new Map();for(const x of a||[])if(Number.isFinite(x.t)&&Number.isFinite(x.p)&&x.p>0)m.set(x.t,{...x,v:Number.isFinite(x.v)&&x.v>=0?x.v:null});return [...m.values()].sort((a,b)=>a.t-b.t)}
function threshold(a){return Math.max(.25,Math.min(12,(median(a.slice(1).map((x,i)=>Math.abs((x.p/a[i].p-1)*100)))||.1)*4.5))}
function detect(input){const a=clean(input),th=threshold(a),out=[];if(a.length<3)return out;let trend=0,start=0,ext=0,hi=0,lo=0;
function add(end,confirmedAt){if(end<=start)return;const v=a.slice(start,end+1).map(x=>x.v).filter(Number.isFinite),b=a.slice(Math.max(0,start-(end-start+1)),start).map(x=>x.v).filter(Number.isFinite),base=avg(b),volume=avg(v);out.push({id:a[start].t+':'+a[end].t,type:trend>0?'UP':'DOWN',start,end,startTime:a[start].t,endTime:a[end].t,startPrice:a[start].p,endPrice:a[end].p,change:(a[end].p/a[start].p-1)*100,hours:(a[end].t-a[start].t)/36e5,volRatio:volume!==null&&base>0?volume/base:null,confirmedAt,threshold:th})}
for(let i=1;i<a.length;i++){const p=a[i].p;if(!trend){if(p>a[hi].p)hi=i;if(p<a[lo].p)lo=i;if((p/a[lo].p-1)*100>=th){trend=1;start=lo;ext=i}else if((p/a[hi].p-1)*100<=-th){trend=-1;start=hi;ext=i}}else if(trend>0){if(p>a[ext].p)ext=i;if((p/a[ext].p-1)*100<=-th){add(ext,a[i].t);trend=-1;start=ext;ext=i}}else{if(p<a[ext].p)ext=i;if((p/a[ext].p-1)*100>=th){add(ext,a[i].t);trend=1;start=ext;ext=i}}}
if(trend)add(ext,null);return out}
function recurrence(events,type,asOf){const a=events.filter(e=>e.type===type&&e.confirmedAt!==null&&e.confirmedAt<=asOf),max=a.length?Math.max(...a.map(e=>Math.abs(e.change))):null,cut=a.length?Math.abs(a.map(e=>e.change).sort((a,b)=>Math.abs(a)-Math.abs(b))[Math.floor((a.length-1)*.8)]):null,strong=a.filter(e=>Math.abs(e.change)>=cut),g=strong.slice(1).map((e,i)=>(e.startTime-strong[i].startTime)/36e5);return{count:a.length,max,record:a.find(e=>Math.abs(e.change)===max)||null,strongCount:strong.length,cut,gapMedian:median(g),gapMin:g.length?Math.min(...g):null,gapMax:g.length?Math.max(...g):null,sinceLast:strong.length?(asOf-strong.at(-1).endTime)/36e5:null}}
// Forecast analogues compare observable windows, not retrospectively identified extrema.
function forecast(input){
 const a=clean(input),lookback=24,horizon=6,step=median(a.slice(1).map((x,i)=>x.t-a[i].t));
 const base={status:'insufficient',validated:false,asOf:a.at(-1)?.t??null,horizonHours:step>0?horizon*step/36e5:null,lookbackBars:lookback,horizonBars:horizon,count:0,counts:{up:0,down:0,range:0},cases:[],medianReturn:null,returnLow:null,returnHigh:null,scenario:null,reason:'Servono almeno 24 osservazioni regolari prima del punto.'};
 if(a.length<lookback||!(step>0))return base;
 function regular(w){return w.slice(1).every((x,i)=>Math.abs((x.t-w[i].t)/step-1)<.1)}
 function state(w){const rets=w.slice(1).map((x,i)=>(x.p/w[i].p-1)*100),vol=Math.sqrt(avg(rets.map(x=>x*x))),scale=Math.max(.05,vol),last=w.at(-1),lo=Math.min(...w.map(x=>x.p)),hi=Math.max(...w.map(x=>x.p)),vv=w.map(x=>x.v),volume=vv.every(Number.isFinite)&&avg(vv.slice(0,-6))>0?avg(vv.slice(-6))/avg(vv.slice(0,-6)):null;return {trend:(last.p/w[0].p-1)*100/scale,momentum:(last.p/w.at(-7).p-1)*100/scale,position:hi>lo?(last.p-lo)/(hi-lo):.5,vol,volume,shape:w.map(x=>(x.p/w[0].p-1)*100/scale),support:lo,resistance:hi}}
 const current=a.slice(-lookback);if(!regular(current))return {...base,reason:'Intervalli irregolari: occorre una serie uniforme per confrontare i tempi.'};
 const target=state(current),band=Math.max(.25,target.vol*Math.sqrt(horizon)*.5),matches=[];
 // Purge both outcome and feature windows away from the current window.
 for(let i=lookback-1;i+horizon<a.length-lookback;i++){
  const w=a.slice(i-lookback+1,i+1),next=a.slice(i+1,i+horizon+1);if(!regular([...w,...next]))continue;
  const x=state(w),vr=target.vol>0?x.vol/target.vol:x.vol===0?1:Infinity;
  if(vr<.5||vr>2||Math.abs(x.position-target.position)>.25||Math.abs(x.trend-target.trend)>3||Math.abs(x.momentum-target.momentum)>2)continue;
  const distance=Math.sqrt(avg(x.shape.map((v,j)=>(v-target.shape[j])**2)));
  if(distance>2||target.volume!==null&&(x.volume===null||Math.abs(Math.log(Math.max(.001,x.volume)/Math.max(.001,target.volume)))>Math.log(2)))continue;
  const ret=(next.at(-1).p/a[i].p-1)*100,exc=next.map(z=>(z.p/a[i].p-1)*100);
  matches.push({time:a[i].t,outcomeTime:next.at(-1).t,returnPct:ret,outcome:ret>band?'up':ret<-band?'down':'range',high:Math.max(...exc),low:Math.min(...exc),distance,index:i});
 }
 // Keep the closest matches without counting overlapping historical windows repeatedly.
 matches.sort((x,y)=>x.distance-y.distance);const cases=[];for(const x of matches){if(cases.every(y=>Math.abs(y.index-x.index)>=lookback+horizon))cases.push(x);if(cases.length===50)break}
 cases.sort((x,y)=>x.time-y.time);const counts={up:0,down:0,range:0};cases.forEach(x=>counts[x.outcome]++);
 const values=cases.map(x=>x.returnPct).sort((x,y)=>x-y),q=t=>values.length?values[Math.floor((values.length-1)*t)]:null,winner=Object.keys(counts).sort((x,y)=>counts[y]-counts[x])[0],share=cases.length?counts[winner]/cases.length:0;
 return {...base,status:cases.length>=20&&share>=.6?'exploratory':'insufficient',reason:cases.length<20?'Pochi precedenti separati: lettura ancora debole.':share<.6?'I precedenti danno esiti discordanti.':'Scenario esplorativo: efficacia fuori campione ancora da verificare.',count:cases.length,counts,cases,medianReturn:median(values),returnLow:q(.25),returnHigh:q(.75),scenario:cases.length>=20&&share>=.6?winner:null,support:target.support,resistance:target.resistance,volumeCompared:target.volume!==null,rangeBand:band};
}
function analyze(input,time){const a=clean(input);if(a.length<3)return null;const at=time==null?a.at(-1).t:Math.max(a[0].t,Math.min(a.at(-1).t,time)),index=a.reduce((best,x,i)=>Math.abs(x.t-at)<Math.abs(a[best].t-at)?i:best,0),point=a[index],past=a.slice(0,index+1),known=detect(past),all=detect(a),event=known.at(-1)||null,recent=past.slice(-21),support=Math.min(...recent.map(x=>x.p)),resistance=Math.max(...recent.map(x=>x.p)),returns=recent.slice(1).map((x,i)=>(x.p/recent[i].p-1)*100),volatility=returns.length?Math.sqrt(avg(returns.map(x=>x*x))):null,step=median(past.slice(1).map((x,i)=>x.t-past[i].t));
// Candidates and outcomes must both have been observed before the selected timestamp.
const horizon=6,candidates=event?known.filter(e=>e.id!==event.id&&e.confirmedAt!==null&&e.confirmedAt<=point.t&&e.type===event.type&&Math.abs(Math.abs(e.change)/Math.abs(event.change)-1)<=.5&&Math.abs(e.hours/Math.max(event.hours,step/36e5)-1)<=.75&&e.end+horizon<index):[],similar=candidates.map(e=>{const end=e.end+horizon,vals=past.slice(e.end+1,end+1).map(x=>(x.p/e.endPrice-1)*100),ret=(past[end].p/e.endPrice-1)*100;return{...e,outcome:Math.abs(ret)<e.threshold?'range':Math.sign(ret)===Math.sign(e.change)?'continuazione':'inversione',returnPct:ret,favorable:Math.max(...vals),adverse:Math.min(...vals),outcomeHours:(past[end].t-e.endTime)/36e5}}),counts={continuazione:0,inversione:0,range:0};for(const e of similar)counts[e.outcome]++;
const previous=past.slice(-21,-1),priorHigh=previous.length?Math.max(...previous.map(x=>x.p)):point.p,priorLow=previous.length?Math.min(...previous.map(x=>x.p)):point.p,pattern=point.p>priorHigh?'Breakout candidato':point.p<priorLow?'Breakdown candidato':event?(event.type==='UP'?'Impulso rialzista':'Impulso ribassista'):'Range / movimento sotto soglia';
return{forecast:forecast(past),point,index,selected:time!=null,asOf:point.t,coverage:{from:a[0].t,to:a.at(-1).t,count:a.length,stepHours:step/36e5},event,sequence:time==null?all.slice(-8).reverse():all.filter(e=>e.endTime>=point.t).slice(0,12),knownCount:known.length,threshold:threshold(past),pattern,support,resistance,volatility,similar,counts,horizonBars:horizon,horizonHours:horizon*step/36e5,medianReturn:median(similar.map(e=>e.returnPct)),up:recurrence(known,'UP',point.t),down:recurrence(known,'DOWN',point.t)}}
return{clean,median,threshold,detect,recurrence,forecast,analyze};
});
