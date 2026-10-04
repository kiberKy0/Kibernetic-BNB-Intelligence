const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
const median=a=>{const x=a.filter(Number.isFinite).sort((p,q)=>p-q);if(!x.length)return null;const m=Math.floor(x.length/2);return x.length%2?x[m]:(x[m-1]+x[m])/2};
const quantile=(a,q)=>{const x=a.filter(Number.isFinite).sort((p,q)=>p-q);if(!x.length)return null;const p=(x.length-1)*q,b=Math.floor(p),r=p-b;return x[b+1]!==undefined?x[b]+r*(x[b+1]-x[b]):x[b]};
const ema=(a,p)=>{if(!a.length)return[];const k=2/(p+1),out=[a[0]];for(let i=1;i<a.length;i++)out.push(a[i]*k+out[i-1]*(1-k));return out};
function rsi(a,p=14){if(a.length<=p)return null;let g=0,l=0;for(let i=a.length-p;i<a.length;i++){const d=a[i]-a[i-1];if(d>=0)g+=d;else l-=d}if(l===0)return 100;const rs=(g/p)/(l/p);return 100-(100/(1+rs))}
function safeRatio(a,b){return Number.isFinite(a)&&Number.isFinite(b)&&b!==0?a/b:null}
function ageHours(ms){return Number.isFinite(ms)?Math.max(0,(Date.now()-ms)/36e5):null}
async function get(url,headers={}){const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Kiber-BNB-Chain/26.0',...headers}});let d=null;try{d=await r.json()}catch{}if(!r.ok)throw new Error(`${r.status} ${url}`);return d}

function technical(candles){
  const sorted=[...candles].sort((a,b)=>a[0]-b[0]);
  const close=sorted.map(x=>n(x[4])).filter(x=>x!==null),high=sorted.map(x=>n(x[2])).filter(x=>x!==null),low=sorted.map(x=>n(x[3])).filter(x=>x!==null),vol=sorted.map(x=>n(x[5])||0);
  if(close.length<4)return {candles:sorted,ema20:null,ema50:null,rsi14:null,volatility:null,support:null,resistance:null,supportMajor:null,resistanceMajor:null,volumeTrend:null,momentum:null};
  const e20=ema(close,20),e50=ema(close,50),rets=close.slice(1).map((x,i)=>Math.log(x/close[i])).filter(Number.isFinite);
  const mean=rets.reduce((a,b)=>a+b,0)/(rets.length||1),sd=Math.sqrt(rets.reduce((a,b)=>a+(b-mean)**2,0)/(rets.length||1))*100;
  const tail=Math.min(32,close.length),recentVol=vol.slice(-tail),oldVol=vol.slice(-tail*2,-tail),rv=recentVol.reduce((a,b)=>a+b,0)/(recentVol.length||1),ov=oldVol.length?oldVol.reduce((a,b)=>a+b,0)/oldVol.length:null;
  const recentHigh=high.slice(-Math.min(32,high.length)),recentLow=low.slice(-Math.min(32,low.length));
  return {
    candles:sorted.slice(-180),ema20:e20.at(-1)??null,ema50:e50.at(-1)??null,rsi14:rsi(close),volatility:sd,
    support:quantile(recentLow,.18),resistance:quantile(recentHigh,.82),supportMajor:Math.min(...low),resistanceMajor:Math.max(...high),
    volumeTrend:ov&&ov>0?(rv/ov-1)*100:null,momentum:(close.at(-1)/close[0]-1)*100,
    lastClose:close.at(-1),lastVolume:vol.at(-1)??null
  };
}

function marketScore(best,tech,pairs){
  const liq=n(best?.liquidity?.usd),vol24=n(best?.volume?.h24),chg24=n(best?.priceChange?.h24),chg6=n(best?.priceChange?.h6),buys=n(best?.txns?.h24?.buys)||0,sells=n(best?.txns?.h24?.sells)||0,age=ageHours(n(best?.pairCreatedAt)),mc=n(best?.marketCap??best?.fdv),price=n(best?.priceUsd);
  let score=0;const drivers=[],warnings=[];
  if(price!==null&&tech.ema20!==null){if(price>tech.ema20){score+=12;drivers.push('prezzo sopra EMA20')}else{score-=12;warnings.push('prezzo sotto EMA20')}}
  if(tech.ema20!==null&&tech.ema50!==null){if(tech.ema20>tech.ema50){score+=14;drivers.push('EMA20 sopra EMA50')}else{score-=14;warnings.push('EMA20 sotto EMA50')}}
  if(tech.rsi14!==null){if(tech.rsi14>=52&&tech.rsi14<=70){score+=10;drivers.push('RSI costruttivo')}else if(tech.rsi14<42){score-=10;warnings.push('RSI debole')}else if(tech.rsi14>76){score-=4;warnings.push('RSI molto tirato')}}
  if(chg24!==null){if(chg24>5){score+=9;drivers.push('momentum 24h positivo')}else if(chg24<-5){score-=9;warnings.push('momentum 24h negativo')}}
  if(chg6!==null){if(chg6>2)score+=6;else if(chg6<-2)score-=6}
  if(buys+sells>20){const imb=(buys-sells)/(buys+sells);if(imb>.12){score+=10;drivers.push('buy flow prevalente')}else if(imb<-.12){score-=10;warnings.push('sell flow prevalente')}}
  if(tech.volumeTrend!==null){if(tech.volumeTrend>20){score+=8;drivers.push('volume in accelerazione')}else if(tech.volumeTrend<-25){score-=6;warnings.push('volume in contrazione')}}
  if(liq!==null){if(liq>=250000){score+=9;drivers.push('liquidità robusta per DEX')}else if(liq<30000){score-=18;warnings.push('liquidità bassa')}}
  const turnover=safeRatio(vol24,liq);if(turnover!==null){if(turnover>=.25&&turnover<=4)score+=5;else if(turnover>8){score-=6;warnings.push('turnover estremo rispetto alla liquidità')}}
  if(age!==null&&age<6){score-=12;warnings.push('pool molto recente')}else if(age!==null&&age>168)score+=4;
  const totalLiq=(pairs||[]).reduce((a,p)=>a+(n(p?.liquidity?.usd)||0),0),share=liq&&totalLiq?liq/totalLiq:null;if(share!==null&&share>.92&&pairs.length>1){score-=4;warnings.push('liquidità molto concentrata nel pool dominante')}
  score=Math.max(-100,Math.min(100,Math.round(score)));
  const direction=score>=25?'Rialzista':score<=-25?'Ribassista':'Neutrale / misto';
  const strength=Math.abs(score)>=55?'Forte':Math.abs(score)>=30?'Moderata':'Debole';
  return {score,direction,strength,drivers:drivers.slice(0,6),warnings:warnings.slice(0,6),metrics:{liquidityUsd:liq,volume24h:vol24,turnover,change24h:chg24,change6h:chg6,buys24h:buys,sells24h:sells,ageHours:age,marketCap:mc,poolLiquidityShare:share}};
}

function qualityScore(best,pairs){
  const liq=n(best?.liquidity?.usd),vol=n(best?.volume?.h24),mc=n(best?.marketCap??best?.fdv),age=ageHours(n(best?.pairCreatedAt)),info=best?.info||{},web=(info.websites||[]).length,social=(info.socials||[]).length,buys=n(best?.txns?.h24?.buys)||0,sells=n(best?.txns?.h24?.sells)||0;
  let s=20;const positives=[],risks=[];
  if(liq>=500000){s+=22;positives.push('liquidità > $500k')}else if(liq>=100000){s+=15;positives.push('liquidità > $100k')}else if(liq<30000){s-=15;risks.push('liquidità fragile')}
  const lm=safeRatio(liq,mc);if(lm!==null&&lm>=.05){s+=14;positives.push('liquidità significativa rispetto alla valutazione')}else if(lm!==null&&lm<.01){s-=10;risks.push('liquidità molto piccola rispetto alla valutazione')}
  if(age!==null&&age>=24*30){s+=12;positives.push('pool con storico > 30 giorni')}else if(age!==null&&age>=24*7){s+=7}else if(age!==null&&age<6){s-=12;risks.push('pool appena creato')}
  if(web){s+=8;positives.push('sito dichiarato nel feed DEX')}else risks.push('sito non disponibile nel feed');if(social){s+=6;positives.push('canali social dichiarati')}
  if((pairs||[]).length>=3)s+=6;
  if(vol&&liq&&vol/liq>=.1)s+=5;
  if(buys+sells>=100){const bal=Math.min(buys,sells)/Math.max(1,Math.max(buys,sells));if(bal>.35)s+=5;else risks.push('flusso buy/sell sbilanciato')}
  s=clamp(Math.round(s));
  const label=s>=75?'Dati strutturali solidi':s>=55?'Da approfondire':s>=35?'Speculativo':'Dati insufficienti / fragile';
  return {score:s,label,positives:positives.slice(0,6),risks:risks.slice(0,6),note:'Lo score misura qualità dei dati e struttura di mercato osservabile, non affidabilità del team né rendimento futuro.'};
}

async function holderIntel(address){
  const key=String(process.env.ETHERSCAN_API_KEY||'').trim();if(!key)return {available:false,reason:'ETHERSCAN_API_KEY non configurata'};
  try{
    const base='https://api.etherscan.io/v2/api?chainid=56&module=token';
    const [h,s]=await Promise.all([get(`${base}&action=tokenholderlist&contractaddress=${address}&page=1&offset=20&apikey=${key}`),get(`${base}&action=tokensupply&contractaddress=${address}&apikey=${key}`)]);
    if(String(h.status)!=='1'||!Array.isArray(h.result)||String(s.status)!=='1')return {available:false,reason:'Piano/API holder non disponibile'};
    const supply=Number(s.result),holders=h.result.map(x=>({address:x.TokenHolderAddress||x.address||'',quantity:Number(x.TokenHolderQuantity||x.quantity||0)})).filter(x=>x.address&&Number.isFinite(x.quantity));
    const top20=supply>0?holders.reduce((a,x)=>a+x.quantity,0)/supply*100:null,top5=supply>0?holders.slice(0,5).reduce((a,x)=>a+x.quantity,0)/supply*100:null;
    return {available:true,top5Pct:top5,top20Pct:top20,holders:holders.slice(0,20).map(x=>({address:x.address,sharePct:supply>0?x.quantity/supply*100:null})),source:'Etherscan API V2 · BNB Chain'};
  }catch{return {available:false,reason:'Holder feed temporaneamente non disponibile'}}
}

module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Cache-Control','s-maxage=45, stale-while-revalidate=180');
  const address=String(req.query?.address||'').trim();const period=String(req.query?.period||'7d').toLowerCase();
  if(!/^0x[a-fA-F0-9]{40}$/.test(address))return res.status(400).json({error:'Invalid BNB Chain token address'});
  const cfg={"24h":['minute',15,96],"7d":['hour',1,168],"30d":['hour',4,180]}[period]||['hour',1,168];
  try{
    const pairs=await get(`https://api.dexscreener.com/token-pairs/v1/bsc/${address}`);
    const bscPairs=(Array.isArray(pairs)?pairs:[]).filter(p=>p.chainId==='bsc').sort((a,b)=>(n(b?.liquidity?.usd)||0)-(n(a?.liquidity?.usd)||0));
    if(!bscPairs.length)return res.status(404).json({error:'No BNB Chain pools found'});
    const best=bscPairs[0],pool=best.pairAddress;
    const [ohlcvR,holdersR]=await Promise.allSettled([
      get(`https://api.geckoterminal.com/api/v2/networks/bsc/pools/${pool}/ohlcv/${cfg[0]}?aggregate=${cfg[1]}&limit=${cfg[2]}&currency=usd`,{'Accept':'application/json;version=20230203'}),
      holderIntel(address)
    ]);
    const candles=ohlcvR.status==='fulfilled'?(ohlcvR.value?.data?.attributes?.ohlcv_list||[]):[];
    const tech=technical(candles),outlook=marketScore(best,tech,bscPairs),quality=qualityScore(best,bscPairs);
    const price=n(best.priceUsd),support=tech.support,resistance=tech.resistance;
    const triggers={
      bullish:resistance!==null?`Conferma sopra ${resistance}`:'Serve rottura della resistenza locale con volume',
      bearish:support!==null?`Debolezza sotto ${support}`:'Serve perdita del supporto locale con volume',
      invalidation:outlook.direction==='Rialzista'?(support!==null?`Scenario rialzista indebolito sotto ${support}`:'perdita supporto'):outlook.direction==='Ribassista'?(resistance!==null?`Scenario ribassista indebolito sopra ${resistance}`:'recupero resistenza'):'Attendere convergenza tra trend, volume e flussi'
    };
    return res.status(200).json({
      version:'26.0',updatedAt:new Date().toISOString(),period,
      token:{address,name:best.baseToken?.name||'',symbol:best.baseToken?.symbol||'',priceUsd:price,marketCap:n(best.marketCap),fdv:n(best.fdv),liquidityUsd:n(best.liquidity?.usd),volume24h:n(best.volume?.h24),change24h:n(best.priceChange?.h24),change6h:n(best.priceChange?.h6),change1h:n(best.priceChange?.h1),buys24h:n(best.txns?.h24?.buys),sells24h:n(best.txns?.h24?.sells),pairCreatedAt:best.pairCreatedAt||null,pairAddress:pool,dexId:best.dexId||'',pairCount:bscPairs.length,websites:(best.info?.websites||[]).slice(0,5),socials:(best.info?.socials||[]).slice(0,5),imageUrl:best.info?.imageUrl||null,boosts:n(best.boosts?.active)},
      technical:{ema20:tech.ema20,ema50:tech.ema50,rsi14:tech.rsi14,volatility:tech.volatility,volumeTrend:tech.volumeTrend,momentum:tech.momentum,support:tech.support,resistance:tech.resistance,supportMajor:tech.supportMajor,resistanceMajor:tech.resistanceMajor,candles:tech.candles},
      outlook:{...outlook,horizon:'24-72h',triggers,note:'Stima di scenario basata su dati tecnici e on-chain osservabili. Non è una probabilità certa né un segnale automatico di acquisto/vendita.'},
      projectQuality:quality,
      holders:holdersR.status==='fulfilled'?holdersR.value:{available:false,reason:'Holder feed non disponibile'},
      sources:['DEX Screener','GeckoTerminal',...(holdersR.status==='fulfilled'&&holdersR.value?.available?['Etherscan API V2']:[])],
      sourceUrls:{dexscreener:best.url||null,geckoterminal:`https://www.geckoterminal.com/bsc/pools/${pool}`}
    });
  }catch(e){return res.status(502).json({error:'Token Intelligence V26 temporarily unavailable',version:'26.0'})}
};
