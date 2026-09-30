module.exports = async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const key=process.env.COINGECKO_API_KEY||'';
  const type=String(req.query?.type||'bsc');
  const headers={Accept:'application/json','User-Agent':'Kiber-BNB-Intelligence/22.1'};
  if(key) headers['x-cg-demo-api-key']=key;
  const get=async url=>{
    const r=await fetch(url,{headers});
    let d=null; try{d=await r.json()}catch{}
    if(!r.ok){const e=new Error(d?.status?.error_message||d?.error||`CoinGecko ${r.status}`);e.status=r.status;throw e}
    return d;
  };
  const n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
  const row=x=>({
    id:x.id,symbol:String(x.symbol||'').toUpperCase(),name:x.name||'',image:x.image||'',rank:x.market_cap_rank??null,
    marketCap:n(x.market_cap),fdv:n(x.fully_diluted_valuation),price:n(x.current_price),
    change1h:n(x.price_change_percentage_1h_in_currency),change24:n(x.price_change_percentage_24h_in_currency??x.price_change_percentage_24h),
    change7d:n(x.price_change_percentage_7d_in_currency),change30d:n(x.price_change_percentage_30d_in_currency),
    marketCapChange24:n(x.market_cap_change_percentage_24h),volume24:n(x.total_volume),high24:n(x.high_24h),low24:n(x.low_24h),
    circulatingSupply:n(x.circulating_supply),totalSupply:n(x.total_supply),maxSupply:n(x.max_supply),
    ath:n(x.ath),athChange:n(x.ath_change_percentage),athDate:x.ath_date||null,
    atl:n(x.atl),atlChange:n(x.atl_change_percentage),atlDate:x.atl_date||null,lastUpdated:x.last_updated||null,
    address:'',onBsc:false,representation:'BNB Chain Ecosystem'
  });
  const markets=async params=>get('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&sparkline=false&price_change_percentage=1h%2C24h%2C7d%2C30d&'+params);
  try{
    if(type==='health') return res.status(200).json({ok:true,service:'Kiber CoinGecko Proxy',authenticated:!!key});
    if(type==='bsc'){
      const page=Math.max(1,Math.min(5,Number(req.query?.page||1)||1));
      const per=Math.max(25,Math.min(250,Number(req.query?.per_page||250)||250));
      const d=await markets(`category=binance-smart-chain&order=market_cap_desc&per_page=${per}&page=${page}`);
      return res.status(200).json({items:Array.isArray(d)?d.map(row):[],source:key?'CoinGecko Demo API':'CoinGecko public API',scope:'BNB Chain Ecosystem',page,perPage:per,authenticated:!!key,updatedAt:new Date().toISOString()});
    }
    if(type==='find'){
      const q=String(req.query?.q||'').trim(); if(!q)return res.status(200).json({items:[]});
      const s=await get('https://api.coingecko.com/api/v3/search?query='+encodeURIComponent(q));
      const coins=(s?.coins||[]).slice(0,15); if(!coins.length)return res.status(200).json({items:[]});
      const ids=coins.map(x=>x.id).join(','); const md=await markets('ids='+encodeURIComponent(ids));
      return res.status(200).json({items:Array.isArray(md)?md.map(row):[],source:'CoinGecko'});
    }
    if(type==='resolve') return res.status(200).json({id:String(req.query?.id||''),address:'',representation:'BNB Chain Ecosystem',source:'CoinGecko'});
    return res.status(404).json({error:'Unknown type'});
  }catch(e){
    const status=Number(e.status)||502;
    return res.status(status===401||status===429?503:502).json({error:String(e.message||e),needsKey:!key,upstreamStatus:status,source:'CoinGecko'});
  }
};