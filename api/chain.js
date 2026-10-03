module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=180');
  const key=process.env.COINGECKO_API_KEY||'';
  const cgHeaders={Accept:'application/json','User-Agent':'Kiber-BNB-Intelligence/23.5'};
  if(key)cgHeaders['x-cg-demo-api-key']=key;
  const get=async(url,headers={Accept:'application/json'})=>{
    const r=await fetch(url,{headers});
    let d=null;try{d=await r.json()}catch{}
    if(!r.ok)throw new Error(`${r.status} ${url}`);
    return d;
  };
  const val=x=>x===null||x===undefined||x===''?null:(Number.isFinite(Number(x))?Number(x):null);
  try{
    const [bnbR,chainsR,stableR,dexR]=await Promise.allSettled([
      get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=binancecoin&sparkline=false&price_change_percentage=24h',cgHeaders),
      get('https://api.llama.fi/v2/chains'),
      get('https://stablecoins.llama.fi/stablecoinchains'),
      get('https://api.llama.fi/overview/dexs/BSC?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true')
    ]);
    const bnb=Array.isArray(bnbR.value)?bnbR.value[0]:null;
    const chains=Array.isArray(chainsR.value)?chainsR.value:[];
    const chain=chains.find(x=>String(x.name||'').toLowerCase()==='bsc')||chains.find(x=>/binance smart chain|bnb smart chain/i.test(String(x.name||'')))||null;
    const stables=Array.isArray(stableR.value)?stableR.value:[];
    const stable=stables.find(x=>String(x.name||'').toLowerCase()==='bsc')||stables.find(x=>/binance smart chain|bnb smart chain/i.test(String(x.name||'')))||null;
    const stableUsd=val(stable?.totalCirculatingUSD?.peggedUSD??stable?.totalCirculatingUSD??stable?.totalCirculating?.peggedUSD);
    const dex=dexR.status==='fulfilled'&&dexR.value&&typeof dexR.value==='object'?dexR.value:{};
    const marketCap=val(bnb?.market_cap),tvl=val(chain?.tvl),dex24=val(dex?.total24h),dex7=val(dex?.total7d);
    const ratio=(a,b)=>a!==null&&b!==null&&b!==0?a/b*100:null;
    const payload={
      ok:!!(bnb||chain||stable),source:'CoinGecko + DefiLlama',updatedAt:new Date().toISOString(),
      bnb:{price:val(bnb?.current_price),change24:val(bnb?.price_change_percentage_24h),marketCap,fdv:val(bnb?.fully_diluted_valuation),volume24:val(bnb?.total_volume),high24:val(bnb?.high_24h),low24:val(bnb?.low_24h)},
      chain:{name:'BNB Smart Chain',tvl,stablecoins:stableUsd,dexVolume24:dex24,dexVolume7d:dex7,dexChange1d:val(dex?.change_1d),dexChange7d:val(dex?.change_7d),tvlToBnbMarketCapPct:ratio(tvl,marketCap),stablecoinsToTvlPct:ratio(stableUsd,tvl),dexVolumeToTvlPct:ratio(dex24,tvl)},
      availability:{bnb:bnbR.status==='fulfilled',tvl:chainsR.status==='fulfilled',stablecoins:stableR.status==='fulfilled',dex:dexR.status==='fulfilled'}
    };
    return res.status(200).json(payload);
  }catch(e){
    return res.status(502).json({error:'BNB chain aggregate unavailable',updatedAt:new Date().toISOString()});
  }
};
