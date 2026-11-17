(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KiberWalletLedger=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const ADDRESS=/^0x[a-fA-F0-9]{40}$/;
  function validAddress(address){return ADDRESS.test(String(address||''));}
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
  return {validAddress,formatUnits,erc20BalanceOf};
});
