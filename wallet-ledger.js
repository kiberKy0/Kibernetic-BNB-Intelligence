(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KiberWalletLedger=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const TYPES=['deposit','withdrawal','profit','loss','fee'];
  const MARKETS=['BNB','XAUUSD'];
  const MODES=['demo','real'];
  const ADDRESS=/^0x[a-fA-F0-9]{40}$/;
  function validAddress(address){return ADDRESS.test(String(address||''));}
  function validEntry(raw){
    const v=raw||{};
    const amount=Number(v.amount);
    if(!MARKETS.includes(v.market)||!MODES.includes(v.mode)||!TYPES.includes(v.type)||!Number.isFinite(amount)||amount<=0||amount>1e9)return null;
    const timestamp=typeof v.timestamp==='string'&&Number.isFinite(Date.parse(v.timestamp))?v.timestamp:new Date().toISOString();
    return {id:String(v.id||timestamp).slice(0,80),timestamp,market:v.market,mode:v.mode,type:v.type,amount:Math.round(amount*100)/100,
      note:String(v.note||'').trim().slice(0,160)};
  }
  function totals(entries,market,mode){
    const sums={deposit:0,withdrawal:0,profit:0,loss:0,fee:0};
    for(const entry of Array.isArray(entries)?entries:[]){
      if(entry?.market!==market||entry?.mode!==mode||!TYPES.includes(entry.type))continue;
      const n=Number(entry.amount);
      if(Number.isFinite(n)&&n>0)sums[entry.type]+=n;
    }
    const net=Math.round((sums.profit-sums.loss-sums.fee)*100)/100;
    const capital=Math.round((sums.deposit-sums.withdrawal+net)*100)/100;
    return {...sums,net,capital,hasCapital:sums.deposit>0,hasEntries:Object.values(sums).some(v=>v>0)};
  }
  function formatUnits(hex,decimals=18,maxDecimals=6){
    if(!/^0x[0-9a-f]+$/i.test(String(hex||''))||!Number.isInteger(decimals)||decimals<0||decimals>30)throw Error('Risposta blockchain non valida');
    const raw=BigInt(hex).toString().padStart(decimals+1,'0');
    const base=decimals?raw.slice(0,-decimals):raw;
    const frac=decimals?raw.slice(-decimals).slice(0,maxDecimals).replace(/0+$/,''):'';
    return base+(frac?'.'+frac:'');
  }
  function erc20BalanceOf(account){
    if(!validAddress(account))throw Error('Indirizzo wallet non valido');
    return '0x70a08231'+account.slice(2).toLowerCase().padStart(64,'0');
  }
  return {validAddress,validEntry,totals,formatUnits,erc20BalanceOf,MARKETS,MODES,TYPES};
});
