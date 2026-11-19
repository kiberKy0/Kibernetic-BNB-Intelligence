'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {verifyV3Pool,FACTORY}=require('../server/bnb-pool-verify.cjs');
const POOL='0x'+'9'.repeat(40),A='0x'+'1'.repeat(40),B='0x'+'2'.repeat(40),OTHER='0x'+'8'.repeat(40);
const hexAddr=x=>'0x'+x.slice(2).padStart(64,'0');
const uint=n=>'0x'+n.toString(16).padStart(64,'0');
function fakeRPC({chain='0x38',canonical=POOL,fee=500}={}){
  const requests=[];
  const fetchImpl=async(_url,options)=>{
    const req=JSON.parse(options.body);requests.push(req);
    let result;
    if(req.method==='eth_chainId')result=chain;
    else if(req.method==='eth_call'){
      const {to,data}=req.params[0];
      if(to.toLowerCase()===POOL.toLowerCase()&&data==='0x0dfe1681')result=hexAddr(A);
      else if(to.toLowerCase()===POOL.toLowerCase()&&data==='0xd21220a7')result=hexAddr(B);
      else if(to.toLowerCase()===POOL.toLowerCase()&&data==='0xddca3f43')result=uint(fee);
      else if(to.toLowerCase()===FACTORY.toLowerCase()&&data.startsWith('0x1698ee82'))result=hexAddr(canonical);
    }
    return {ok:true,json:async()=>({result})};
  };
  return {requests,fetchImpl};
}
test('verifica factory getPool e distingue verifica pool dalla sicurezza token',async()=>{
  const f=fakeRPC();const x=await verifyV3Pool(POOL,'https://rpc.example',f.fetchImpl);
  assert.equal(x.verified,true);assert.equal(x.chainId,56);assert.equal(x.fee,500);
  assert.equal(x.token0,A);assert.equal(x.token1,B);
  assert.match(x.note,/NON verifica/);
  const last=f.requests.at(-1);assert.equal(last.params[0].to,FACTORY);
});
test('pool diversa da factory viene respinta',async()=>{
  const f=fakeRPC({canonical:OTHER});
  const x=await verifyV3Pool(POOL,'https://rpc.example',f.fetchImpl);
  assert.equal(x.verified,false);
});
test('RPC su chain diversa non effettua alcuna eth_call',async()=>{
  const f=fakeRPC({chain:'0x1'});
  await assert.rejects(()=>verifyV3Pool(POOL,'https://rpc.example',f.fetchImpl),/BNB/);
  assert.equal(f.requests.length,1);
});
test('RPC insicuro o address malformato vengono respinti',async()=>{
  await assert.rejects(()=>verifyV3Pool('not-an-address','https://rpc.example',fakeRPC().fetchImpl),/Indirizzo/);
  await assert.rejects(()=>verifyV3Pool(POOL,'http://rpc.example',fakeRPC().fetchImpl),/HTTPS/);
});
