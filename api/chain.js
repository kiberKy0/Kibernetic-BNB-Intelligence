module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Cache-Control','s-maxage=90, stale-while-revalidate=300');
  const key=process.env.COINGECKO_API_KEY||'';
  const cgHeaders={Accept:'application/json','User-Agent':'Kiber-BNB-Chain/26.0'};
  if(key)cgHeaders['x-cg-demo-api-key']=key;
  const get=async(url,headers={Accept:'application/json'})=>{
    const r=await fetch(url,{headers,signal:AbortSignal.timeout(8000)});
    let d=null;try{d=await r.json()}catch{}
    if(!r.ok)throw new Error(`${r.status} ${url}`);
    return d;
  };
  const val=x=>x===null||x===undefined||x===''?null:(Number.isFinite(Number(x))?Number(x):null);
  const ratio=(a,b)=>a!==null&&b!==null&&b!==0?a/b*100:null;
  const toMs=x=>{x=val(x);if(x===null)return null;return x>1e12?x:x*1000};
  const normalizeSeries=(rows,timeIndex=0,valueIndex=1)=>Array.isArray(rows)?rows.map(x=>({t:toMs(Array.isArray(x)?x[timeIndex]:x?.date),v:val(Array.isArray(x)?x[valueIndex]:x?.tvl)})).filter(x=>x.t&&x.v!==null):[];
  const pctChange=(series,days)=>{
    if(!Array.isArray(series)||series.length<2)return null;
    const last=series.at(-1),cut=last.t-days*86400000;
    let first=null;for(const p of series){if(p.t<=cut)first=p;else break}
    return first?.v&&last?.v!==null?((last.v/first.v)-1)*100:null;
  };
  try{
    const [bnbR,chainsR,stableR,dexR,bnbHistR,tvlHistR,tickerR,spotHistoryR]=await Promise.allSettled([
      get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=binancecoin&sparkline=false&price_change_percentage=24h',cgHeaders),
      get('https://api.llama.fi/v2/chains'),
      get('https://stablecoins.llama.fi/stablecoinchains'),
      get('https://api.llama.fi/overview/dexs/BSC?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true'),
      get('https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=1095&interval=daily',cgHeaders),
      get('https://api.llama.fi/v2/historicalChainTvl/BSC'),
      get('https://data-api.binance.vision/api/v3/ticker/24hr?symbol=BNBUSDT'),
      get('https://data-api.binance.vision/api/v3/klines?symbol=BNBUSDT&interval=1d&limit=1000')
    ]);
    const bnb=Array.isArray(bnbR.value)?bnbR.value[0]:null;
    const chains=Array.isArray(chainsR.value)?chainsR.value:[];
    const chain=chains.find(x=>String(x.name||'').toLowerCase()==='bsc')||chains.find(x=>/binance smart chain|bnb smart chain/i.test(String(x.name||'')))||null;
    const stables=Array.isArray(stableR.value)?stableR.value:[];
    const stable=stables.find(x=>String(x.name||'').toLowerCase()==='bsc')||stables.find(x=>/binance smart chain|bnb smart chain/i.test(String(x.name||'')))||null;
    const stableUsd=val(stable?.totalCirculatingUSD?.peggedUSD??stable?.totalCirculatingUSD??stable?.totalCirculating?.peggedUSD);
    const dex=dexR.status==='fulfilled'&&dexR.value&&typeof dexR.value==='object'?dexR.value:{};
    const spot=tickerR.status==='fulfilled'?tickerR.value:null;
    const spotPrice=val(spot?.lastPrice),useSpot=spotPrice!==null&&spotPrice>0;
    const spotHistory=spotHistoryR.status==='fulfilled'&&Array.isArray(spotHistoryR.value)?spotHistoryR.value.map(k=>({t:val(k?.[0]),v:val(k?.[4])})).filter(x=>x.t!==null&&x.v!==null&&x.v>0).sort((a,b)=>a.t-b.t):[];
    const marketCap=val(bnb?.market_cap),tvl=val(chain?.tvl),dex24=val(dex?.total24h),dex7=val(dex?.total7d);
    const cgHistory=bnbHistR.status==='fulfilled'?normalizeSeries(bnbHistR.value?.prices||[],0,1).slice(-1100):[];
    const bnbHistory=spotHistory.length>2?spotHistory:cgHistory;
    const price=useSpot?spotPrice:val(bnb?.current_price);
    const priceSource=useSpot?'Binance Spot BNB/USDT':price!==null?'CoinGecko BNB/USD':null;
    const historySource=spotHistory.length>2?'Binance Spot BNB/USDT':cgHistory.length>2?'CoinGecko BNB/USD':null;
    const tvlHistory=tvlHistR.status==='fulfilled'?normalizeSeries(tvlHistR.value||[],0,1).slice(-1100):[];
    const payload={
      ok:price!==null||!!(chain||stable),source:[priceSource,'DefiLlama'].filter(Boolean).join(' + '),updatedAt:new Date().toISOString(),
      bnb:{price,change24:useSpot?val(spot?.priceChangePercent):val(bnb?.price_change_percentage_24h),marketCap,fdv:val(bnb?.fully_diluted_valuation),volume24:useSpot?val(spot?.quoteVolume):val(bnb?.total_volume),high24:useSpot?val(spot?.highPrice):val(bnb?.high_24h),low24:useSpot?val(spot?.lowPrice):val(bnb?.low_24h),source:priceSource,historySource,quote:useSpot?'USDT':'USD',volumeScope:useSpot?'BNBUSDT spot pair':'aggregate market',updatedAt:useSpot&&val(spot?.closeTime)!==null?new Date(Number(spot.closeTime)).toISOString():bnb?.last_updated||null},
      chain:{name:'BNB Smart Chain',tvl,stablecoins:stableUsd,dexVolume24:dex24,dexVolume7d:dex7,dexChange1d:val(dex?.change_1d),dexChange7d:val(dex?.change_7d),tvlChange7d:pctChange(tvlHistory,7),tvlChange30d:pctChange(tvlHistory,30),tvlToBnbMarketCapPct:ratio(tvl,marketCap),stablecoinsToTvlPct:ratio(stableUsd,tvl),dexVolumeToTvlPct:ratio(dex24,tvl)},
      history:{bnb:bnbHistory,chainTvl:tvlHistory},
      availability:{bnb:price!==null,tvl:chainsR.status==='fulfilled',stablecoins:stableR.status==='fulfilled',dex:dexR.status==='fulfilled',bnbHistory:bnbHistory.length>2,chainHistory:tvlHistR.status==='fulfilled'&&tvlHistory.length>2}
    };
    return res.status(200).json(payload);
  }catch(e){
    return res.status(502).json({error:'BNB chain aggregate unavailable',updatedAt:new Date().toISOString()});
  }
};
