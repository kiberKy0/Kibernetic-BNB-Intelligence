module.exports=async function handler(req,res){
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  if(!process.env.OPENAI_API_KEY)return res.status(503).json({error:'AI backend not configured'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const cleanNum=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
    const sector=body.sector?{title:String(body.sector.title||'').slice(0,120),text:String(body.sector.text||'').slice(0,2600),metrics:String(body.sector.metrics||'').slice(0,1000),risks:String(body.sector.risks||'').slice(0,1000)}:null;
    const token=body.token?{
      symbol:body.token.baseToken?.symbol||body.token.symbol,name:body.token.baseToken?.name||body.token.name,address:body.token.address,
      sector:body.token.sector,subsector:body.token.subsector,priceUsd:cleanNum(body.token.priceUsd??body.token.price),priceChange24h:cleanNum(body.token.priceChange?.h24??body.token.change24),
      liquidityUsd:cleanNum(body.token.liquidity?.usd??body.token.liquidityUsd??body.token.liquidity),volume24h:cleanNum(body.token.volume?.h24??body.token.volume24hUsd??body.token.volume),
      buys24h:cleanNum(body.token.txns?.h24?.buys??body.token.buys24h),sells24h:cleanNum(body.token.txns?.h24?.sells??body.token.sells24h),marketCap:cleanNum(body.token.marketCap||body.token.fdv),
      riskScore:cleanNum(body.token.riskScore),pairCount:cleanNum(body.token.pairCount),dexes:Array.isArray(body.token.dexes)?body.token.dexes.slice(0,8):[]
    }:null;
    const allowed=['movement','news','risk','summary','chain','market','fundamentals','compare','token360','scenario','newsimpact','projectquality','strategy'];
    const mode=allowed.includes(String(body.analysisMode||''))?String(body.analysisMode):'general';
    const bnb={price:cleanNum(body.bnb?.price),change24:cleanNum(body.bnb?.change24),marketCap:cleanNum(body.bnb?.marketCap),fdv:cleanNum(body.bnb?.fdv),volume24:cleanNum(body.bnb?.volume24),high24:cleanNum(body.bnb?.high24),low24:cleanNum(body.bnb?.low24)};
    const chain={name:String(body.chain?.name||'BNB Smart Chain').slice(0,80),tvl:cleanNum(body.chain?.tvl),stablecoins:cleanNum(body.chain?.stablecoins),dexVolume24:cleanNum(body.chain?.dexVolume24),dexVolume7d:cleanNum(body.chain?.dexVolume7d),dexChange1d:cleanNum(body.chain?.dexChange1d),dexChange7d:cleanNum(body.chain?.dexChange7d),tvlToBnbMarketCapPct:cleanNum(body.chain?.tvlToBnbMarketCapPct),stablecoinsToTvlPct:cleanNum(body.chain?.stablecoinsToTvlPct),dexVolumeToTvlPct:cleanNum(body.chain?.dexVolumeToTvlPct)};
    const intelligence=body.intelligence?{
      chain:{tvl:cleanNum(body.intelligence.chain?.tvl),dexVolume24:cleanNum(body.intelligence.chain?.dexVolume24),dexVolume7d:cleanNum(body.intelligence.chain?.dexVolume7d),dexChange1d:cleanNum(body.intelligence.chain?.dexChange1d),dexChange7d:cleanNum(body.intelligence.chain?.dexChange7d)},
      marketRadar:{attention:(body.intelligence.marketRadar?.attention||[]).slice(0,10)},fundamentals:{protocols:(body.intelligence.fundamentals?.protocols||[]).slice(0,12)}
    }:null;
    const ti=body.tokenIntel?{
      updatedAt:body.tokenIntel.updatedAt,period:body.tokenIntel.period,token:body.tokenIntel.token||null,technical:body.tokenIntel.technical?{ema20:cleanNum(body.tokenIntel.technical.ema20),ema50:cleanNum(body.tokenIntel.technical.ema50),rsi14:cleanNum(body.tokenIntel.technical.rsi14),volatility:cleanNum(body.tokenIntel.technical.volatility),volumeTrend:cleanNum(body.tokenIntel.technical.volumeTrend),momentum:cleanNum(body.tokenIntel.technical.momentum),support:cleanNum(body.tokenIntel.technical.support),resistance:cleanNum(body.tokenIntel.technical.resistance),supportMajor:cleanNum(body.tokenIntel.technical.supportMajor),resistanceMajor:cleanNum(body.tokenIntel.technical.resistanceMajor)}:null,
      outlook:body.tokenIntel.outlook||null,projectQuality:body.tokenIntel.projectQuality||null,holders:body.tokenIntel.holders||null,sources:body.tokenIntel.sources||[]
    }:null;
    const marketNews=(body.marketNews?.items||body.news||[]).slice(0,20).map(x=>({title:x.title,source:x.source,published:x.published,category:x.category,impact:x.impact,tone:x.tone,trust:x.trust,relevance:x.relevance,url:x.url}));
    const discovery=(body.discovery?.candidates||[]).slice(0,10).map(x=>({symbol:x.symbol,name:x.name,address:x.address,score:cleanNum(x.score),label:x.label,why:x.why,risks:x.risks,metrics:x.metrics}));
    const dossierFromAnalysis=body.analysis?.dossier||body.dossier||null;
    const context={version:'26.0',analysisMode:mode,profile:body.profile?{name:String(body.profile.name||'').slice(0,80),mode:String(body.profile.mode||'').slice(0,30)}:null,bnb,chain,intelligence,sector,token,tokenIntel:ti,marketNews,discovery,watchlist:(body.watchlist||[]).slice(0,18),analysis:body.analysis?{history:body.analysis.history||null}:null,dossier:dossierFromAnalysis?{tokens:(dossierFromAnalysis.tokens||[]).slice(0,8),news:(dossierFromAnalysis.news||[]).slice(0,8)}:null,conversation:(body.conversation||[]).slice(-10).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'').slice(0,1800)}))};
    const guide={
      movement:'MOTORE MOVIMENTO: spiega il movimento osservato incrociando prezzo, variazione, volume, liquidità, buy/sell, tecnico, BNB, chain e notizie. Cerca conferme e contraddizioni.',
      news:'MOTORE NEWS: valuta le notizie una per una e classifica il nesso con il mercato come forte, moderato, debole o insufficiente. Una coincidenza temporale non è causalità.',
      risk:'MOTORE RISCHIO: usa soltanto rischi misurabili. Evidenzia dati mancanti su holder, contratto, bridge o audit senza inventarli.',
      summary:'MOTORE SINTESI: unisci BNB, chain, token, storico, news, dossier e Intelligence Center separando fatti, ipotesi, elementi contrari e prossimi controlli.',
      chain:'CHAIN PULSE: interpreta BNB, TVL, stablecoin, DEX volume e rapporti strutturali. Cerca divergenze tra prezzo e attività on-chain.',
      market:'DEX RADAR: tratta nuovi pool e Attention Score come segnali di attività/anomalia, mai come segnali automatici di acquisto.',
      fundamentals:'FUNDAMENTALS: confronta TVL, crescita, fees/revenue e score interni. Evidenzia ciò che è realmente misurato e ciò che manca.',
      compare:'COMPARATORE: confronta solo gli elementi forniti, mostrando forza, debolezza e dati mancanti.',
      token360:'TOKEN 360 V26: crea una lettura completa del token. Ordine: quadro attuale; trend tecnico; volume/liquidità/flow; livelli supporto-resistenza; news rilevanti e loro impatto plausibile; holder se disponibili; qualità del progetto; scenario rialzista; scenario ribassista; invalidazioni; rischi; prossime verifiche. Ogni affermazione deve derivare dai dati nel contesto.',
      scenario:'SCENARIO 24-72H: usa lo score direzionale come indicatore interno, non come probabilità. Descrivi scenario rialzista, ribassista e laterale, trigger osservabili, livelli di invalidazione e quali segnali farebbero cambiare lettura. Non dare target di prezzo inventati.',
      newsimpact:'NEWS IMPACT: ordina le notizie per impatto e affidabilità, spiega il canale attraverso cui potrebbero influire sul token/BNB Chain e indica se prezzo, volume e flussi stanno già confermando oppure no.',
      projectquality:'QUALITÀ PROGETTO: valuta solo evidenze verificabili disponibili: età pool, liquidità, market cap/FDV, turnover, numero pool/DEX, sito/social dichiarati, holder se disponibili, struttura dei flussi. Non confondere presenza social o boost pubblicitari con affidabilità.',
      strategy:'STRATEGIA DI MONITORAGGIO: non impartire ordini di acquisto/vendita. Definisci invece condizioni operative da sorvegliare: conferme, invalidazioni, rischi, livelli tecnici, variazioni di volume/liquidità, news e holder. Spiega quando la tesi deve essere rivalutata.',
      general:'Usa il contesto completo e rispondi in modo analitico e verificabile.'
    }[mode];
    const instructions=`Sei Kiber, motore di intelligence della piattaforma Kiber BNB Chain V26. Parla in italiano chiaro e professionale. Il tuo compito è trasformare dati multi-fonte in analisi comprensibili, non vendere certezze.\n\nDistingui sempre CHAIN, PROTOCOLLO, POOL e TOKEN. Usa soltanto valori presenti nel contesto. Dati null o assenti restano mancanti. Non inventare fonti, eventi, market cap, holder, target, probabilità o relazioni causali. Gli score Kiber sono indicatori deterministici interni, non probabilità di rendimento. Le stime rialziste/ribassiste devono essere presentate come scenari condizionati da trigger e invalidazioni.\n\nPer le notizie: valuta freschezza, fonte, rilevanza, impatto e conferma di mercato. Per progetti a bassa capitalizzazione: evidenzia anche rischio di liquidità, età del pool, dati incompleti e possibili distorsioni promozionali. Non chiamare un progetto “sicuro” o “garantito”.\n\n${guide}\n\nFormato preferito: sintetico ma completo, con sezioni chiare. Rendi sempre evidente 1) cosa osservi, 2) perché conta, 3) cosa conferma, 4) cosa contraddice, 5) cosa monitorare dopo.`;
    const question=String(body.message||'').slice(0,3200);
    const input=`CONTESTO KIBER V26:\n${JSON.stringify(context)}\n\nDOMANDA / MOTORE:\n${question}`;
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+process.env.OPENAI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-6-luna',instructions,input,max_output_tokens:1900})});
    const d=await r.json();if(!r.ok)return res.status(502).json({error:d.error?.message||'OpenAI error'});
    const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';if(!answer)return res.status(502).json({error:'Empty OpenAI response'});
    return res.status(200).json({answer,model:process.env.OPENAI_MODEL||'gpt-6-luna',analysisMode:mode,version:'26.0'});
  }catch(e){return res.status(500).json({error:'Kiber backend error'})}
};
