'use strict';
/* Read-only XAU spot REFERENCE. Not a source for the analytical OHLC decoder. */
module.exports = async function handler(req,res) {
  res.setHeader('Content-Type','application/json; charset=utf-8');
  res.setHeader('Cache-Control','private, no-store, max-age=0');
  if(req.method!=='GET')return res.status(405).json({error:'Metodo non consentito'});
  const source='gold-api.com · XAU/USD indicativo';
  const out=(status,extras={})=>res.status(200).json({
    status,source,checkedAt:new Date().toISOString(),price:null,quoteTime:null,
    message:'Prezzo di riferimento, non quotazione eseguibile del broker. Non alimenta i filtri decisionali.',
    ...extras
  });
  try {
    const r=await fetch('https://api.gold-api.com/price/XAU',{
      headers:{'Accept':'application/json','User-Agent':'Kibernetic-XAU-SpotReference/1.0'},
      signal:AbortSignal.timeout(8500),cache:'no-store'
    });
    if(!r.ok)return out('error',{message:'Gold API non disponibile (HTTP '+r.status+').'});
    const raw=await r.json();
    const px=Number(raw?.price);
    const ts=typeof raw?.updatedAt==='string'?Date.parse(raw.updatedAt):NaN;
    const time=Number.isFinite(ts)?new Date(ts).toISOString():null;
    const age=Number.isFinite(ts)?Math.floor((Date.now()-ts)/1000):null;
    const curr=String(raw?.currency||'USD').toUpperCase();
    const symbol=String(raw?.symbol||'XAU').toUpperCase();
    if(!Number.isFinite(px)||px<=0||curr!=='USD'||symbol!=='XAU'||age===null||age < -30){
      return out('unverified',{message:'Valore, valuta o timestamp della fonte non verificabile.'});
    }
    if(age>180)return out('stale',{quoteTime:time,ageSeconds:age,message:'Quotazione XAU troppo vecchia ('+age+' secondi): prezzo nascosto.'});
    return out('recent',{price:px,quoteTime:time,ageSeconds:age,
      message:'Prezzo spot indicativo XAU/USD ricevuto con timestamp recente; non coincide necessariamente con Bid/Ask MT5 e NON autorizza Compra/Vendi.'});
  } catch(e) {
    return out('error',{message:'Impossibile ottenere il prezzo spot indicativo. Nessun valore inventato.'});
  }
};