// Kiber voice-input: short audio clips only, explicit microphone consent in browser.
'use strict';
const model='gemini-3.5-flash-lite';
const attempts=new Map();
module.exports=async(req,res)=>{
  res.setHeader('Cache-Control','no-store');
  if(req.method!=='POST')return res.status(405).json({error:'Metodo non consentito'});
  const key=String(process.env.KIBER_ORACOLO_BNB||process.env.GEMINI_API_KEY||'').replace(/[\u200b-\u200d\u2060\ufeff\s]/g,'');
  if(!key)return res.status(503).json({error:'Trascrizione IA non configurata'});
  const now=Date.now(),ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].slice(0,90);
  for(const [k,v] of attempts)if(now-v.at>120000)attempts.delete(k);
  const current=attempts.get(ip)||{at:now,count:0};if(now-current.at>60000){current.at=now;current.count=0}
  if(current.count>=8)return res.status(429).json({error:'Troppe richieste vocali. Riprova tra un minuto.'});
  current.count++;attempts.set(ip,current);
  try{
    const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
    const base64=String(body.audio||''),mime=String(body.mime||'').toLowerCase();
    if(!/^audio\/(?:webm|ogg|mp4|mpeg|wav|aac)(?:;[\w\s=+.-]+)?$/.test(mime)||base64.length<100||base64.length>1500000||!/^[a-zA-Z0-9+/]+=*$/.test(base64))
      return res.status(400).json({error:'Formato o dimensione audio non valida (massimo 15 secondi)'});
    const r=await fetch('https://generativelanguage.googleapis.com/v1beta/models/'+model+':generateContent',{
      method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
      signal:AbortSignal.timeout(22000),
      body:JSON.stringify({contents:[{parts:[{text:'Trascrivi fedelmente in italiano le parole pronunciate in questo audio. Rispondi esclusivamente con la trascrizione, senza spiegazioni e senza inventare parole non udibili.'},{inlineData:{mimeType:mime.split(';')[0],data:base64}}]}],generationConfig:{maxOutputTokens:230,temperature:0}})
    });
    const data=await r.json().catch(()=>({}));
    if(!r.ok){const m=r.status===429?'Limite temporaneo Gemini raggiunto':r.status===403?'Servizio vocale non autorizzato':r.status===400?'Formato non accettato da Gemini':'Trascrizione vocale non disponibile';return res.status(r.status===429?429:502).json({error:m})}
    const raw=(data.candidates?.[0]?.content?.parts||[]).map(p=>p.text||'').join(' ').trim();
    const text=raw.replace(/^["“]|["”]$/g,'').replace(/^(?:trascrizione|testo)\s*:\s*/i,'').slice(0,430);
    if(!text||/^(?:audio non|nessun parlato|silenzio|non riesco a trascrivere)/i.test(text))return res.status(422).json({error:'Non ho sentito parole riconoscibili. Riprova più vicino al microfono.'});
    return res.status(200).json({text,provider:'gemini',model});
  }catch{return res.status(502).json({error:'La trascrizione non è riuscita. Controlla la connessione e riprova.'})}
};
