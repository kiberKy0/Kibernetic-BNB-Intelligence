(()=>{
  const originalFetch=window.fetch.bind(window);
  const SUPABASE_CATALOG='https://iytjxruxpvwjjhbndkzo.supabase.co/functions/v1/kibernetic-catalog';
  window.fetch=(input,init)=>{
    try{
      const url=typeof input==='string'?input:(input?.url||'');
      if(url.startsWith(SUPABASE_CATALOG)){
        const u=new URL(url);
        const local='/api/coingecko'+(u.search||'');
        return originalFetch(local,init);
      }
    }catch{}
    return originalFetch(input,init);
  };
})();