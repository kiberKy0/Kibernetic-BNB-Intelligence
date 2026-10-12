'use strict';
const url='https://iytjxruxpvwjjhbndkzo.supabase.co/functions/v1/kibernetic-refresh';
async function cloud(q={}){const query=new URLSearchParams(Object.entries(q).filter(([k])=>['address','name','symbol'].includes(k)));const r=await fetch(url+'?'+query,{signal:AbortSignal.timeout(5000)});if(!r.ok)throw Error('Cloud refresh unavailable');return r.json()}
function matches(row,q){return !!row?.report&&row.source===q.source&&row.step_seconds===Number(q.step)&&Date.parse(row.as_of)===Number(q.asOf)&&(q.source==='dex'?row.address===String(q.address||'').toLowerCase()&&row.pool_address===q.pool:row.asset===q.id)}
module.exports={cloud,matches,handler:async(req,res)=>{if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});try{const d=await cloud(req.query);res.setHeader('Cache-Control','s-maxage=15');return res.status(200).json(d)}catch{return res.status(503).json({available:false,error:'Aggiornamento cloud non disponibile'})}}};
