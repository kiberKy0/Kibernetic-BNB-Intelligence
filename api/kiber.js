module.exports=async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI backend not configured'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const sector=body.sector?{
      title:String(body.sector.title||'').slice(0,120),
      text:String(body.sector.text||'').slice(0,2400),
      metrics:String(body.sector.metrics||'').slice(0,800),
      risks:String(body.sector.risks||'').slice(0,800)
    }:null;
    const context={
      capital:body.capital||0,
      bnb:body.bnb||{},
      chain:body.chain||{},
      sector,
      token:body.token?{
        symbol:body.token.baseToken?.symbol||body.token.symbol,
        name:body.token.baseToken?.name||body.token.name,
        priceUsd:body.token.priceUsd,
        priceChange24h:body.token.priceChange?.h24??body.token.change24,
        liquidityUsd:body.token.liquidity?.usd??body.token.liquidityUsd,
        volume24h:body.token.volume?.h24??body.token.volume24hUsd,
        txns24h:body.token.txns?.h24,
        marketCap:body.token.marketCap||body.token.fdv
      }:null,
      watchlist:(body.watchlist||[]).slice(0,12).map(w=>({
        symbol:w.symbol,
        priceUsd:w.priceUsd??w.price,
        change24:w.change24,
        liquidity:w.liquidity,
        volume24:w.volume24??w.volume,
        risk:w.risk,
        note:w.note
      })),
      analysis:body.analysis||null,
      news:(body.news||[]).slice(0,10).map(n=>({title:n.title,source:n.source||n.publisher,category:n.category}))
    };
    const instructions=`Sei Kiber, assistente educativo e di analisi della dashboard Kiber BNB Intelligence. Rispondi sempre in italiano chiaro, naturale e concreto. Se è presente un settore, usalo come contesto didattico: spiega termini, differenze, funzione, utilità, metriche e rischi senza trasformare la risposta in un elenco rigido, salvo quando aiuta davvero. Per dati di mercato usa soltanto il contesto ricevuto e non inventare prezzi, market cap, notizie o metriche mancanti. Distingui fatti osservati, interpretazioni e scenari possibili. Non promettere rendimenti e non presentare ipotesi come certezze. Se la domanda riguarda politica, regolamentazione o autorità pubbliche, resta neutrale e descrittivo.`;
    const question=String(body.message||'').slice(0,2000);
    const input=`CONTESTO KIBER:\n${JSON.stringify(context)}\n\nDOMANDA UTENTE:\n${question}`;
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL||'gpt-6-luna',
        instructions,
        input,
        max_output_tokens:800
      })
    });
    const d=await r.json();
    if(!r.ok)return res.status(502).json({error:d.error?.message||'OpenAI error'});
    const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';
    if(!answer)return res.status(502).json({error:'Empty OpenAI response'});
    return res.status(200).json({answer,model:process.env.OPENAI_MODEL||'gpt-6-luna'});
  }catch(e){
    return res.status(500).json({error:'Kiber backend error'});
  }
};