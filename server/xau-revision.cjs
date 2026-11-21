/* Shared-proxy read-only revision status for the gold page.
 * Proxies PUBLIC GitHub commit metadata without any user credentials.
 * No repository editing, secret access or trading behavior.
 */
module.exports=async function handler(req,res){
 'use strict';
 if(req.method!=='GET')return res.status(405).json({ok:false,error:'Metodo non consentito'});
 res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
 res.setHeader('X-Content-Type-Options','nosniff');
 const url='https://api.github.com/repos/kiberKy0/Kibernetic-BNB-Intelligence/commits?path=xau-usd.html&per_page=1';
 try{
   const r=await fetch(url,{headers:{Accept:'application/vnd.github+json','User-Agent':'Kiber-XAU-Revision-Status'},
     signal:AbortSignal.timeout(8500)});
   if(!r.ok)throw Error('github-unavailable');
   const entries=await r.json();
   const item=Array.isArray(entries)?entries[0]:null;
   const sha=item?.sha,date=item?.commit?.committer?.date;
   if(typeof sha!=='string'||!/^[0-9a-f]{40}$/i.test(sha)||
      !date||!Number.isFinite(Date.parse(date)))throw Error('invalid-upstream');
   const message=String(item.commit?.message||'').split('\n')[0].slice(0,140);
   return res.status(200).json({ok:true,source:'GitHub · ultima modifica xau-usd.html',sha:sha.slice(0,7),at:new Date(date).toISOString(),message});
 }catch(_){
   return res.status(503).json({ok:false,error:'Ultima modifica momentaneamente non verificabile'});
 }
};
