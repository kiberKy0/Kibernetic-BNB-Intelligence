const VERSION='27.5.1';
const num=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function pct(v){v=num(v);return v===null?'—':`${v>=0?'+':''}${v.toFixed(2)}%`}
function money(v){v=num(v);if(v===null)return'—';const a=Math.abs(v);if(a>=1e12)return'$'+(v/1e12).toFixed(2)+'T';if(a>=1e9)return'$'+(v/1e9).toFixed(2)+'B';if(a>=1e6)return'$'+(v/1e6).toFixed(2)+'M';if(a>=1e3)return'$'+(v/1e3).toFixed(1)+'K';return'$'+v.toLocaleString('it-IT',{maximumFractionDigits:a<1?8:2})}
function direction(score,threshold=22){return score>=threshold?'RIALZISTA':score<=-threshold?'RIBASSISTA':'NEUTRALE'}
function qualityLabel(score){return score>=80?'ALTA':score>=55?'MEDIA':'BASSA'}
function unique(a){return [...new Set(a.filter(Boolean))]}

function tokenEvaluation(body){
  const t=body?.token||{},i=body?.tokenIntel||{},news=body?.tokenNews||body?.marketNews||{};
  let score=0,present=0;const total=10,confirm=[],contradict=[],missing=[];
  const add=(v,w,cap,pos,neg)=>{v=num(v);if(v===null){missing.push(pos.split(' ')[0]);return}present++;const d=clamp(v*w,-cap,cap);score+=d;if(d>2)confirm.push(pos.replace('{v}',pct(v)));else if(d<-2)contradict.push(neg.replace('{v}',pct(v)))};
  add(t.change24,4,24,'24h {v}','24h {v}');
  add(t.change7d,1.5,22,'7g {v}','7g {v}');
  add(t.change30d,.6,18,'30g {v}','30g {v}');
  const os=num(i?.outlook?.score);if(os!==null){present++;score+=os*.42;(i?.outlook?.drivers||[]).slice(0,2).forEach(x=>confirm.push(x));(i?.outlook?.warnings||[]).slice(0,2).forEach(x=>contradict.push(x))}else missing.push('on-chain');
  const rsi=num(i?.technical?.rsi14);if(rsi!==null){present++;if(rsi>=52&&rsi<=70){score+=7;confirm.push(`RSI ${rsi.toFixed(0)} costruttivo`)}else if(rsi<42){score-=7;contradict.push(`RSI ${rsi.toFixed(0)} debole`)}else if(rsi>76){score-=4;contradict.push(`RSI ${rsi.toFixed(0)} molto tirato`)}}else missing.push('RSI');
  const vt=num(i?.technical?.volumeTrend);if(vt!==null){present++;if(vt>20){score+=6;confirm.push('volume in accelerazione')}else if(vt<-25){score-=5;contradict.push('volume in contrazione')}}else missing.push('trend volume');
  const buys=num(i?.token?.buys24h),sells=num(i?.token?.sells24h);if(buys!==null&&sells!==null&&buys+sells>10){present++;const im=(buys-sells)/(buys+sells);if(im>.12){score+=7;confirm.push('buy flow prevalente')}else if(im<-.12){score-=7;contradict.push('sell flow prevalente')}}else missing.push('buy/sell flow');
  const liq=num(i?.token?.liquidityUsd??t?.liquidityUsd);if(liq!==null){present++;if(liq>=250000){score+=4;confirm.push('liquidità BSC robusta')}else if(liq<30000){score-=14;contradict.push('liquidità BSC bassa')}}else missing.push('liquidità BSC');
  const pos=num(news?.counts?.positive)||0,neg=num(news?.counts?.negative)||0;if(news?.counts){present++;const d=pos-neg;score+=clamp(d*1.7,-7,7);if(d>=2)confirm.push('news recenti più costruttive');if(d<=-2)contradict.push('news recenti più sfavorevoli')}else missing.push('news');
  const qs=num(i?.projectQuality?.score);if(qs!==null){present++;if(qs<35){score-=8;contradict.push('struttura di mercato fragile')}else if(qs>=75)confirm.push('struttura di mercato solida nei dati osservabili')}else missing.push('qualità struttura');
  score=Math.round(clamp(score,-100,100));const quality=Math.round(clamp(present/total*100,0,100));
  return {subject:t?.name||t?.symbol||'Token',symbol:t?.symbol||'',score,direction:direction(score),quality,qualityLabel:qualityLabel(quality),confirmations:unique(confirm).slice(0,6),contradictions:unique(contradict).slice(0,6),missing:unique(missing).slice(0,6),liquidityUsd:liq,projectQuality:qs,horizon:'24-72h'};
}
function chainEvaluation(body){
  const b=body?.bnb||{},c=body?.chain||{},news=body?.marketNews||{};let score=0,present=0,total=6;const confirm=[],contradict=[],missing=[];
  const add=(v,w,cap,label)=>{v=num(v);if(v===null){missing.push(label);return}present++;const d=clamp(v*w,-cap,cap);score+=d;(d>=0?confirm:contradict).push(`${label} ${pct(v)}`)};
  add(b.change24,5,24,'BNB 24h');add(c.dexChange1d,2.2,20,'DEX 24h');add(c.dexChange7d,.8,14,'DEX 7g');add(c.tvlChange7d,3,18,'TVL 7g');add(c.tvlChange30d,1,12,'TVL 30g');
  if(news?.counts){present++;const bal=(num(news.counts.positive)||0)-(num(news.counts.negative)||0);score+=clamp(bal*2,-8,8);if(bal>=2)confirm.push('news più costruttive');if(bal<=-2)contradict.push('news più sfavorevoli')}else missing.push('news');
  score=Math.round(clamp(score,-100,100));const quality=Math.round(clamp(present/total*100,0,100));return{subject:'BNB Chain',score,direction:direction(score),quality,qualityLabel:qualityLabel(quality),confirmations:unique(confirm).slice(0,6),contradictions:unique(contradict).slice(0,6),missing:unique(missing).slice(0,6),horizon:'24-72h'};
}
function bnbEvaluation(body){
  const b=body?.bnb||{};let score=0,present=0,total=4;const confirm=[],contradict=[],missing=[];const ch=chainEvaluation(body);
  const v=num(b.change24);if(v!==null){present++;const d=clamp(v*6,-30,30);score+=d;(d>=0?confirm:contradict).push(`BNB 24h ${pct(v)}`)}else missing.push('BNB 24h');
  if(num(b.volume24)!==null){present++;confirm.push(`volume 24h ${money(b.volume24)}`)}else missing.push('volume');
  if(num(b.marketCap)!==null)present++;else missing.push('market cap');
  if(ch.quality>=50){present++;score+=ch.score*.22;(ch.score>=0?confirm:contradict).push(`contesto Chain ${ch.direction.toLowerCase()}`)}else missing.push('contesto Chain');
  score=Math.round(clamp(score,-100,100));const quality=Math.round(clamp(present/total*100,0,100));return{subject:'BNB',score,direction:direction(score),quality,qualityLabel:qualityLabel(quality),confirmations:unique(confirm).slice(0,6),contradictions:unique(contradict).slice(0,6),missing:unique(missing).slice(0,6),horizon:'24-72h'};
}
function enrichEvaluation(e){
  const pos=(e.confirmations||[]).length,neg=(e.contradictions||[]).length,total=pos+neg;
  const agree=total?Math.max(pos,neg)/total:0;
  return {...e,dataQuality:e.quality,evidenceCount:total,convergence:e.quality<40?'BASSA':agree>=.75?'ALTA':agree>=.55?'MEDIA':'BASSA'};
}
function chooseEvaluation(body){const e=(body?.token?.symbol||body?.token?.name)?tokenEvaluation(body):(body?.analysisSubject==='bnb'?bnbEvaluation(body):body?.analysisSubject==='chain'?chainEvaluation(body):(/chain|rete|tvl|dex/.test(String(body?.message||'').toLowerCase())?chainEvaluation(body):bnbEvaluation(body)));return enrichEvaluation(e)}
function icon(d){return d==='RIALZISTA'?'🟢':d==='RIBASSISTA'?'🔴':'🟡'}
function chartOracleFallback(body,e){
  const chart=body?.analysis?.chart||{},i=body?.tokenIntel||{},b=body?.bnb||{},ch=body?.chain||{},news=body?.marketNews||{},f=body?.analysis?.forensics||null;
  const t=i?.technical||{},token=i?.token||{},parts=[];
  parts.push(icon(e.direction)+' '+e.direction+' · '+e.subject+(e.symbol?' ('+e.symbol+')':''));
  const why=[...(e.confirmations||[]).slice(0,4),...(e.contradictions||[]).slice(0,3).map(x=>'contro: '+x)];
  parts.push('PERCHÉ È QUI\n'+(why.length?why.join(' · '):'I dati disponibili non spiegano ancora il movimento con sufficiente forza.'));
  const tech=[];if(num(t.rsi14)!==null)tech.push('RSI '+num(t.rsi14).toFixed(1));if(num(t.support)!==null)tech.push('supporto '+money(t.support));if(num(t.resistance)!==null)tech.push('resistenza '+money(t.resistance));if(num(t.volumeTrend)!==null)tech.push('trend volume '+pct(t.volumeTrend));if(chart.periodChange)tech.push('periodo '+String(chart.periodChange));if(chart.days)tech.push('finestra '+chart.days+' giorni');
  parts.push('GRAFICO E LIVELLI\n'+(tech.length?tech.join(' · '):'Livelli tecnici non sufficientemente disponibili dalla fonte corrente.'));
  const liq=num(token.liquidityUsd??e.liquidityUsd),flow=[];if(liq!==null)flow.push('liquidità '+money(liq));const buys=num(token.buys24h),sells=num(token.sells24h);if(buys!==null&&sells!==null)flow.push('buy/sell '+buys+'/'+sells);if(num(b.volume24)!==null)flow.push('volume BNB 24h '+money(b.volume24));if(num(ch.dexVolume24)!==null)flow.push('DEX BNB Chain 24h '+money(ch.dexVolume24));
  if(b.source)flow.push('fonte BNB: '+b.source+(b.volumeScope?' · '+b.volumeScope:''));
  parts.push('LIQUIDITÀ E FLUSSI\n'+(flow.length?flow.join(' · '):'Nessun dato di liquidità/flusso abbastanza completo per attribuire il movimento.'));
  const chain=[];if(num(b.change24)!==null)chain.push('BNB 24h '+pct(b.change24));if(num(ch.dexChange1d)!==null)chain.push('DEX 24h '+pct(ch.dexChange1d));if(num(ch.tvlChange7d)!==null)chain.push('TVL 7g '+pct(ch.tvlChange7d));if(num(ch.tvlChange30d)!==null)chain.push('TVL 30g '+pct(ch.tvlChange30d));const pos=num(news?.counts?.positive)||0,neg=num(news?.counts?.negative)||0;if(pos||neg)chain.push('news +'+pos+'/-'+neg);
  parts.push('CONTESTO ESTERNO\n'+(chain.length?chain.join(' · '):'Il contesto chain/news non è abbastanza completo in questa chiamata.'));
  if(f?.event){const ev=f.event,cy=f.cycles||{};parts.push('CICLO OSSERVATO\n'+String(ev.type||'evento')+' '+pct(ev.changePct)+' in '+(num(ev.durationHours)!==null?num(ev.durationHours).toFixed(1)+'h':'durata non disponibile')+(num(cy.sameTypeAvgGapHours)!==null?' · ricorrenza media '+(num(cy.sameTypeAvgGapHours)/24).toFixed(1)+' giorni':'')+'. Frequenza storica, non previsione certa.')} 
  const trigger=[];if(num(t.resistance)!==null)trigger.push('conferma sopra '+money(t.resistance)+' con volume');if(num(t.support)!==null)trigger.push('lettura indebolita sotto '+money(t.support));if(!trigger.length)trigger.push('serve convergenza tra prezzo, volume/liquidità e dati della chain');
  const scen=e.direction==='RIALZISTA'?'Struttura favorevole ma da confermare.':e.direction==='RIBASSISTA'?'Struttura debole: evitare di chiamare inversione finché non compaiono conferme.':'Equilibrio: al momento non c’è una rottura direzionale abbastanza supportata.';
  parts.push('SCENARIO\n'+scen+' '+trigger.join(' · ')+'.');
  parts.push('AFFIDABILITÀ\nQualità dati '+e.quality+'/100 ('+e.qualityLabel+'). Dati mancanti: '+((e.missing||[]).length?e.missing.join(', '):'nessuno tra quelli previsti')+'.');
  return parts.join('\n\n');
}
function deterministic(body){
  if(body?.analysis?.forensics)return forensicsFallback(body);
  const e=chooseEvaluation(body),mode=String(body?.analysisMode||'summary');if(mode==='chartoracle')return chartOracleFallback(body,e);const confirmations=e.confirmations.length?e.confirmations.join(' · '):'nessuna conferma forte';const contradictions=e.contradictions.length?e.contradictions.join(' · '):'nessuna contraddizione forte';const missing=e.missing.length?e.missing.join(', '):'nessun dato essenziale mancante';
  let focus='';if(mode==='risk')focus='\n\nRischio: concentra la verifica su liquidità, volatilità, struttura del pool, flussi e dati mancanti.';if(mode==='contrarian')focus='\n\nVerifica contrarian: i segnali che potrebbero rendere sbagliata questa lettura sono soprattutto quelli elencati tra le contraddizioni e le invalidazioni tecniche.';
  return `${icon(e.direction)} ${e.direction}\n${e.subject}${e.symbol?` (${e.symbol})`:''}\n\nConferme: ${confirmations}\n\nContraddizioni: ${contradictions}\n\nQualità dati: ${e.qualityLabel} (${e.quality}/100). Dati mancanti: ${missing}.\n\nCosa cambia la lettura: rottura dei livelli tecnici, inversione di volume/flussi, variazioni forti di liquidità, TVL/DEX o nuove informazioni ad alto impatto.${focus}\n\nKiber score ${e.score>=0?'+':''}${e.score}/100. È uno score di scenario, non una probabilità né una garanzia di rendimento.`;
}

