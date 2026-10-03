module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Cache-Control','s-maxage=90, stale-while-revalidate=240');
  const n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
  const get=async url=>{const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Kiber-BNB-Intelligence/24.0'}});let d=null;try{d=await r.json()}catch{}if(!r.ok)throw new Error(`${r.status} ${url}`);return d};
  const ageHours=iso=>{const t=Date.parse(iso||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/36e5):null};
  const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));

  function normalizePool(x){
    const a=x?.attributes||{};
    const tx1=a.transactions?.h1||{},tx24=a.transactions?.h24||{};
    const vol1=n(a.volume_usd?.h1),vol24=n(a.volume_usd?.h24),liq=n(a.reserve_in_usd),chg1=n(a.price_change_percentage?.h1),chg24=n(a.price_change_percentage?.h24),age=ageHours(a.pool_created_at);
    const buys1=n(tx1.buys)||0,sells1=n(tx1.sells)||0,buys24=n(tx24.buys)||0,sells24=n(tx24.sells)||0;
    let score=0;
    if(liq!==null){if(liq>=250000)score+=22;else if(liq>=50000)score+=16;else if(liq>=10000)score+=9;}
    if(vol24!==null&&liq){const r=vol24/liq;if(r>=5)score+=24;else if(r>=2)score+=18;else if(r>=1)score+=12;}
    if(chg1!==null){const a=Math.abs(chg1);if(a>=30)score+=20;else if(a>=15)score+=14;else if(a>=7)score+=8;}
    const tx=buys1+sells1;if(tx>=500)score+=18;else if(tx>=100)score+=12;else if(tx>=25)score+=6;
    if(age!==null&&age<=24)score+=10;
    const net=buys1-sells1;if(Math.abs(net)>=50)score+=6;
    return {id:x?.id||'',name:a.name||'',address:a.address||'',poolCreatedAt:a.pool_created_at||null,ageHours:age,priceUsd:n(a.base_token_price_usd),marketCap:n(a.market_cap_usd),fdv:n(a.fdv_usd),liquidityUsd:liq,volume1h:vol1,volume24h:vol24,change1h:chg1,change24h:chg24,buys1h:buys1,sells1h:sells1,buys24h:buys24,sells24h:sells24,attentionScore:clamp(Math.round(score)),source:'GeckoTerminal'};
  }

  function feeIndex(fees){
    const list=Array.isArray(fees?.protocols)?fees.protocols:Array.isArray(fees?.data)?fees.data:[];
    const map=new Map();
    for(const x of list){
      const key=String(x?.slug||x?.name||x?.displayName||'').toLowerCase().replace(/[^a-z0-9]/g,'');
      if(!key)continue;
      map.set(key,{fees24:n(x.total24h??x.total24hFees??x.dailyFees),fees7d:n(x.total7d),fees30d:n(x.total30d),revenue24:n(x.revenue24h??x.dailyRevenue)});
    }
    return map;
  }

  function normalizeProtocol(x,feesMap){
    const chains=Array.isArray(x?.chains)?x.chains:[];
    const key=String(x?.slug||x?.name||'').toLowerCase().replace(/[^a-z0-9]/g,'');
    const f=feesMap.get(key)||{};
    const tvl=n(x?.tvl),d1=n(x?.change_1d),d7=n(x?.change_7d),mcap=n(x?.mcap);
    let score=35;
    if(tvl!==null){if(tvl>=1e9)score+=25;else if(tvl>=2.5e8)score+=18;else if(tvl>=5e7)score+=11;else if(tvl>=1e7)score+=6;}
    if(d7!==null)score+=clamp(d7,-10,10);
    if(d1!==null)score+=clamp(d1,-6,6);
    if(f.fees24!==null&&f.fees24!==undefined){if(f.fees24>=1e6)score+=14;else if(f.fees24>=1e5)score+=10;else if(f.fees24>=1e4)score+=6;}
    return {name:x?.name||'',slug:x?.slug||'',category:x?.category||'Altro',logo:x?.logo||'',tvl,mcap,change1d:d1,change7d:d7,fees24:f.fees24??null,fees7d:f.fees7d??null,fees30d:f.fees30d??null,revenue24:f.revenue24??null,fundamentalScore:clamp(Math.round(score)),chains};
  }

  try{
    const [chainR,poolsR,protocolsR,feesR,dexR]=await Promise.allSettled([
      get('https://api.llama.fi/v2/chains'),
      get('https://api.geckoterminal.com/api/v2/networks/bsc/new_pools?page=1'),
      get('https://api.llama.fi/protocols'),
      get('https://api.llama.fi/overview/fees/BSC?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true'),
      get('https://api.llama.fi/overview/dexs/BSC?excludeTotalDataChart=true&excludeTotalDataChartBreakdown=true')
    ]);

    const chains=chainR.status==='fulfilled'&&Array.isArray(chainR.value)?chainR.value:[];
    const bsc=chains.find(x=>String(x.name||'').toLowerCase()==='bsc')||chains.find(x=>/bnb smart chain|binance smart chain/i.test(String(x.name||'')))||{};
    const pools=(poolsR.status==='fulfilled'&&Array.isArray(poolsR.value?.data)?poolsR.value.data:[]).map(normalizePool).sort((a,b)=>b.attentionScore-a.attentionScore);
    const feesMap=feeIndex(feesR.status==='fulfilled'?feesR.value:null);
    const protocolsAll=protocolsR.status==='fulfilled'&&Array.isArray(protocolsR.value)?protocolsR.value:[];
    const protocols=protocolsAll.filter(x=>(Array.isArray(x?.chains)?x.chains:[]).some(c=>String(c).toLowerCase()==='bsc')).map(x=>normalizeProtocol(x,feesMap)).sort((a,b)=>(b.fundamentalScore-a.fundamentalScore)||((b.tvl||0)-(a.tvl||0))).slice(0,30);
    const dex=dexR.status==='fulfilled'&&dexR.value&&typeof dexR.value==='object'?dexR.value:{};
    const attention=pools.filter(x=>x.attentionScore>=45).slice(0,10);
    const events=[];
    if(n(bsc.tvl)!==null)events.push({type:'chain',level:'info',title:'BNB Chain Pulse',text:`TVL rilevato: ${Math.round(n(bsc.tvl))} USD. Il valore viene confrontato con attività DEX e protocolli.`});
    if(attention.length)events.push({type:'market',level:attention[0].attentionScore>=70?'high':'medium',title:'DEX Radar',text:`${attention.length} nuovi pool superano la soglia di attenzione Kiber; il punteggio massimo è ${attention[0].attentionScore}/100.`});
    if(protocols.length)events.push({type:'fundamentals',level:'info',title:'Fundamentals',text:`${protocols.length} protocolli BSC classificati. Primo per punteggio Kiber: ${protocols[0].name} (${protocols[0].fundamentalScore}/100).`});

    return res.status(200).json({
      version:'24.0',updatedAt:new Date().toISOString(),source:['DefiLlama','GeckoTerminal'],
      chain:{name:'BNB Smart Chain',tvl:n(bsc.tvl),tokenSymbol:bsc.tokenSymbol||'BNB',dexVolume24:n(dex.total24h),dexVolume7d:n(dex.total7d),dexChange1d:n(dex.change_1d),dexChange7d:n(dex.change_7d)},
      marketRadar:{newPools:pools.slice(0,20),attention},
      fundamentals:{protocols},events,
      availability:{chain:chainR.status==='fulfilled',newPools:poolsR.status==='fulfilled',protocols:protocolsR.status==='fulfilled',fees:feesR.status==='fulfilled',dex:dexR.status==='fulfilled'}
    });
  }catch(e){
    return res.status(502).json({error:'Kiber Intelligence temporarily unavailable',version:'24.0',updatedAt:new Date().toISOString()});
  }
};
