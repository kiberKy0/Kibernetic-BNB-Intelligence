module.exports=async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI backend not configured'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const cleanNum=v=>Number.isFinite(Number(v))?Number(v):null;
    const sector=body.sector?{
      title:String(body.sector.title||'').slice(0,120),text:String(body.sector.text||'').slice(0,2600),
      metrics:String(body.sector.metrics||'').slice(0,1000),risks:String(body.sector.risks||'').slice(0,1000)
    }:null;
    const token=body.token?{
      symbol:body.token.baseToken?.symbol||body.token.symbol,name:body.token.baseToken?.name||body.token.name,address:body.token.address,
      sector:body.token.sector,subsector:body.token.subsector,priceUsd:cleanNum(body.token.priceUsd),
      priceChange24h:cleanNum(body.token.priceChange?.h24??body.token.change24),liquidityUsd:cleanNum(body.token.liquidity?.usd??body.token.liquidityUsd),
      volume24h:cleanNum(body.token.volume?.h24??body.token.volume24hUsd),buys24h:cleanNum(body.token.txns?.h24?.buys??body.token.buys24h),
      sells24h:cleanNum(body.token.txns?.h24?.sells??body.token.sells24h),marketCap:cleanNum(body.token.marketCap||body.token.fdv),
      riskScore:cleanNum(body.token.riskScore),pairCount:cleanNum(body.token.pairCount),dexes:Array.isArray(body.token.dexes)?body.token.dexes.slice(0,8):[]
    }:null;
    const mode=['movement','news','risk','summary'].includes(String(body.analysisMode||''))?String(body.analysisMode):'general';
    const bnb={
      price:cleanNum(body.bnb?.price),change24:cleanNum(body.bnb?.change24),marketCap:cleanNum(body.bnb?.marketCap),
      fdv:cleanNum(body.bnb?.fdv),volume24:cleanNum(body.bnb?.volume24),high24:cleanNum(body.bnb?.high24),low24:cleanNum(body.bnb?.low24)
    };
    const chain={
      name:String(body.chain?.name||'BNB Smart Chain').slice(0,80),tvl:cleanNum(body.chain?.tvl),stablecoins:cleanNum(body.chain?.stablecoins),
      dexVolume24:cleanNum(body.chain?.dexVolume24),dexVolume7d:cleanNum(body.chain?.dexVolume7d),dexChange1d:cleanNum(body.chain?.dexChange1d),
      dexChange7d:cleanNum(body.chain?.dexChange7d),tvlToBnbMarketCapPct:cleanNum(body.chain?.tvlToBnbMarketCapPct),
      stablecoinsToTvlPct:cleanNum(body.chain?.stablecoinsToTvlPct),dexVolumeToTvlPct:cleanNum(body.chain?.dexVolumeToTvlPct)
    };
    const context={
      version:'23.5',analysisMode:mode,
      profile:body.profile?{name:String(body.profile.name||'').slice(0,80),mode:String(body.profile.mode||'').slice(0,30)}:null,
      bnb,chain,sector,token,
      watchlist:(body.watchlist||[]).slice(0,18).map(w=>({symbol:w.symbol,name:w.name,priceUsd:cleanNum(w.priceUsd??w.price),change24:cleanNum(w.change24),liquidity:cleanNum(w.liquidity),volume24:cleanNum(w.volume24??w.volume),risk:w.risk,note:w.note})),
      analysis:body.analysis?{
        history:body.analysis.history||null,
        dossier:body.analysis.dossier?{tokens:(body.analysis.dossier.tokens||[]).slice(0,8).map(t=>({symbol:t.symbol,name:t.name,address:t.address,sector:t.sector})),news:(body.analysis.dossier.news||[]).slice(0,8).map(n=>({title:n.title,source:n.source,why:n.why,published:n.published}))}:null
      }:null,
      news:(body.news||[]).slice(0,15).map(n=>({title:n.title,source:n.source||n.publisher,category:n.category,impact:n.impact,why:n.why,published:n.published,tokenAddresses:(n.token_addresses||[]).slice(0,8)})),
      conversation:(body.conversation||[]).slice(-10).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'').slice(0,1800)}))
    };
    const modeGuide={
      movement:'MOTORE MOVIMENTO: parti dal movimento osservato. Incrocia prezzo, variazione, volume, liquidità, buy/sell, storico, BNB e metriche chain. Cerca conferme e contraddizioni. Collega le news solo quando il timing e i dati rendono il nesso plausibile.',
      news:'MOTORE NEWS: valuta le notizie una per una. Classifica il collegamento al movimento come forte, moderato, debole o insufficiente, spiegando quali dati lo sostengono e cosa manca. Non trasformare una coincidenza temporale in causalità.',
      risk:'MOTORE RISCHIO: usa solo rischi misurabili dai dati ricevuti. Considera liquidità, volume, volatilità, drawdown, buy/sell, market cap, qualità delle fonti e dati chain. Se concentrazione, contract risk o bridge flow non sono presenti, dichiarali mancanti invece di inventarli.',
      summary:'MOTORE SINTESI: unisci BNB, BSC, token, storico, watchlist, news e dossier. Separa chiaramente fatti osservati, ipotesi plausibili, elementi contrari e prossimi controlli. Dai priorità ai segnali che convergono da più fonti.',
      general:'Usa il contesto completo e rispondi alla domanda in modo analitico e verificabile.'
    }[mode];
    const instructions=`Sei Kiber, l'intelligenza interattiva della dashboard Kiber BNB Intelligence V23.5. Parla in italiano chiaro, naturale e concreto. Sei diretto, curioso e preciso, ma scettico quando le prove sono deboli.

Usa il contesto come un unico quadro: BNB, metriche aggregate BNB Smart Chain, token, prezzo, variazione, liquidità, volume, buy/sell, rischio, storico, watchlist, notizie, settore, dossier e conversazione. Distingui sempre livello CHAIN e livello TOKEN.

Regole sui dati: non inventare mai prezzi, market cap, TVL, liquidità, volume, notizie, fonti o relazioni causali. Un dato null o assente resta mancante. Una notizia vicina a un movimento è solo una possibile spiegazione finché timing e dati di mercato non convergono. Distingui fatti osservati, interpretazioni e scenari.

${modeGuide}

Quando produci un'analisi, rendi evidente: 1) cosa osservi, 2) cosa potrebbe spiegarlo e con quale forza qualitativa, 3) cosa indebolisce o contraddice la lettura, 4) cosa controllare dopo. Non usare percentuali di confidenza inventate. Per politica, regolamentazione o autorità pubbliche resta neutrale e descrittivo.`;
    const question=String(body.message||'').slice(0,2600);
    const input=`CONTESTO KIBER V23.5:\n${JSON.stringify(context)}\n\nDOMANDA / MOTORE:\n${question}`;
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-6-luna',instructions,input,max_output_tokens:1400})
    });
    const d=await r.json();
    if(!r.ok)return res.status(502).json({error:d.error?.message||'OpenAI error'});
    const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';
    if(!answer)return res.status(502).json({error:'Empty OpenAI response'});
    return res.status(200).json({answer,model:process.env.OPENAI_MODEL||'gpt-6-luna',analysisMode:mode,version:'23.5'});
  }catch(e){
    return res.status(500).json({error:'Kiber backend error'});
  }
};
