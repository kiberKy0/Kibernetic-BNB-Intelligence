/* Original-code vault: local IndexedDB only, hash-matched, never execute uploaded JS.
   The archived bytes, not reconstructed source snippets, are the canonical original.
 */
(function(){
'use strict';
const D=window.KiberBustabitArchiveData;
if(!D)return;
const $=id=>document.getElementById(id);
const n=v=>Number(v).toLocaleString('it-IT',{maximumFractionDigits:2});
const signed=v=>(v>0?'+':'')+n(v);
const status=t=>{const e=$('bfArchiveStatus');if(e)e.textContent=t};
const cache=new Map();
const DATABASE='kiber-bustabit-v2-private-sources',STORE='originals';
let database=null;
function openDatabase(){
 return new Promise((resolve)=>{
  if(!window.indexedDB){resolve(null);return}
  const req=indexedDB.open(DATABASE,1);
  req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'sha'})};
  req.onsuccess=()=>resolve(req.result);
  req.onerror=()=>resolve(null);
  req.onblocked=()=>resolve(null);
 });
}
function transact(mode,work){
 if(!database)return Promise.resolve(null);
 return new Promise(resolve=>{
  try{
   const t=database.transaction(STORE,mode),store=t.objectStore(STORE),request=work(store);
   request.onsuccess=()=>resolve(request.result);
   request.onerror=()=>resolve(null);
   t.onerror=()=>resolve(null);
  }catch(_){resolve(null)}
 });
}
async function readKnown(){
 for(const file of D.codes){
  const saved=await transact('readonly',store=>store.get(file.sha));
  if(saved?.bytes)cache.set(file.sha,saved);
 }
 renderCodes();
}
function make(tag,className,text){
 const e=document.createElement(tag);if(className)e.className=className;
 if(text!==undefined)e.textContent=text;return e;
}
function showDialog(entry){
 const record=cache.get(entry.sha);if(!record)return;
 $('bfSourceTitle').textContent=entry.name+' · originale';
 $('bfSourceDigest').textContent='SHA-256 '+entry.sha+' · '+n(record.bytes.byteLength)+' byte';
 $('bfSourceText').textContent=new TextDecoder('utf-8').decode(record.bytes);
 $('bfSourceDialog').showModal();
}
function download(entry){
 const record=cache.get(entry.sha);if(!record)return;
 const blob=new Blob([record.bytes],{type:'text/javascript;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=entry.file;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
}
async function forget(entry){
 cache.delete(entry.sha);
 await transact('readwrite',s=>s.delete(entry.sha));
 renderCodes();status('Copia locale di '+entry.file+' eliminata solo da questo browser. Nessun originale della Libreria modificato.');
}
function renderCodes(){
 const root=$('bfArchiveCards');if(!root)return;
 root.replaceChildren();
 for(const entry of D.codes){
  const saved=cache.has(entry.sha);
  const card=make('article','bf-code');
  const head=make('div','bf-code-title');
  head.append(make('b','',entry.name),make('span','bf-pill '+(saved?'':'warn'),saved?'ORIGINALE IMPORTATO':'DA IMPORTARE'));
  card.append(head,make('small','bf-state',entry.state));
  card.append(make('p','bf-sub',entry.detail));
  const test=make('div','bf-mini');
  test.append(make('b','',entry.test),make('small','',entry.file+' · '+n(entry.bytes)+' byte'));
  card.append(test);
  const digest=make('code','bf-digest','SHA-256 '+entry.sha);card.append(digest);
  const actions=make('div','bf-card-actions');
  const preview=make('button','bf-action','Leggi originale');preview.disabled=!saved;
  preview.addEventListener('click',()=>showDialog(entry));
  const down=make('button','bf-action secondary','Scarica .js');down.disabled=!saved;
  down.addEventListener('click',()=>download(entry));
  actions.append(preview,down);
  if(saved){
   const del=make('button','bf-action danger','Rimuovi locale');
   del.addEventListener('click',()=>forget(entry));actions.append(del);
  }
  card.append(actions);root.append(card);
 }
 const count=D.codes.filter(c=>cache.has(c.sha)).length;
 $('bfSourceCount').textContent=count+' / '+D.codes.length+' sorgenti originali conservati su questo dispositivo';
}
async function digestBytes(buffer){
 if(!crypto?.subtle?.digest)throw new Error('SHA-256 non disponibile in questo browser');
 const hash=await crypto.subtle.digest('SHA-256',buffer);
 return Array.from(new Uint8Array(hash),v=>v.toString(16).padStart(2,'0')).join('');
}
async function importFiles(files){
 if(!files?.length)return;
 let added=0,ignored=0,errors=[];
 for(const file of Array.from(files).slice(0,20)){
  if(!/\.js$/i.test(file.name)||file.size>1048576){ignored++;continue}
  try{
   const bytes=await file.arrayBuffer(),sha=await digestBytes(bytes);
   const match=D.codes.find(v=>v.sha===sha && v.bytes===bytes.byteLength);
   if(!match){errors.push(file.name+' non coincide con una delle 6 versioni originali catalogate');continue}
   if(cache.has(sha)){ignored++;continue}
   const record={sha,filename:match.file,bytes,verifiedAt:new Date().toISOString()};
   const stored=await transact('readwrite',s=>s.put(record));
   cache.set(sha,record);added++;
   if(!database)errors.push('Memoria locale non disponibile: file consultabile solo fino a chiusura della pagina');
  }catch(e){errors.push(file.name+': '+e.message)}
 }
 renderCodes();
 status('Importati '+added+' originali senza modifiche; '+ignored+' duplicati/non ammessi.'+(errors.length?' '+errors.join('; '):'')+' Nessun file trasmesso al server.');
}
function renderEvidence(){
 $('bfStatBets').textContent=n(D.evidence.bets);
 $('bfStatWins').textContent=n(D.evidence.wins);
 $('bfStatNet').textContent=signed(D.evidence.netBits)+' bit';
 $('bfStatTests').textContent='29 / 29';
 $('bfReportHash').textContent='SHA-256 registro: '+D.evidence.sha256;
 $('bfSourceLabel').textContent=D.evidence.name;
 const body=$('bfStrategyRows');body.replaceChildren();
 const sorted=[...D.strategies].sort((a,b)=>b.bets-a.bets);
 for(const row of sorted){
  const tr=make('tr');
  [row.name,n(row.bets),n(row.wins),n(100*row.wins/row.bets)+'%',signed(row.net)+' bit'].forEach((s,i)=>{
   const td=make('td',i>0?'num':'',s);
   if(i===4)td.classList.add(row.net<0?'bf-negative':'bf-positive');
   tr.append(td);
  });
  body.append(tr);
 }
 const total=make('tr');total.style.fontWeight='800';
 ['TOTALE',n(D.evidence.bets),n(D.evidence.wins),n(100*D.evidence.wins/D.evidence.bets)+'%',signed(D.evidence.netBits)+' bit'].forEach((s,i)=>{
  const td=make('td',i>0?'num':'',s);if(i===4)td.classList.add('bf-negative');total.append(td)
 });body.append(total);
 const teach=$('bfTeachSelect');
 D.strategies.forEach(s=>{const o=make('option','',s.name);o.value=s.name;teach.append(o)});
 D.controls.forEach(s=>{const o=make('option','',s[0]);o.value=s[0];teach.append(o)});
 teach.addEventListener('change',explain);explain();
}
function explain(){
 const name=$('bfTeachSelect').value;
 const st=D.strategies.find(x=>x.name===name),control=D.controls.find(x=>x[0]===name);
 $('bfTeachTitle').textContent='Kiber spiega: '+name;
 if(st){
  $('bfTeachText').textContent=st.what;
  $('bfTeachEvidence').textContent='Registro 7 novembre 2026: '+st.bets+' puntate annotate, '+st.wins+' vittorie, saldo '+signed(st.net)+' bit. Fonte: CSV storico; puntate con fondi reali non certificate.';
 }else{
  $('bfTeachText').textContent=control?.[1]||'Seleziona una famiglia di algoritmi.';
  $('bfTeachEvidence').textContent='Regola da verificare nei log della versione corrispondente. Nessuna efficacia predittiva dimostrata.';
 }
}
$('bfArchiveImport')?.addEventListener('change',async e=>{await importFiles(e.target.files);e.target.value=''});
$('bfSourceClose')?.addEventListener('click',()=>$('bfSourceDialog').close());
$('bfSourceDownload')?.addEventListener('click',()=>{
 const entry=D.codes.find(x=>$('bfSourceTitle').textContent.startsWith(x.name));
 if(entry)download(entry);
});
$('bfSourceCopy')?.addEventListener('click',async()=>{
 try{await navigator.clipboard.writeText($('bfSourceText').textContent);status('Codice copiato come testo. Per conservare i byte esatti, usa Scarica .js.')}
 catch(e){status('Copia automatica non autorizzata dal browser: usa Scarica .js.')}
});
renderEvidence();renderCodes();
openDatabase().then(db=>{database=db;readKnown();});
})();
