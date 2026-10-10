(()=>{
'use strict';
const $=i=>document.getElementById(i),q=(s,r=document)=>r.querySelector(s);
const state={busy:false,cache:null,cacheAt:0,current:null,request:0};
async function J(url,opt={}){const r=await fetch(url,{...opt,signal:AbortSignal.timeout(20000)});let d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d?.error||String(r.status));return d}
async function marketContext(){if(state.cache&&Date.now()-state.cacheAt<60000)return state.cache;const [a,b,c]=await Promise.allSettled([J('/api/chain?v=275',{cache:'no-store'}),J('/api/intelligence?v=275',{cache:'no-store'}),J('/api/news-v26?v=275',{cache:'no-store'})]);state.cache={chain:a.status==='fulfilled'?a.value:null,intel:b.status==='fulfilled'?b.value:null,news:c.status==='fulfilled'?c.value:null};state.cacheAt=Date.now();return state.cache}
function profile(){const name=($('profileName')?.value||$('profileNameTop')?.textContent||'Doriano').trim()||'Doriano',initial=(name.match(/[A-Za-zÀ-ÿ0-9]/)?.[0]||'D').toUpperCase();['avatar','v23ProfileAvatar','v26ProfileInitial'].forEach(id=>{const x=$(id);if(x){x.textContent=initial;x.classList.add('v275-initial')}});$('avatarSelect')?.remove()}
function alertKey(c){return c?.id?'id:'+c.id:c?.address?'address:'+String(c.address).toLowerCase():''}
function alertList(){try{return JSON.parse(localStorage.getItem('kiber_alerts_v274')||'[]')}catch{return[]}}
function saveAlerts(a){try{localStorage.setItem('kiber_alerts_v274',JSON.stringify(a.slice(0,120)))}catch{}}
async function toggleAlert(){const c=window.kiberTokenContext?.()?.coin;if(!c)return;const k=alertKey(c);let a=alertList(),i=a.findIndex(x=>x.key===k);if(i>=0)a.splice(i,1);else{if('Notification'in window&&Notification.permission==='default'){try{await Notification.requestPermission()}catch{}}a.unshift({key:k,id:c.id||null,address:c.address||null,symbol:c.symbol||'',name:c.name||'',thresholdPct:3,price:true,news:true,at:Date.now()})}saveAlerts(a);syncAlertButton()}
function syncAlertButton(){const b=$('v271Monitor'),c=window.kiberTokenContext?.()?.coin;if(!b)return;const on=c&&alertList().some(x=>x.key===alertKey(c));b.textContent=on?'🔔 Avvisi attivi':'🔔 Attiva avvisi';b.onclick=toggleAlert}
function ensureSheet(){
 if($('v275Sheet'))return;
 const s=document.createElement('section');s.id='v275Sheet';s.className='v275-sheet';s.setAttribute('aria-hidden','true');
 s.innerHTML='<div class="v275-backdrop" data-v275-close></div><div class="v275-panel"><header><div class="v275-sheet-brand"><img src="assets/kiber-logo.svg?v=275" alt="Kiber"><div><span>KIBER ORACLE</span><b id="v275SheetTitle">Analisi grafico</b></div></div><button class="v275-close" data-v275-close aria-label="Chiudi">×</button></header><main><div id="v275SheetAnswer" class="v275-answer">Premi Analizza per avviare la lettura.</div><small id="v275SheetMeta"></small><div class="v275-sheet-actions"><button id="v275Chat">Parla con Kiber</button><button id="v275Again">Rianalizza</button></div></main></div>';
 document.body.appendChild(s);s.addEventListener('click',e=>{if(e.target.closest('[data-v275-close]'))closeSheet()});$('v275Again').onclick=()=>state.current&&run(state.current);$('v275Chat').onclick=()=>{closeSheet();window.v268OpenChat?.('Approfondisci l’analisi del grafico che sto guardando. Spiegami movente, liquidità, cicli, news, macro, scenario futuro e cosa invaliderebbe la lettura.',false)}
}
function closeSheet(){const s=$('v275Sheet');if(!s)return;s.classList.remove('open');s.setAttribute('aria-hidden','true');document.body.classList.remove('v275-sheet-open')}
function openSheet(type){ensureSheet();state.current=type;const names={main:'BNB · analisi del grafico',chain:'BNB Chain · analisi del grafico',token:'Token · analisi del grafico'};$('v275SheetTitle').textContent=names[type]||'Analisi grafico';$('v275Sheet').classList.add('open');$('v275Sheet').setAttribute('aria-hidden','false');document.body.classList.add('v275-sheet-open');run(type)}
function makeButton(id,type){
 if($(id))return $(id);const b=document.createElement('button');b.id=id;b.type='button';b.className='v275-analyze';b.setAttribute('aria-label','Analizza con Kiber');b.innerHTML='<span class="v275-analyze-icon"><img src="assets/kiber-logo.svg?v=275" alt=""></span><span>Analizza</span>';b.onclick=()=>openSheet(type);return b
}
function ensureButtons(){
 const main=$('v269Chart');if(main&&!$('v275MainAnalyze'))main.insertAdjacentElement('afterend',makeButton('v275MainAnalyze','main'));
 const chain=q('.v26f-chart-wrap');if(chain&&!$('v275ChainAnalyze'))chain.insertAdjacentElement('afterend',makeButton('v275ChainAnalyze','chain'));
 const tok=$('v271Chart');if(tok&&!$('v275TokenAnalyze'))tok.insertAdjacentElement('afterend',makeButton('v275TokenAnalyze','token'));
 ['v274MainOracle','v274ChainOracle','v274TokenOracle'].forEach(id=>$(id)?.remove())
}
function daysFor(type){if(type==='main')return Number(q('[data-v269-days].active')?.dataset.v269Days)||30;if(type==='chain')return Number(q('[data-v26f-days].active')?.dataset.v26fDays)||30;return Number(window.kiberTokenContext?.()?.days)||30}
async function run(type){
 ensureSheet();const request=++state.request;state.busy=true;const ans=$('v275SheetAnswer'),meta=$('v275SheetMeta');ans.classList.add('loading');ans.textContent='Kiber sta incrociando grafico, volumi, liquidità, cicli, chain, news e contesto macro…';meta.textContent='Analisi in corso.';
 try{
   const mc=await marketContext(),tc=window.kiberTokenContext?.(),days=daysFor(type);let body;
   if(type==='token'&&tc?.coin){
     body={analysisMode:'chartoracle',analysisSubject:'token',message:'Analizza seriamente la moneta aperta sul periodo selezionato. Ricostruisci: 1) perché il prezzo è arrivato qui, 2) processo UP/DOWN e frequenza, 3) volume e liquidità realmente disponibili, 4) eventi e news rilevanti, 5) settore e BNB Chain, 6) scenario futuro dominante e alternativo, 7) conferme e invalidazione. Evita frasi generiche: se un dato manca dichiaralo e non usarlo.',token:tc.coin,tokenIntel:tc.intel,marketNews:tc.news||mc.news,chain:mc.chain?.chain,bnb:mc.chain?.bnb,analysis:{chart:{days,forecast:tc.forecast,source:tc.chartData?.source||'market',periodChange:$('v271PeriodChange')?.textContent||''},forensics:window.kiberForensicsContext?.()||null}}
   }else{
     const mode=type==='chain'?'BNB Chain':'BNB';
     body={analysisMode:'chartoracle',analysisSubject:type==='chain'?'chain':'bnb',message:'Analizza seriamente '+mode+' sul grafico selezionato ('+days+' giorni). Ricostruisci cosa ha prodotto il movimento fino ad ora, volume/liquidità/flussi disponibili, cicli e durata, BNB Chain/DEX/TVL, notizie realmente rilevanti, dollaro/tassi/SEC o macro solo se supportati dai dati, cosa è alle porte e scenario futuro dominante/alternativo con conferme e invalidazione. Evita frasi generiche e non inventare causalità.',bnb:mc.chain?.bnb,chain:mc.chain?.chain,intelligence:mc.intel,marketNews:mc.news,analysis:{chart:{days,periodChange:type==='chain'?$('v26fGraphMove')?.textContent:$('v269Change')?.textContent,high:$('v269High')?.textContent,low:$('v269Low')?.textContent,last:$('v269Last')?.textContent}}}
   }
   const r=await J('/api/kiber',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});if(request!==state.request)return;ans.textContent=r.answer||'Analisi non disponibile.';meta.textContent=(r.provider==='deterministic'?'Motore dati attivo. OpenAI non è ancora collegata alla piattaforma.':'OpenAI attiva')+(r.model?' · '+r.model:'');
 }catch(e){if(request!==state.request)return;ans.textContent='Analisi temporaneamente non disponibile.';meta.textContent='Errore di collegamento al motore Kiber.'}finally{if(request===state.request){ans.classList.remove('loading');state.busy=false}}
}
function tick(){profile();ensureButtons();syncAlertButton()}
function boot(){document.body.classList.add('v275');ensureSheet();setTimeout(tick,700);setInterval(tick,2000)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();