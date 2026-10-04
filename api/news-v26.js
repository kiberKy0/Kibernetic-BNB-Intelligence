function dec(s=''){return s.replace(/<!\[CDATA\[|\]\]>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>')}
function ex(x,t){const m=x.match(new RegExp('<'+t+'[^>]*>([\\s\\S]*?)<\\/'+t+'>','i'));return m?dec(m[1].trim()):''}
const safe=s=>String(s||'').trim().slice(0,120);
const ageHours=d=>{const t=Date.parse(d||'');return Number.isFinite(t)?Math.max(0,(Date.now()-t)/36e5):null};
function classify(title,source){
  const t=String(title||'').toLowerCase(),s=String(source||'').toLowerCase();
  const positive=/launch|integrat|partnership|adoption|approve|approval|upgrade|growth|record|expands|support|listing|listed|funding|investment|collaborat|deploy|mainnet|institutional/.test(t);
  const negative=/hack|exploit|attack|lawsuit|charge|ban|delist|outage|investigation|fraud|scam|breach|liquidat|crash|decline|warning|sanction|suspend/.test(t);
  const high=/hack|exploit|lawsuit|charge|ban|delist|listing|listed|upgrade|hard fork|sec |etf|partnership|institutional|mainnet|outage|regulat|sanction/.test(t);
  const official=/sec|bnb chain|binance/.test(s)?'official/primary':/reuters|bloomberg|coindesk|the block|decrypt|cointelegraph/.test(s)?'established':'aggregated';
  const category=/sec |regulat|law|government|sanction|policy/.test(t)?'Regolamentazione':/fed |ecb|inflation|rate|jobs|cpi|gdp|macro/.test(t)?'Macro':/hack|exploit|security|attack|breach/.test(t)?'Sicurezza':/launch|partnership|integrat|adoption|upgrade|mainnet/.test(t)?'Ecosistema':'Mercato';
  return {impact:high?'alto':(positive||negative?'medio':'basso'),tone:positive&&!negative?'positivo':negative&&!positive?'negativo':'neutrale/misto',trust:official,category};
}
async function rss(url,sourceOverride){const r=await fetch(url,{headers:{'User-Agent':'Kiber-BNB-Chain/26.0 https://kiber.blog','Accept':'application/rss+xml,text/xml;q=0.9,*/*;q=0.8'}});if(!r.ok)throw new Error(String(r.status));const xml=await r.text(),out=[];for(const m of xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)){const b=m[1],title=ex(b,'title');if(!title)continue;out.push({title,url:ex(b,'link'),published:ex(b,'pubDate'),source:sourceOverride||ex(b,'source')||'News feed'})}return out}
module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Cache-Control','s-maxage=120, stale-while-revalidate=420');
  const symbol=safe(req.query?.symbol).replace(/[^A-Za-z0-9._-]/g,''),name=safe(req.query?.name).replace(/["<>]/g,'');
  const tokenQ=[name,symbol].filter(Boolean).join(' ');
  const queries=[
    'BNB Chain crypto when:1d','BNB Smart Chain DeFi when:1d','Binance BNB announcement when:1d','BNB Chain security OR exploit when:3d',
    'crypto regulation SEC when:1d','crypto Federal Reserve macro when:1d','site:bnbchain.org BNB Chain when:7d','site:binance.com BNB Chain when:7d'
  ];
  if(tokenQ)queries.unshift(`"${tokenQ}" crypto when:7d`);
  const calls=queries.map(q=>rss('https://news.google.com/rss/search?q='+encodeURIComponent(q)+'&hl=en&gl=US&ceid=US:en').catch(()=>[]));
  calls.push(rss('https://www.sec.gov/news/pressreleases.rss','SEC').catch(()=>[]));
  const parts=await Promise.all(calls),all=parts.flat();
  const seen=new Set(),items=[];
  for(const x of all){
    const k=x.title.toLowerCase().replace(/\s+/g,' ').trim();if(!k||seen.has(k))continue;seen.add(k);
    const meta=classify(x.title,x.source),age=ageHours(x.published),relevance=tokenQ&&new RegExp(symbol||'a^','i').test(x.title)?'token':/bnb|binance smart chain|bsc/i.test(x.title)?'bnb':'market';
    const freshness=age===null?0:age<=6?3:age<=24?2:age<=72?1:0;
    const priority=(meta.impact==='alto'?5:meta.impact==='medio'?3:1)+(meta.trust==='official/primary'?3:meta.trust==='established'?2:0)+(relevance==='token'?4:relevance==='bnb'?2:0)+freshness;
    items.push({...x,...meta,relevance,ageHours:age,priority});
  }
  items.sort((a,b)=>b.priority-a.priority||((Date.parse(b.published)||0)-(Date.parse(a.published)||0)));
  const top=items.slice(0,40),impact={positive:top.filter(x=>x.tone==='positivo'&&x.impact!=='basso').length,negative:top.filter(x=>x.tone==='negativo'&&x.impact!=='basso').length,high:top.filter(x=>x.impact==='alto').length};
  const balance=impact.positive-impact.negative;
  return res.status(200).json({version:'26.0',updatedAt:new Date().toISOString(),query:tokenQ||'BNB Chain',marketNewsBalance:balance>2?'positivo':balance<-2?'negativo':'misto',counts:impact,items:top,sources:['Google News RSS','SEC.gov','BNB Chain/Binance results via indexed news'],note:'Tono e impatto sono classificazioni euristiche. Una notizia non implica causalità sul prezzo; Kiber richiede conferme da prezzo, volume, liquidità e flussi.'});
};
