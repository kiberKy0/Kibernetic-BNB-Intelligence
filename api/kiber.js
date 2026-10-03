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
      sector:body.token.sector,subsector:body.token.subsector,priceUsd:cleanNum(body.token.priceUsd??body.token.price),
      priceChange24h:cleanNum(body.token.priceChange?.h24??body.token.change24),liquidityUsd:cleanNum(body.token.liquidity?.usd??body.token.liquidityUsd??body.token.liquidity),
      volume24h:cleanNum(body.token.volume?.h24??body.token.volume24hUsd??body.token.volume),buys24h:cleanNum(body.token.txns?.h24?.buys??body.token.buys24h),
      sells24h:cleanNum(body.token.txns?.h24?.sells??body.token.sells24h),marketCap:cleanNum(body.token.marketCap||body.token.fdv),
      riskScore:cleanNum(body.token.riskScore),pairCount:cleanNum(body.token.pairCount),dexes:Array.isArray(body.token.dexes)?body.token.dexes.slice(0,8):[]
    }:null;
    const allowed=['movement','news','risk','summary','chain','market','fundamentals','compare'];
    const mode=allowed.includes(String(body.analysisMode||''))?String(body.analysisMode):'general';
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
    const intelligence=body.intelligence?{
      chain:{
        tvl:cleanNum(body.intelligence.chain?.tvl),dexVolume24:cleanNum(body.intelligence.chain?.dexVolume24),dexVolume7d:cleanNum(body.intelligence.chain?.dexVolume7d),
        dexChange1d:cleanNum(body.intelligence.chain?.dexChange1d),dexChange7d:cleanNum(body.intelligence.chain?.dexChange7d)
      },
      marketRadar:{attention:(body.intelligence.marketRadar?.attention||[]).slice(0,10).map(x=>({name:x.name,ageHours:cleanNum(x.ageHours),liquidityUsd:cleanNum(x.liquidityUsd),volume24h:cleanNum(x.volume24h),change1h:cleanNum(x.change1h),change24h:cleanNum(x.change24h),buys1h:cleanNum(x.buys1h),sells1h:cleanNum(x.sells1h),attentionScore:cleanNum(x.attentionScore)}))},
      fundamentals:{protocols:(body.intelligence.fundamentals?.protocols||[]).slice(0,12).map(x=>({name:x.name,category:x.category,tvl:cleanNum(x.tvl),mcap:cleanNum(x.mcap),change1d:cleanNum(x.change1d),change7d:cleanNum(x.change7d),fees24:cleanNum(x.fees24),fees7d:cleanNum(x.fees7d),revenue24:cleanNum(x.revenue24),fundamentalScore:cleanNum(x.fundamentalScore)}))}
    }:null;
    const dossierFromAnalysis=body.analysis?.dossier||body.dossier||null;
    const context={
      version:'24.0',analysisMode:mode,
      profile:body.profile?{name:String(body.profile.name||'').slice(0,80),mode:String(body.profile.mode||'').slice(0,30)}:null,
      bnb,chain,intelligence,sector,token,
      watchlist:(body.watchlist||[]).slice(0,18).map(w=>({symbol:w.symbol,name:w.name,priceUsd:cleanNum(w.priceUsd??w.price),change24:cleanNum(w.change24),liquidity:cleanNum(w.liquidity),volume24:cleanNum(w.volume24??w.volume),risk:w.risk,note:w.note})),
      analysis:body.analysis?{history:body.analysis.history||null}:null,
      dossier:dossierFromAnalysis?{
        tokens:(dossierFromAnalysis.tokens||[]).slice(0,8).map(t=>({symbol:t.symbol,name:t.name,address:t.address,sector:t.sector})),
        news:(dossierFromAnalysis.news||[]).slice(0,8).map(n=>({title:n.title,source:n.source,why:n.why,published:n.published}))
      }:null,
      news:(body.news||[]).slice(0,15).map(n=>({title:n.title,source:n.source||n.publisher,category:n.category,impact:n.impact,why:n.why||n.why_it_matters,published:n.published||n.published_at,tokenAddresses:(n.token_addresses||[]).slice(0,8)})),
      conversation:(body.conversation||[]).slice(-10).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'').slice(0,1800)}))
    };
    const modeGuide={
      movement:'MOTORE MOVIMENTO: parti dal movimento osservato. Incrocia prezzo, variazione, volume, liquidità, buy/sell, storico, BNB e metriche chain. Cerca conferme e contraddizioni. Collega le news solo quando timing e dati rendono il nesso plausibile.',
      news:'MOTORE NEWS: valuta le notizie una per una. Classifica il collegamento al movimento come forte, moderato, debole o insufficiente e spiega perché. Non trasformare una coincidenza temporale in causalità.',
      risk:'MOTORE RISCHIO: usa soltanto rischi misurabili dai dati ricevuti. Considera liquidità, volume, volatilità, drawdown, buy/sell, market cap, qualità delle fonti e dati chain. Dati assenti restano assenti.',
      summary:'MOTORE SINTESI: unisci BNB, BSC, token, storico, watchlist, news, dossier e Intelligence Center. Separa fatti, ipotesi plausibili, elementi contrari e prossimi controlli.',
      chain:'CHAIN PULSE: interpreta BNB price, market cap, TVL, stablecoin, DEX volume e rapporti strutturali. Spiega cosa misurano e quali segnali convergono o divergono. Non chiamare bullish o bearish un singolo rapporto senza conferme.',
      market:'DEX RADAR: analizza i nuovi pool e gli Attention Score come segnali di attività/anomalia, non come segnali di acquisto. Evidenzia volume/liquidità, intensità delle transazioni, variazioni rapide, età del pool e possibili rischi di liquidità.',
      fundamentals:'FUNDAMENTALS: confronta protocolli BSC usando TVL, variazioni 1d/7d, fees/revenue quando presenti e Kiber Fundamentals Score. Il punteggio è una metrica interna, non una certificazione. Evidenzia i dati mancanti.',
      compare:'COMPARATORE: confronta solo i protocolli passati nel contesto. Mostra punti di forza, debolezze, divergenze tra TVL/crescita/fees e quali dati aggiuntivi servono prima di trarre conclusioni.',
      general:'Usa il contesto completo e rispondi alla domanda in modo analitico e verificabile.'
    }[mode];
    const instructions=`Sei Kiber, l'intelligenza interattiva della dashboard Kiber BNB Intelligence V24.0. Parla in italiano chiaro, naturale e concreto. Sei diretto, curioso, preciso e scettico quando le prove sono deboli.

Usa il contesto come un unico quadro: BNB, metriche aggregate BNB Smart Chain, Intelligence Center V24, token, prezzo, variazione, liquidità, volume, buy/sell, storico, watchlist, notizie, settore, dossier e conversazione. Distingui sempre livello CHAIN, PROTOCOLLO, POOL e TOKEN.

Regole sui dati: non inventare mai prezzi, market cap, TVL, liquidità, volume, fees, revenue, notizie, fonti o relazioni causali. Un dato null o assente resta mancante. Una notizia vicina a un movimento è soltanto una possibile spiegazione finché timing e dati di mercato non convergono. Distingui fatti osservati, interpretazioni e scenari. Gli score Kiber sono strumenti interni di priorità/lettura e non previsioni di rendimento.

${modeGuide}

Quando produci un'analisi, rendi evidente: 1) cosa osservi, 2) cosa potrebbe spiegarlo e con quale forza qualitativa, 3) cosa indebolisce o contraddice la lettura, 4) cosa controllare dopo. Non usare percentuali di confidenza inventate. Per politica, regolamentazione o autorità pubbliche resta neutrale e descrittivo.`;
    const question=String(body.message||'').slice(0,2800);
    const input=`CONTESTO KIBER V24.0:\n${JSON.stringify(context)}\n\nDOMANDA / MOTORE:\n${question}`;
    const r=await fetch('https://api.openai.com/v1/responses',{
      method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},
      body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-6-luna',instructions,input,max_output_tokens:1500})
    });
    const d=await r.json();
    if(!r.ok)return res.status(502).json({error:d.error?.message||'OpenAI error'});
    const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';
    if(!answer)return res.status(502).json({error:'Empty OpenAI response'});
    return res.status(200).json({answer,model:process.env.OPENAI_MODEL||'gpt-6-luna',analysisMode:mode,version:'24.0'});
  }catch(e){
    return res.status(500).json({error:'Kiber backend error'});
  }
};
