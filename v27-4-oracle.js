(()=>{
'use strict';
const $=i=>document.getElementById(i),q=(s,r=document)=>r.querySelector(s);
function profile(){const name=($('profileName')?.value||$('profileNameTop')?.textContent||'Doriano').trim()||'Doriano',initial=(name.match(/[A-Za-zÀ-ÿ0-9]/)?.[0]||'D').toUpperCase();['avatar','v23ProfileAvatar','v26ProfileInitial'].forEach(id=>{const x=$(id);if(x){x.textContent=initial;x.classList.add('v275-initial')}});$('avatarSelect')?.remove()}
function openSheet(type){const tc=type==='token'?window.kiberTokenContext?.():null;const scope={subject:type==='main'?'bnb':type==='chain'?'chain':'token',tokenContext:tc?JSON.parse(JSON.stringify(tc)):null,forensics:type==='token'?JSON.parse(JSON.stringify(window.kiberForensicsContext?.()||null)):null,chart:{days:daysFor(type),source:type==='token'?tc?.chartData?.source:null,periodChange:type==='token'?$('v271PeriodChange')?.textContent:type==='chain'?$('v26fGraphMove')?.textContent:$('v269Change')?.textContent}};window.v268OpenChat?.('Analizza '+(tc?.coin?.name||(type==='chain'?'BNB Chain':'BNB'))+' sul grafico selezionato.',true,scope)}
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
function tick(){profile();ensureButtons()}
function boot(){document.body.classList.add('v275');setTimeout(tick,700);setInterval(tick,2000)}
document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();
})();