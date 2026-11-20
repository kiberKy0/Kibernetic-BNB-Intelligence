/* Kibernetic: compact DEX strategy study. Does not trade, sign, or fetch account data. */
(()=>{
'use strict';
const E=window.KiberBnbSpeculativeStrategy;
if(!E?.analyze)return;
const $=id=>document.getElementById(id);
const s=document.createElement('style');
s.id='kiberSpeculativeStyles';
s.textContent=[
'#kiberBnbSpecHome,#kiberBnbSpecToken{border:1px solid #4e91cb;border-radius:14px;background:linear-gradient(135deg,#102955,#101c48);color:#eaf7ff;margin:11px 0;padding:0 12px}',
'#kiberBnbSpecHome>summary,#kiberBnbSpecToken>summary{cursor:pointer;font-size:13px;font-weight:850;min-height:43px;padding:12px 2px;color:#def7ff}',
'#kiberBnbSpecHome .ks-body,#kiberBnbSpecToken .ks-body{border-top:1px solid #39618b;padding:11px 2px 13px;font-size:12px;line-height:1.55;color:#c5dff2}',
'#kiberBnbSpecHome ol,#kiberBnbSpecToken ol{margin:6px 0 10px;padding-left:20px}',
'#kiberBnbSpecHome li,#kiberBnbSpecToken li{margin:6px 0}',
'#kiberBnbSpecHome p,#kiberBnbSpecToken p{margin:8px 0}',
'#kiberBnbSpecHome a,#kiberBnbSpecToken a{color:#88efff;text-decoration:underline}',
'#kiberSpecState{padding:10px;border:1px solid #417db4;border-radius:9px;background:#152f60;color:#e7f7ff;overflow-wrap:anywhere}',
'@media(max-width:400px){#kiberBnbSpecHome,#kiberBnbSpecToken{padding:0 9px}}'
].join('');
document.head.appendChild(s);
const rules=[
'Identifica token, contratto e pool BNB Chain. Liquidità minima per lo studio: $100.000. Verifica restrizioni del contratto.',
'Usa almeno 60 candele OHLC DEX reali della stessa pool, già chiuse, con volume e orari regolari.',
'Filtro di tendenza: EMA20 sopra EMA50 e chiusura sopra EMA20. Cerca rottura del massimo delle precedenti 20 candele.',
'Volume sulla candela di rottura ≥ 1,5× della media delle 20 precedenti. Attendi entro quattro candele un retest e una chiusura sopra la resistenza.',
'Studio della gestione del rischio: massimo teorico 0,5% del capitale per idea, stop con buffer ATR14, obiettivo di studio 2R. Verifica sempre prezzi eseguibili, gas, slippage e price impact.',
'Se mancano dati recenti, volume, liquidità, quotazione eseguibile e controlli sul token, resta in ATTESA. Nessun ordine automatico.'
];
const node=(tag,text,cls='')=>{const n=document.createElement(tag);n.textContent=text||'';if(cls)n.className=cls;return n};
function body(){
 const d=node('div','','ks-body');
 d.append(node('p','Metodo conosciuto: breakout Donchian a 20 barre con retest, filtro EMA20/EMA50 e volume. Versione didattica per coppie DEX BNB.'));
 const list=document.createElement('ol');
 for(const x of rules)list.append(node('li',x));
 d.append(list);
 d.append(node('p','Backtest con costi reali e valutazione fuori campione ancora da effettuare: nessun rendimento dimostrato. L’interfaccia non esegue swap.'));
 const ps=node('p','Approfondimenti: ');
 const links=[
  ['Binance Academy · Swing trading','https://www.binance.com/en/academy/articles/a-beginners-guide-to-swing-trading-cryptocurrency'],
  ['Binance Academy · Medie mobili','https://www.binance.com/en/academy/articles/trading-strategies-with-moving-averages'],
  ['PancakeSwap · Commissioni e routing','https://docs.pancakeswap.finance/trade/pancakeswap-exchange/fees-and-routes']
 ];
 links.forEach(([name,url],i)=>{if(i)ps.append(document.createTextNode(' · '));const a=node('a',name);a.href=url;a.target='_blank';a.rel='noopener noreferrer';ps.append(a)});
 d.append(ps);return d;
}
function mountHome(){
 const root=$('kiberCompactDashboard'),ref=root?.querySelector('.kcd-external-source');
 if(!root||!ref)return false;
 if($('kiberBnbSpecHome'))return true;
 const details=node('details');details.id='kiberBnbSpecHome';
 details.setAttribute('aria-label','Strategia speculativa BNB di sola lettura');
 details.append(node('summary','Strategia BNB · Breakout + retest · Studio'),body());
 ref.insertAdjacentElement('afterend',details);return true;
}
function mountToken(){
 const root=document.querySelector('#v271TokenView .v271-main');
 if(!root)return false;
 if($('kiberBnbSpecToken'))return true;
 const details=node('details');details.id='kiberBnbSpecToken';
 details.setAttribute('aria-label','Studio su OHLC reali per il token selezionato');
 const info=body(),state=node('div','ATTESA: carica un token con candele DEX reali.');state.id='kiberSpecState';
 state.setAttribute('role','status');info.prepend(state);
 details.append(node('summary','Strategia speculativa · Donchian 20 + EMA · sola lettura'),info);
 const after=$('kiberBnbTradingPipeline');
 if(after?.parentNode===root)after.insertAdjacentElement('afterend',details);
 else root.append(details);
 details.addEventListener('toggle',()=>{if(details.open)render()});
 return true;
}
function render(){
 const view=$('v271TokenView'),box=$('kiberBnbSpecToken'),target=$('kiberSpecState');
 if(!view?.classList.contains('open')||!box?.open||!target)return;
 const ctx=window.kiberTokenContext?.()||{};
 const token=ctx.intel?.token||{},coin=ctx.coin||{};
 const result=E.analyze({sourceKind:ctx.chartKind,chainId:56,
  tokenAddress:token.address||coin.address||'',
  historicalPoolAddress:ctx.studyPoolAddress,
  quotedPoolAddress:ctx.studyPricePoolAddress,
  liquidityUsd:ctx.studyPoolLiquidityUsd,
  candles:ctx.studyCandles});
 const status={NON_VALUTATA:'NON VALUTATA',DATI_INSUFFICIENTI:'DATI INSUFFICIENTI',
  DATI_OBSOLETI:'DATI OBSOLETI',ATTESA:'ATTESA',CANDIDATO_DIDATTICO:'CANDIDATO DIDATTICO'}[result.status]||'ATTESA';
 const fmt=x=>Number.isFinite(x)?x.toLocaleString('it-IT',{maximumSignificantDigits:6}):'—';
 let message=status+' · '+result.reason;
 if(result.poolAddress)message+=' Pool '+result.poolAddress.slice(0,12)+'…';
 if(result.status==='CANDIDATO_DIDATTICO'){
  message+=' Esempio teorico: chiusura '+fmt(result.illustrativeEntry)+', stop '+fmt(result.illustrativeStop)+', 2R '+fmt(result.illustrativeTarget2R)+'.';
  message+=' NON È UN ORDINE: la quotazione eseguibile e i costi non sono verificati.';
 }
 target.dataset.status=result.status;target.textContent=message;
}
function boot(){
 const attach=()=>{const home=mountHome(),token=mountToken();return home&&token};
 if(attach())return;
 const observer=new MutationObserver(()=>{if(attach())observer.disconnect()});
 observer.observe(document.body,{childList:true,subtree:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
setInterval(()=>{mountHome();mountToken();render()},15000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
})();
