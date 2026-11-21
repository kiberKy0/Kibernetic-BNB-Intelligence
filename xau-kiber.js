/* XAU/USD: Kiber floating assistant, context-limited read-only analysis. */
(()=>{
 'use strict';
 const $=id=>document.getElementById(id);
 const create=(tag,cls,txt)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e;};
 let busy=false,request=null;
 function init(){
  if($('xauKiberFab'))return;
  const fab=create('button','xau-kiber-fab');fab.id='xauKiberFab';fab.type='button';fab.title='Apri assistente Kiber · XAU/USD';fab.setAttribute('aria-label','Apri assistente Kiber XAU/USD');
  const logo=create('img');logo.src='/assets/kiber-xau-blue-logo.svg?v=1';logo.alt='';logo.width=45;logo.height=45;fab.append(logo);
  const panel=create('section','xau-kiber-panel');panel.id='xauKiberPanel';panel.hidden=true;panel.setAttribute('role','dialog');panel.setAttribute('aria-modal','false');panel.setAttribute('aria-label','Assistente Kiber XAU/USD');
  panel.innerHTML='<div class="xau-kiber-top"><img src="/assets/kiber-xau-blue-logo.svg?v=1" width="37" height="37" alt=""><div><strong>Kiber · XAU/USD</strong><small>Analisi oro · dati verificati</small></div><button type="button" id="xauKiberClose" aria-label="Chiudi assistente">×</button></div><div class="xau-kiber-messages" id="xauKiberMessages" aria-live="polite"></div><div class="xau-kiber-quick"><button type="button" data-query="Perché sei in attesa?">Perché attesa?</button><button type="button" data-query="Quali condizioni mancano per un ingresso?">Cosa manca?</button><button type="button" data-query="Spiega il trend attuale e i livelli osservabili.">Analizza</button></div><form id="xauKiberForm" class="xau-kiber-compose"><input id="xauKiberInput" aria-label="Domanda su XAU/USD" maxlength="800" autocomplete="off" placeholder="Chiedi a Kiber…"><button type="submit">Invia</button></form><small id="xauKiberNote">Il widget TradingView è separato dai dati del Decoder. Nessun ordine.</small>';
  document.body.append(fab,panel);
  const messages=$('xauKiberMessages');
  function say(role,value){
   const item=create('p','xau-kiber-message '+role,String(value).slice(0,6000));
   messages.append(item);messages.scrollTop=messages.scrollHeight;
  }
  function close(){
   try{request?.abort()}catch{}request=null;busy=false;
   panel.hidden=true;fab.hidden=false;
  }
  fab.onclick=()=>{panel.hidden=false;fab.hidden=true;
    if(!messages.childNodes.length)say('assistant','Sono Kiber. Posso spiegarti trend, indicatori e condizioni del Decoder XAU/USD. Se manca il feed, ti dirò perché non posso validare un ingresso.');
    $('xauKiberInput').focus();
  };
  $('xauKiberClose').onclick=close;
  async function submit(q){
   q=String(q||'').trim().slice(0,800);if(busy||!q)return;
   say('user',q);busy=true;$('xauKiberInput').value='';request=new AbortController();
   const button=$('xauKiberForm').querySelector('button');button.disabled=true;
   const timeout=setTimeout(()=>request?.abort(),25000);
   try{
    const analysis=window.KiberXauContext||{state:'WAIT',mode:'unverified',source:'Dati assenti'};
    const response=await fetch('/api/kiber',{method:'POST',headers:{'Content-Type':'application/json'},
      signal:request.signal,body:JSON.stringify({message:q,analysisSubject:'xau',analysisMode:'xau',analysis})});
    if(!response.ok)throw Error('Non disponibile');
    const data=await response.json();
    say('assistant',data.answer||'Non sono disponibili dati sufficienti per rispondere.');
    $('xauKiberNote').textContent=data.provider==='deterministic'
      ?'Risposta tecnica locale · IA esterna non disponibile. Nessun ordine.'
      :'Risposta IA su dati XAU/USD disponibili · nessun ordine.';
   }catch{if(!panel.hidden)say('assistant','Non riesco a raggiungere il servizio Kiber. Il grafico resta consultabile, ma non posso verificare segnali.')}
   finally{clearTimeout(timeout);busy=false;request=null;button.disabled=false}
  }
  $('xauKiberForm').onsubmit=e=>{e.preventDefault();void submit($('xauKiberInput').value)};
  panel.querySelectorAll('[data-query]').forEach(b=>b.onclick=()=>void submit(b.dataset.query));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!panel.hidden)close()});
 }
 document.readyState==='loading'?document.addEventListener('DOMContentLoaded',init,{once:true}):init();
})();