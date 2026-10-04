const n=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
const clamp=(v,a=0,b=100)=>Math.max(a,Math.min(b,v));
const ageHours=iso=>{const t=Date.parse(iso||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/36e5):null};
async function get(url){const r=await fetch(url,{headers:{Accept:'application/json','User-Agent':'Kiber-BNB-Chain/26.0'}});let d=null;try{d=await r.json()}catch{}if(!r.ok)throw new Error(String(r.status));return d}
function tokenMap(included=[]){const m=new Map();for(const x of included){if(x?.type!=='token')continue;const a=x.attributes||{};m.set(x.id,{address:a.address||String(x.id||'').split('_').slice(1).join('_'),name:a.name||'',symbol:a.symbol||'',image:a.image_url||null})}return m}
function scorePool(x,profile){
  const a=x.attributes||{},liq=n(a.reserve_in_usd),vol=n(a.volume_usd?.h24),mc=n(a.market_cap_usd??a.fdv_usd),chg=n(a.price_change_percentage?.h24),tx=a.transactions?.h24||{},buys=n(tx.buys)||0,sells=n(tx.sells)||0,age=ageHours(a.pool_created_at),turn=liq&&vol?vol/liq:null;
  let s=12;const why=[],risks=[];
  if(liq>=250000){s+=22;why.push('liquidità > $250k')}else if(liq>=75000){s+=17;why.push('liquidità > $75k')}else if(liq>=25000){s+=10}else{risks.push('liquidità bassa')}
  if(vol>=500000){s+=18;why.push('volume 24h elevato')}else if(vol>=100000){s+=13;why.push('volume 24h attivo')}else if(vol>=25000)s+=7;
  if(turn!==null&&turn>=.3&&turn<=5){s+=10;why.push('turnover coerente con la liquidità')}else if(turn!==null&&turn>8){s-=8;risks.push('turnover molto aggressivo')}
  if(buys+sells>=500){s+=12;why.push('attività transazionale forte')}else if(buys+sells>=100)s+=7;
  if(buys+sells>=30){const bal=Math.min(buys,sells)/Math.max(1,Math.max(buys,sells));if(bal>.35){s+=7;why.push('flusso buy/sell non unidirezionale')}else{risks.push('flusso buy/sell molto sbilanciato')}}
  if(age!==null&&age>=24&&age<=24*45){s+=9;why.push('nuovo ma con almeno 24h di storico')}else if(age!==null&&age<2){s-=12;risks.push('pool quasi appena creato')}else if(age!==null&&age>24*90)s-=3;
  if(mc!==null&&mc>=150000&&mc<=15000000){s+=10;why.push('market cap contenuto')}else if(mc!==null&&mc>50000000){s-=8}
  const lm=liq&&mc?liq/mc:null;if(lm!==null&&lm>=.04){s+=7;why.push('buon rapporto liquidità/valutazione')}else if(lm!==null&&lm<.008){s-=8;risks.push('liquidità piccola rispetto alla valutazione')}
  if(profile){s+=7;why.push('profilo pubblico rilevato');if((profile.links||[]).length)s+=3}
  if(chg!==null&&Math.abs(chg)>150){s-=10;risks.push('variazione 24h estrema')}
  s=clamp(Math.round(s));
  return {score:s,label:s>=75?'Da approfondire con priorità':s>=60?'Interessante ma da verificare':s>=45?'Speculativo':'Fragile / dati insufficienti',why:why.slice(0,5),risks:risks.slice(0,5),metrics:{liquidityUsd:liq,volume24h:vol,marketCap:mc,change24h:chg,buys24h:buys,sells24h:sells,ageHours:age,turnover:turn,liquidityToMcap:lm}};
}
module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});res.setHeader('Cache-Control','s-maxage=120, stale-while-revalidate=420');
  try{
    const [p1,p2,profilesR]=await Promise.allSettled([
      get('https://api.geckoterminal.com/api/v2/networks/bsc/new_pools?page=1&include=base_token,quote_token'),
      get('https://api.geckoterminal.com/api/v2/networks/bsc/new_pools?page=2&include=base_token,quote_token'),
      get('https://api.dexscreener.com/token-profiles/latest/v1')
    ]);
    const pages=[p1,p2].filter(x=>x.status==='fulfilled').map(x=>x.value),profiles=profilesR.status==='fulfilled'&&Array.isArray(profilesR.value)?profilesR.value:[];
    const profMap=new Map(profiles.filter(x=>x.chainId==='bsc').map(x=>[String(x.tokenAddress||'').toLowerCase(),x]));
    const candidates=[];
    for(const pg of pages){const tm=tokenMap(pg.included||[]);for(const pool of (pg.data||[])){
      const rel=pool.relationships?.base_token?.data?.id,token=tm.get(rel)||{};const address=String(token.address||'').toLowerCase();if(!/^0x[a-f0-9]{40}$/.test(address))continue;
      const profile=profMap.get(address)||null,sc=scorePool(pool,profile),mc=sc.metrics.marketCap;if(mc!==null&&mc>50000000)continue;if((sc.metrics.liquidityUsd||0)<20000)continue;
      candidates.push({address,name:token.name||pool.attributes?.name||'',symbol:token.symbol||'',image:token.image||profile?.icon||null,poolAddress:pool.attributes?.address||'',createdAt:pool.attributes?.pool_created_at||null,profile:profile?{description:profile.description||'',url:profile.url||'',links:(profile.links||[]).slice(0,5)}:null,...sc,source:'GeckoTerminal + DEX Screener'});
    }}
    const seen=new Set(),uniq=candidates.filter(x=>{if(seen.has(x.address))return false;seen.add(x.address);return true}).sort((a,b)=>b.score-a.score).slice(0,20);
    return res.status(200).json({version:'26.0',updatedAt:new Date().toISOString(),candidates:uniq,sources:['GeckoTerminal new pools','DEX Screener token profiles'],criteria:'Market cap/FDV <= $50M quando disponibile, liquidità minima $20k, attività, età pool, turnover, equilibrio buy/sell e presenza di profilo pubblico.',note:'La sezione individua progetti emergenti da approfondire. Non certifica team, contratto o sicurezza e non è una raccomandazione di acquisto.'});
  }catch{return res.status(502).json({version:'26.0',candidates:[],error:'Discovery feed unavailable'})}
};
