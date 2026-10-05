function num(v){return v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null)}
function money(v){v=num(v);if(v===null)return '—';const a=Math.abs(v);if(a>=1e12)return '$'+(v/1e12).toFixed(2)+'T';if(a>=1e9)return '$'+(v/1e9).toFixed(2)+'B';if(a>=1e6)return '$'+(v/1e6).toFixed(2)+'M';return '$'+v.toLocaleString('it-IT',{maximumFractionDigits:2})}
function pct(v){v=num(v);return v===null?'—':`${v>=0?'+':''}${v.toFixed(2)}%`}
function deterministic(body){
  const b=body?.bnb||{},c=body?.chain||{},t=body?.token||{},ti=body?.tokenIntel||{};
  const q=String(body?.message||'').toLowerCase();let score=0,seen=0,reasons=[];
  const add=(v,w,label,cap=30)=>{v=num(v);if(v===null)return;score+=Math.max(-cap,Math.min(cap,v*w));seen++;reasons.push(label.replace('{v}',pct(v)))};
  const hasToken=!!(t?.symbol||t?.name);
  if(hasToken){
    add(t.change24,4,'24h {v}',24);add(t.change7d,1.4,'7g {v}',22);add(t.change30d,.55,'30g {v}',18);
    const os=num(ti?.outlook?.score);if(os!==null){score+=os*.45;seen++;const d=(ti?.outlook?.drivers||[])[0],w=(ti?.outlook?.warnings||[])[0];if(d)reasons.push(d);if(w)reasons.push(w)}
    const label=!seen?'🟡 NEUTRALE':score>=22?'🟢 RIALZISTA':score<=-22?'🔴 RIBASSISTA':'🟡 NEUTRALE';
    return `${label}\n${t.name||t.symbol} (${t.symbol||'TOKEN'})\n\nPerché: ${reasons.slice(0,4).join(' · ')||'dati insufficienti per forzare una direzione.'}\n\nCosa può cambiare la lettura: variazioni di prezzo, volume, liquidità, livelli tecnici, flussi on-chain o nuove informazioni rilevanti.\n\nLettura automatica Kiber basata sui dati disponibili.`;
  }
  if(/chain|rete|tvl|dex/.test(q)){add(c.dexChange1d,2,'DEX 24h {v}');add(c.tvlChange7d,4,'TVL 7G {v}');add(c.tvlChange30d,1.2,'TVL 30G {v}')}
  else{add(b.change24,6,'BNB 24h {v}');if(num(b.volume24)!==null){seen++;reasons.push('volume 24h '+money(b.volume24))}}
  const label=!seen?'🟡 NEUTRALE':score>=18?'🟢 RIALZISTA':score<=-18?'🔴 RIBASSISTA':'🟡 NEUTRALE';
  const subject=/chain|rete|tvl|dex/.test(q)?'BNB Chain':'BNB';
  return `${label}\n${subject}\n\nPerché: ${reasons.slice(0,3).join(' · ')||'dati insufficienti per forzare una direzione.'}\n\nCosa può cambiare la lettura: variazioni significative di prezzo, volume, TVL, flussi DEX o nuove informazioni rilevanti.\n\nLettura automatica Kiber basata sui dati disponibili.`;
}
async function gatewayCall(credential,{instructions,input}){
  const model=process.env.AI_GATEWAY_MODEL||'openai/gpt-6-luna';
  const r=await fetch('https://ai-gateway.vercel.sh/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+credential,'Content-Type':'application/json'},body:JSON.stringify({model,instructions,input,max_output_tokens:1500})});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error?.message||`AI Gateway ${r.status}`);
  const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';if(!answer)throw new Error('Empty AI Gateway response');
  return {answer,provider:'vercel-ai-gateway',model};
}
async function callProvider({instructions,input}){
  const openaiKey=process.env.OPENAI_API_KEY||'',gatewayKey=process.env.AI_GATEWAY_API_KEY||'',oidc=process.env.VERCEL_OIDC_TOKEN||'';
  if(openaiKey){
    const model=process.env.OPENAI_MODEL||'gpt-6-luna';
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+openaiKey,'Content-Type':'application/json'},body:JSON.stringify({model,instructions,input,max_output_tokens:1500})});
    const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error?.message||`OpenAI ${r.status}`);
    const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';if(!answer)throw new Error('Empty OpenAI response');
    return {answer,provider:'openai',model};
  }
  if(gatewayKey)return gatewayCall(gatewayKey,{instructions,input});
  if(oidc)return gatewayCall(oidc,{instructions,input});
  throw new Error('No AI credential available');
}
module.exports=async function handler(req,res){
  if(req.method==='GET'){
    const provider=process.env.OPENAI_API_KEY?'openai':(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN)?'vercel-ai-gateway':'deterministic';
    return res.status(200).json({ok:true,provider,ai:provider!=='deterministic',model:process.env.OPENAI_MODEL||process.env.AI_GATEWAY_MODEL||(provider==='vercel-ai-gateway'?'openai/gpt-6-luna':'gpt-6-luna'),version:'27.1'});
  }
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{},mode=String(body.analysisMode||'summary').slice(0,40);
    const token=body.token?{
      symbol:String(body.token.symbol||body.token.baseToken?.symbol||'').slice(0,30),name:String(body.token.name||body.token.baseToken?.name||'').slice(0,120),address:String(body.token.address||'').slice(0,80),
      price:num(body.token.price??body.token.priceUsd),change24:num(body.token.change24??body.token.priceChange?.h24),change7d:num(body.token.change7d),change30d:num(body.token.change30d),
      marketCap:num(body.token.marketCap??body.token.fdv),volume24:num(body.token.volume24??body.token.volume?.h24),liquidityUsd:num(body.token.liquidityUsd??body.token.liquidity?.usd),rank:num(body.token.rank),categories:Array.isArray(body.token.categories)?body.token.categories.slice(0,10):[]
    }:null;
    const context={version:'27.1',analysisMode:mode,bnb:body.bnb||null,chain:body.chain||null,intelligence:body.intelligence||null,token,tokenIntel:body.tokenIntel||null,marketNews:body.marketNews?.items?{counts:body.marketNews.counts||null,items:body.marketNews.items.slice(0,18)}:body.marketNews||null,discovery:body.discovery?.candidates?{candidates:body.discovery.candidates.slice(0,8)}:body.discovery||null,chart:body.analysis?.chart||null,conversation:(body.conversation||[]).slice(-10).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'').slice(0,1600)}))};
    const question=String(body.message||'').slice(0,3200);
    const instructions=`Sei Kiber AI, il motore di intelligence di Kiber BNB Chain V27.1. Rispondi in italiano, diretto e leggibile. Se la domanda riguarda una moneta o il mercato, dai prima una direzione semplice quando i dati lo consentono: 🟢 RIALZISTA, 🟡 NEUTRALE o 🔴 RIBASSISTA. Poi spiega il perché con massimo 4 motivi concreti e indica cosa potrebbe cambiare la lettura. Usa solo i dati presenti nel contesto. Non inventare prezzi, holder, notizie, target, probabilità o causalità. Distingui BNB, BNB Chain, token, pool e protocollo. Dai più peso ai dati on-chain quando esistono; quando il contratto BSC o altri dati mancano, dichiaralo. Le previsioni sono stime condizionate, non certezze né ordini di acquisto.`;
    const input=`CONTESTO KIBER V27.1:\n${JSON.stringify(context)}\n\nDOMANDA:\n${question}`;
    try{const out=await callProvider({instructions,input});return res.status(200).json({...out,analysisMode:mode,version:'27.1'})}
    catch(aiError){return res.status(200).json({answer:deterministic(body),provider:'deterministic',model:null,analysisMode:mode,version:'27.1',warning:String(aiError.message||aiError).slice(0,220)})}
  }catch(e){return res.status(500).json({error:'Kiber backend error',detail:String(e.message||e).slice(0,180)})}
};