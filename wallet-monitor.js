(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const U=window.KiberWalletLedger;
  if(!U||!$('walletMini')||!$('walletBalanceToggle'))return;
  const EXPECTED_CHAIN='0x38';
  const TOKENS=[
    {id:'walletUsdt',contract:'0x55d398326f99059ff775485246999027b3197955',decimals:18},
    {id:'walletUsdc',contract:'0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',decimals:18}
  ];
  let provider=null,account=null,chain=null,timer=null;
  const put=(id,v)=>{$(id).textContent=String(v)};
  const short=address=>address?address.slice(0,6)+'…'+address.slice(-4):'Non collegato';
  function status(message){put('walletStatus',message)}
  function clearBalances(){for(const id of ['walletBnb','walletUsdt','walletUsdc'])put(id,'—')}
  function findMetaMask(){
    const injected=window.ethereum;
    if(!injected)return null;
    const choices=Array.isArray(injected.providers)?injected.providers:[injected];
    return choices.find(p=>p?.isMetaMask&&typeof p.request==='function')||null;
  }
  function showAccount(){
    put('walletAddress',short(account));
    put('walletNetwork',chain===EXPECTED_CHAIN?'BNB Smart Chain · rete 56':chain?'Rete '+chain+' · cambia rete in MetaMask':'Rete da verificare');
    const explorer=$('walletExplorer');
    explorer.hidden=!account;
    if(account)explorer.href='https://bscscan.com/address/'+account;
  }
  function stopTimer(){if(timer){clearInterval(timer);timer=null}}
  function beginTimer(){
    stopTimer();
    if(account&&!$('walletMini').hidden)timer=setInterval(()=>{
      if(!$('walletMini').hidden)refresh();
    },45000);
  }
  function setAccount(next){
    account=Array.isArray(next)?next.find(U.validAddress)||null:null;
    clearBalances();
    showAccount();
    if(!account){stopTimer();status('Wallet non collegato. Apri MetaMask per autorizzare la lettura.')}
    else refresh();
  }
  function changedNetwork(next){
    chain=typeof next==='string'?next.toLowerCase():null;
    clearBalances();showAccount();
    if(account)refresh();
  }
  function attachProvider(p){
    if(provider===p)return;
    provider=p;
    p.on?.('accountsChanged',setAccount);
    p.on?.('chainChanged',changedNetwork);
  }
  async function refresh(){
    if(!account||!provider){status('Nessun account MetaMask collegato in questo browser');return}
    const snapshot=account;
    try{
      const chainId=await provider.request({method:'eth_chainId'});
      if(snapshot!==account)return;
      chain=typeof chainId==='string'?chainId.toLowerCase():null;
      showAccount();
      if(chain!==EXPECTED_CHAIN){
        clearBalances();
        status('Per vedere BNB, USDT e USDC seleziona BNB Smart Chain nell’app MetaMask.');
        return;
      }
      const calls=[
        provider.request({method:'eth_getBalance',params:[snapshot,'latest']}),
        ...TOKENS.map(t=>provider.request({method:'eth_call',params:[{to:t.contract,data:U.erc20BalanceOf(snapshot)},'latest']}))
      ];
      const out=await Promise.allSettled(calls);
      if(snapshot!==account||$('walletMini').hidden)return;
      const fields=[{id:'walletBnb',decimals:18},...TOKENS.map(t=>({id:t.id,decimals:t.decimals}))];
      for(let i=0;i<fields.length;i++){
        const result=out[i];let value='Non disponibile';
        if(result?.status==='fulfilled'){
          try{value=U.formatUnits(result.value,fields[i].decimals,6)}
          catch{value='Dato non valido'}
        }
        put(fields[i].id,value);
      }
      status('Saldi reali BNB Chain · aggiornati alle '+new Date().toLocaleTimeString('it-IT'));
    }catch(e){clearBalances();status('Impossibile leggere il saldo: '+String(e?.message||'errore').slice(0,160))}
  }
  async function restoreIfAuthorized(){
    const p=findMetaMask();
    if(!p){
      $('walletMobileHelp').hidden=false;
      status('Per mostrare il saldo qui, apri l’Oracolo dal browser di MetaMask e autorizza la connessione.');
      return;
    }
    attachProvider(p);
    try{
      const accounts=await p.request({method:'eth_accounts'});
      if(Array.isArray(accounts)&&accounts.some(U.validAddress))setAccount(accounts);
      else status('Premi «Collega per visualizzare» per autorizzare la lettura del saldo.');
    }catch{status('Collegamento da autorizzare in MetaMask')}
  }
  async function connect(){
    const p=findMetaMask();
    if(!p){$('walletMobileHelp').hidden=false;status('Apri l’Oracolo nel browser di MetaMask: Chrome Android potrebbe non rilevare il wallet.');return}
    attachProvider(p);
    const button=$('walletConnect');button.disabled=true;
    try{
      const accounts=await p.request({method:'eth_requestAccounts'});
      if(!Array.isArray(accounts)||!accounts.some(U.validAddress))throw Error('Nessun account autorizzato');
      account=accounts.find(U.validAddress);
      $('walletMobileHelp').hidden=true;
      showAccount();await refresh();beginTimer();
    }catch(e){status(e?.code===4001?'Connessione annullata in MetaMask':'Connessione non riuscita: '+String(e?.message||'errore').slice(0,150))}
    finally{button.disabled=false}
  }
  function close(){
    $('walletMini').hidden=true;
    $('walletBalanceToggle').setAttribute('aria-expanded','false');
    stopTimer();
  }
  async function open(){
    $('walletMini').hidden=false;
    $('walletBalanceToggle').setAttribute('aria-expanded','true');
    await restoreIfAuthorized();
    if(account){await refresh();beginTimer()}
  }
  $('walletBalanceToggle').addEventListener('click',()=>{
    if($('walletMini').hidden)open();
    else close();
  });
  $('walletClose').addEventListener('click',close);
  $('walletConnect').addEventListener('click',connect);
  $('walletRefresh').addEventListener('click',refresh);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('walletMini').hidden)close()});
  window.addEventListener('focus',()=>{if(account&&!$('walletMini').hidden)refresh()});
})();
