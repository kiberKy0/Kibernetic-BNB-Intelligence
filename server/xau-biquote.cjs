'use strict';
/*
 * Kibernetic XAU/USD online feed adapter v1.
 * Source biquote.io; independent of user's MT5 Android account.
 * Accepts only genuine completed OHLC and timestamped broker-external Bid/Ask.
 * Fail-closed: markets closed, stale ticks, bad bar counts and impossible OHLC.
 */
const INTERVALS = Object.freeze({
  '1min': {remote:'1m',minutes:1},
  '5min': {remote:'5m',minutes:5},
  '15min': {remote:'15m',minutes:15},
  '1h': {remote:'1h',minutes:60},
  '4h': {remote:'4h',minutes:240},
  '1day': {remote:'1d',minutes:1440}
});
const SOURCE = 'biquote.io · MT5 broker esterno';
const FRAME_NAMES = ['5min','15min','1h','4h','1day'];
const validN = n => typeof n === 'number' && Number.isFinite(n) && n > 0;
const round = (value,digits=2)=> Number.isFinite(value) ? Number(value.toFixed(digits)) : null;
function parseIso(value){
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/.test(value))return NaN;
  return Date.parse(value);
}
function normalizeBar(raw,now,minutes){
  if(!raw||typeof raw!=='object'||raw.isOpen!==false)return null;
  const ms=parseIso(raw.openTime);
  const c={time:new Date(Number.isFinite(ms)?ms:0).toISOString(),open:Number(raw.open),high:Number(raw.high),low:Number(raw.low),close:Number(raw.close)};
  const duration=minutes*60000;
  if(!Number.isFinite(ms)||ms>now||ms+duration>now+5000 || ![c.open,c.high,c.low,c.close].every(validN))return null;
  if(c.high<Math.max(c.open,c.close,c.low)||c.low>Math.min(c.open,c.close,c.high))return null;
  return c;
}
function normalizeBars(raw,interval,now){
  const config=INTERVALS[interval];
  if(!config||!raw||String(raw.symbol||'').toUpperCase()!=='XAUUSD'||!Array.isArray(raw.bars))throw Error('Serie OHLC priva di identificazione XAUUSD');
  let invalid=0,duplicates=0;
  const map=new Map();
  for(const row of raw.bars){
    if(row?.isOpen===true)continue;
    const b=normalizeBar(row,now,config.minutes);
    if(!b){invalid++;continue;}
    if(map.has(b.time)){duplicates++;continue;}
    map.set(b.time,b);
  }
  const candles=[...map.values()].sort((a,b)=>Date.parse(a.time)-Date.parse(b.time));
  if(invalid>3||duplicates>2)throw Error('Serie con candele non valide o duplicate');
  if(candles.length<60)throw Error('Campione OHLC troppo piccolo: '+candles.length+' candele');
  const last=candles[candles.length-1];
  const lastClosedAt=Date.parse(last.time)+config.minutes*60000;
  const ageSeconds=Math.round((now-lastClosedAt)/1000);
  // During market close the tick gate protects against using historical bars.
  // A completed H4/D1 bar may be older than an M15 bar, within its own scale.
  const maxAge=Math.max(120,config.minutes*2*60+120);
  const recent=ageSeconds>=-5&&ageSeconds<=maxAge;
  return {candles,interval,lastCandleStart:last.time,lastClosedAt:new Date(lastClosedAt).toISOString(),ageSeconds,recent,invalid,duplicates};
}
function normalizeTick(raw,now){
  const tickAt=parseIso(raw?.timestamp);
  const bid=Number(raw?.bid),ask=Number(raw?.ask),mid=Number(raw?.mid);
  const spread=ask-bid;
  const ageSeconds=Number.isFinite(tickAt)?Math.round((now-tickAt)/1000):null;
  const open=raw?.marketState==='open'&&raw?.stale===false;
  const valid=validN(bid)&&validN(ask)&&validN(mid)&&bid<ask&&bid<=mid&&mid<=ask&&spread>0&&spread<mid*0.001;
  const fresh=ageSeconds!==null&&ageSeconds>=-20&&ageSeconds<=120;
  return {ok:open&&valid&&fresh,open,valid,fresh,marketState:String(raw?.marketState||'unknown'),
    source:String(raw?.source||'Fonte esterna'),timestamp:Number.isFinite(tickAt)?new Date(tickAt).toISOString():null,
    ageSeconds,bid:valid?round(bid,3):null,ask:valid?round(ask,3):null,
    mid:valid?round(mid,3):null,spread:valid?round(spread,3):null};
}
function ema(values,window){
  if(values.length<window)return null;
  let v=values.slice(0,window).reduce((a,b)=>a+b,0)/window;
  const k=2/(window+1);
  for(let i=window;i<values.length;i++)v=v*(1-k)+values[i]*k;
  return v;
}
function trendOf(normalized){
  if(!normalized||!normalized.recent)return {status:'unavailable',direction:'non disponibile'};
  const close=normalized.candles.map(b=>b.close);
  const e20=ema(close,20),e50=ema(close,50),latest=close[close.length-1];
  const direction=e20>e50&&latest>e20?'rialzista':e20<e50&&latest<e20?'ribassista':'laterale';
  return {status:'observed',direction,interval:normalized.interval,close:round(latest),ema20:round(e20),ema50:round(e50),
    lastClosedAt:normalized.lastClosedAt,ageSeconds:normalized.ageSeconds};
}
async function readJSON(url,fetchImpl){
  const response=await fetchImpl(url,{headers:{'Accept':'application/json','User-Agent':'Kiber-XAU-Decoder/2.0'},signal:AbortSignal.timeout(9500),cache:'no-store'});
  if(!response.ok)throw Error('Fonte esterna HTTP '+response.status);
  return response.json();
}
async function getSnapshot(options={}){
  const now=Number.isFinite(options.now)?options.now:Date.now();
  const interval=String(options.interval||'15min');
  if(!INTERVALS[interval])throw Error('Intervallo non valido');
  const fetchImpl=options.fetchImpl||fetch;
  const frames=[...new Set([interval,...FRAME_NAMES])];
  const frameReq=frames.map(k=>readJSON('https://biquote.io/api/XAUUSD/ohlc?interval='+INTERVALS[k].remote+'&limit=110',fetchImpl));
  const tickReq=readJSON('https://biquote.io/api/XAUUSD?allowStale=false',fetchImpl);
  const calendarFrom=new Date(now-30*60000).toISOString();
  const calendarTo=new Date(now+48*3600000).toISOString();
  const calendarReq=readJSON('https://biquote.io/api/calendar?from='+encodeURIComponent(calendarFrom)+'&to='+encodeURIComponent(calendarTo)+'&countries=US&importance=high&limit=40',fetchImpl);
  const settled=await Promise.allSettled([...frameReq,tickReq,calendarReq]);
  const selectedIndex=frames.indexOf(interval);
  if(settled[selectedIndex].status!=='fulfilled')throw Error('Candele XAUUSD non raggiungibili: '+settled[selectedIndex].reason.message);
  if(settled[frames.length].status!=='fulfilled')throw Error('Quote Bid/Ask XAUUSD non raggiungibili: '+settled[frames.length].reason.message);
  const selected=normalizeBars(settled[selectedIndex].value,interval,now);
  const tick=normalizeTick(settled[frames.length].value,now);
  const series={};
  for(let i=0;i<frames.length;i++){
    if(settled[i].status!=='fulfilled'){series[frames[i]]={status:'unavailable',direction:'non disponibile'};continue;}
    try{series[frames[i]]=trendOf(normalizeBars(settled[i].value,frames[i],now));}
    catch{series[frames[i]]={status:'unavailable',direction:'non disponibile'};}
  }
  const macroRaw=settled[frames.length+1].status==='fulfilled'&&Array.isArray(settled[frames.length+1].value)?settled[frames.length+1].value:null;
  const calendar=macroRaw?macroRaw.filter(x=>{
    const t=parseIso(x?.time);
    return Number.isFinite(t)&&x?.importance==='high'&&x?.countryCode==='US'&&x?.timeMode==='exact'&&t>=now-30*60000&&t<=now+48*3600000;
  }).sort((a,b)=>Date.parse(a.time)-Date.parse(b.time)).slice(0,8).map(x=>({name:String(x.name||'Evento USA').slice(0,100),time:x.time,importance:'high',currency:'USD'})):null;
  const nearHighImpact=Array.isArray(calendar)&&calendar.some(x=>Math.abs(Date.parse(x.time)-now)<=30*60000);
  const barValid=selected.recent;
  const ok=tick.ok&&barValid&&!nearHighImpact;
  const reason=!tick.open?'Mercato chiuso o non confermato dal provider':
    !tick.valid?'Prezzo/spread Bid-Ask non coerente':
    !tick.fresh?'Ultima quotazione Bid-Ask troppo vecchia':
    !barValid?'Ultima candela OHLC troppo vecchia':
    nearHighImpact?'Evento economico USA ad alto impatto ±30 minuti':'Tick e candele recenti verificati sulla stessa fonte; ritardo a monte non certificato';
  return {
    symbol:'XAU/USD',interval,source:SOURCE,feedStatus:ok?'recent':'blocked',
    timestamp:new Date(now).toISOString(),lastCandleStart:selected.lastCandleStart,lastClosedAt:selected.lastClosedAt,
    quality:{ok,reason,selectedAgeSeconds:selected.ageSeconds,tick,provider:'biquote.io',independentLatencyVerified:false},
    multiTimeframe:series,calendar:{connected:calendar!==null,highImpactNear:nearHighImpact,next:calendar&&calendar.length?calendar[0]:null,events:calendar||[]},
    candles: ok?selected.candles:[],
    // The client may show the latest tick for reference but must not use it as an executable quote.
    note:ok?'Dati tecnici derivati da broker esterno, nessun collegamento con il conto MT5 Android. Nessun ordine automatico.':
      'Dati bloccati: '+reason
  };
}
module.exports={getSnapshot,normalizeBars,normalizeTick,trendOf,INTERVALS};
