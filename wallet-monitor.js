(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const L=window.KiberWalletLedger;
  if(!L||!$('walletPanel')||!$('walletOpen'))return;
  const networkId='0x38';
  const contracts=[
    {id:'USDT',address:'0x55d398326f99059ff775485246999027b3197955',decimals:18},
    {id:'USDC',address:'0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',decimals:18}
  ];
  const labels={deposit:'Deposito',withdrawal:'Prelievo',profit:'Profitto',loss:'Perdita',fee:'Commissione'};
  const fmt=n=>Number(n).toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2});
  const set=(id,value)=>{$(id).textContent=String(value)};
  let provider=null,account=null,chain=null,timer=null,entries=[];
  const key=()=>('kiber_strategy_ledger_v1_'+(account?.toLowerCase()||'unlinked'));
  const addressShort=a=>a?a.slice(0,6)+'…'+a.slice(-4):'Non collegato';
  function status(message){set('walletStatus',message)}
  function loadLedger(){
    try{const data=JSON.parse(localStorage.getItem(key())||'[]');entries=Array.isArray(data)?data.map(L.validEntry).filter(Boolean).slice(-500):[]}
    catch{entries=[]}
    renderLedger();
  }
  function saveLedger(){
    try{localStorage.setItem(key(),JSON.stringify(entries.slice(-500)));return true}
    catch{status('Memoria browser non disponibile: esporta il registro per non perderlo');return false}
  }
  function renderLedger(){
    const market=$('walletMarket').value,mode=$('walletMode').value,t=L.totals(entries,market,mode);
    set('walletNet',(t.net>=0?'+':'')+fmt(t.net)+' USD');
    set('walletCapital',t.hasCapital?fmt(t.capital)+' USD':'Non definito');
    set('walletFlows','Depositi: '+fmt(t.deposit)+' USD · Prelievi: '+fmt(t.withdrawal)+' USD');
    set('walletCosts','Profitti: '+fmt(t.profit)+' · Perdite: '+fmt(t.loss)+' · Commissioni: '+fmt(t.fee)+' USD');
    const list=$('walletEntries');list.replaceChildren();
    const visible=entries.filter(e=>e.market===market&&e.mode===mode).slice(-15).reverse();
    if(!visible.length){const e=document.createElement('li');e.textContent='Nessun movimento registrato in questo mercato e modalità';list.append(e);return}
    for(const e of visible){
      const li=document.createElement('li');const title=document.createElement('strong');
      title.textContent=labels[e.type]+' · '+fmt(e.amount)+' USD';
      const detail=document.createElement('small');
      detail.textContent=new Date(e.timestamp).toLocaleString('it-IT')+(e.note?' · '+e.note:'');
      li.append(title,detail);list.append(li);
    }
  }
  function stopRefresh(){if(timer){clearInterval(timer);timer=null}}
  function readOnlyProvider(){
    const p=window.ethereum;
    if(!p)return null;
    const choices=Array.isArray(p.providers)?p.providers:[p];
    return choices.find(x=>x?.isMetaMask&&typeof x.request==='function')||null;
  }
  function updateNetwork(){
    set('walletNetwork',chain==='0x38'?'BNB Smart Chain (56)':chain?'Rete '+chain+' · seleziona BNB Chain in MetaMask':'Rete non disponibile');
  }
  function resetBalances(){
    for(const x of ['walletBnb','walletUsdt','walletUsdc'])set(x,'—');
    set('walletUpdated','Aggiornamento: —');
  }
  async function refresh(){
    if(!account||!provider)return;
    try{
      const chainHex=await provider.request({method:'eth_chainId'});
      chain=typeof chainHex==='string'?chainHex.toLowerCase():null;
      updateNetwork();
      if(chain!==networkId){resetBalances();status('Collega BNB Smart Chain nel wallet per leggere i saldi. Nessuna rete verrà cambiata automaticamente.');return}
      const address=account;
      const results=await Promise.allSettled([
        provider.request({method:'eth_getBalance',params:[address,'latest']}),
        ...contracts.map(token=>provider.request({method:'eth_call',params:[{to:token.address,data:L.erc20BalanceOf(address)},'latest']}))
      ]);
      if(address!==account)return;
      const output=['walletBnb','walletUsdt','walletUsdc'];
      const decimals=[18,...contracts.map(x=>x.decimals)];
      for(let i=0;i<output.length;i++){
        if(results[i].status==='fulfilled'){
          try{set(output[i],L.formatUnits(results[i].value,decimals[i],6))}
          catch{set(output[i],'Dato non valido')}
        }else set(output[i],'Non disponibile');
      }
      set('walletUpdated','Ultimo controllo: '+new Date().toLocaleTimeString('it-IT'));
      status('Solo lettura · rete BNB Chain · nessuna autorizzazione di spesa richiesta');
    }catch(e){resetBalances();status('Lettura wallet non riuscita: '+(e?.message||'errore di rete'))}
  }
  async function connect(){
    const p=readOnlyProvider();
    if(!p){status('Provider MetaMask non rilevato in questo browser. Su Android apri la piattaforma nel browser interno MetaMask.');$('walletMobileHelp').hidden=false;return}
    $('walletConnect').disabled=true;
    try{
      const accounts=await p.request({method:'eth_requestAccounts'});
      const selected=accounts?.find(L.validAddress);
      if(!selected)throw Error('Nessun indirizzo autorizzato');
      if(provider!==p){provider=p;p.on?.('accountsChanged',onAccountsChanged);p.on?.('chainChanged',onChainChanged)}
      account=selected;set('walletAddress',addressShort(account));
      $('walletExplorer').href='https://bscscan.com/address/'+account;
      $('walletExplorer').hidden=false;
      $('walletMobileHelp').hidden=true;
      $('walletConnect').textContent='Ricollega / cambia account';
      loadLedger();await refresh();if(!$('walletPanel').hidden)beginRefresh();
    }catch(e){status(e?.code===4001?'Connessione rifiutata nel wallet':'Connessione non riuscita: '+(e?.message||'errore'))}
    finally{$('walletConnect').disabled=false}
  }
  function onAccountsChanged(accounts){
    const next=(Array.isArray(accounts)?accounts:[]).find(L.validAddress)||null;
    account=next;
    set('walletAddress',addressShort(account));$('walletExplorer').hidden=!account;
    if(account)$('walletExplorer').href='https://bscscan.com/address/'+account;
    resetBalances();loadLedger();
    if(account)refresh();else status('Wallet disconnesso: autorizzazione revocabile anche da MetaMask');
  }
  function onChainChanged(id){chain=typeof id==='string'?id.toLowerCase():null;updateNetwork();resetBalances();refresh()}
  function beginRefresh(){stopRefresh();if(account)timer=setInterval(()=>{if(!$('walletPanel').hidden)refresh()},45000)}
  function open(){
    const gold=$('goldPanel');if(gold&&!gold.hidden){gold.hidden=true;$('switchGold')?.setAttribute('aria-expanded','false')}
    $('walletPanel').hidden=false;$('walletOpen').setAttribute('aria-expanded','true');
    $('walletClose').focus();if(account){refresh();beginRefresh()}
  }
  function close(){ $('walletPanel').hidden=true;$('walletOpen').setAttribute('aria-expanded','false');stopRefresh();$('walletOpen').focus() }
  $('walletOpen').addEventListener('click',open);
  $('walletClose').addEventListener('click',close);
  $('walletConnect').addEventListener('click',connect);
  $('walletRefresh').addEventListener('click',refresh);
  $('walletMarket').addEventListener('change',renderLedger);
  $('walletMode').addEventListener('change',renderLedger);
  $('walletEntryForm').addEventListener('submit',e=>{
    e.preventDefault();
    const raw={timestamp:new Date().toISOString(),id:new Date().toISOString()+'-'+entries.length,
      market:$('walletMarket').value,mode:$('walletMode').value,type:$('walletType').value,
      amount:$('walletAmount').value,note:$('walletNote').value};
    const value=L.validEntry(raw);
    if(!value){status('Importo o operazione non valido');return}
    entries.push(value);saveLedger();renderLedger();
    $('walletAmount').value='';$('walletNote').value='';
    status('Movimento registrato sul dispositivo, NON verificato automaticamente dalla blockchain');
  });
  $('walletExport').addEventListener('click',()=>{
    const rows=[['data_utc','mercato','modalita','tipo','importo_usd','nota'],
      ...entries.map(e=>[e.timestamp,e.market,e.mode,e.type,e.amount,e.note])];
    const csv=rows.map(r=>r.map(x=>'"'+String(x??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
    const blob=new Blob([csv],{type:'text/csv;charset=utf-8'});
    const uri=URL.createObjectURL(blob);const a=document.createElement('a');a.href=uri;a.download='kiber-strategie-'+new Date().toISOString().slice(0,10)+'.csv';
    document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(uri),1000);
  });
  $('walletDisconnect').addEventListener('click',()=>{
    account=null;chain=null;stopRefresh();resetBalances();loadLedger();
    set('walletAddress','Non collegato');set('walletNetwork','—');$('walletExplorer').hidden=true;
    $('walletConnect').textContent='Collega MetaMask';
    status('Vista wallet scollegata. Revoca anche il permesso dal menu Siti connessi di MetaMask se desideri disconnettere la dApp.');
  });
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('walletPanel').hidden)close()});
  loadLedger();
})();
