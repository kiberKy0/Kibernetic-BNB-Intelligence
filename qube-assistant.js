(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').slice(0,500);
const state={history:[],busy:false};
function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
function say(role,text){const b=$('qubeMessages');if(!b)return;const item=el('div','qube-msg '+role,text);b.append(item);b.scrollTop=b.scrollHeight;state.history.push({role,text:String(text).slice(0,3000)});if(state.history.length>30)state.history.shift();}
function context(){
 let watch=[];try{watch=JSON.parse(localStorage.getItem('kiber_v271_watch')||'[]');if(!Array.isArray(watch))watch=[];}catch{}
 const catalog=typeof window.kiberCatalogContext==='function'?window.kiberCatalogContext():[];
 return {watch:watch.slice(0,30),catalogCount:catalog.length,scannerCount:Number(($('freeScanStatus')?.textContent||'').match(/^\d+/)?.[0]||0),selectedToken:$('v271Name')?.textContent||$('labName')?.textContent||null,price:$('v271Price')?.textContent||$('mPrice')?.textContent||null,change24:$('v27124')?.textContent||$('mChange')?.textContent||null,source:'Interfaccia Kibernetic; dati possono essere incompleti o non aggiornati'};
}
function help(){
 return 'Sono Qube, assistente integrato in Kibernetic. Posso spiegare dati e funzioni, aprire lo scanner, mostrare i monitorati e analizzare il contesto disponibile. Non sono collegato a un modello linguistico esterno: questa è una versione gratuita basata su comandi e regole verificabili. Nessuna operazione finanziaria viene eseguita.';
}
function localAnswer(q,ctx){
 const t=q.toLowerCase();
 if(/^(ciao|salve|hey|aiuto|help|cosa sai fare)/.test(t))return help();
 if(/scanner|nuovi pool|nuove monete|scopri/.test(t)){const panel=$('freeScanner');if(panel){panel.scrollIntoView({behavior:'smooth',block:'start'});$('freeScanNav')?.click();return 'Ho aperto Scanner FREE. Le nuove coppie provengono da GeckoTerminal e DEX Screener; non coprono tutte le monete BNB e i punteggi non sono probabilità di profitto.'}return 'Lo scanner non è disponibile in questa pagina.';}
 if(/monitorat|watchlist|preferit/.test(t)){const count=ctx.watch.length;return 'Nella lista locale ci sono '+count+' token'+(count?': '+ctx.watch.map(x=>x.symbol||x.name||x.address||'senza nome').slice(0,12).join(', '):'.')+'. Il monitoraggio H24 di tutti questi token NON è garantito: i preferiti sono memorizzati nel browser.';}
 if(/catalogo|quante monete|tutte le monete|copertura/.test(t))return 'Catalogo attualmente caricato nel browser: '+ctx.catalogCount+' ID. Non è il totale di tutti i contratti BSC. Le pagine aggiuntive si caricano dal catalogo, rispettando le quote delle fonti.';
 if(/rischio|honeypot|sicurezza/.test(t))return 'Per un token dello Scanner FREE usa “Controlla rischio” per interrogare GoPlus. Se i dati mancano, il rischio resta NON VERIFICATO. Non trattare mai un controllo parziale come garanzia di vendibilità o sicurezza.';
 if(/prezz|analizz|scenario|prevision|grafico/.test(t)){
   const name=ctx.selectedToken&&ctx.selectedToken!=='—'?ctx.selectedToken:'nessuna moneta selezionata';
   return 'Contesto attuale: '+name+'. Prezzo visibile: '+(ctx.price||'non disponibile')+'. Variazione 24h: '+(ctx.change24||'non disponibile')+'. Per un dossier completo apri la scheda del token e scegli Analisi completa. I dati di prezzo non bastano a prevedere il futuro.';
 }
 if(/automaz|capitale|trading|compra|vendi|wallet/.test(t))return 'Qube non può comprare, vendere o gestire un wallet. Lo scanner gratuito è di sola lettura. Il futuro motore strategie dovrà partire da simulazioni, limiti di rischio e autorizzazioni esplicite.';
 if(/aggiorna|refresh/.test(t)){const b=$('freeScanRefresh');if(b){b.click();return 'Aggiornamento scanner richiesto. La fonte può restituire dati in cache; controlla l’orario indicato nella sezione.'}return 'Aggiorna la pagina per richiedere nuovi dati.';}
 return 'Non ho una risposta verificabile a questa domanda con le regole gratuite attuali. Puoi chiedermi: “scanner”, “monitorati”, “rischio”, “catalogo”, “analizza token”, “automazione”. Non invento dati o risposte.';
}
function submit(){
 if(state.busy)return;
 const input=$('qubeInput'),q=esc(input?.value||'').trim();if(!q)return;
 input.value='';say('user',q);state.busy=true;
 try{say('assistant',localAnswer(q,context()));}finally{state.busy=false;}
}
function init(){
 if($('qubePanel'))return;
 const panel=el('aside','qube-panel');panel.id='qubePanel';panel.hidden=true;panel.setAttribute('aria-label','Assistente Qube');
 panel.innerHTML='<div class="qube-top"><div class="qube-mark">Q</div><div><strong>Qube</strong><small>Assistente gratuito · dati locali</small></div><button id="qubeClose" aria-label="Chiudi Qube" type="button">×</button></div><div id="qubeMessages" class="qube-messages" aria-live="polite"></div><div class="qube-quick"><button type="button" data-qube="Apri scanner">Scanner</button><button type="button" data-qube="Mostra monitorati">Monitorati</button><button type="button" data-qube="Controlla rischio">Rischi</button></div><div class="qube-compose"><input id="qubeInput" maxlength="500" aria-label="Messaggio a Qube" placeholder="Chiedi a Qube…"><button type="button" id="qubeSend">Invia</button></div><small class="qube-note">Modalità locale a regole. Non è ChatGPT né una IA generativa. Nessuna operazione su wallet.</small>';
 const open=el('button','qube-fab','✦ Qube');open.id='qubeFab';open.type='button';open.setAttribute('aria-label','Apri assistente Qube');
 document.body.append(panel,open);
 open.onclick=()=>{panel.hidden=false;open.hidden=true;$('qubeInput')?.focus();if(!state.history.length)say('assistant',help());};
 $('qubeClose').onclick=()=>{panel.hidden=true;open.hidden=false;};
 $('qubeSend').onclick=submit;
 $('qubeInput').onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();submit();}};
 panel.querySelectorAll('[data-qube]').forEach(b=>b.onclick=()=>{$('qubeInput').value=b.dataset.qube;submit();});
}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();