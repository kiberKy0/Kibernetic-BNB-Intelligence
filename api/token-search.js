module.exports = async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  const q=String(req.query?.q||'').trim();
  if(!q) return res.status(400).json({error:'Missing q'});
  try{
    const r=await fetch('https://api.dexscreener.com/latest/dex/search?q='+encodeURIComponent(q));
    if(!r.ok) throw new Error('DexScreener '+r.status);
    const d=await r.json();
    const pairs=(d.pairs||[]).filter(p=>p.chainId==='bsc').slice(0,20);
    res.status(200).json({pairs});
  }catch(e){res.status(502).json({error:'Token feed unavailable'});}
}
