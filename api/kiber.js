module.exports = async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY) return res.status(503).json({error:'AI backend not configured'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const context={capital:body.capital||0,bnb:body.bnb||{},token:body.token?{symbol:body.token.baseToken?.symbol,name:body.token.baseToken?.name,priceUsd:body.token.priceUsd,priceChange24h:body.token.priceChange?.h24,liquidityUsd:body.token.liquidity?.usd,volume24h:body.token.volume?.h24,txns24h:body.token.txns?.h24,marketCap:body.token.marketCap||body.token.fdv}:null,news:(body.news||[]).map(n=>({title:n.title,source:n.source,category:n.category})).slice(0,8)};
    const prompt=`Sei Kiber, assistente della dashboard Kibernetic BNB Intelligence. Rispondi in italiano, breve e concreto. Usa solo il contesto fornito per i dati di mercato. Non inventare prezzi o notizie. Distingui fatti da scenari. Non dare ordini finanziari; spiega rischi, cosa sta succedendo, possibili motivi e cosa monitorare.\n\nCONTESTO:\n${JSON.stringify(context)}\n\nDOMANDA:\n${String(body.message||'').slice(0,1500)}`;
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5.6-luna',input:prompt,max_output_tokens:500})});
    const d=await r.json();if(!r.ok) return res.status(502).json({error:d.error?.message||'OpenAI error'});
    const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';
    res.status(200).json({answer});
  }catch(e){res.status(500).json({error:'Kiber backend error'});}
}
