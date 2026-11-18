'use strict';
// Public read-only PancakeSwap market snapshot. No wallet or private credentials.
const ADDRESS=/^0x[0-9a-fA-F]{40}$/;
const num=x=>x===null||x===undefined||x===''?null:(Number.isFinite(Number(x))?Number(x):null);
function selectPair(rows,address){
  if(!ADDRESS.test(String(address)))return null;
  const token=address.toLowerCase();
  const candidates=(Array.isArray(rows)?rows:[]).filter(p=>
    p?.chainId==='bsc' &&
    String(p.dexId||'').toLowerCase().includes('pancake') &&
    ADDRESS.test(String(p?.pairAddress||'')) &&
    String(p?.baseToken?.address||'').toLowerCase()===token &&
    num(p?.priceUsd)!==null && num(p.priceUsd)>0 &&
    num(p?.liquidity?.usd)!==null && num(p.liquidity.usd)>0
  ).sort((a,b)=>(num(b?.liquidity?.usd)||0)-(num(a?.liquidity?.usd)||0));
  return candidates[0]||null;
}
async function handler(req,res){
  res.setHeader('Content-Type','application/json; charset=utf-8');
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Solo GET'});
  const address=String(req.query?.address||'').trim();
  if(!ADDRESS.test(address))return res.status(400).json({ok:false,error:'Serve un contratto BNB Chain valido'});
  try {
    const response=await fetch('https://api.dexscreener.com/token-pairs/v1/bsc/'+address,{
      headers:{Accept:'application/json','User-Agent':'Kiber-BNB-Intelligence/29'},
      signal:AbortSignal.timeout(8500)
    });
    if(!response.ok){
      res.setHeader('Cache-Control','no-store');
      return res.status(response.status===429?503:502).json({ok:false,error:response.status===429?'Fornitore temporaneamente limitato':'Fonte di mercato indisponibile'});
    }
    const data=await response.json();
    const pair=selectPair(data,address);
    if(!pair){
      res.setHeader('Cache-Control','public, s-maxage=15');
      return res.status(200).json({ok:false,status:'NO_VERIFIED_PANCAKE_POOL',chainId:56,address,source:'DEX Screener',fetchedAt:new Date().toISOString(),note:'Nessuna pool PancakeSwap con base token e prezzo/liquidità validi; non dedurre un prezzo.'});
    }
    const snapshot={
      ok:true,status:'SNAPSHOT',chainId:56,address,
      source:'DEX Screener / PancakeSwap',
      feedType:'HTTP_POLL',
      websocket:false,
      priceTimestampVerified:false,
      fetchedAt:new Date().toISOString(),
      note:'Orario di acquisizione, NON orario dell’ultimo scambio on-chain.',
      pair:{
        address:pair.pairAddress,dexId:String(pair.dexId||''),url:typeof pair.url==='string'&&pair.url.startsWith('https://dexscreener.com/')?pair.url:null,
        baseSymbol:String(pair.baseToken?.symbol||'').slice(0,25),quoteSymbol:String(pair.quoteToken?.symbol||'').slice(0,25),
        priceUsd:num(pair.priceUsd),priceNative:num(pair.priceNative),
        liquidityUsd:num(pair.liquidity?.usd),volume24Usd:num(pair.volume?.h24),marketCapUsd:num(pair.marketCap),fdvUsd:num(pair.fdv),
        change24Pct:num(pair.priceChange?.h24),
        buys24:num(pair.txns?.h24?.buys),sells24:num(pair.txns?.h24?.sells)
      }
    };
    res.setHeader('Cache-Control','public, s-maxage=15, stale-while-revalidate=15');
    return res.status(200).json(snapshot);
  }catch{
    res.setHeader('Cache-Control','no-store');
    return res.status(503).json({ok:false,status:'SOURCE_UNAVAILABLE',error:'Timeout o errore nella fonte; nessun prezzo inventato'});
  }
}
module.exports=handler;
module.exports.selectPair=selectPair;