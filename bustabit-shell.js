/* Independent Bustabit area: mounts an entry on BNB's hub without changing BNB or XAU logic. */
(function(){
'use strict';
const app=document.getElementById('app');if(!app)return;
const css=document.createElement('style');css.textContent=
 '#kiberBustabitTab{border-color:#7469ad!important;background:#231c40!important;color:#f0e9ff!important}'+
 '#kiberBustabitTab b{color:#f0e9ff!important}'+
 '#kiberBustaOverlay{position:fixed;inset:0;z-index:40;background:#071321;color:#eaf4ff;display:flex;flex-direction:column;font-family:system-ui,sans-serif}'+
 '#kiberBustaOverlay[hidden]{display:none!important}'+
 '#kiberBustaFrame{width:100%;height:100%;flex:1;border:0;display:block;background:#08121f}'+
 '#kiberBustaTop{display:flex;align-items:center;justify-content:space-between;gap:10px;border-bottom:1px solid #314962;padding:8px 13px;background:#0d1d30}'+
 '#kiberBustaTop b{font-size:14px}#kiberBustaClose{border:1px solid #6485a4;background:#1b3a53;color:#fff;padding:10px 13px;border-radius:10px;min-height:42px}';
document.head.append(css);
/* Root-level entry: the new BNB home view may not display the legacy hubNav. */
const quick=document.createElement('button');
quick.id='kiberBustabitQuick';quick.type='button';
quick.textContent='🎯 Bustabit';
quick.setAttribute('aria-label','Apri Bustabit Intelligence Lab');
quick.setAttribute('aria-controls','kiberBustaOverlay');
quick.setAttribute('aria-expanded','false');
quick.style.cssText='position:fixed;right:12px;bottom:calc(84px + env(safe-area-inset-bottom,0px));z-index:38;min-height:48px;padding:10px 17px;border:1px solid #ab99ff;border-radius:15px;background:#251c48;color:#f5efff;box-shadow:0 8px 30px #0009;font:700 14px system-ui,sans-serif;cursor:pointer';
document.body.append(quick);

const layer=document.createElement('section');layer.id='kiberBustaOverlay';layer.hidden=true;layer.setAttribute('aria-label','Reparto Bustabit indipendente');
const top=document.createElement('div');top.id='kiberBustaTop';
const title=document.createElement('b');title.textContent='🎯 Kibernetic · Bustabit Intelligence';
const close=document.createElement('button');close.type='button';close.id='kiberBustaClose';close.textContent='← BNB';
top.append(title,close);
const frame=document.createElement('iframe');frame.id='kiberBustaFrame';frame.title='Laboratorio Bustabit, scanner e catalogo bot';frame.dataset.src='/bustabit-lab.html';
layer.append(top,frame);document.body.append(layer);
let lastNav=null;
function open(){
 if(!frame.src)frame.src=frame.dataset.src;
 layer.hidden=false;quick.setAttribute('aria-expanded','true');lastNav=document.getElementById('app')?.contentDocument?.getElementById('kiberBustabitTab')||lastNav;
 close.focus();
}
function shut(){layer.hidden=true;quick.setAttribute('aria-expanded','false');if(lastNav&&lastNav.isConnected)lastNav.focus()}
close.addEventListener('click',shut);
quick.addEventListener('click',open);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!layer.hidden)shut()});
window.addEventListener('message',e=>{if(e.origin===location.origin&&e.source===frame.contentWindow&&e.data?.type==='KIBER_BUSTABIT_CLOSE')shut()});
function mount(){
 let d;try{d=app.contentDocument}catch{return false}
 const nav=d?.getElementById('hubNav');if(!nav)return false;
 if(!d.getElementById('kiberBustabitInnerStyle')){
  const style=d.createElement('style');style.id='kiberBustabitInnerStyle';
  style.textContent='#kiberBustabitTab{border-color:#7469ad!important;background:#231c40!important;color:#f0e9ff!important}#kiberBustabitTab b{color:#f0e9ff!important}';
  d.head.append(style);
 }
 let btn=d.getElementById('kiberBustabitTab');
 if(!btn){
  btn=d.createElement('button');btn.type='button';btn.id='kiberBustabitTab';
  const b=d.createElement('b');b.textContent='🎯 Bustabit';
  const span=d.createElement('span');span.textContent='Scanner e bot';
  btn.append(b,span);nav.append(btn);
  btn.addEventListener('click',e=>{e.stopImmediatePropagation();open()},true);
 }
 return true;
}
app.addEventListener('load',()=>{if(!mount())setTimeout(mount,800)});
let retries=0;const poll=setInterval(()=>{if(mount()||++retries>=100)clearInterval(poll)},400);
})();