function forensicsFallback(body){
  const f=body?.analysis?.forensics||{},ev=f.event||{},att=f.attribution||{},cy=f.cycles||{},ph=Array.isArray(f.phases)?f.phases:[];
  const type=String(ev.type||'EVENTO'),change=num(ev.changePct),hours=num(ev.durationHours),ratio=num(ev.volumeRatio),liq=num(att.historicalLiquidity),linked=Array.isArray(att.linkedNews)?att.linkedNews:[],cls=String(att.classification||'SCONOSCIUTA');
  const causes=Array.isArray(att.factors)&&att.factors.length?att.factors.join(' · '):'nessun movente esterno abbastanza documentato';
  const process=ph.length?ph.map(x=>String(x.label||'fase')+' '+pct(x.changePct)).join(' → '):'fasi non sufficientemente dettagliate';
  const gap=num(cy.sameTypeAvgGapHours),same=num(cy.sameTypeCount),mode=String(body?.analysisMode||'eventforensics');
  let tail='';
  if(mode==='cycles')tail='\n\nRicorrenza: '+(same===null?'—':same+' casi dello stesso tipo')+(gap===null?'':', intervallo medio '+(gap/24).toFixed(1)+' giorni')+'. È frequenza storica del campione, non una previsione certa.';
  if(mode==='futureimpact')tail='\n\nProssimo movimento: controllare conferma o inversione di volume, livelli tecnici, liquidità, flussi e nuove informazioni ad alto impatto. Se questi segnali non convergono, il responso deve restare prudente.';
  return type+' '+pct(change)+' in '+(hours===null?'—':hours.toFixed(1)+'h')+
    '\n\nMovente: '+cls+'. '+causes+
    '\n\nProcesso: '+process+
    '\n\nVolume: '+(ratio===null?'storico non sufficiente':ratio.toFixed(2)+'× rispetto alla finestra precedente')+
    '\n\nLiquidità storica: '+(liq===null?'non archiviata per questa data':money(liq))+
    '\n\nNews/eventi vicini: '+linked.length+'. La vicinanza temporale è correlazione, non prova automatica di causalità.'+tail;
}

