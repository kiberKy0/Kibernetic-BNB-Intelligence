// GoPlus Token Security on BNB Chain: read-only checks, no wallet operations.
const ADDRESS=/^0x[a-fA-F0-9]{40}$/;
const FLAG_FIELDS=[
  ['is_honeypot','Honeypot segnalato',3],
  ['cannot_sell_all','Vendita totale potenzialmente impedita',3],
  ['is_blacklisted','Blacklist segnalata',3],
  ['hidden_owner','Proprietario nascosto',2],
  ['owner_change_balance','Il proprietario può modificare saldi',3],
  ['is_mintable','Offerta potenzialmente modificabile',1],
  ['is_proxy','Contratto proxy modificabile',1],
  ['transfer_pausable','Trasferimenti sospendibili',2],
  ['can_take_back_ownership','Proprietà riacquisibile',1]
];
function securitySummary(raw){
 const flags=[];let observed=0;
 for(const [field,label,severity] of FLAG_FIELDS){
   const v=raw?.[field];if(v==='1'||v===1||v===true){flags.push({field,label,severity});observed++;}
   else if(v==='0'||v===0||v===false)observed++;
 }
 for(const tax of ['buy_tax','sell_tax']){
   const v=raw?.[tax];if(v!==null&&v!==undefined&&v!==''){
     const value=Number(v);
     if(Number.isFinite(value)){
       observed++;
       if(value>0.2)flags.push({field:tax,label:tax==='buy_tax'?'Tassa acquisto elevata':'Tassa vendita elevata',severity:2});
     }
   }
 }
 if(raw?.is_open_source==='0'){flags.push({field:'is_open_source',label:'Codice sorgente non verificato',severity:2});observed++;}
 else if(raw?.is_open_source==='1')observed++;
 const hard=flags.some(x=>x.severity===3);
 return {risk:!observed?'NON VERIFICABILE':hard?'ALTO':flags.length?'ATTENZIONE':'NESSUN RISCHIO RILEVATO NEI CAMPI DISPONIBILI',flags,checkedFields:observed,
    warning:'Controllo automatico parziale, non audit del contratto. Un risultato senza segnalazioni non garantisce la sicurezza o la vendibilità.'};
}

async function safetyHandler(req,res){
 if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
 const address=String(req.query?.address||'').trim();
 if(!ADDRESS.test(address))return res.status(400).json({error:'Indirizzo BSC non valido'});
 const url='https://api.gopluslabs.io/api/v1/token_security/56?contract_addresses='+encodeURIComponent(address.toLowerCase());
 try{
  const h={Accept:'application/json'};
  if(process.env.GOPLUS_ACCESS_TOKEN)h.Authorization='Bearer '+process.env.GOPLUS_ACCESS_TOKEN;
  const response=await fetch(url,{headers:h,signal:AbortSignal.timeout(7000)});
  if(!response.ok)throw Error('HTTP '+response.status);
  const data=await response.json();
  const token=data?.result?.[address.toLowerCase()];
  if(data?.code!==1||!token)throw Error('Dati token non presenti');
  res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=600');
  return res.status(200).json({ok:true,chainId:56,address:address.toLowerCase(),source:'GoPlus Token Security',updatedAt:new Date().toISOString(),...securitySummary(token)});
 }catch(e){
  res.setHeader('Cache-Control','no-store');
  return res.status(503).json({ok:false,address,source:'GoPlus',error:'Verifica sicurezza non disponibile. Nessuna conclusione sulla sicurezza del token.',diagnostic:String(e?.message||'').slice(0,70)});
 }
}

module.exports = async function handler(req,res){
  if(req.query?.mode==='safety')return safetyHandler(req,res);
  res.setHeader('Access-Control-Allow-Origin','*');
  const q=String(req.query?.q||'').trim();
  if(!q) return res.status(400).json({error:'Missing q'});
  try{
    const r=await fetch('https://api.dexscreener.com/latest/dex/search?q='+encodeURIComponent(q));
    if(!r.ok) throw new Error('DexScreener '+r.status);
    const d=await r.json();
    const pairs=(d.pairs||[]).filter(p=>p.chainId==='bsc').slice(0,20);
    res.status(200).json({pairs});
  }catch(e){res.status(502).json({error:'Token feed unavailable'});}
}

module.exports.securitySummary=securitySummary;
