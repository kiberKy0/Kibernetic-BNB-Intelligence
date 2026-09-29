(()=>{
  const load=src=>new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.async=false;s.onload=resolve;s.onerror=reject;document.body.appendChild(s)});
  (async()=>{
    try{
      await load('v20-brand-frozen.js?v=v20-frozen-e718');
      window.__v20FrozenReady=true;
      document.dispatchEvent(new Event('kiber:v20-ready'));
    }catch(e){
      console.error('Avvio base V20 non riuscito',e);
      window.__v20FrozenReady=false;
    }
  })();
})();