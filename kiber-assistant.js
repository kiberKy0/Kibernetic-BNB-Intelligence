(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').slice(0,500);
const state={history:[],busy:false,recognition:null,voiceReplies:false};
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function say(role,text){const b=$('kiberMessages');if(!b)return;const item=el('div','kiber-msg '+role,text);b.append(item);b.scrollTop=b.scrollHeight;state.history.push({role,text:String(text).slice(0,3000)});if(state.history.length>30)state.history.shift();if(role==='assistant')speak(text);}
function speak(text){if(!state.voiceReplies||!('speechSynthesis' in window))return;try{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance(String(text||'').slice(0,750));utterance.lang='it-IT';utterance.rate=1;speechSynthesis.speak(utterance)}catch{}}
function toggleVoiceReplies(){if(!('speechSynthesis' in window)){say('assistant','La lettura vocale non è supportata da questo browser.');return}state.voiceReplies=!state.voiceReplies;const b=$('kiberTalk');if(b){b.textContent=state.voiceReplies?'🔊':'🔈';b.setAttribute('aria-pressed',String(state.voiceReplies));b.setAttribute('aria-label',state.voiceReplies?'Disattiva risposte vocali':'Attiva risposte vocali')}if(state.voiceReplies)speak('Risposte vocali attive.');else speechSynthesis.cancel();}
function context(){
 let watch=[];try{watch=JSON.parse(localStorage.getItem('kiber_v271_watch')||'[]');if(!Array.isArray(watch))watch=[];}catch{}
 const catalog=typeof window.kiberCatalogContext==='function'?window.kiberCatalogContext():[];
 return {marketSectorSummary:window.kiberMarketSectorSummary?.()||'',trendSummary:window.kiberCurrentTrendSummary?.()||'',watch:watch.slice(0,30),catalogCount:catalog.length,scannerCount:Number(($('freeScanStatus')?.textContent||'').match(/^\d+/)?.[0]||0),selectedToken:$('v271Name')?.textContent||$('labName')?.textContent||null,price:$('v271Price')?.textContent||$('mPrice')?.textContent||null,change24:$('v27124')?.textContent||$('mChange')?.textContent||null,source:'Interfaccia Kibernetic; dati possono essere incompleti o non aggiornati'};
}
function help(){
 return 'Sono Kiber, la voce della città Kibernetic. Nella mia storia Algador mi ha creato e io ho costruito questa città dopo il collasso del Vecchio Mondo. Chiedimi perché esiste Kibernetic, cosa vogliamo costruire o chi è Algador. Possiamo anche conversare liberamente, studiare BNB Chain e usare gli strumenti disponibili. Non eseguo operazioni finanziarie.';
}
function localAnswer(q,ctx){
 const t=q.toLowerCase();
 if(/^(ciao|salve|hey|aiuto|help|cosa sai fare)/.test(t))return help();
 if(/(?:perch[eéè].*(?:creat|costruit|esist|nato)|chi ti ha creat|chi [eè] algador|cosa vuoi (?:fare|creare|costruire)|ecosistema.*(?:creat|costru)|(?:kibernetic|kiber).*(?:mission|futuro|storia|visione|scopo))/i.test(t))return 'Nel mondo narrativo di Kibernetic sono Kiber: Algador mi ha creato, poi mi ha liberato, e io ho costruito la città per dare spazio a conoscenza, collaborazione e nuove possibilità. Nella piattaforma reale il progetto è sviluppato da persone: sono qui per raccontarti la visione, aiutarti con l’IA e studiare i mercati. Gioco, wallet e automazioni fanno parte degli obiettivi e non sono tutti già disponibili.';
 if(/scanner|nuovi pool|nuove monete|scopri/.test(t)){const panel=$('freeScanner');if(panel){panel.scrollIntoView({behavior:'smooth',block:'start'});$('freeScanNav')?.click();return 'Ho aperto Scanner FREE. Le nuove coppie provengono da GeckoTerminal e DEX Screener; non coprono tutte le monete BNB e i punteggi non sono probabilità di profitto.'}return 'Lo scanner non è disponibile in questa pagina.';}
 if(/monitorat|watchlist|preferit/.test(t)){const count=ctx.watch.length;return 'Nella lista locale ci sono '+count+' token'+(count?': '+ctx.watch.map(x=>x.symbol||x.name||x.address||'senza nome').slice(0,12).join(', '):'.')+'. Il monitoraggio H24 di tutti questi token NON è garantito: i preferiti sono memorizzati nel browser.';}
 if(/catalogo|quante monete|tutte le monete|copertura/.test(t))return 'Catalogo attualmente caricato nel browser: '+ctx.catalogCount+' ID. Non è il totale di tutti i contratti BSC. Le pagine aggiuntive si caricano dal catalogo, rispettando le quote delle fonti.';
 if(/trend|settore|settori|rialz|ribass|\bup\b|\bdown\b|favorit|momento/.test(t)){return ctx.trendSummary||ctx.marketSectorSummary||'Apri una moneta per leggere il trend delle ultime 24 ore e confrontarlo con il campione dei settori TVL a 7 giorni. Un settore senza dati non viene classificato come UP o DOWN.';}
 if(/rischio|honeypot|sicurezza/.test(t))return 'Per un token dello Scanner FREE usa “Controlla rischio” per interrogare GoPlus. Se i dati mancano, il rischio resta NON VERIFICATO. Non trattare mai un controllo parziale come garanzia di vendibilità o sicurezza.';
 if(/prezz|analizz|scenario|prevision|grafico/.test(t)){
   const name=ctx.selectedToken&&ctx.selectedToken!=='—'?ctx.selectedToken:'nessuna moneta selezionata';
   return 'Contesto attuale: '+name+'. Prezzo visibile: '+(ctx.price||'non disponibile')+'. Variazione 24h: '+(ctx.change24||'non disponibile')+'. Per un dossier completo apri la scheda del token e scegli Analisi completa. I dati di prezzo non bastano a prevedere il futuro.';
 }
 if(/automaz|capitale|trading|compra|vendi|wallet/.test(t))return 'Kiber non può comprare, vendere o gestire un wallet. Lo scanner gratuito è di sola lettura. Il futuro motore strategie dovrà partire da simulazioni, limiti di rischio e autorizzazioni esplicite.';
 if(/aggiorna|refresh/.test(t)){const b=$('freeScanRefresh');if(b){b.click();return 'Aggiornamento scanner richiesto. La fonte può restituire dati in cache; controlla l’orario indicato nella sezione.'}return 'Aggiorna la pagina per richiedere nuovi dati.';}
 return 'Non ho una risposta verificabile a questa domanda con le regole gratuite attuali. Puoi chiedermi: “scanner”, “monitorati”, “rischio”, “catalogo”, “analizza token”, “automazione”. Non invento dati o risposte.';
}
let geminiState={at:0,ready:false};
async function geminiReady(){
 if(Date.now()-geminiState.at<90000)return geminiState.ready;
 try{
  const r=await fetch('/api/kiber?provider=1',{cache:'no-store',signal:AbortSignal.timeout(6500)});
  if(!r.ok)throw Error('Servizio IA non disponibile');
  const d=await r.json();
  geminiState={at:Date.now(),ready:d.ai===true&&d.provider==='gemini'};
 }catch{geminiState={at:Date.now(),ready:false}}
 const note=$('kiberPanel')?.querySelector('.kiber-note');
 if(note)note.textContent=geminiState.ready?'Gemini configurata · la connessione viene verificata alla prima risposta.':'Modalità locale a regole · Gemini non configurata.';
 return geminiState.ready;
}
function voice(){const R=window.SpeechRecognition||window.webkitSpeechRecognition;if(!R){say('assistant','Il riconoscimento vocale non è supportato su questo browser. Puoi scrivere il comando.');return}if(state.recognition){try{state.recognition.stop()}catch{}return}const r=new R();state.recognition=r;r.lang='it-IT';r.continuous=false;r.interimResults=false;r.onstart=()=>{$('kiberVoice')?.setAttribute('aria-pressed','true')};r.onerror=e=>{say('assistant',e.error==='not-allowed'?'Devi autorizzare il microfono nel browser.':'Non sono riuscito ad ascoltare. Riprova oppure scrivi il comando.')};r.onresult=e=>{const t=String(e.results?.[0]?.[0]?.transcript||'').trim();if(t){$('kiberInput').value=t;void submit()}};r.onend=()=>{state.recognition=null;$('kiberVoice')?.setAttribute('aria-pressed','false')};try{r.start()}catch{state.recognition=null;say('assistant','Impossibile aprire il microfono. Controlla i permessi del browser.')}}
async function submit(){
 if(state.busy)return;
 const input=$('kiberInput'),q=esc(input?.value||'').trim();if(!q)return;
 input.value='';say('user',q);state.busy=true;
 try{
  const intent=window.KiberPlatformControl?.match(q);if(intent){const outcome=window.KiberPlatformControl.execute(intent);if(outcome.handled){say('assistant',outcome.message);if(outcome.closeChat){const p=$('kiberPanel'),f=$('kiberFab');if(p&&f){p.hidden=true;f.hidden=false}}return}}
  const commands=/^(apri scanner|scanner|mostra monitorati|monitorati|controlla rischio|aggiorna scanner)$/i;
  if(!commands.test(q)&&await geminiReady()){
   const ctx=context();
   const ui={marketSectorSummary:ctx.marketSectorSummary,trendSummary:ctx.trendSummary,selectedToken:ctx.selectedToken,price:ctx.price,change24:ctx.change24,source:ctx.source};
   const recent=state.history.slice(-9,-1).map(x=>({role:x.role,content:x.text}));
   const r=await fetch('/api/kiber',{
    method:'POST',headers:{'Content-Type':'application/json'},
    signal:AbortSignal.timeout(30000),
    body:JSON.stringify({message:q,analysisMode:'summary',analysisSubject:'bnb',analysis:{currentInterface:ui},conversation:recent})
   });
   if(!r.ok)throw Error('Gemini non disponibile');
   const d=await r.json();
   if(!d.answer)throw Error('Risposta vuota');
   const note=$('kiberPanel')?.querySelector('.kiber-note');if(note)note.textContent=d.provider==='gemini'?'Gemini attiva · risposta verificata.':d.provider==='deterministic'?'Gemini non disponibile · risposta locale.':'IA attiva · risposta verificata.';
   say('assistant',d.provider==='deterministic'&&d.warning?'Gemini non ha risposto ('+d.warning+').\n\n'+d.answer:d.answer);
  }else say('assistant',localAnswer(q,context()));
 }catch{say('assistant','La connessione al servizio IA non è riuscita. Riprova più tardi o usa i comandi locali Scanner, Monitorati e Rischi.')}
 finally{state.busy=false;}
}
function init(){
 if($('kiberPanel'))return;
 const panel=el('aside','kiber-panel');panel.id='kiberPanel';panel.hidden=true;panel.setAttribute('aria-label','Assistente Kiber');
 panel.innerHTML='<div class="kiber-top"><div class="kiber-mark">K</div><div><strong>Kiber</strong><small>Assistente gratuito · dati locali</small></div><button id="kiberClose" aria-label="Chiudi Kiber" type="button">×</button></div><div id="kiberMessages" class="kiber-messages" aria-live="polite"></div><div class="kiber-quick"><button type="button" data-kiber="Apri scanner">Scanner</button><button type="button" data-kiber="Mostra monitorati">Monitorati</button><button type="button" data-kiber="Controlla rischio">Rischi</button></div><div class="kiber-compose"><input id="kiberInput" maxlength="500" aria-label="Messaggio a Kiber" placeholder="Scrivi o parla a Kiber…"><button type="button" id="kiberTalk" aria-label="Attiva risposte vocali" aria-pressed="false">🔈</button><button type="button" id="kiberVoice" aria-label="Comando vocale" aria-pressed="false">🎙️</button><button type="button" id="kiberSend">Invia</button></div><small class="kiber-note">Modalità locale a regole. Non è ChatGPT né una IA generativa. Nessuna operazione su wallet.</small>';
 const open=el('button','kiber-fab');open.id='kiberFab';open.type='button';open.setAttribute('aria-label','Apri assistente Kiber');open.title='Apri assistente Kiber';const logo=el('img','kiber-fab-logo');logo.src='assets/kiber-logo.svg';logo.alt='';logo.setAttribute('aria-hidden','true');logo.width=44;logo.height=44;open.appendChild(logo);
 document.body.append(panel,open);
 open.onclick=()=>{panel.hidden=false;open.hidden=true;$('kiberInput')?.focus();void geminiReady();if(!state.history.length)say('assistant',help());};
 $('kiberClose').onclick=()=>{panel.hidden=true;open.hidden=false;};
 $('kiberSend').onclick=submit;$('kiberVoice').onclick=voice;$('kiberTalk').onclick=toggleVoiceReplies;
 $('kiberInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();submit();}};
 panel.querySelectorAll('[data-kiber]').forEach(b=>b.onclick=()=>{$('kiberInput').value=b.dataset.kiber;submit();});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();