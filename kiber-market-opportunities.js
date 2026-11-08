/* Read-only market opportunity shortlist. Uses only catalog currently loaded in Kibernetic. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KiberMarketOpportunities=api})(typeof window==='object'?window:globalThis,()=>{
'use strict';
const n=v=>v===''||v===null||v===undefined?null:Number.isFinite(Number(v))?Number(v):null;
const getSector=x=>typeof window!=='undefined'?window.KiberSector?.classify(x)?.name||'Da verificare':'Da verificare';
const isRequest=(question,previous='')=>{
 const t=String(question||'').toLowerCase(),p=String(previous||'').toLowerCase();
 return /(?:qual[ei] token|qual[ei] monet|migliori token|seleziona.*token|trova.*(?:opportunit|rialzo|candidat)|(?:quali|cosa) (?:acquist|compra|convien)|potenzial[ie].*(?:salit|rialz)|(?:candidate|candidati).*acquist|token (?:più|piu) (?:forti|interessanti)|segnali di ingresso|scanner.*(?:opportunit|classific)|classifica.*rialz|analizza.*(?:in salita|in crescita))/i.test(t)
 || (/^(?:quale quindi|quali quindi|quale|quali|quale moneta|quale token)\??$/i.test(t.trim())&&/(?:compra|acquist|candidat|rialz|salita|opportunit|token|monet|consigl)/.test(p));
};
function build(catalog,opts={}){
 const items=Array.isArray(catalog)?catalog:[];
 const normalized=items.filter(x=>x&&typeof x==='object'&&String(x.id||'').length>0).map(x=>{
  const price=n(x.price??x.current_price),change24=n(x.change24??x.price_change_percentage_24h),volume24=n(x.volume24??x.total_volume),marketCap=n(x.marketCap??x.market_cap);
  const turnover=volume24!==null&&marketCap>0?volume24/marketCap:null;
  return {id:String(x.id).slice(0,100),name:String(x.name||'').slice(0,90),symbol:String(x.symbol||'').slice(0,22),sector:getSector(x),rank:n(x.rank),price,change24,volume24,marketCap,turnover};
 });
 const eligible=normalized.filter(x=>x.change24!==null&&x.change24>0&&x.volume24!==null&&x.volume24>=100000&&x.marketCap!==null&&x.marketCap>=1000000&&!['Stablecoin','RWA'].includes(x.sector));
 // The score is explicitly only an ordering of current momentum+turnover, not a profitability estimate.
 const rank=x=>Math.min(x.change24,25)*1.7+Math.min(x.turnover??0,1)*23+Math.log10(Math.max(x.volume24,1))*1.2;
 const top=eligible.sort((a,b)=>rank(b)-rank(a)).slice(0,10);
 const topDown=normalized.filter(x=>x.change24!==null&&x.change24<0&&x.volume24>100000).sort((a,b)=>a.change24-b.change24).slice(0,3);
 return{source:'CoinGecko · catalogo caricato nel browser',sample:normalized.length,asOf:new Date().toISOString(),criteria:'variazione 24h positiva, volume >= 100000 USD, market cap >= 1 milione USD; ordine per momentum e attività relativa. Dati globali CoinGecko, non automaticamente liquidità BNB Chain.',scope:'Solo i token attualmente caricati nella piattaforma; nessun rilevamento completo di tutti i contratti BSC.',candidates:top,weaknesses:topDown,warning:'Questa classifica non è una probabilità di profitto né una raccomandazione personale. Verificare prezzo live, spread, liquidità negoziabile, sicurezza del contratto, volumi recenti e direzione nelle diverse finestre temporali prima di valutare un ingresso.'};
}
return {build,isRequest,version:'1.0'};
});
