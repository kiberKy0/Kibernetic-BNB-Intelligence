/* XAU/USD · BNB-style 3D monitoring sphere, transparent revision times,
 * and in-app sector navigation. No fake online flags, brokerage or trading.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.XauFinanceNavigation=api;
 if(typeof document!=='undefined')api.init();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const ALLOWED=['finance','bustabit','bnb'];
 const RELEASE='/api/xau-revision';
 const $=id=>document.getElementById(id);
 const fmt=(date)=>{
   const n=Date.parse(date||'');
   if(!Number.isFinite(n))return 'Non verificato';
   return new Date(n).toLocaleString('it-IT',{timeZone:'Europe/Rome',
     day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'});
 };
 let analysis=null,revisionLoaded=0,releaseBusy=false;
 function assign(id,text){
   const element=$(id);
   if(element)element.textContent=String(text);
 }
 function setAnalyzed(report){
   const t=report?.at;
   if(!report?.validated||!Number.isFinite(Date.parse(t||'')))return;
   analysis={at:t,interval:String(report.interval||'—'),sourceTime:report.sourceTime||null};
   assign('xauOrbLastAnalysis',fmt(t)+' · periodo '+analysis.interval);
   assign('xauOrbLastCandle',analysis.sourceTime?fmt(analysis.sourceTime):'Non disponibile');
 }
 async function loadRevision(force=false){
   if(releaseBusy||(!force&&revisionLoaded&&Date.now()-revisionLoaded<300000))return;
   releaseBusy=true;
   try{
     const controller=new AbortController();
     const timeout=setTimeout(()=>controller.abort(),9000);
     let response;
     try{response=await fetch(RELEASE,{cache:'no-store',signal:controller.signal,headers:{Accept:'application/vnd.github+json'}})}
     finally{clearTimeout(timeout);}
     if(!response.ok)throw Error('GitHub '+response.status);
     const item=await response.json();
     const date=item?.at;
     const sha=item?.sha;
     if(item?.ok!==true||!date||!Number.isFinite(Date.parse(date))||typeof sha!=='string'||sha.length!==7)
       throw Error('Dati revisione non completi');
     assign('xauOrbLastRevision',fmt(date)+' · '+sha);
     const subject=String(item?.message||'').split('\n')[0].trim();
     assign('xauOrbRevisionNote',subject?subject.slice(0,125):'Ultima modifica del codice della pagina.');
     revisionLoaded=Date.now();
   }catch(_){
     assign('xauOrbLastRevision','Non verificabile ora');
     assign('xauOrbRevisionNote','Fonte GitHub non raggiungibile. Nessuna data inventata.');
     revisionLoaded=0;
   }finally{releaseBusy=false;}
 }
 function closeMenu(){
   const panel=$('xauDestinationsPanel'),button=$('xauDestinationsBtn');
   if(panel)panel.hidden=true;
   if(button)button.setAttribute('aria-expanded','false');
 }
 function toggleMenu(show){
   const panel=$('xauDestinationsPanel'),button=$('xauDestinationsBtn');
   if(!panel||!button)return;
   panel.hidden=!show;
   button.setAttribute('aria-expanded',String(show));
   if(show){
     $('xauBrokerInfo')?.setAttribute('hidden','');
     $('xauStatusPopover')?.setAttribute('hidden','');
     $('xauFeedOrb')?.setAttribute('aria-expanded','false');
   }
 }
 function destinationPath(destination){
   if(!ALLOWED.includes(destination))return null;
   const url=new URL('/',location.origin);
   url.searchParams.set('kiberDestination',destination);
   return url.pathname+url.search;
 }
 function navigate(destination){
   if(!ALLOWED.includes(destination))return false;
   closeMenu();
   let embedded=false;
   try{embedded=root.parent!==root&&!!root.parent.document.getElementById('goldPanel')}catch(_){}
   if(embedded){
     root.parent.postMessage({type:'KIBER_XAU_NAVIGATE',destination},location.origin);
   }else{
     // Standalone gold page: open the existing Bustabit lab directly,
     // not a non-existent /bustabit route. Finance/BNB use the shell.
     const target=destination==='bustabit'?'/bustabit-lab.html':destinationPath(destination);
     if(target)root.location.assign(target);
   }
   return true;
 }
 let initialized=false;
 function init(){
   if(initialized)return;
   if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init,{once:true});return;}
   initialized=true;
   $('xauDestinationsBtn')?.addEventListener('click',()=>{
     toggleMenu($('xauDestinationsPanel')?.hidden===true);
   });
   for(const destination of ALLOWED){
     $('xauDestination'+destination[0].toUpperCase()+destination.slice(1))?.addEventListener('click',()=>navigate(destination));
   }
   $('xauDestinationsClose')?.addEventListener('click',closeMenu);
   $('xauFeedOrb')?.addEventListener('click',()=>{
     if($('xauStatusPopover')?.hidden===false){void loadRevision();}
   });
   $('xauStatusRefresh')?.addEventListener('click',()=>void loadRevision(true));
   document.addEventListener('keydown',event=>{
     if(event.key==='Escape')closeMenu();
   });
   document.addEventListener('pointerdown',event=>{
     const menu=$('xauDestinationsPanel'),button=$('xauDestinationsBtn');
     if(menu&&!menu.hidden&&!menu.contains(event.target)&&!button?.contains(event.target))closeMenu();
   });
   if(analysis)setAnalyzed({...analysis,validated:true});
 }
 return {init,navigate,destinationPath,setAnalyzed,loadRevision,fmt};
});
