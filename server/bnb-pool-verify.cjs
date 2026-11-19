'use strict';
/* Verify PancakeSwap V3 pool identity on BNB Chain using READ-ONLY eth_call.
   Verification of pool origin is NOT a token safety audit or trade permission. */
const ADDRESS=/^0x[0-9a-fA-F]{40}$/;
const RPC='https://bsc-dataseed-public.bnbchain.org';
const FACTORY='0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865';
const SELECTORS=Object.freeze({token0:'0x0dfe1681',token1:'0xd21220a7',fee:'0xddca3f43',getPool:'0x1698ee82'});
const normalize=v=>String(v||'').toLowerCase();
function addrFromHex(value){
  if(!/^0x[0-9a-fA-F]{64}$/.test(String(value||'')))throw Error('Risposta ABI errata');
  return '0x'+value.slice(-40).toLowerCase();
}
function argAddress(v){if(!ADDRESS.test(String(v)))throw Error('Indirizzo non valido');return v.slice(2).toLowerCase().padStart(64,'0')}
function argUInt(v){if(!Number.isSafeInteger(v)||v<0||v>=1000000)throw Error('Fee non valida');return v.toString(16).padStart(64,'0')}
async function verifyV3Pool(pool,rpcUrl=RPC,fetchImpl=fetch){
  if(!ADDRESS.test(String(pool||'')))throw Error('Indirizzo della pool non valido');
  if(typeof rpcUrl!=='string'||!/^https:\/\/[^ ]+$/.test(rpcUrl))throw Error('RPC HTTPS non valido');
  const call=async(method,params)=>{
    const r=await fetchImpl(rpcUrl,{
      method:'POST',
      headers:{'Content-Type':'application/json',Accept:'application/json'},
      body:JSON.stringify({jsonrpc:'2.0',id:1,method,params}),
      signal:AbortSignal.timeout(7500)
    });
    if(!r.ok)throw Error('RPC non disponibile');
    const data=await r.json();
    if(data?.error||typeof data?.result!=='string')throw Error('Risposta RPC non verificata');
    return data.result;
  };
  const chain=await call('eth_chainId',[]);
  if(normalize(chain)!=='0x38')throw Error('RPC non collegato alla BNB Smart Chain');
  const get=async(address,data)=>call('eth_call',[{to:address,data},'latest']);
  const [a,b,f]=await Promise.all([get(pool,SELECTORS.token0),get(pool,SELECTORS.token1),get(pool,SELECTORS.fee)]);
  const token0=addrFromHex(a),token1=addrFromHex(b);
  if(token0===token1)throw Error('Token della pool non validi');
  if(!/^0x[0-9a-fA-F]{64}$/.test(f))throw Error('Fee pool non valida');
  const fee=Number(BigInt(f));
  if(!Number.isSafeInteger(fee)||fee<=0||fee>=1000000)throw Error('Fee pool fuori intervallo');
  const lookup=SELECTORS.getPool+argAddress(token0)+argAddress(token1)+argUInt(fee);
  const canonical=addrFromHex(await get(FACTORY,lookup));
  const verified=canonical===normalize(pool);
  return {verified,chainId:56,pool:normalize(pool),factory:normalize(FACTORY),token0,token1,fee,
    checkedAt:new Date().toISOString(),source:'BNB Smart Chain eth_call / PancakeSwap V3 Factory',
    note:verified?'Pool confermata dalla factory. Questo NON verifica l’affidabilità dei token.':'Indirizzo NON riconosciuto dalla factory PancakeSwap V3.'};
}
async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({ok:false,error:'Solo GET'});
  const pool=String(req.query?.pool||'').trim();
  if(!ADDRESS.test(pool))return res.status(400).json({ok:false,error:'Indirizzo pool non valido'});
  try{
    const result=await verifyV3Pool(pool,process.env.BSC_RPC_HTTP_URL||RPC);
    res.setHeader('Cache-Control','public, s-maxage=45, stale-while-revalidate=30');
    return res.status(200).json({ok:true,...result});
  }catch{
    res.setHeader('Cache-Control','no-store');
    return res.status(503).json({ok:false,status:'UNAVAILABLE',verified:false,error:'RPC indisponibile o risposta incompleta, pool non verificata'});
  }
}
module.exports={handler,verifyV3Pool,FACTORY,SELECTORS,addrFromHex};