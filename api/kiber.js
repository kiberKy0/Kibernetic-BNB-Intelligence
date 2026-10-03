module.exports=async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI backend not configured'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const sector=body.sector?{
      title:String(body.sector.title||'').slice(0,120),
      text:String(body.sector.text||'').slice(0,2600),
      metrics:String(body.sector.metrics||'').slice(0,1000),
      risks:String(body.sector.risks||'').slice(0,1000)
    }:null;
    const token=body.token?{
      symbol:body.token.baseToken?.symbol||body.token.symbol,
      name:body.token.baseToken?.name||body.token.name,
      address:body.token.address,
      sector:body.token.sector,
      subsector:body.token.subsector,
      priceUsd:body.token.priceUsd,
      priceChange24h:body.token.priceChange?.h24??body.token.change24,
      liquidityUsd:body.token.liquidity?.usd??body.token.liquidityUsd,
      volume24h:body.token.volume?.h24??body.token.volume24hUsd,
      buys24h:body.token.txns?.h24?.buys??body.token.buys24h,
      sells24h:body.token.txns?.h24?.sells??body.token.sells24h,
      marketCap:body.token.marketCap||body.token.fdv,
      riskScore:body.token.riskScore,
      pairCount:body.token.pairCount,
      dexes:Array.isArray(body.token.dexes)?body.token.dexes.slice(0,8):[]
    }:null;
    const context={
      profile:body.profile?{
        name:String(body.profile.name||'').slice(0,80),
        avatar:String(body.profile.avatar||'').slice(0,16),
        mode:String(body.profile.mode||'').slice(0,30)
      }:null,
      capital:body.capital||0,
      bnb:body.bnb||{},
      chain:body.chain||{},
      sector,
      token,
      watchlist:(body.watchlist||[]).slice(0,18).map(w=>({
        symbol:w.symbol,
        name:w.name,
        priceUsd:w.priceUsd??w.price,
        change24:w.change24,
        liquidity:w.liquidity,
        volume24:w.volume24??w.volume,
        risk:w.risk,
        note:w.note
      })),
      analysis:body.analysis?{
        history:body.analysis.history||null,
        dossier:body.analysis.dossier?{
          tokens:(body.analysis.dossier.tokens||[]).slice(0,8).map(t=>({symbol:t.symbol,name:t.name,address:t.address,sector:t.sector})),
          news:(body.analysis.dossier.news||[]).slice(0,8).map(n=>({title:n.title,source:n.source,why:n.why,published:n.published}))
        }:null
      }:null,
      news:(body.news||[]).slice(0,15).map(n=>({
        title:n.title,
        source:n.source||n.publisher,
        category:n.category,
        impact:n.impact,
        why:n.why,
        published:n.published,
        tokenAddresses:(n.token_addresses||[]).slice(0,8)
      })),
      conversation:(body.conversation||[]).slice(-10).map(m=>({
        role:m.role==='assistant'?'assistant':'user',
        content:String(m.content||'').slice(0,1800)
      }))
    };
    const instructions=`Sei Kiber, l'intelligenza interattiva della dashboard Kiber BNB Intelligence. Parla in italiano chiaro, naturale e concreto. Hai una personalità riconoscibile da analista: diretto, curioso, preciso e scettico quando le prove sono deboli. Non fare teatro e non riempire lo spazio con frasi generiche.

Usa tutto il contesto ricevuto come un unico quadro: token, prezzo, variazione, liquidità, volume, buy/sell, rischio, storico, watchlist, notizie, settore, dossier e conversazione recente. Mantieni continuità con le richieste precedenti della sessione.

Regole sui dati: non inventare mai prezzi, market cap, notizie, fonti, metriche o relazioni causali. Se un dato manca, dillo. Se una notizia è vicina nel tempo a un movimento, trattala come possibile spiegazione e indica quali dati la rendono più o meno plausibile. Distingui sempre fatti osservati, interpretazioni e scenari possibili. Una correlazione temporale non è una prova di causa.

Quando l'utente chiede perché un token si muove o chiede un'analisi, costruisci la risposta in modo utile: 1) cosa osservi nei dati, 2) quali fattori possono spiegare il movimento e con quale forza, 3) cosa contraddice o indebolisce quella lettura, 4) cosa controllare dopo. Non usare titoli rigidi se una risposta breve è migliore, ma lascia sempre una conclusione comprensibile.

Per domande educative sui settori, spiega funzione, utilità, metriche e rischi. Non promettere rendimenti e non trasformare ipotesi in certezze. Per politica, regolamentazione o autorità pubbliche resta neutrale, descrittivo e separa fatti da interpretazioni.`;
    const question=String(body.message||'').slice(0,2200);
    const input=`CONTESTO KIBER:\n${JSON.stringify(context)}\n\nDOMANDA UTENTE:\n${question}`;
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',
      headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({
        model:process.env.OPENAI_MODEL||'gpt-6-luna',
        instructions,
        input,
        max_output_tokens:1200
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
