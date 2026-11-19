'use strict';
/* Persistent BNB watcher (Node 22+, not a Vercel Function). READ-ONLY.
   Requires worker Secrets BSC_WSS_URL, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
   Optional BSC_RPC_HTTP_URL for on-chain verification.
   Never stores private keys, sends orders or claims guaranteed second-by-second pricing. */
const {createSwapWatcher}=require('./bnb-ws-subscribe.cjs');
const {verifyV3Pool}=require('./bnb-pool-verify.cjs');
const ADDRESS=/^0x[0-9a-f]{40}$/;
const BSC_RPC='https://bsc-dataseed-public.bnbchain.org';
function makeStore(config={}){
  const url=String(config.url||'').replace(/\/+$/,'');
  const key=String(config.key||'');
  const fetchImpl=config.fetchImpl||fetch;
  if(!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(url))throw Error('SUPABASE_URL HTTPS non valida');
  if(key.length<30)throw Error('SUPABASE_SERVICE_ROLE_KEY non configurata');
  async function request(table,{method='GET',query='',body=null,prefer=''}={}){
    const response=await fetchImpl(url+'/rest/v1/'+table+query,{
      method,headers:{
        apikey:key,Authorization:'Bearer '+key,Accept:'application/json',
        ...(body===null?{}:{'Content-Type':'application/json'}),
        ...(prefer?{Prefer:prefer}:{})
      },
      ...(body===null?{}:{body:JSON.stringify(body)}),
      signal:AbortSignal.timeout(10000)
    });
    if(!response.ok)throw Error('Database BNB non disponibile ('+response.status+')');
    if(response.status===204)return null;
    const result=await response.text();
    return result?JSON.parse(result):null;
  }
  return {
    listPools:()=>request('kibernetic_bnb_pool_registry',{query:'?select=pool_address,token0_address,token1_address,fee&enabled=eq.true&verified_onchain=eq.true&limit=30'}),
    insertEvent:data=>request('kibernetic_bnb_swap_events',{method:'POST',query:'?on_conflict=chain_id,transaction_hash,log_index,removed',body:data,prefer:'resolution=ignore-duplicates,return=minimal'}),
    state:data=>request('kibernetic_bnb_stream_state',{method:'POST',query:'?on_conflict=worker_id',body:data,prefer:'resolution=merge-duplicates,return=minimal'})
  };
}
function createWorker({env=process.env,fetchImpl=fetch,WebSocketImpl=globalThis.WebSocket,clock=Date.now,verify=verifyV3Pool,makeWatcher=createSwapWatcher,store=null}={}){
  const workerId=String(env.BNB_WORKER_ID||'kibernetic_bnb_v3_main');
  if(!/^[a-zA-Z0-9_-]{3,64}$/.test(workerId))throw Error('BNB_WORKER_ID non valido');
  const db=store||makeStore({url:env.SUPABASE_URL,key:env.SUPABASE_SERVICE_ROLE_KEY,fetchImpl});
  const rpcHttp=env.BSC_RPC_HTTP_URL||BSC_RPC;
  const wss=env.BSC_WSS_URL;
  let watcher=null,heartbeat=null,running=false,seenBlock=0;
  let events=0,pending=Promise.resolve(),backlog=0,failed=false,streamStage='NOT_CONFIGURED',details='';
  const statusMap={CONNECTING:'CONNECTING',SUBSCRIBED:'SUBSCRIBED',RECONNECTING:'RECONNECTING',BLOCKED:'ERROR',UNAVAILABLE:'ERROR',ERROR:'ERROR',STOPPED:'STOPPED'};
  async function state(){
    await db.state({worker_id:workerId,chain_id:56,status:streamStage,subscribed_pools:watcher?.state().subscribed?watcher.state().poolCount:0,
      last_block:seenBlock||null,last_event_at:events?new Date(clock()).toISOString():null,last_heartbeat_at:new Date(clock()).toISOString(),
      details:details.slice(0,500),updated_at:new Date(clock()).toISOString()});
  }
  function enqueue(event){
    if(event.chainId!==56||event.priceAvailable!==false)return;
    if(backlog>=1000){failed=true;streamStage='ERROR';details='Coda oltre 1000 eventi, dati incompleti';return}
    backlog++;
    const blockNumber=Number(BigInt(event.blockNumber));
    const logIndex=Number(BigInt(event.logIndex));
    if(!Number.isSafeInteger(blockNumber)||!Number.isSafeInteger(logIndex)){backlog--;return}
    pending=pending.then(async()=>{
      const payload={chain_id:56,pool_address:event.pool.toLowerCase(),transaction_hash:event.transactionHash.toLowerCase(),
        log_index:logIndex,block_number:blockNumber,removed:!!event.removed,
        event_received_at:event.receivedAt,price_usd:null,payload:{source:event.source,unconfirmed:true,priceAvailable:false}};
      await db.insertEvent(payload);
      events++;
      seenBlock=Math.max(seenBlock,blockNumber);
    }).catch(err=>{failed=true;streamStage='ERROR';details='Errore archiviazione eventi: '+String(err?.message||'').slice(0,120)})
      .finally(()=>{backlog--});
  }
  async function start(){
    if(running)throw Error('Worker già avviato');
    running=true;
    try {
      // An empty or unverified registry must never be watched as if live.
      const rows=await db.listPools();
      if(!Array.isArray(rows)||!rows.length){streamStage='NOT_CONFIGURED';details='Nessuna pool V3 verificata e abilitata';await state();running=false;return {active:false,reason:details}}
      const pools=[];
      for(const row of rows.slice(0,30)){
        const pool=String(row.pool_address||'').toLowerCase();
        if(!ADDRESS.test(pool))continue;
        try{
          const proof=await verify(pool,rpcHttp,fetchImpl);
          if(proof.verified&&proof.chainId===56&&proof.token0===row.token0_address&&proof.token1===row.token1_address&&proof.fee===row.fee)pools.push(pool);
        }catch{continue}
      }
      if(!pools.length){streamStage='ERROR';details='Nessuna pool supera la verifica on-chain';await state();running=false;return {active:false,reason:details}}
      if(typeof wss!=='string'||!wss.startsWith('wss://')){streamStage='NOT_CONFIGURED';details='Manca BSC_WSS_URL: sottoscrizione non avviata';await state();running=false;return {active:false,reason:details}}
      watcher=makeWatcher({url:wss,pools,WebSocketImpl,now:clock,
        onState:info=>{
          streamStage=statusMap[info.stage]||'ERROR';details=info.details;
          // Reconnect gaps are not recovered. Do not label stream complete.
          if(info.stage==='RECONNECTING')details+=' · eventuali blocchi mancanti da recuperare';
          state().catch(()=>{failed=true});
        },onSwap:enqueue});
      watcher.start();
      heartbeat=setInterval(()=>state().catch(()=>{failed=true}),30000);
      return {active:true,chainId:56,pools:pools.length};
    }catch(error){
      running=false;streamStage='ERROR';details=String(error?.message||error).slice(0,150);
      await state().catch(()=>{});
      throw error;
    }
  }
  async function stop(){
    watcher?.stop();if(heartbeat)clearInterval(heartbeat);heartbeat=null;
    running=false;
    await pending;streamStage='STOPPED';details=failed?'Problemi nell’archiviazione da riconciliare':'Interrotto';
    await state().catch(()=>{});
  }
  return {start,stop,health:()=>({running,streamStage,pending:backlog,events,seenBlock,failed})};
}
if(require.main===module){
  const worker=createWorker();
  worker.start().then(result=>{
    if(!result.active){process.stderr.write('BNB worker non attivo: '+result.reason+'\n');process.exitCode=2;return}
    process.stdout.write('BNB watcher connesso al database; stream in attesa di sottoscrizione on-chain.\n');
    for(const signal of ['SIGINT','SIGTERM'])process.once(signal,()=>worker.stop().then(()=>process.exit(0)));
  }).catch(error=>{process.stderr.write('BNB worker: '+error.message+'\n');process.exitCode=1});
}
module.exports={createWorker,makeStore};