/* Kibernetic: metriche direzionali descrittive, non previsioni. Shared by browser and tests. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KiberTrendMetrics=api})(typeof window==='object'?window:globalThis,()=>{
'use strict';
const number=v=>v===null||v===undefined||v===''?null:Number.isFinite(Number(v))?Number(v):null;
const periodChange=v=>{
  const value=number(v);
  if(value===null)return {state:'unknown',label:'NON DISPONIBILE',value:null};
  return {state:value>0?'up':value<0?'down':'flat',label:value>0?'UP':value<0?'DOWN':'STABILE',value};
};
const percentage=v=>{const n=number(v);return n===null?'—':(n>0?'+':'')+n.toLocaleString('it-IT',{maximumFractionDigits:2})+'%'};
const SECTOR_GROUPS={
  'DeFi':['Dexs','Dexes','Lending','Yield','CDP','Liquid Staking','Liquid Restaking','Leveraged Farming','Yield Aggregator'],
  'Stablecoin':['CDP','Stablecoin'],
  'RWA':['RWA'],
  'Infrastructure & Interoperability':['Bridge','Cross Chain Bridge','Interoperability'],
  'Gaming & Metaverse':['Gaming'],
  'DePIN':['DePIN'],
  'AI & Compute':['AI','Artificial Intelligence']
};
function validFeed(data,now=Date.now()){
  if(!data||!Array.isArray(data.sectors))return false;
  const date=Date.parse(data.updatedAt||'');
  return Number.isFinite(date)&&date<=now+120000&&(now-date)<=24*3600000;
}
function strongest(data,now=Date.now()){
  if(!validFeed(data,now))return null;
  const choices=data.sectors.filter(x=>number(x.change7d)!==null&&number(x.tvl)>0&&Number(x.count)>0).sort((a,b)=>b.change7d-a.change7d);
  const first=choices[0];
  if(!first)return null;
  return {name:String(first.name||'Altro'),...periodChange(first.change7d),count:Number(first.count),sample:Number(data.covered)||0,updatedAt:data.updatedAt,metric:'TVL BNB Chain · 7 giorni'};
}
function matchingSector(coin,feed,watchApi,now=Date.now()){
  const classification=watchApi?.sector?.(coin||{})||{name:'Non classificato',source:'dati assenti'};
  const name=classification.name;
  if(!validFeed(feed,now))return {name,source:classification.source,reason:'Storico settori non aggiornato',...periodChange(null)};
  const wanted=SECTOR_GROUPS[name]||[name];
  const rows=feed.sectors.filter(x=>wanted.some(w=>String(w).toLowerCase()===String(x.name||'').toLowerCase())&&number(x.change7d)!==null&&number(x.tvl)>0&&Number(x.count)>0);
  // Aggregate by implied starting capital, not by an arithmetic average of returns.
  let before=0,after=0,count=0;
  for(const s of rows){const curr=number(s.tvl),pct=number(s.change7d);if(pct===null||pct<=-100)continue;const prev=curr/(1+pct/100);if(!Number.isFinite(prev)||prev<=0)continue;before+=prev;after+=curr;count+=Number(s.count)||0;}
  if(!before)return {name,source:classification.source,reason:'Nessun campione TVL corrispondente: non equivale a settore DOWN',...periodChange(null)};
  const change=(after/before-1)*100;
  return {name,source:classification.source,reason:'Campione TVL 7 giorni · '+count+' protocolli; non misura la performance del prezzo dei token',...periodChange(change),count};
}
return{number,periodChange,percentage,validFeed,strongest,matchingSector,SECTOR_GROUPS};
});
