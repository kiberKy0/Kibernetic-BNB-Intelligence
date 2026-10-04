function dec(s=''){return s.replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>')}
function ex(x,t){const m=x.match(new RegExp('<'+t+'[^>]*>([\\s\\S]*?)<\\/'+t+'>','i'));return m?dec(m[1].trim()):''}
const safe=s=>String(s||'').trim().slice(0,120);
const ageHours=d=>{const t=Date.parse(d||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/36e5):null};
const SECTORS=[
  ['Layer 1 & Layer 2','layer 1 layer 2 blockchain scaling rollup'],['DeFi','DeFi DEX lending staking yield'],['Stablecoin','stablecoin USDT USDC depeg'],['RWA','RWA tokenization real world assets'],['AI & Compute','AI crypto compute GPU agent'],['Data & Oracle','oracle blockchain data feed Chainlink'],['DePIN','DePIN decentralized physical infrastructure'],['Infrastructure & Interoperability','bridge cross-chain interoperability modular blockchain'],['Privacy & Cybersecurity','crypto privacy cybersecurity exploit audit'],['Digital Identity','digital identity DID KYC blockchain'],['Gaming & Metaverse','web3 gaming GameFi metaverse'],['Meme','memecoin meme crypto'],['NFT & Social','NFT SocialFi decentralized social'],['Payments','crypto payments remittance merchant stablecoin payments'],['DeSci & Emerging Tech','DeSci decentralized science emerging crypto technology']
];
function sectorGuess(title=''){
  const t=String(title).toLowerCase();
  const rules=[
    ['Privacy & Cybersecurity',/hack|exploit|cyber|security|breach|audit|privacy|zero knowledge|zk proof/],['Stablecoin',/stablecoin|usdt|usdc|dai|depeg|peg/],['RWA',/\brwa\b|real world asset|tokeni[sz]ation|treasury|bond token/],['AI & Compute',/\bai\b|artificial intelligence|agent|gpu|compute|machine learning/],['Data & Oracle',/oracle|data feed|chainlink|pyth|indexing|the graph/],['DePIN',/depin|physical infrastructure|wireless network|storage network|compute network/],['Infrastructure & Interoperability',/bridge|cross-chain|interoperab|rollup|modular|layerzero|wormhole/],['Digital Identity',/digital identity|\bdid\b|credential|attestation|identity protocol|kyc/],['Gaming & Metaverse',/gamefi|gaming|metaverse|web3 game|play-to-earn/],['Meme',/memecoin|meme coin|doge|shib|pepe|floki/],['NFT & Social',/\bnft\b|socialfi|decentralized social|creator economy/],['Payments',/payment|remittance|merchant|checkout|payfi/],['DeSci & Emerging Tech',/desci|decentralized science|research dao|science blockchain/],['DeFi',/\bdefi\b|\bdex\b|lending|staking|yield|liquidity protocol|amm|derivatives/],['Layer 1 & Layer 2',/layer 1|layer1|layer 2|layer2|mainnet|blockchain network|scaling/]
  ];
  return rules.find(([,r])=>r.test(t))?.[0]||null;
}
function classify(title,source){
  const t=String(title||'').toLowerCase(),s=String(source||'').toLowerCase();
  const positive=/launch|integrat|partnership|adoption|approve|approval|upgrade|growth|record|expands|support|listing|listed|funding|investment|collaborat|deploy|mainnet|institutional|increase|surge|rises|gain/.test(t);
  const negative=/hack|exploit|attack|lawsuit|charge|ban|delist|outage|investigation|fraud|scam|breach|liquidat|crash|decline|warning|sanction|suspend|falls|drop|decrease/.test(t);
  const high=/hack|exploit|lawsuit|charge|ban|delist|listing|listed|upgrade|hard fork|sec |etf|partnership|institutional|mainnet|outage|regulat|sanction|breach/.test(t);
  const official=/sec|bnb chain|binance/.test(s)?'official/primary':/reuters|bloomberg|coindesk|the block|decrypt|cointelegraph/.test(s)?'established':'aggregated';
  const category=/sec |regulat|law|government|sanction|policy/.test(t)?'Regolamentazione':/fed |ecb|inflation|rate|jobs|cpi|gdp|macro/.test(t)?'Macro':/hack|exploit|security|attack|breach/.test(t)?'Sicurezza':/launch|partnership|integrat|adoption|upgrade|mainnet/.test(t)?'Ecosistema':'Mercato';
  return {impact:high?'alto':(positive||negative?'medio':'basso'),tone:positive&&!negative?'positivo':negative&&!positive?'negativo':'neutrale/misto',trust:official,category};
}
async function rss(url,sourceOverride,limit=4){
  const r=await fetch(url,{headers:{'User-Agent':'Kiber-BNB-Chain/26.6 https://kiber.blog','Accept':'application/rss+xml,text/xml;q=0.9,*/*;q=0.8'}});if(!r.ok)throw new Error(String(r.status));
  const xml=await r.text(),out=[];for(const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)){const b=m[1],title=ex(b,'title');if(!title)continue;out.push({title,url:ex(b,'link'),published:ex(b,'pubDate'),source:sourceOverride||ex(b,'source')||'News feed'});if(out.length>=limit)break}return out;
}
module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Cache-Control','s-maxage=120, stale-while-revalidate=420');
  const symbol=safe(req.query?.symbol).replace(/[^A-Za-z0-9._-]/g,''),name=safe(req.query?.name).replace(/["<>]/g,'');const tokenQ=[name,symbol].filter(Boolean).join(' ');
  const baseQueries=['BNB Chain crypto when:1d','Binance BNB announcement when:1d','crypto regulation SEC when:1d','crypto Federal Reserve macro when:1d'];
  const calls=baseQueries.map(q=>rss('https://news.google.com/rss/search?q='+encodeURIComponent(q)+'&hl=en&gl=US&ceid=US:en').then(a=>a.map(x=>({...x,sector:sectorGuess(x.title)}))).catch(()=>[]));
  for(const [sector,q] of SECTORS){calls.push(rss('https://news.google.com/rss/search?q='+encodeURIComponent(q+' crypto blockchain when:3d')+'&hl=en&gl=US&ceid=US:en').then(a=>a.map(x=>({...x,sector}))).catch(()=>[]))}
  if(tokenQ)calls.push(rss('https://news.google.com/rss/search?q='+encodeURIComponent('"'+tokenQ+'" crypto when:7d')+'&hl=en&gl=US&ceid=US:en',null,6).then(a=>a.map(x=>({...x,sector:sectorGuess(x.title)}))).catch(()=>[]));
  calls.push(rss('https://www.sec.gov/news/pressreleases.rss','SEC',6).then(a=>a.map(x=>({...x,sector:sectorGuess(x.title)}))).catch(()=>[]));
  const all=(await Promise.all(calls)).flat(),seen=new Set(),items=[];
  for(const x of all){
    const k=x.title.toLowerCase().replace(/\s+/g,' ').trim();if(!k||seen.has(k))continue;seen.add(k);
    const meta=classify(x.title,x.source),age=ageHours(x.published),relevance=tokenQ&&new RegExp(symbol||'a^','i').test(x.title)?'token':/bnb|binance smart chain|bsc/i.test(x.title)?'bnb':'market';
    const freshness=age===null?0:age<=6?3:age<=24?2:age<=72?1:0;const priority=(meta.impact==='alto'?5:meta.impact==='medio'?3:1)+(meta.trust==='official/primary'?3:meta.trust==='established'?2:0)+(relevance==='token'?4:relevance==='bnb'?2:0)+(x.sector?2:0)+freshness;
    items.push({...x,...meta,relevance,ageHours:age,priority,sector:x.sector||sectorGuess(x.title)});
  }
  items.sort((a,b)=>b.priority-a.priority||((Date.parse(b.published)||0)-(Date.parse(a.published)||0)));
  const top=items.slice(0,70),impact={positive:top.filter(x=>x.tone==='positivo'&&x.impact!=='basso').length,negative:top.filter(x=>x.tone==='negativo'&&x.impact!=='basso').length,high:top.filter(x=>x.impact==='alto').length};
  const sectorCounts=Object.fromEntries(SECTORS.map(([name])=>{const a=top.filter(x=>x.sector===name);return[name,{total:a.length,positive:a.filter(x=>x.tone==='positivo').length,negative:a.filter(x=>x.tone==='negativo').length,high:a.filter(x=>x.impact==='alto').length}]}));
  const balance=impact.positive-impact.negative;
  return res.status(200).json({version:'26.6',updatedAt:new Date().toISOString(),query:tokenQ||'BNB Chain',marketNewsBalance:balance>2?'positivo':balance<-2?'negativo':'misto',counts:impact,sectors:SECTORS.map(x=>x[0]),sectorCounts,items:top,sources:['Google News RSS','SEC.gov','BNB Chain/Binance results via indexed news'],note:'Tono, settore e impatto sono classificazioni euristiche. Una notizia non implica causalità sul prezzo; Kiber richiede conferme da prezzo, volume, liquidità e flussi.'});
};
