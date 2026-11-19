'use strict';
/* WebSocket watcher for BNB Chain PancakeSwap V3 swap logs.
   Must run in a persistent cloud worker, NOT a Vercel serverless request.
   Requires a private BSC_WSS_URL configured in cloud Secrets. NEVER signs trades. */
const ADDRESS=/^0x[a-fA-F0-9]{40}$/;
const HASH=/^0x[a-fA-F0-9]{64}$/;
const SWAP_TOPIC='0x19b47279256b2a23a1665c810c8d55a1758940ee09377d4f8d26497a3577dc83';
function createSwapWatcher(options={}){
  const socketFactory=options.WebSocketImpl||globalThis.WebSocket;
  const url=options.url;
  const pools=Array.isArray(options.pools)?options.pools:[];
  if(typeof url!=='string'||!/^wss:\/\/[^ ]+$/i.test(url))throw Error('Serve un WSS RPC endpoint sicuro');
  if(typeof socketFactory!=='function')throw Error('WebSocket non supportato dal runtime');
  if(!pools.length||pools.length>30||pools.some(x=>!ADDRESS.test(x)))throw Error('Specificare 1–30 pool BSC valide');
  const allowed=new Set(pools.map(x=>x.toLowerCase()));
  if(allowed.size!==pools.length)throw Error('Pool duplicate');
  const wsSetTimeout=options.setTimeoutFn||setTimeout;
  const wsClearTimeout=options.clearTimeoutFn||clearTimeout;
  const now=options.now||Date.now;
  const onState=typeof options.onState==='function'?options.onState:()=>{};
  const onSwap=typeof options.onSwap==='function'?options.onSwap:()=>{};
  let client=null,stopped=true,confirmed=false,subscription=null,retry=null,retries=0,seq=0;
  const recent=new Set();
  function status(stage,details=''){onState({stage,details,time:new Date(now()).toISOString(),chainId:56,confirmed,subscriptionActive:!!subscription})}
  function scheduleReconnect(){
    if(stopped||retry!==null)return;
    confirmed=false;subscription=null;
    const delay=Math.min(30000,1000*2**Math.min(retries++,5));
    status('RECONNECTING','Stream interrotto; nessun evento usato per operazioni');
    retry=wsSetTimeout(()=>{retry=null;open()},delay);
  }
  function open(){
    if(stopped)return;
    let ws;
    try{ws=new socketFactory(url)}catch{scheduleReconnect();return}
    client=ws;
    status('CONNECTING');
    ws.onopen=()=>{
      if(stopped||client!==ws)return;
      ws.send(JSON.stringify({jsonrpc:'2.0',id:1,method:'eth_chainId',params:[]}));
    };
    ws.onmessage=event=>{
      if(stopped||client!==ws)return;
      let data;
      try{data=JSON.parse(typeof event.data==='string'?event.data:String(event.data))}catch{return}
      if(data?.id===1){
        if(data.error||String(data.result).toLowerCase()!=='0x38'){
          status('BLOCKED','RPC non verificato sulla BNB Smart Chain');
          client=null;try{ws.close()}catch{};scheduleReconnect();return;
        }
        confirmed=true;
        ws.send(JSON.stringify({jsonrpc:'2.0',id:2,method:'eth_subscribe',params:['logs',{address:pools,topics:[SWAP_TOPIC]}]}));
        return;
      }
      if(data?.id===2){
        if(data.error||typeof data.result!=='string'||!data.result.startsWith('0x')){
          status('UNAVAILABLE','Il nodo RPC non supporta lo stream logs');
          client=null;try{ws.close()}catch{};scheduleReconnect();return;
        }
        subscription=data.result;retries=0;
        status('SUBSCRIBED','Pool PancakeSwap V3 sotto osservazione');
        return;
      }
      if(data?.method!=='eth_subscription'||!confirmed||!subscription||data.params?.subscription!==subscription)return;
      const log=data.params?.result;
      if(!log||!allowed.has(String(log.address||'').toLowerCase())||String(log.topics?.[0]||'').toLowerCase()!==SWAP_TOPIC)return;
      if(!HASH.test(String(log.transactionHash))||!/^0x[0-9a-f]+$/i.test(String(log.blockNumber||''))||!/^0x[0-9a-f]+$/i.test(String(log.logIndex||'')))return;
      const key=String(log.transactionHash).toLowerCase()+':'+String(log.logIndex).toLowerCase()+':'+(log.removed?'removed':'added');
      if(recent.has(key))return;
      recent.add(key);if(recent.size>1500)recent.delete(recent.values().next().value);
      seq+=1;
      onSwap({source:'BNB Chain RPC / PancakeSwap V3',chainId:56,sequence:seq,receivedAt:new Date(now()).toISOString(),pool:log.address,transactionHash:log.transactionHash,blockNumber:log.blockNumber,logIndex:log.logIndex,removed:log.removed===true,verifiedEventType:true,usdPrice:null,priceAvailable:false});
    };
    ws.onerror=()=>{status('ERROR','Errore nella connessione WSS')};
    ws.onclose=()=>{if(client===ws)client=null;scheduleReconnect()};
  }
  return {
    start(){if(!stopped)return;stopped=false;retries=0;recent.clear();open()},
    stop(){stopped=true;confirmed=false;subscription=null;if(retry!==null){wsClearTimeout(retry);retry=null}const ws=client;client=null;try{ws?.close()}catch{}status('STOPPED')},
    state(){return {running:!stopped,chainVerified:confirmed,subscribed:!!subscription,sequence:seq,poolCount:allowed.size}}
  };
}
module.exports={createSwapWatcher,SWAP_TOPIC};