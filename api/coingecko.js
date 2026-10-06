module.exports = async function handler(req,res){
  if(req.method!=='GET') return res.status(405).json({error:'Method not allowed'});
  const key=process.env.COINGECKO_API_KEY||'';
  const type=String(req.query?.type||'bsc');
  const headers={Accept:'application/json','User-Agent':'Kiber-BNB-Intelligence/27.1'};
  if(key) headers['x-cg-demo-api-key']=key;
  const get=async (url,h=headers)=>{
    const r=await fetch(url,{headers:h});
    let d=null; try{d=await r.json()}catch{}
    if(!r.ok){const e=new Error(d?.status?.error_message||d?.error||d?.msg||`Upstream ${r.status}`);e.status=r.status;throw e}
    return d;
  };
  const n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
  const validId=id=>/^[a-z0-9][a-z0-9-]{0,119}$/i.test(String(id||''));
  const bscAddress=platforms=>{
    if(!platforms||typeof platforms!=='object')return '';
    const preferred=['binance-smart-chain','bnb-smart-chain','binance-chain'];
    for(const k of preferred){const v=String(platforms[k]||'').trim();if(/^0x[a-fA-F0-9]{40}$/.test(v))return v;}
    for(const [k,v0] of Object.entries(platforms)){
      if(!/(binance|bnb)/i.test(k))continue;
      const v=String(v0||'').trim();if(/^0x[a-fA-F0-9]{40}$/.test(v))return v;
    }
    return '';
  };
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
  const coin=async id=>get(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`);
  try{
    if(type==='health') return res.status(200).json({ok:true,service:'Kiber Market Proxy',coinGeckoAuthenticated:!!key,version:'27.1'});

    if(type==='coin_detail'){
      const id=String(req.query?.id||'').trim();
      if(!validId(id))return res.status(400).json({error:'Invalid CoinGecko id'});
      res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=180');
      const d=await coin(id),m=d?.market_data||{},address=bscAddress(d?.platforms);
      return res.status(200).json({
        ok:true,version:'27.1',source:key?'CoinGecko Demo API':'CoinGecko public API',
        coin:{
          id:d?.id||id,symbol:String(d?.symbol||'').toUpperCase(),name:d?.name||id,image:d?.image?.large||d?.image?.small||'',rank:d?.market_cap_rank??null,
          address,onBsc:!!address,platforms:d?.platforms||{},categories:(d?.categories||[]).filter(Boolean).slice(0,12),
          description:String(d?.description?.en||'').replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim().slice(0,1200),
          homepage:(d?.links?.homepage||[]).find(Boolean)||'',
          price:n(m?.current_price?.usd),marketCap:n(m?.market_cap?.usd),fdv:n(m?.fully_diluted_valuation?.usd),volume24:n(m?.total_volume?.usd),
          high24:n(m?.high_24h?.usd),low24:n(m?.low_24h?.usd),change24:n(m?.price_change_percentage_24h),change7d:n(m?.price_change_percentage_7d),change30d:n(m?.price_change_percentage_30d),
          ath:n(m?.ath?.usd),athChange:n(m?.ath_change_percentage?.usd),atl:n(m?.atl?.usd),atlChange:n(m?.atl_change_percentage?.usd),
          circulatingSupply:n(m?.circulating_supply),totalSupply:n(m?.total_supply),maxSupply:n(m?.max_supply),lastUpdated:m?.last_updated||null
        },
        updatedAt:new Date().toISOString()
      });
    }

    if(type==='coin_chart'){
      const id=String(req.query?.id||'').trim();
      if(!validId(id))return res.status(400).json({error:'Invalid CoinGecko id'});
      const allowed=[1,7,30,90,365,1095],asked=Math.max(1,Number(req.query?.days||30)||30),days=allowed.reduce((best,x)=>Math.abs(x-asked)<Math.abs(best-asked)?x:best,30);
      res.setHeader('Cache-Control','s-maxage=45, stale-while-revalidate=120');
      const d=await get(`https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}/market_chart?vs_currency=usd&days=${days}`);
      const prices=Array.isArray(d?.prices)?d.prices:[],caps=Array.isArray(d?.market_caps)?d.market_caps:[],vols=Array.isArray(d?.total_volumes)?d.total_volumes:[];
      const points=prices.map((x,i)=>({t:Number(x?.[0]),p:n(x?.[1]),marketCap:n(caps?.[i]?.[1]),volume:n(vols?.[i]?.[1])})).filter(x=>Number.isFinite(x.t)&&x.p!==null);
      return res.status(200).json({ok:true,version:'27.1',id,days,points,source:key?'CoinGecko Demo API':'CoinGecko public API',updatedAt:new Date().toISOString()});
    }

    if(type==='bnb_ohlc'){
      const requested=Math.max(1,Math.min(1095,Number(req.query?.days||30)||30));
      const cfg=requested<=1?{days:1,interval:'15m',limit:96}:requested<=7?{days:7,interval:'1h',limit:168}:requested<=30?{days:30,interval:'4h',limit:180}:requested<=90?{days:90,interval:'1d',limit:90}:requested<=365?{days:365,interval:'1d',limit:365}:{days:1095,interval:'1d',limit:1095};
      res.setHeader('Cache-Control','s-maxage=20, stale-while-revalidate=60');
      try{
        let raw=[];let remaining=cfg.limit,endTime=null;
        while(remaining>0){
          const lim=Math.min(1000,remaining),end=endTime?`&endTime=${endTime}`:'';
          const part=await get(`https://data-api.binance.vision/api/v3/klines?symbol=BNBUSDT&interval=${cfg.interval}&limit=${lim}${end}`,{Accept:'application/json','User-Agent':'Kiber-BNB-Intelligence/27.4'});
          if(!Array.isArray(part)||!part.length)break;
          raw=[...part,...raw];remaining-=part.length;
          const first=Number(part[0]?.[0]);if(!Number.isFinite(first)||part.length<lim)break;endTime=first-1;
        }
        const seen=new Set();const candles=(Array.isArray(raw)?raw:[]).map(k=>({t:Math.floor(Number(k?.[0])/1000),open:n(k?.[1]),high:n(k?.[2]),low:n(k?.[3]),close:n(k?.[4]),volume:n(k?.[5]),quoteVolume:n(k?.[7])})).filter(x=>Number.isFinite(x.t)&&[x.open,x.high,x.low,x.close].every(v=>v!==null)&&(!seen.has(x.t)&&seen.add(x.t)));
        if(candles.length>2)return res.status(200).json({ok:true,asset:'BNB',pair:'BNBUSDT',days:cfg.days,interval:cfg.interval,candles,source:'Binance Spot public market data',updatedAt:new Date().toISOString()});
      }catch(e){}
      const d=await get(`https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=${cfg.days}`,headers);
      const p=Array.isArray(d?.prices)?d.prices:[],v=Array.isArray(d?.total_volumes)?d.total_volumes:[];
      const step=Math.max(1,Math.floor(p.length/Math.max(24,Math.min(180,p.length))));
      const candles=[];
      for(let i=0;i<p.length;i+=step){const s=p.slice(i,i+step);if(!s.length)continue;const vals=s.map(x=>n(x?.[1])).filter(x=>x!==null);if(!vals.length)continue;const vol=v.slice(i,i+step).reduce((a,x)=>a+(n(x?.[1])||0),0);candles.push({t:Math.floor(Number(s[0][0])/1000),open:vals[0],high:Math.max(...vals),low:Math.min(...vals),close:vals.at(-1),volume:null,quoteVolume:vol||null})}
      return res.status(200).json({ok:true,asset:'BNB',pair:'BNB/USD',days:cfg.days,interval:'aggregated',candles,source:key?'CoinGecko Demo API fallback':'CoinGecko public API fallback',updatedAt:new Date().toISOString()});
    }

    if(type==='bnb_chart'){
      const allowed=[1,7,30,90,365,1095];
      const asked=Math.max(1,Number(req.query?.days||30)||30);
      const days=allowed.reduce((best,x)=>Math.abs(x-asked)<Math.abs(best-asked)?x:best,30);
      res.setHeader('Cache-Control','s-maxage=60, stale-while-revalidate=180');
      const d=await get(`https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=${days}`);
      const prices=Array.isArray(d?.prices)?d.prices:[],caps=Array.isArray(d?.market_caps)?d.market_caps:[],vols=Array.isArray(d?.total_volumes)?d.total_volumes:[];
      const points=prices.map((x,i)=>({t:Number(x?.[0]),p:n(x?.[1]),marketCap:n(caps?.[i]?.[1]),volume:n(vols?.[i]?.[1])})).filter(x=>Number.isFinite(x.t)&&x.p!==null);
      return res.status(200).json({ok:true,asset:'BNB',days,points,source:key?'CoinGecko Demo API':'CoinGecko public API',updatedAt:new Date().toISOString()});
    }

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

    if(type==='resolve'){
      const id=String(req.query?.id||'').trim();
      if(!validId(id))return res.status(400).json({error:'Invalid CoinGecko id'});
      const d=await coin(id),address=bscAddress(d?.platforms);
      return res.status(200).json({id,address,onBsc:!!address,platforms:d?.platforms||{},representation:'BNB Chain Ecosystem',source:'CoinGecko'});
    }

    return res.status(404).json({error:'Unknown type'});
  }catch(e){
    const status=Number(e.status)||502;
    return res.status(status===401||status===429?503:502).json({error:String(e.message||e),needsKey:!key,upstreamStatus:status,source:'Kiber Market Proxy'});
  }
};