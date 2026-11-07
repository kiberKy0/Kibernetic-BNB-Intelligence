// Optional on-demand natural speech with a capped input size. No audio or secrets stored.
'use strict';
const attempts=new Map();
function wav(pcm){const header=Buffer.alloc(44);header.write('RIFF',0);header.writeUInt32LE(36+pcm.length,4);header.write('WAVE',8);header.write('fmt ',12);header.writeUInt32LE(16,16);header.writeUInt16LE(1,20);header.writeUInt16LE(1,22);header.writeUInt32LE(24000,24);header.writeUInt32LE(48000,28);header.writeUInt16LE(2,32);header.writeUInt16LE(16,34);header.write('data',36);header.writeUInt32LE(pcm.length,40);return Buffer.concat([header,pcm])}
module.exports=async(req,res)=>{
 res.setHeader('Cache-Control','no-store');if(req.method!=='POST')return res.status(405).json({error:'Metodo non consentito'});
 const key=String(process.env.KIBER_ORACOLO_BNB||process.env.GEMINI_API_KEY||'').replace(/[\u200b-\u200d\u2060\ufeff\s]/g,'');
 if(!key)return res.status(503).json({error:'Voce naturale Gemini non disponibile'});
 const now=Date.now(),ip=String(req.headers['x-forwarded-for']||req.socket?.remoteAddress||'unknown').split(',')[0].slice(0,90);
 for(const [k,v] of attempts)if(now-v.at>120000)attempts.delete(k);
 const bucket=attempts.get(ip)||{at:now,count:0};if(now-bucket.at>60000){bucket.at=now;bucket.count=0}
 if(bucket.count>=5)return res.status(429).json({error:'Limite temporaneo della voce naturale'});
 bucket.count++;attempts.set(ip,bucket);
 try{
  const body=typeof req.body==='string'?JSON.parse(req.body):req.body||{};
  const original=String(body.text||'').trim();if(!original||original.length>480)return res.status(400).json({error:'Testo troppo lungo per la voce naturale'});
  const voice=['Charon','Orus','Puck'].includes(body.voice)?body.voice:'Charon';
  const instruction='Leggi esattamente questo testo in italiano naturale, con una voce maschile calda, giovane-adulta e chiara, da assistente tecnologico amichevole. Nessun tono robotico. Testo: '+original;
  const r=await fetch('https://generativelanguage.googleapis.com/v1beta/interactions',{
   method:'POST',headers:{'Content-Type':'application/json','x-goog-api-key':key},
   signal:AbortSignal.timeout(24000),
   body:JSON.stringify({model:'gemini-3.1-flash-tts-preview',input:instruction,response_format:{type:'audio'},generation_config:{speech_config:[{voice}]}})
  });
  const d=await r.json().catch(()=>({}));
  if(!r.ok)return res.status(r.status===429?429:502).json({error:r.status===429?'Quota voce Gemini raggiunta':r.status===404?'Modello voce naturale non disponibile':'Voce Gemini non disponibile per questa chiave'});
  const audio=String(d.output_audio?.data||'');if(!audio||audio.length>4500000)return res.status(502).json({error:'Nessun audio generato'});
  const raw=Buffer.from(audio,'base64');if(!raw.length)return res.status(502).json({error:'Audio vuoto'});
  const output=wav(raw);res.setHeader('Content-Type','audio/wav');res.setHeader('Content-Length',output.length);return res.status(200).send(output);
 }catch{return res.status(502).json({error:'La voce naturale non ha risposto'})}
};
