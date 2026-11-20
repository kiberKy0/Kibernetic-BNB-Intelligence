'use strict';

/**
 * Kiber IA Finance: one headline per category, selected from dated Google News RSS.
 * Selection is an editorial heuristic (relevance + freshness), not a fact about
 * which story is objectively "the most important".
 */
const TOPICS = [
  {
    id:'macro', label:'Macroeconomia',
    query:'(BCE OR Federal Reserve OR inflazione OR tassi OR PIL) economia',
    terms:/\b(BCE|Fed|Federal Reserve|inflazion|tassi|PIL|economia|recession|occupazion|bank)\b/i
  },
  {
    id:'markets',label:'Mercati',
    query:'(Wall Street OR Nasdaq OR S&P 500 OR FTSE MIB OR borse europee) mercati azionari',
    terms:/\b(Wall Street|Nasdaq|S&P|FTSE|borsa|borse|azion|mercat|Dow Jones|Stoxx)\b/i
  },
  {
    id:'crypto',label:'Criptovalute',
    query:'(bitcoin OR ethereum OR criptovalute OR crypto ETF) mercato',
    terms:/\b(bitcoin|BTC|ethereum|ETH|criptovalut|crypto|stablecoin|blockchain|ETF)\b/i
  }
];
function decodeEntities(value) {
  return String(value || '')
    .replace(/<!\[CDATA\[|\]\]>/g,'')
    .replace(/&(?:amp|quot|apos|lt|gt|nbsp);/g,m=>({'&amp;':'&','&quot;':'"','&apos;':"'",'&lt;':'<','&gt;':'>','&nbsp;':' '}[m]))
    .replace(/&#(\d+);/g,(_,x)=>String.fromCodePoint(Math.min(Number(x),0x10ffff)))
    .replace(/&#x([0-9a-f]+);/gi,(_,x)=>String.fromCodePoint(Math.min(parseInt(x,16),0x10ffff)))
    .replace(/<[^>]+>/g,'').trim();
}
function getTag(block,tag){
  const match=block.match(new RegExp('<'+tag+'(?:\\s[^>]*)?>([\\s\\S]*?)<\\/'+tag+'>','i'));
  return decodeEntities(match?.[1] || '');
}
function todayRome(timestamp) {
  return new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Rome',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(timestamp));
}
function extractItems(xml,topic,now){
  const results=[];
  for(const match of String(xml).matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)){
    const item=match[1],title=getTag(item,'title'),url=getTag(item,'link'),source=getTag(item,'source') || 'Google News';
    const pub=getTag(item,'pubDate'),publishedMs=Date.parse(pub);
    if(!title || !/^https:\/\/[^\s<>"']+$/i.test(url) || !Number.isFinite(publishedMs))continue;
    const hours=(now-publishedMs)/36e5;
    if(hours < -0.5 || hours > 48)continue;
    const sameDay=todayRome(publishedMs)===todayRome(now);
    const relevance=topic.terms.test(title)?1:0;
    const importance=/\b(annunc|decision|record|croll|crisi|approv|tagli|rialz|inflazion|tassi|ETF|Fed|BCE)\b/i.test(title)?1:0;
    // Prefer today's reporting; older stories only appear if nothing new is found.
    const score=(sameDay?100:0)+(relevance*18)+(importance*5)-hours;
    const cleanTitle=title.endsWith(' - '+source)?title.slice(0,-source.length-3):title;
    results.push({title:cleanTitle,url,source,publishedAt:new Date(publishedMs).toISOString(),sameDay,score});
  }
  return results;
}
async function readTopic(topic,now){
  const url='https://news.google.com/rss/search?q='+encodeURIComponent(topic.query)+'&hl=it&gl=IT&ceid=IT:it';
  const r=await fetch(url,{headers:{'Accept':'application/rss+xml,text/xml;q=0.9','User-Agent':'Kiber-IA-Finance/1.0'},signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw new Error('news provider HTTP '+r.status);
  const items=extractItems(await r.text(),topic,now).sort((a,b)=>b.score-a.score);
  const best=items.find(x=>x.sameDay) || null;
  if(!best)return {category:topic.id,label:topic.label,status:'unavailable',message:'Nessuna notizia verificabile pubblicata oggi.'};
  const {score,sameDay,...article}=best;
  return {category:topic.id,label:topic.label,status:'available',...article};
}
module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=300');
  const now=Date.now();
  const parts=await Promise.allSettled(TOPICS.map(topic=>readTopic(topic,now)));
  const items=TOPICS.map((topic,i)=>parts[i].status==='fulfilled'?parts[i].value:{
    category:topic.id,label:topic.label,status:'unavailable',
    message:'Fonte temporaneamente non raggiungibile.'
  });
  res.status(200).json({date:todayRome(now),updatedAt:new Date(now).toISOString(),provider:'Google News RSS',selection:'Selezione automatica per freschezza e pertinenza, non classifica oggettiva',items});
};
