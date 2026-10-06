(()=>{
'use strict';
const $=i=>document.getElementById(i),q=(s,r=document)=>r.querySelector(s),qa=(s,r=document)=>[...r.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const state={sig:{},busy:{},cache:null,cacheAt:0};
async function J(url,opt={}){const r=await fetch(url,opt);let d={};try{d=await r.json()}catch{}if(!r.ok)throw Error(d?.error||String(r.status));return d}
async function marketContext(){if(state.cache&&Date.now()-state.cacheAt<60000)return state.cache;const [a,b,c]=await Promise.allSettled([J('/api/chain?v=274',{cache:'no-store'}),J('/api/intelligence?v=274',{cache:'no-store'}),J('/api/news-v26?v=274',{cache:'no-store'})]);state.cache={chain:a.status==='fulfilled'?a.value:null,intel:b.status==='fulfilled'?b.value:null,news:c.status==='fulfilled'?c.value:null};state.cacheAt=Date.now();return state.cache}
function profile(){
  const name=($('profileName')?.value||$('profileNameTop')?.textContent||'Doriano').trim()||'Doriano',initial=(name.match(/[A-Za-zÀ-ÿ0-9]/)?.[0]||'D').toUpperCase();
  ['avatar','v23ProfileAvatar','v26ProfileInitial'].forEach(id=>{const x=$(id);if(x){x.textContent=initial;x.classList.add('v274-initial')}});
  const old=$('avatarSelect');if(old)old.remove();
}
function alertKey(c){return c?.id?'id:'+c.id:c?.address?'address:'+String(c.address).toLowerCase():''}
function alertList(){try{return JSON.parse(localStorage.getItem('kiber_alerts_v274')||'[]')}catch{return[]}}
function saveAlerts(a){try{localStorage.setItem('kiber_alerts_v274',JSON.stringify(a.slice(0,120)))}catch{}}
async function toggleAlert(){
  const c=window.kiberTokenContext?.()?.coin;if(!c)return;const k=alertKey(c);let a=alertList(),i=a.findIndex(x=>x.key===k);
  if(i>=0)a.splice(i,1);else{if('Notification'in window&&Notification.permission==='default'){try{await Notification.requestPermission()}catch{}}a.unshift({key:k,id:c.id||null,address:c.address||null,symbol:c.symbol||'',name:c.name||'',thresholdPct:3,price:true,news:true,at:Date.now()})}
  saveAlerts(a);syncAlertButton();
}
function syncAlertButton(){const b=$('v271Monitor'),c=window.kiberTokenContext?.()?.coin;if(!b)return;const on=c&&alertList().some(x=>x.key===alertKey(c));b.textContent=on?'🔔 Avvisi attivi':'🔔 Attiva avvisi';b.onclick=toggleAlert}
function card(id,label){
  let x=$(id);if(x)return x;x=document.createElement('section');x.id=id;x.className='v274-oracle';x.innerHTML='<div class="v274-face"><img src="assets/kiber-face.svg?v=274" alt="Kiber"></div><div class="v274-copy"><span>PREVISIONE KIBER</span><b>'+esc(label)+'</b><p data-v274-text>Kiber sta unendo grafico, liquidità, flussi, chain, news e contesto macro.</p><small data-v274-meta>Analisi automatica in preparazione.</small><div class="v274-actions"><button data-v274-chat>Parla con Kiber</button><button data-v274-refresh>Rianalizza</button></div></div>';return x}
function ensureCards(){
 const main=$('v269Chart');if(main&&!$('v274MainOracle')){const c=card('v274MainOracle','BNB · lettura del grafico');main.insertAdjacentElement('afterend',c);wire(c,'main')}
 const home=$('v26fChart');if(home&&!$('v274ChainOracle')){const c=card('v274ChainOracle','BNB Chain · lettura del grafico');q('.v26f-chart-wrap')?.insertAdjacentElement('afterend',c);wire(c,'chain')}
 const tok=$('v271Chart');if(tok&&!$('v274TokenOracle')){const c=card('v274TokenOracle','Token · lettura del grafico');tok.insertAdjacentElement('afterend',c);wire(c,'token')}
}
function wire(c,type){q('[data-v274-chat]',c).onclick=()=>window.v268OpenChat?.(type==='token'?'Analizza la moneta aperta e il suo grafico. Voglio movente, processo UP/DOWN, liquidità, tempi, news, rischi e scenario futuro.':'Analizza il grafico aperto e spiegami movente, liquidità, cicli, macro, news, rischi e scenario futuro.',false);q('[data-v274-refresh]',c).onclick=()=>run(type,true)}
function sig(type){
 if(type==='main')return [q('[data-v269-days].active')?.dataset.v269Days,$('v269Last')?.textContent,$('v269Change')?.textContent].join('|');
 if(type==='chain')return [q('[data-v26f-mode].active')?.dataset.v26fMode,q('[data-v26f-days].active')?.dataset.v26fDays,$('v26fGraphMove')?.textContent].join('|');
 const c=window.kiberTokenContext?.();return [c?.coin?.id||c?.coin?.address,c?.days,c?.chartData?.points?.length,c?.intel?.technical?.candles?.length,c?.forecast?.score].join('|')
}
async function run(type,force=false){
 const id=type==='main'?'v274MainOracle':type==='chain'?'v274ChainOracle':'v274TokenOracle',box=$(id);if(!box||state.busy[type])return;const s=sig(type);if(!force&&(!s||s===state.sig[type]))return;state.sig[type]=s;state.busy[type]=true;const p=q('[data-v274-text]',box),meta=q('[data-v274-meta]',box);p.textContent='Kiber sta ricostruendo il movimento e confrontando le fonti…';meta.textContent='Prezzo + volumi + liquidità + chain + news + macro quando disponibili.';
 try{
  const mc=await marketContext(),tc=window.kiberTokenContext?.();let body;
  if(type==='token'&&tc?.coin){body={analysisMode:'chartoracle',message:'Analizza automaticamente il grafico della moneta aperta. Ricostruisci perché è arrivata qui, processo UP/DOWN, durata e ricorrenza, volume e liquidità disponibili, notizie/eventi, settore e contesto BNB. Poi dammi scenario futuro dominante, scenario contrario, conferme e invalidazione. Non inventare causalità o dati mancanti.',token:tc.coin,tokenIntel:tc.intel,marketNews:tc.news||mc.news,chain:mc.chain?.chain,bnb:mc.chain?.bnb,analysis:{chart:{days:tc.days,forecast:tc.forecast,source:tc.chartData?.source||'market'},forensics:window.kiberForensicsContext?.()||null}}}
  else{const mode=type==='chain'?'BNB Chain':'BNB',days=Number(type==='chain'?q('[data-v26f-days].active')?.dataset.v26fDays:q('[data-v269-days].active')?.dataset.v269Days)||30;body={analysisMode:'chartoracle',message:'Analizza '+mode+' dal grafico corrente su '+days+' giorni. Spiega perché è arrivato qui, quali forze hanno spinto UP/DOWN, liquidità e flussi osservabili, contesto dollaro/tassi/SEC/regolamentazione e notizie realmente rilevanti, cosa è alle porte e quale scenario futuro è più supportato. Se usi informazioni web separa fatti, correlazioni e ipotesi.',bnb:mc.chain?.bnb,chain:mc.chain?.chain,intelligence:mc.intel,marketNews:mc.news,analysis:{chart:{days,periodChange:type==='chain'?$('v26fGraphMove')?.textContent:$('v269Change')?.textContent,high:$('v269High')?.textContent,low:$('v269Low')?.textContent}}}}
  const r=await J('/api/kiber',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});p.textContent=r.answer||'Analisi non disponibile.';meta.textContent=(r.provider==='deterministic'?'Modalità dati: collega OpenAI per ricerca e dialogo completi.':'IA attiva')+(r.model?' · '+r.model:'');
 }catch(e){p.textContent='Analisi temporaneamente non disponibile. Il grafico resta utilizzabile.';meta.textContent='Errore collegamento Kiber AI.'}finally{state.busy[type]=false}
}
function tick(){profile();ensureCards();syncAlertButton();['main','chain','token'].forEach(t=>run(t,false))}
function boot(){document.body.classList.add('v274');setTimeout(tick,900);setInterval(tick,2500)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();