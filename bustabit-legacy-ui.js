/* Focused classic-code overview. No news feed, no betting actions, no remote uploads. */
(function(){
'use strict';
const L=window.KiberBustabitLegacy;if(!L)return;
const $=id=>document.getElementById(id);
const n=v=>Number(v).toLocaleString('it-IT',{maximumFractionDigits:2});
const signed=v=>v===null?'N/D':(v>0?'+':'')+n(v)+' bit';
const el=(tag,cls,value)=>{const x=document.createElement(tag);if(cls)x.className=cls;if(value!==undefined)x.textContent=value;return x};
const audits=$('bfLegacyAudits');
if(audits)for(const item of L.audits){
 const article=el('article','bf-mini');
 const row=el('div','bf-code-title');
 row.append(el('b','',item.title),el('span','bf-pill warn',item.flag));
 const stats=el('small','','Puntate annotate: '+n(item.bets)+' · Vittorie: '+n(item.wins)+' · Risultato: '+signed(item.net));
 if(item.net<0)stats.classList.add('bf-negative');
 article.append(row,stats,el('small','',item.note));audits.append(article);
}
const bands=$('bfLegacyBands');
if(bands)for(const [key,title,range] of L.bands){
 const item=el('div','bf-band');
 item.append(el('b','',key),el('span','',title),el('small','',range));
 bands.append(item);
}
const sel=$('bfHistoricalSelect');
if(sel){
 for(const [key] of L.explanations){
  const option=el('option','',key);option.value=key;sel.append(option);
 }
 const render=()=>{
  const item=L.explanations.find(x=>x[0]===sel.value);
  $('bfHistoricalTitle').textContent='Kiber spiega · '+(item?.[0]||'Storico');
  $('bfHistoricalText').textContent=item?.[1]||'Seleziona una famiglia di codici.';
 };
 sel.addEventListener('change',render);render();
}
})();
