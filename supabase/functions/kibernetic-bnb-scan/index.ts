// Kibernetic BNB continuous scanner: public READ-ONLY results.
// Internal Supabase role key never leaves this Edge Function.
const root=Deno.env.get('SUPABASE_URL')||'';
const secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const origin='https://kibernetic-bnb-intelligence.vercel.app';
const cors={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET,OPTIONS','Access-Control-Allow-Headers':'content-type','Vary':'Origin'};
const respond=(body:unknown,code=200)=>new Response(JSON.stringify(body),{status:code,headers:{...cors,'Content-Type':'application/json; charset=utf-8','Cache-Control':code===200?'public,max-age=15':'no-store','X-Content-Type-Options':'nosniff'}});
const fixed=new Map([
 ['0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c','binancecoin'],
 ['0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82','pancakeswap-token'],
 ['0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd','chainlink']
]);
async function read(table:string,query:string){
 const r=await fetch(root+'/rest/v1/'+table+'?'+query,{
  headers:{apikey:secret,Authorization:'Bearer '+secret,Accept:'application/json'},
  signal:AbortSignal.timeout(4500)
 });
 if(!r.ok)throw Error('DB query unavailable');
 return await r.json();
}
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors});
 if(req.method!=='GET')return respond({ok:false,error:'Solo lettura GET'},405);
 if(!root.startsWith('https://')||secret.length<24)return respond({ok:false,status:'UNAVAILABLE'},503);
 const url=new URL(req.url),address=(url.searchParams.get('address')||'').toLowerCase(),
 id=(url.searchParams.get('id')||'').trim();
 if(address&&!/^0x[0-9a-f]{40}$/.test(address))return respond({ok:false,error:'Contratto non valido'},400);
 if(id&&!['binancecoin','pancakeswap-token','chainlink'].includes(id))return respond({ok:false,error:'ID non valido'},400);
 const asset=address?(fixed.get(address)||'address:'+address):(id||'');
 try{
  const [healthRows,stateRows,findingsRows]=await Promise.all([
   read('kibernetic_bnb_scan_health','select=job_name,last_success_at,assets_analyzed,status,detail&job_name=eq.kibernetic-bnb-scan&limit=1'),
   asset?read('kibernetic_bnb_scan_state','select=asset,pool_address,source,price_usd,liquidity_usd,price_change_5m_pct,price_change_15m_pct,liquidity_change_15m_pct,last_source_at,scanned_at,status,note&asset=eq.'+encodeURIComponent(asset)+'&limit=1'):Promise.resolve([]),
   asset?read('kibernetic_bnb_scan_findings','select=event_type,observed_at,source_captured_at,baseline_at,change_pct,severity,summary&asset=eq.'+encodeURIComponent(asset)+'&order=observed_at.desc&limit=4'):Promise.resolve([])
  ]);
  const h=healthRows?.[0]||null,entry=stateRows?.[0]||null;
  const age=h?.last_success_at?Math.floor((Date.now()-Date.parse(h.last_success_at))/1000):null;
  const online=h?.status==='OK'&&age!==null&&age>=0&&age<=190;
  const sourceAge=entry?.last_source_at?Math.floor((Date.now()-Date.parse(entry.last_source_at))/1000):null;
  return respond({ok:true,scanOnline:online,mode:'BACKGROUND_SQL_1M',
   scheduleSeconds:60,websocket:false,tradeExecution:false,
   lastAnalysisAt:h?.last_success_at||null,ageSeconds:age,
   monitoredAssets:Number(h?.assets_analyzed)||0,
   status:online?'CURRENT':h?'STALE':'NOT_CONFIGURED',
   token:entry?{asset:entry.asset,pool:entry.pool_address,
    source:'DEX Screener snapshot HTTP',
    priceUsd:Number(entry.price_usd),liquidityUsd:entry.liquidity_usd===null?null:Number(entry.liquidity_usd),
    priceChange5mPct:entry.price_change_5m_pct===null?null:Number(entry.price_change_5m_pct),
    priceChange15mPct:entry.price_change_15m_pct===null?null:Number(entry.price_change_15m_pct),
    liquidityChange15mPct:entry.liquidity_change_15m_pct===null?null:Number(entry.liquidity_change_15m_pct),
    lastSourceAt:entry.last_source_at,ageSeconds:sourceAge,
    status:sourceAge!==null&&sourceAge>190?'STALE':entry.status}:null,
   findings:(Array.isArray(findingsRows)?findingsRows:[]).map(x=>({
    type:x.event_type,at:x.observed_at,sourceAt:x.source_captured_at,
    changePct:x.change_pct===null?null:Number(x.change_pct),
    severity:x.severity,summary:x.summary
   })),
   note:'Ricerca programmata ogni minuto anche a telefono spento, sui soli token monitorati (max 12). Snapshot HTTP, non flusso WebSocket e non segnale compra/vendi.'});
 }catch{
  return respond({ok:false,status:'UNAVAILABLE',scanOnline:false,
    error:'Stato della ricerca non disponibile; nessun dato inventato'},503);
 }
});