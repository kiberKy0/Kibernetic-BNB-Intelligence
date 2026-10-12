import {tracked,snapshots} from './market.mjs';
const base=Deno.env.get('SUPABASE_URL')||'',key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
const headers={apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'};
async function rest(path:string,options:RequestInit={}){const r=await fetch(base+'/rest/v1/'+path,{...options,headers:{...headers,...options.headers},signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Database '+r.status);const t=await r.text();return t?JSON.parse(t):null}
const out=(d:any,status=200)=>new Response(JSON.stringify(d),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store'}});
Deno.serve(async(req)=>{let lease='';const started=Date.now();try{
 if(req.method==='GET'){const rows=await rest('kibernetic_minute_state?select=last_attempt,last_success,status,detail&id=eq.true');return out({mode:'minute-market',state:rows[0]||null,note:'Raccolta limitata a massimo 12 token. I conteggi e i volumi sono finestre mobili 24h. Notizie e previsioni hanno cicli separati.'})}
 if(req.method!=='POST')return out({error:'Method not allowed'},405);
 const token=req.headers.get('Authorization')?.replace(/^Bearer /,'')||'';if(token.length<20)return out({error:'Unauthorized'},401);
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token)))).map(x=>x.toString(16).padStart(2,'0')).join('');
 const auth=await rest('kibernetic_v281_control?select=job_name&job_name=eq.collector&secret_hash=eq.'+hash);if(!auth.length)return out({error:'Unauthorized'},401);
 const now=new Date().toISOString(),minute=new Date(Math.floor(Date.now()/60000)*60000).toISOString(),id=crypto.randomUUID();
 const acquired=await rest('kibernetic_minute_state?id=eq.true&locked_until=lte.'+encodeURIComponent(now)+'&last_attempt=lt.'+encodeURIComponent(minute),{method:'PATCH',headers:{Prefer:'return=representation'},body:JSON.stringify({lease:id,locked_until:new Date(Date.now()+90000).toISOString(),last_attempt:now,status:'running'})});
 if(!acquired.length)return out({skipped:true,reason:'Already running or minute already attempted'});lease=id;
 const watched=await rest('kibernetic_watchlist_cloud?select=token_address&enabled=eq.true&order=updated_at.desc&limit=40'),assets=tracked(watched);
 const r=await fetch('https://api.dexscreener.com/tokens/v1/bsc/'+assets.map((a:any)=>a.address).join(','),{signal:AbortSignal.timeout(18000)});if(!r.ok)throw Error('Provider '+r.status);
 const pairs=await r.json(),captured_at=new Date().toISOString(),rows=snapshots(pairs,assets,captured_at);if(!rows.length)throw Error('No valid pools');
 await rest('kibernetic_minute_snapshots?on_conflict=asset,bucket',{method:'POST',headers:{Prefer:'resolution=ignore-duplicates,return=minimal'},body:JSON.stringify(rows)});
 // Short archive only; the existing hourly historical archive is kept intact.
 await rest('kibernetic_minute_snapshots?captured_at=lt.'+encodeURIComponent(new Date(Date.now()-86400000).toISOString()),{method:'DELETE'});
 const detail={requested:assets.length,captured:rows.length,missing:assets.length-rows.length,duration_ms:Date.now()-started,provider_requests:1,retention_hours:24};
 await rest('kibernetic_minute_state?id=eq.true&lease=eq.'+lease,{method:'PATCH',body:JSON.stringify({last_success:captured_at,status:rows.length===assets.length?'ok':'partial',detail,locked_until:new Date().toISOString(),lease:null})});lease='';return out({ok:true,captured_at,...detail});
 }catch(e){if(lease){try{await rest('kibernetic_minute_state?id=eq.true&lease=eq.'+lease,{method:'PATCH',body:JSON.stringify({status:'error',detail:{error:String(e?.message||'Collection failed'),duration_ms:Date.now()-started},locked_until:new Date(Date.now()+120000).toISOString(),lease:null})})}catch{}}return out({ok:false,error:'Minute collection failed'},503)}});