async function gatewayCall(credential,{instructions,input}){
  const preferred=String(process.env.AI_GATEWAY_MODEL||'').trim();
  const models=[preferred,...(!preferred?['openai/gpt-6-astra','openai/gpt-6-sol','openai/gpt-6-luna']:[])].filter(Boolean);
  let last=null;
  for(const model of models){
    try{
      const r=await fetch('https://ai-gateway.vercel.sh/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+credential,'Content-Type':'application/json'},body:JSON.stringify({model,instructions,input,max_output_tokens:2600})});
      const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error?.message||`AI Gateway ${r.status}`);const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';if(!answer)throw new Error('Empty AI Gateway response');return{answer,provider:'vercel-ai-gateway',model};
    }catch(e){last=e}
  }
  throw last||new Error('AI Gateway unavailable');
}
async function openaiCall(key,{instructions,input,useWebSearch=false}){
  const preferred=String(process.env.OPENAI_MODEL||'').trim();
  const models=[preferred,...(!preferred?['gpt-6-astra','gpt-6-sol','gpt-6-luna']:[])].filter(Boolean);
  let last=null;
  for(const model of models){
    try{
      const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({model,instructions,input,max_output_tokens:2600,...(useWebSearch?{tools:[{type:'web_search'}]}:{})})});
      const d=await r.json().catch(()=>({}));if(!r.ok)throw new Error(d?.error?.message||`OpenAI ${r.status}`);const answer=d.output_text||((d.output||[]).flatMap(x=>x.content||[]).find(x=>x.type==='output_text')?.text)||'';if(!answer)throw new Error('Empty OpenAI response');return{answer,provider:'openai',model};
    }catch(e){last=e}
  }
  throw last||new Error('OpenAI unavailable');
}
async function callProvider(payload){
  const attempts=[];const openaiKey=String(process.env.OPENAI_API_KEY||''),gatewayKey=String(process.env.AI_GATEWAY_API_KEY||''),oidc=String(process.env.VERCEL_OIDC_TOKEN||'');
  if(openaiKey)attempts.push(()=>openaiCall(openaiKey,payload));if(gatewayKey)attempts.push(()=>gatewayCall(gatewayKey,payload));if(!gatewayKey&&oidc)attempts.push(()=>gatewayCall(oidc,payload));
  let last=null;for(const run of attempts){try{return await run()}catch(e){last=e}}throw last||new Error('No AI credential available');
}
function isCasual(q){q=String(q||'').trim().toLowerCase();return /^(ciao|salve|buongiorno|buonasera|come stai|come va|chi sei|che fai|grazie|ok|perfetto|bene)[!?., ]*$/.test(q)}
function casualFallback(q){const x=String(q||'').toLowerCase();if(/come stai|come va/.test(x))return 'Sto bene. Sono operativo e pronto a ragionare con te. Se vuoi parlare normalmente, parliamo normalmente; se passi a BNB o a un token, cambio modalità e uso i dati disponibili.';if(/chi sei/.test(x))return 'Sono Kiber, l’assistente della piattaforma. Posso conversare normalmente e, quando la domanda riguarda mercato o BNB Chain, passare all’analisi dei dati.';if(/grazie/.test(x))return 'Figurati. Almeno una cosa oggi funziona senza aprire dodici pannelli.';return 'Ci sono. Puoi parlarmi normalmente oppure chiedermi un’analisi su BNB, BNB Chain o una moneta.'}
function sanitizeContext(body,e){
  const token=body.token?{symbol:String(body.token.symbol||'').slice(0,30),name:String(body.token.name||'').slice(0,120),address:String(body.token.address||'').slice(0,80),price:num(body.token.price??body.token.priceUsd),change24:num(body.token.change24??body.token.priceChange?.h24),change7d:num(body.token.change7d),change30d:num(body.token.change30d),marketCap:num(body.token.marketCap??body.token.fdv),volume24:num(body.token.volume24??body.token.volume?.h24),liquidityUsd:num(body.token.liquidityUsd??body.token.liquidity?.usd),rank:num(body.token.rank),categories:Array.isArray(body.token.categories)?body.token.categories.slice(0,10):[]}:null;
  return{version:VERSION,analysisMode:String(body.analysisMode||'summary').slice(0,40),analysisSubject:body.analysisSubject||null,oracleEvaluation:e,bnb:body.bnb||null,chain:body.chain||null,intelligence:body.intelligence||null,token,tokenIntel:body.tokenIntel||null,marketNews:body.marketNews?.items?{counts:body.marketNews.counts||null,marketNewsBalance:body.marketNews.marketNewsBalance||null,items:body.marketNews.items.slice(0,18)}:body.marketNews||null,tokenNews:body.tokenNews?.items?{counts:body.tokenNews.counts||null,items:body.tokenNews.items.slice(0,12)}:null,analysis:body.analysis||null,conversation:(body.conversation||[]).slice(-10).map(m=>({role:m.role==='assistant'?'assistant':'user',content:String(m.content||'').slice(0,1600)}))};
}
module.exports=async function handler(req,res){
  if(req.method==='GET'){
    const provider=process.env.OPENAI_API_KEY?'openai':(process.env.AI_GATEWAY_API_KEY||process.env.VERCEL_OIDC_TOKEN)?'vercel-ai-gateway':'deterministic';
    return res.status(200).json({ok:true,provider,ai:provider!=='deterministic',model:process.env.OPENAI_MODEL||process.env.AI_GATEWAY_MODEL||(provider==='vercel-ai-gateway'?'openai/gpt-6-astra':'gpt-6-astra'),version:VERSION,capabilities:['conversation','bnb','chain','token360','scenario','risk','contrarian','newsimpact','chartoracle','eventforensics','cycles','futureimpact','chart-point-analysis','cycle-frequency','web-search-when-openai','data-quality','model-fallback','fallback']});
  }
  if(req.method!=='POST')return res.status(405).json({error:'Method not allowed'});
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{},evaluation=chooseEvaluation(body),context=sanitizeContext(body,evaluation),question=String(body.message||'').slice(0,3600),casual=isCasual(question);
    const instructions=`Sei Kiber AI, assistente conversazionale e motore di intelligence per BNB Chain. Hai una personalità stabile: diretto, chiaro, curioso e prudente quando i dati sono deboli. Se la domanda è conversazionale o non finanziaria, rispondi normalmente senza forzare analisi di mercato. Se la domanda è finanziaria, devi essere versatile ma rigoroso. Dai prima il verdetto quando i dati lo consentono: 🟢 RIALZISTA, 🟡 NEUTRALE o 🔴 RIBASSISTA. Subito dopo separa: 1) conferme, 2) contraddizioni, 3) rischio e qualità dei dati, 4) cosa invaliderebbe lo scenario. Usa soltanto il contesto fornito. Non inventare prezzi, holder, notizie, target, probabilità, partnership, cause o dati mancanti. Se le fonti sono incomplete o contraddittorie, privilegia NEUTRALE e dichiaralo. Lo score Kiber misura convergenza dei segnali e la qualità dati misura completezza/coerenza: nessuno dei due è probabilità di profitto. Distingui sempre BNB, BNB Chain, token, pool e protocollo. Per richieste contrarian cerca attivamente prove contro la tesi corrente. Per richieste risk evidenzia liquidità, volatilità, flussi, concentrazione, giovinezza del pool e dati mancanti. Niente ordini di acquisto o promesse di rendimento. Se analysisMode è eventforensics, cycles o futureimpact usa analysis.forensics come una ricostruzione investigativa del movimento: separa movente supportato, correlazione temporale e causalità non dimostrata; descrivi fasi UP/DOWN, volume, eventuale liquidità storica realmente archiviata, ricorrenza e limiti del campione. Non inventare liquidità passata o news che non sono nel contesto. La frequenza storica non è una previsione certa.`;
    const input=`CONTESTO KIBER ${VERSION}:\n${JSON.stringify(context)}\n\nDOMANDA:\n${question}`;
    const mode=String(context.analysisMode||'summary'),useWebSearch=!casual&&['token360','scenario','newsimpact','chartoracle','eventforensics','futureimpact','macro','summary'].includes(mode);
    try{const out=await callProvider({instructions,input,useWebSearch});return res.status(200).json({...out,evaluation,assessment:evaluation,analysisMode:context.analysisMode,webSearchEnabled:useWebSearch,version:VERSION})}
    catch(aiError){return res.status(200).json({answer:casual?casualFallback(question):deterministic(body),provider:'deterministic',model:null,evaluation,assessment:evaluation,analysisMode:context.analysisMode,webSearchEnabled:false,version:VERSION,warning:String(aiError.message||aiError).slice(0,220)})}
  }catch(e){return res.status(500).json({error:'Kiber backend error',detail:String(e.message||e).slice(0,180),version:VERSION})}
};
