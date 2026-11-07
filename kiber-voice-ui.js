(()=>{
'use strict';
const voicesSelects=new Set();
let speaking=null;
const synth=window.speechSynthesis;
const supportedAudio=()=>!!(navigator.mediaDevices?.getUserMedia&&window.MediaRecorder);
function voiceList(){try{return synth?.getVoices()||[]}catch{return []}}
function preferred(voices){
 const it=voices.filter(v=>/^it(?:-|$)/i.test(v.lang));
 const male=it.find(v=>/\b(?:alessandro|cosimo|paolo|luca|giorgio|federico|davide|mario|riccardo|stefano)\b/i.test(v.name));
 return male||it.find(v=>/natural|premium|neural|enhanced/i.test(v.name))||it[0]||voices.find(v=>/^it/i.test(v.lang))||null;
}
function populate(select){
 if(!select)return;voicesSelects.add(select);const voices=voiceList(),old=select.value,stored=localStorage.getItem('kiber_voice_id')||'';
 const it=voices.filter(v=>/^it(?:-|$)/i.test(v.lang));
 select.replaceChildren();
 const auto=document.createElement('option');auto.value='auto';auto.textContent='Voce italiana automatica';select.append(auto);
 for(const v of it){const opt=document.createElement('option');opt.value=v.voiceURI;opt.textContent=v.name+(v.localService?' · dispositivo':' · online');select.append(opt)}
 const chosen=(it.some(v=>v.voiceURI===old)?old:it.some(v=>v.voiceURI===stored)?stored:'auto');select.value=chosen;
 if(!it.length){const o=document.createElement('option');o.value='not-ready';o.disabled=true;o.textContent='Caricamento voci italiane…';select.append(o)}
 select.onchange=()=>{try{localStorage.setItem('kiber_voice_id',select.value)}catch{}};
}
if(synth?.addEventListener)synth.addEventListener('voiceschanged',()=>voicesSelects.forEach(s=>{if(s.isConnected)populate(s);else voicesSelects.delete(s)}));
function stopSpeech(){try{synth?.cancel()}catch{}speaking=null}
function speak(text){
 if(!synth||!window.SpeechSynthesisUtterance)return false;
 stopSpeech();const voices=voiceList(),stored=localStorage.getItem('kiber_voice_id')||'auto';
 const picked=(stored!=='auto'?voices.find(v=>v.voiceURI===stored):null)||preferred(voices);
 try{
 const u=new SpeechSynthesisUtterance(String(text||'').replace(/https?:\/\/\S+/g,'link web').slice(0,1400));
 u.lang='it-IT';u.rate=.96;u.pitch=.91;u.volume=1;
 if(picked){u.voice=picked;u.lang=picked.lang||'it-IT'}
 speaking=u;synth.speak(u);return true
 }catch{return false}
}
function makeMic({onText,onStatus}){
 let media=null,stream=null,recognizer=null,controller=null,chunks=[],timer=0,nonce=0,mode='idle';
 const status=(message,pressed=false)=>{try{onStatus?.(message,pressed)}catch{}};
 const tracks=()=>{try{stream?.getTracks().forEach(t=>t.stop())}catch{}stream=null};
 function cancel(){
  nonce++;clearTimeout(timer);timer=0;
  try{controller?.abort()}catch{}controller=null;
  try{if(recognizer){recognizer.onresult=null;recognizer.onerror=null;recognizer.onend=null;recognizer.abort()}}catch{}recognizer=null;
  try{if(media){media.onstop=null;media.onerror=null;if(media.state!=='inactive')media.stop()}}catch{}media=null;tracks();chunks=[];mode='idle';status('',false);
 }
 async function transcribe(blob,id){
  if(!blob?.size){mode='idle';status('Non ho sentito audio. Riprova.',false);return}
  if(blob.size>1050000){mode='idle';status('Registrazione troppo grande. Parla per meno di 12 secondi.',false);return}
  mode='transcribing';status('Trascrizione vocale in corso…',false);
  const ctrl=new AbortController();controller=ctrl;
  try{
   const base64=await new Promise((resolve,reject)=>{
    const reader=new FileReader();reader.onerror=()=>reject(new Error('Lettura audio fallita'));
    reader.onload=()=>resolve(String(reader.result||'').split(',')[1]||'');
    reader.readAsDataURL(blob)
   });
   if(id!==nonce)return;
   const res=await fetch('/api/kiber-voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({audio:base64,mime:blob.type||'audio/webm'}),signal:ctrl.signal});
   const data=await res.json().catch(()=>({}));
   if(id!==nonce)return;
   if(!res.ok||!data.text)throw Error(data.error||'Trascrizione non riuscita');
   mode='idle';status('Comando riconosciuto',false);onText(String(data.text||'').slice(0,430));
  }catch(e){if(id!==nonce||ctrl.signal.aborted)return;mode='idle';status(e.message||'Trascrizione non riuscita',false)}
  finally{if(controller===ctrl)controller=null}
 }
 function fallback(id){
  const Rec=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!Rec){mode='idle';status('Microfono non disponibile. Prova Chrome e autorizza il microfono.',false);return}
  try{
   const r=new Rec();recognizer=r;r.lang='it-IT';r.interimResults=false;r.continuous=false;
   r.onstart=()=>{if(id===nonce){mode='recording';status('Ti ascolto…',true)}};
   r.onerror=e=>{if(id!==nonce)return;mode='idle';status(e.error==='not-allowed'?'Consenti il microfono nelle impostazioni del browser.':'Il riconoscimento vocale del browser non è disponibile.',false)};
   r.onresult=e=>{if(id!==nonce)return;const t=String(e.results?.[0]?.[0]?.transcript||'').trim();mode='idle';status(t?'Comando riconosciuto':'Non ho sentito parole.',false);if(t)onText(t)};
   r.onend=()=>{if(id===nonce&&mode==='recording'){mode='idle';status('Microfono pronto',false)}};
   r.start();
  }catch{mode='idle';status('Il microfono non si è avviato. Verifica autorizzazioni browser.',false)}
 }
 async function start(){
  const id=++nonce;mode='starting';status('Richiesta autorizzazione microfono…',true);
  if(!supportedAudio()){fallback(id);return}
  try{
   const local=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true,autoGainControl:true}});
   if(id!==nonce){local.getTracks().forEach(t=>t.stop());return}
   stream=local;
   const types=['audio/webm;codecs=opus','audio/webm','audio/mp4','audio/ogg;codecs=opus'];
   const mime=types.find(x=>MediaRecorder.isTypeSupported(x));
   media=new MediaRecorder(local,mime?{mimeType:mime}:undefined);
   chunks=[];
   media.ondataavailable=e=>{if(e.data?.size)chunks.push(e.data)};
   media.onerror=()=>{if(id===nonce){cancel();status('Registrazione non riuscita. Riprova.',false)}};
   media.onstop=()=>{tracks();clearTimeout(timer);if(id!==nonce)return;const blob=new Blob(chunks,{type:media?.mimeType||mime||'audio/webm'});media=null;chunks=[];void transcribe(blob,id)};
   media.start(350);mode='recording';status('Ti ascolto… Tocca di nuovo per inviare (max 12 s)',true);
   timer=setTimeout(()=>{if(id===nonce&&media?.state==='recording')stop()},12000);
  }catch(e){tracks();if(id!==nonce)return;mode='idle';const denied=e?.name==='NotAllowedError'||e?.name==='PermissionDeniedError';status(denied?'Accesso al microfono negato. Abilitalo per questo sito.':'Microfono non disponibile. Controlla il browser e riprova.',false)}
 }
 function stop(){
  if(mode==='recording'&&media?.state==='recording'){status('Elaborazione registrazione…',false);media.stop()}
  else if(mode==='recording'&&recognizer){try{recognizer.stop()}catch{}}
  else if(mode==='starting')cancel();
 }
 function toggle(){
  if(mode==='recording'||mode==='starting'){stop();return}
  if(mode==='transcribing'){status('Sto già trascrivendo il messaggio…',false);return}
  void start();
 }
 return{toggle,cancel,get state(){return mode}};
}
window.KiberVoice=Object.freeze({makeMic,populate,speak,stopSpeech,voiceList,hasSpeech:!!synth});
window.addEventListener('pagehide',stopSpeech);
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopSpeech()});
})();