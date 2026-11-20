/* Kiber IA Finance · return to Home / BNB market / original Bustabit Lab.
 * Works from embedded gold iframe, or from standalone /xau-usd through a URL route.
 * No external links, credentials, orders, wallet operations or invented destinations.
 */
(function(){
 'use strict';
 if(typeof document==='undefined')return;
 const allowed=new Set(['finance','bnb','bustabit']);
 const $=id=>document.getElementById(id);
 function ready(destination){
   const app=$('app');
   let d=null;
   try{d=app?.contentDocument}catch(_){}
   if(!d||!d.getElementById('v241Home')||!d.getElementById('v241Back'))return false;
   if(destination==='bustabit'){
     const entry=d.getElementById('kiberHeaderBustabit') || $('kiberBustabitQuick');
     if(!entry||typeof entry.click!=='function')return false;
   }
   return true;
 }
 function hideGold(){
   const panel=$('goldPanel'),button=$('switchGold');
   if(panel)panel.hidden=true;
   if(button)button.setAttribute('aria-expanded','false');
   try{$('app')?.contentWindow?.KiberPlanets?.refresh()}catch(_){}
 }
 function route(destination){
   if(!allowed.has(destination)||!ready(destination))return false;
   hideGold();
   let d;
   try{d=$('app').contentDocument}catch(_){return false;}
   if(destination==='bustabit'){
     const button=d.getElementById('kiberHeaderBustabit')||$('kiberBustabitQuick');
     button.click();
     return true;
   }
   // IA Finance is the home dashboard of the same application, not another website.
   d.getElementById('v241Back').click();
   if(destination==='bnb'){
     const button=d.querySelector('[data-v241-open="market"]');
     if(!button)return false;
     button.click(); // BNB market and token list, distinct from IA Finance Home
   }
   return true;
 }
 function routeEventually(destination){
   if(!allowed.has(destination))return;
   let tries=0;
   const timer=setInterval(()=>{
     tries++;
     if(route(destination)){
       clearInterval(timer);
       const url=new URL(location.href);
       url.searchParams.delete('kiberDestination');
       history.replaceState(null,'',url.pathname+url.search+url.hash);
     }else if(tries>=75){
       clearInterval(timer);
       // No fake navigation: home remains accessible if scripts fail to boot.
       console.warn('Kiber: destinazione non pronta, torna alla dashboard principale.');
     }
   },250);
 }
 window.addEventListener('message',e=>{
   const frame=$('goldFrame');
   if(e.origin!==location.origin||!frame||e.source!==frame.contentWindow)return;
   if(e.data?.type!=='KIBER_XAU_NAVIGATE')return;
   if(typeof e.data.destination!=='string'||!allowed.has(e.data.destination))return;
   routeEventually(e.data.destination);
 });
 const selected=new URLSearchParams(location.search).get('kiberDestination');
 if(selected&&allowed.has(selected))routeEventually(selected);
})();
