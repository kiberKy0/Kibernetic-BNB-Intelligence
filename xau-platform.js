/* Kiber XAU/USD · compact broker/MT5 drawer and verified update orb.
 * Accounts are NOT connected. Status is based on actual server checks and tick timestamps.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.XauPlatform=api;
 if(typeof document!=='undefined')api.init();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const MAX_AGE_MS=120000;
 const $=id=>document.getElementById(id);
 const str=x=>String(x??'');
 const validDate=x=>{
   const n=typeof x==='string'?Date.parse(x):NaN;
   return Number.isFinite(n)?n:null;
 };
 const fmt=x=>{
   const time=validDate(x);
   return time===null?'—':new Date(time).toLocaleString('it-IT',{
      timeZone:'Europe/Rome',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',second:'2-digit'
   });
 };
 let last=null,manualFailure=null;
 function derive(snapshot,now=Date.now()){
   if(!snapshot||!snapshot.quality?.ok||!snapshot.quality?.tick?.ok||
      !snapshot.quality.tick.fresh||snapshot.symbol!=='XAU/USD')
      return {state:'offline',label:'OFFLINE',detail:'Dati esterni non validati.'};
   const tick=validDate(snapshot.quality.tick.timestamp);
   const check=validDate(snapshot.timestamp);
   if(tick===null||check===null)
     return {state:'offline',label:'OFFLINE',detail:'Timestamp del tick o della verifica non presente.'};
   const tickAge=now-tick,checkAge=now-check;
   if(tickAge< -20000||checkAge< -20000||tickAge>MAX_AGE_MS||checkAge>MAX_AGE_MS)
      return {state:'stale',label:'DATI VECCHI',detail:'Nessuna verifica recente: non mostrare ONLINE.'};
   return {state:'online',label:'ONLINE',detail:'Feed esterno ricevuto e validato di recente.'};
 }
 function txt(id,value){const element=$(id);if(element)element.textContent=str(value);}
 function paint(){
   const orb=$('xauFeedOrb');if(!orb)return;
   const state=manualFailure?{state:'offline',label:'OFFLINE',detail:manualFailure}:
     derive(last,Date.now());
   orb.dataset.state=state.state;
   txt('xauFeedOrbText',state.label);
   txt('xauStatusState',state.detail);
   txt('xauStatusLastCheck',last?.timestamp?fmt(last.timestamp):'—');
   txt('xauStatusLastTick',last?.quality?.tick?.timestamp?fmt(last.quality.tick.timestamp):'—');
   txt('xauStatusLastBar',last?.lastClosedAt?fmt(last.lastClosedAt):'—');
   txt('xauStatusSource',last?.source||'Nessuna fonte verificata');
   orb.title=state.label+' · Ultima verifica '+(last?.timestamp?fmt(last.timestamp):'non disponibile');
 }
 function setChecking(){
   manualFailure=null;
   const orb=$('xauFeedOrb');
   if(orb){orb.dataset.state='checking';txt('xauFeedOrbText','VERIFICA');txt('xauStatusState','Controllo fonte XAU/USD in corso…');}
 }
 function setLive(feed){
   if(feed?.quality?.ok&&feed.quality.tick?.ok){
     last={symbol:feed.symbol,quality:{
       ok:true,tick:{ok:feed.quality.tick.ok,fresh:feed.quality.tick.fresh,
        timestamp:feed.quality.tick.timestamp}},
      timestamp:feed.timestamp,lastClosedAt:feed.lastClosedAt,source:feed.source};
     manualFailure=null;
   }else manualFailure='Il server non ha convalidato le quotazioni XAU/USD.';
   paint();
 }
 function setOffline(reason){
   manualFailure='Ultimo controllo non riuscito: '+str(reason||'feed non disponibile').slice(0,160);
   paint();
 }
 function toggleStatus(show){
   const pop=$('xauStatusPopover'),button=$('xauFeedOrb');
   if(!pop||!button)return;
   pop.hidden=!show;button.setAttribute('aria-expanded',String(show));
   if(show){closeBroker();paint();}
 }
 function setBrokerTab(type){
   const mt5=type==='mt5';
   const c=$('xauBrokerCTraderSection'),m=$('xauBrokerMt5Section');
   if(c)c.hidden=mt5;
   if(m)m.hidden=!mt5;
   $('xauBrokerCTraderTab')?.setAttribute('aria-pressed',String(!mt5));
   $('xauBrokerMt5Tab')?.setAttribute('aria-pressed',String(mt5));
 }
 function closeBroker(){
   const panel=$('xauBrokerInfo');if(panel)panel.hidden=true;
   $('xauBrokerOpen')?.setAttribute('aria-expanded','false');
   $('xauMt5Open')?.setAttribute('aria-expanded','false');
 }
 function showBroker(type){
   const panel=$('xauBrokerInfo');if(!panel)return;
   const isShown=!panel.hidden;
   const current=$('xauBrokerMt5Tab')?.getAttribute('aria-pressed')==='true'?'mt5':'ctrader';
   if(isShown&&current===type){closeBroker();return;}
   setBrokerTab(type);
   panel.hidden=false;
   $('xauBrokerOpen')?.setAttribute('aria-expanded',String(type==='ctrader'));
   $('xauMt5Open')?.setAttribute('aria-expanded',String(type==='mt5'));
   toggleStatus(false);
 }
 let initialized=false;
 function init(){
   if(initialized)return;
   if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',init,{once:true});return;}
   initialized=true;
   $('xauBrokerOpen')?.addEventListener('click',()=>showBroker('ctrader'));
   $('xauMt5Open')?.addEventListener('click',()=>showBroker('mt5'));
   $('xauBrokerCTraderTab')?.addEventListener('click',()=>setBrokerTab('ctrader'));
   $('xauBrokerMt5Tab')?.addEventListener('click',()=>setBrokerTab('mt5'));
   $('xauBrokerClose')?.addEventListener('click',closeBroker);
   $('xauFeedOrb')?.addEventListener('click',()=>toggleStatus($('xauStatusPopover')?.hidden===true));
   $('xauStatusClose')?.addEventListener('click',()=>toggleStatus(false));
   $('xauStatusRefresh')?.addEventListener('click',()=>{
     toggleStatus(false);
     $('refresh')?.click();
   });
   document.addEventListener('keydown',event=>{
     if(event.key==='Escape'){toggleStatus(false);closeBroker();}
   });
   setInterval(()=>{if(!document.hidden)paint();},10000);
   document.addEventListener('visibilitychange',()=>{if(!document.hidden)paint();});
   paint();
 }
 return {init,derive,setChecking,setLive,setOffline};
});
