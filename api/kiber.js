function num(v){return v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null)}
function money(v){v=num(v);if(v===null)return '—';const a=Math.abs(v);if(a>=1e12)return '$'+(v/1e12).toFixed(2)+'T';if(a>=1e9)return '$'+(v/1e9).toFixed(2)+'B';if(a>=1e6)return '$'+(v/1e6).toFixed(2)+'M';return '$'+v.toLocaleString('it-IT',{maximumFractionDigits:2})}
function pct(v){v=num(v);return v===null?'—':`${v>=0?'+':''}${v.toFixed(2)}%`}
function deterministic(body){
  const b=body?.bnb||{},c=body?.chain||{};
  const q=String(body?.message||'').toLowerCase();
  let score=0,seen=0,reasons=[];
  const add=(v,w,label)=>{v=num(v);if(v===null)return;score+=Math.max(-30,Math.min(30,v*w));seen++;reasons.push(label.replace('{v}',pct(v)))};
  if(/chain|rete|tvl|dex/.test(q)){
    add(c.dexChange1d,2,'DEX 24h {v}');add(c.tvlChange7d,4,'TVL 7G {v}');add(c.tvlChange30d,1.2,'TVL 30G {v}');
  }else{
    add(b.change24,6,'BNB 24h {v}');
    if(num(b.volume24)!==null){seen++;reasons.push('volume 24h '+money(b.volume24))}
  }
  const label=!seen?'🟡 NEUTRALE':score>=18?'🟢 RIALZISTA':score<=-18?'🔴 RIBASSISTA':'🟡 NEUTRALE';
  const subject=/chain|rete|tvl|dex/.test(q)?'BNB Chain':'BNB';
  return `${label}\n${subject}\n\nPerché: ${reasons.slice(0,3).join(' · ')||'dati insufficienti per forzare una direzione.'}\n\nCosa può cambiare la lettura: variazioni significative di prezzo, volume, TVL, flussi DEX o nuove informazioni rilevanti.\n\nLettura automatica Kiber basata sui dati disponibili.`;
}
async function gatewayCall(credential,{instructions,input}){
  const model=process.env.AI_GATEWAY_MODEL||'openai/gpt-6-luna';
  const r=await fetch('https://ai-gateway.vercel.sh/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+credential,'Content-Type':'application/json'},body:JSON.stringify({model,instructions,input,max_output_tokens:1400})});
  const d=await r.json().catch(()=>({}));
  if(!r.ok)throw new Error(d?.error?.message||`AI Gateway ${r.status}`);
  const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';
  if(!answer)throw new Error('Empty AI Gateway response');
  return {answer,provider:'vercel-ai-gateway',model};
}
async function callProvider({instructions,input}){
  const openaiKey=process.env.OPENAI_API_KEY||'';
  const gatewayKey=process.env.AI_GATEWAY_API_KEY||'';
  const oidc=process.env.VERCEL_OIDC_TOKEN||'';
  if(openaiKey){
    const model=process.env.OPENAI_MODEL||'gpt-6-luna';
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+openaiKey,'Content-Type':'application/json'},body:JSON.stringify({model,instructions,input,max_output_tokens:1400})});
    const d=await r.json().catch(()=>({}));
    if(!r.ok)throw new Error(d?.error?.message||`OpenAI ${r.status}`);
    const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';
    if(!answer)throw new Error('Empty OpenAI response');
    return {answer,provider:'openai',model};
  }
  if(gatewayKey)return gatewayCall(gatewayKey,{instructions,input});
  if(oidc)return gatewayCall(oidc,{instructions,input});
  throw new Error('No AI credential available');
}
module.exports=async function handler(req,res){
  if(req.method==='GET'){
    const provider=process.env.OPENAI_API_KEY?'openai':(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN)?'vercel-ai-gateway':'deterministic';
    return res.status(200).json({ok:true,provider,ai:provider!=='deterministic',model:process.env.OPENAI_MODEL||process.env.AI_GATEWAY_MODEL||(provider==='vercel-ai-gateway'?'openai/gpt-6-luna':'gpt-6-luna'),version:'26.9'});
  }
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const mode=String(body.analysisMode||'summary').slice(0,40);
    const context={
      version:'26.9',analysisMode:mode,
      bnb:body.bnb||null,chain:body.chain||null,intelligence:body.intelligence||null,
      token:body.token||null,tokenIntel:body.tokenIntel||null,
      marketNews:body.marketNews?.items?{items:body.marketNews.items.slice(0,18)}:body.marketNews||null,
      discovery:body.discovery?.candidates?{candidates:body.discovery.candidates.slice(0,8)}:body.discovery||null,
      conversation:(body.conversation||[]).slice(-10).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'').slice(0,1600)}))
    };
    const question=String(body.message||'').slice(0,3000);
    const instructions=`Sei Kiber AI, il motore di intelligence di Kiber BNB Chain. Rispondi in italiano, diretto e semplice. Prima dai la direzione se pertinente: 🟢 RIALZISTA, 🟡 NEUTRALE o 🔴 RIBASSISTA. Poi spiega il perché con massimo 3 motivi concreti. Infine indica cosa potrebbe cambiare la lettura. Usa solo i dati forniti. Non inventare prezzi, holder, notizie, probabilità o causalità. Distingui BNB, BNB Chain, token, pool e protocollo. Le previsioni sono stime condizionate, non certezze né ordini di acquisto.`;
    const input=`CONTESTO KIBER:\n${JSON.stringify(context)}\n\nDOMANDA:\n${question}`;
    try{
      const out=await callProvider({instructions,input});
      return res.status(200).json({...out,analysisMode:mode,version:'26.9'});
    }catch(aiError){
      return res.status(200).json({answer:deterministic(body),provider:'deterministic',model:null,analysisMode:mode,version:'26.9',warning:String(aiError.message||aiError).slice(0,220)});
    }
  }catch(e){return res.status(500).json({error:'Kiber backend error',detail:String(e.message||e).slice(0,180)})}
};