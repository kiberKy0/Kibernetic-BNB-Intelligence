(()=>{
  const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)});
  (async()=>{
    try{
      await load('v20-brand-frozen.js?v=v20-frozen-e718');
      await load('v21-market.js?v=21-market-a');
    }catch(e){console.error('Avvio V21 non riuscito',e)}
  })();
})();