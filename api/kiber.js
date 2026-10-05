function num(v){return v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null)}
function money(v){v=num(v);if(v===null)return '—';const a=Math.abs(v);if(a>=1e12)return '$'+(v/1e12).toFixed(2)+'T';if(a>=1e9)return '$'+(v/1e9).toFixed(2)+'B';if(a>=1e6)return '$'+(v/1e6).toFixed(2)+'M';return '$'+v.toLocaleString('it-IT',{maximumFractionDigits:a<1?8:2})}
function pct(v){v=num(v);return v===null?'—':`${v>=0?'+':''}${v.toFixed(2)}%`}
const clip=(v,a=-100,b=100)=>Math.max(a,Math.min(b,v));
function oracleAssessment(body){
  const t=body?.token||{},ti=body?.tokenIntel||{},news=body?.marketNews||{},tech=ti?.technical||{},out=ti?.outlook||{},holders=ti?.holders||{};
  let score=0,weight=0;const drivers=[],risks=[],missing=[],votes=[];
  const add=(v,w,cap,label)=>{
    v=num(v);if(v===null){missing.push(label);return}
    const part=clip(v*w,-cap,cap);score+=part;weight+=cap;votes.push(Math.sign(part));drivers.push(`${label}: ${pct(v)}`);
  };
  if(t?.symbol||t?.name){
    add(t.change24,4,24,'Prezzo 24h');
    add(t.change7d,1.5,22,'Prezzo 7g');
    add(t.change30d,.6,18,'Prezzo 30g');
    const os=num(out.score);if(os!==null){score+=clip(os*.45,-30,30);weight+=30;votes.push(Math.sign(os));if(out.drivers?.[0])drivers.push(out.drivers[0]);if(out.warnings?.[0])risks.push(out.warnings[0])}else missing.push('outlook on-chain');
    const rsi=num(tech.rsi14);if(rsi!==null){weight+=8;if(rsi>=52&&rsi<=70){score+=8;votes.push(1);drivers.push('RSI costruttivo')}else if(rsi<42){score-=8;votes.push(-1);risks.push('RSI debole')}else if(rsi>76){score-=4;votes.push(-1);risks.push('RSI molto tirato')}else votes.push(0)}else missing.push('RSI');
    const ema20=num(tech.ema20),ema50=num(tech.ema50),price=num(t.price??t.priceUsd);
    if(ema20!==null&&ema50!==null){weight+=10;if(ema20>ema50){score+=10;votes.push(1);drivers.push('EMA20 sopra EMA50')}else{score-=10;votes.push(-1);risks.push('EMA20 sotto EMA50')}}else missing.push('EMA20/EMA50');
    const liq=num(ti?.token?.liquidityUsd??t.liquidityUsd);if(liq!==null){weight+=10;if(liq>=250000){score+=8;drivers.push('liquidità DEX robusta')}else if(liq<30000){score-=10;risks.push('liquidità bassa')}else score+=2}else missing.push('liquidità BSC');
    const q=num(ti?.projectQuality?.score);if(q!==null){weight+=8;score+=clip((q-50)*.16,-8,8);if(q<40)risks.push('struttura di mercato fragile')}else missing.push('quality score');
    if(holders?.available&&num(holders.top5Pct)!==null){weight+=6;const h=num(holders.top5Pct);if(h>65){score-=6;risks.push('concentrazione top holder elevata')}else if(h<35){score+=3;drivers.push('concentrazione holder più distribuita')}}else missing.push('holder concentration');
    const pos=num(news?.counts?.positive)||0,neg=num(news?.counts?.negative)||0,high=num(news?.counts?.high)||0;
    if(pos||neg||high){weight+=8;const d=clip((pos-neg)*2,-8,8);score+=d;votes.push(Math.sign(d));if(d>0)drivers.push('news recenti più costruttive');if(d<0)risks.push('news recenti più sfavorevoli')}else missing.push('news rilevanti');
    if(price!==null&&ema20!==null&&price<ema20)risks.push('prezzo sotto EMA20');
  }
  score=Math.round(clip(score));
  const active=votes.filter(v=>v!==0),posVotes=active.filter(v=>v>0).length,negVotes=active.filter(v=>v<0).length;
  const agreement=active.length?Math.max(posVotes,negVotes)/active.length:0;
  const direction=score>=22?'RIALZISTA':score<=-22?'RIBASSISTA':'NEUTRALE';
  const dataQuality=Math.round(clip((weight/144)*100,0,100));
  const convergence=dataQuality<35?'BASSA':agreement>=.72?'ALTA':agreement>=.55?'MEDIA':'BASSA';
  const invalidation=direction==='RIALZISTA'?(out?.triggers?.bearish||out?.triggers?.invalidation||'Perdita dei supporti con peggioramento di volume e flussi'):direction==='RIBASSISTA'?(out?.triggers?.bullish||out?.triggers?.invalidation||'Recupero delle resistenze con conferma di volume e flussi'):'Serve convergenza tra trend, volume, liquidità e flussi';
  return {direction,score,dataQuality,convergence,evidenceCount:active.length,drivers:[...new Set(drivers)].slice(0,5),risks:[...new Set(risks)].slice(0,5),missing:[...new Set(missing)].slice(0,6),invalidation};
}
function deterministic(body){
  const b=body?.bnb||{},c=body?.chain||{},t=body?.token||{};const q=String(body?.message||'').toLowerCase();
  if(t?.symbol||t?.name){
    const a=oracleAssessment(body),icon=a.direction==='RIALZISTA'?'🟢':a.direction==='RIBASSISTA'?'🔴':'🟡';
    return `${icon} ${a.direction}\n${t.name||t.symbol} (${t.symbol||'TOKEN'})\n\nPerché: ${a.drivers.slice(0,4).join(' · ')||'i segnali disponibili non convergono abbastanza.'}\n\nRischi/contraddizioni: ${a.risks.slice(0,3).join(' · ')||'nessuna contraddizione forte rilevata nei dati disponibili.'}\n\nQualità evidenze: ${a.dataQuality}/100 · Convergenza: ${a.convergence}. Non è una probabilità di rendimento.\n\nInvalidazione: ${a.invalidation}`;
  }
  let score=0,seen=0,reasons=[];const add=(v,w,label,cap=30)=>{v=num(v);if(v===null)return;score+=clip(v*w,-cap,cap);seen++;reasons.push(label.replace('{v}',pct(v)))};
  if(/chain|rete|tvl|dex/.test(q)){add(c.dexChange1d,2,'DEX 24h {v}');add(c.tvlChange7d,4,'TVL 7G {v}');add(c.tvlChange30d,1.2,'TVL 30G {v}')}
  else{add(b.change24,6,'BNB 24h {v}');if(num(b.volume24)!==null){seen++;reasons.push('volume 24h '+money(b.volume24))}}
  const label=!seen?'🟡 NEUTRALE':score>=18?'🟢 RIALZISTA':score<=-18?'🔴 RIBASSISTA':'🟡 NEUTRALE';
  return `${label}\n${/chain|rete|tvl|dex/.test(q)?'BNB Chain':'BNB'}\n\nPerché: ${reasons.slice(0,3).join(' · ')||'dati insufficienti per forzare una direzione.'}\n\nCosa può cambiare la lettura: variazioni significative di prezzo, volume, TVL, flussi DEX o nuove informazioni rilevanti.`;
}
async function gatewayCall(credential,{instructions,input}){
  const model=process.env.AI_GATEWAY_MODEL||'openai/gpt-6-luna';
  const r=await fetch('https://ai-gateway.vercel.sh/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+credential,'Content-Type':'application/json'},body:JSON.stringify({model,instructions,input,max_output_tokens:1800})});
  const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error?.message||`AI Gateway ${r.status}`);
  const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';if(!answer)throw new Error('Empty AI Gateway response');
  return {answer,provider:'vercel-ai-gateway',model};
}
async function callProvider({instructions,input}){
  const openaiKey=process.env.OPENAI_API_KEY||'',gatewayKey=process.env.AI_GATEWAY_API_KEY||'',oidc=process.env.VERCEL_OIDC_TOKEN||'';
  if(openaiKey){
    const model=process.env.OPENAI_MODEL||'gpt-6-luna';
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+openaiKey,'Content-Type':'application/json'},body:JSON.stringify({model,instructions,input,max_output_tokens:1800})});
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
    return res.status(200).json({ok:true,provider,ai:provider!=='deterministic',model:process.env.OPENAI_MODEL||process.env.AI_GATEWAY_MODEL||(provider==='vercel-ai-gateway'?'openai/gpt-6-luna':'gpt-6-luna'),version:'27.2',capabilities:['token360','scenario','risk','newsimpact','evidence-quality','contradictions']});
  }
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{},mode=String(body.analysisMode||'summary').slice(0,40);
    const token=body.token?{symbol:String(body.token.symbol||body.token.baseToken?.symbol||'').slice(0,30),name:String(body.token.name||body.token.baseToken?.name||'').slice(0,120),address:String(body.token.address||'').slice(0,80),price:num(body.token.price??body.token.priceUsd),change24:num(body.token.change24??body.token.priceChange?.h24),change7d:num(body.token.change7d),change30d:num(body.token.change30d),marketCap:num(body.token.marketCap??body.token.fdv),volume24:num(body.token.volume24??body.token.volume?.h24),liquidityUsd:num(body.token.liquidityUsd??body.token.liquidity?.usd),rank:num(body.token.rank),categories:Array.isArray(body.token.categories)?body.token.categories.slice(0,10):[]}:null;
    const normalized={...body,token};const assessment=token?oracleAssessment(normalized):null;
    const context={version:'27.2',analysisMode:mode,bnb:body.bnb||null,chain:body.chain||null,intelligence:body.intelligence||null,token,tokenIntel:body.tokenIntel||null,oracleAssessment:assessment,marketNews:body.marketNews?.items?{counts:body.marketNews.counts||null,items:body.marketNews.items.slice(0,18)}:body.marketNews||null,discovery:body.discovery?.candidates?{candidates:body.discovery.candidates.slice(0,8)}:body.discovery||null,chart:body.analysis?.chart||null,conversation:(body.conversation||[]).slice(-10).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'').slice(0,1600)}))};
    const question=String(body.message||'').slice(0,3200);
    const instructions=`Sei Kiber AI V27.2, motore di intelligence per BNB Chain. Rispondi in italiano, diretto, verificabile e prudente. Se analizzi un asset, apri con 🟢 RIALZISTA, 🟡 NEUTRALE o 🔴 RIBASSISTA solo quando le evidenze lo permettono. Poi separa: 1) cosa sostiene la lettura, 2) cosa la contraddice o aumenta il rischio, 3) cosa invaliderebbe lo scenario, 4) qualità delle evidenze. Usa esclusivamente il contesto fornito. Non inventare prezzi, holder, news, target, probabilità, rendimenti o causalità. Non chiamare "confidenza" una probabilità: usa qualità dati e convergenza. Dai più peso a liquidità, struttura del pool, trend tecnico, volume e flussi osservabili. Le news sono contesto, non prova di causalità. Se mancano dati cruciali dichiaralo chiaramente. Non dare ordini di acquisto/vendita e non promettere profitto.`;
    const input=`CONTESTO KIBER V27.2:\n${JSON.stringify(context)}\n\nDOMANDA:\n${question}`;
    try{const out=await callProvider({instructions,input});return res.status(200).json({...out,assessment,analysisMode:mode,version:'27.2'})}
    catch(aiError){return res.status(200).json({answer:deterministic(normalized),assessment,provider:'deterministic',model:null,analysisMode:mode,version:'27.2',warning:String(aiError.message||aiError).slice(0,220)})}
  }catch(e){return res.status(500).json({error:'Kiber backend error',detail:String(e.message||e).slice(0,180),version:'27.2'})}
};