/* Kiber account: one local name + one illustrated planet in BNB and XAU/USD. */
(function(root){
 'use strict';
 const KEY='kiber_v17_profile';
 const items=[
  {id:'astra',name:'Astra',a:'#4ae0ff',b:'#1449a9',c:'#0b2052',ring:'#92edff'},
  {id:'orion',name:'Orion',a:'#cda7ff',b:'#6538c7',c:'#1c1549',ring:'#d9a9ff'},
  {id:'aurum',name:'Aurum',a:'#ffe6a0',b:'#b27624',c:'#503214',ring:'#ffe7ab'},
  {id:'verdant',name:'Verdant',a:'#95fad8',b:'#19886f',c:'#0e433d',ring:'#c0f5b4'},
  {id:'nebula',name:'Nebula',a:'#f2a1e8',b:'#a247a2',c:'#312051',ring:'#e7c8ff'},
  {id:'quantis',name:'Quantis',a:'#dcecff',b:'#6f90d9',c:'#263d81',ring:'#a6ebff'}
 ];
 const ids=new Set(items.map(i=>i.id));
 const safe=id=>ids.has(id)?id:'astra';
 function read(){try{const p=JSON.parse(localStorage.getItem(KEY)||'{}');return p&&typeof p==='object'?p:{}}catch{return {}}}
 function write(p){try{localStorage.setItem(KEY,JSON.stringify({...read(),...p}))}catch{}refresh()}
 function svg(id){
  const p=items.find(x=>x.id===safe(id));
  const rings=['orion','nebula','aurum'].includes(p.id);
  const str=[
   '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144 144">',
   '<defs><radialGradient id="space"><stop stop-color="#182e57"/><stop offset="1" stop-color="#071426"/></radialGradient>',
   '<radialGradient id="planet" cx=".27" cy=".22" r=".89"><stop stop-color="'+p.a+'"/><stop offset=".51" stop-color="'+p.b+'"/><stop offset="1" stop-color="'+p.c+'"/></radialGradient>',
   '<linearGradient id="stripe" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".34"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>',
   '<circle cx="72" cy="72" r="70" fill="url(#space)"/>',
   '<g fill="#e7faff" opacity=".8"><circle cx="20" cy="29" r="1.6"/><circle cx="120" cy="26" r="1"/><circle cx="128" cy="112" r="1.6"/><circle cx="22" cy="115" r="1.3"/><circle cx="102" cy="119" r="1"/></g>',
   rings?'<ellipse cx="72" cy="78" rx="65" ry="19" fill="none" stroke="'+p.ring+'" stroke-opacity=".75" stroke-width="6" transform="rotate(-24 72 78)"/>':'',
   '<circle cx="72" cy="72" r="45" fill="url(#planet)" stroke="#ffffff" stroke-opacity=".22" stroke-width="1"/>',
   '<path d="M37 62 Q75 40 111 61 M31 75 Q72 55 116 76 M35 91 Q76 74 108 94" stroke="url(#stripe)" fill="none" stroke-width="10" stroke-linecap="round" opacity=".55"/>',
   '<ellipse cx="59" cy="52" rx="17" ry="9" fill="#fff" opacity=".16" transform="rotate(-27 59 52)"/>',
   rings?'<path d="M18 100 Q66 129 128 53" stroke="'+p.ring+'" stroke-width="6" stroke-opacity=".9" fill="none" stroke-linecap="round"/>':'',
   '</svg>'
  ].join('');
  return 'data:image/svg+xml;charset=UTF-8,'+encodeURIComponent(str);
 }
 function paint(el,id){
  if(!el)return;el.style.backgroundImage='url("'+svg(id)+'")';
  el.style.backgroundPosition='center';el.style.backgroundSize='cover';el.style.backgroundRepeat='no-repeat';
  el.style.borderRadius='50%';el.style.color='transparent';
  el.textContent='';
  el.setAttribute('aria-label','Pianeta '+items.find(x=>x.id===safe(id)).name);
 }
 function build(host,initial){
  if(!host)return;host.classList.add('kiber-planet-grid');host.replaceChildren();
  items.forEach(p=>{
    const button=document.createElement('button');button.type='button';button.className='kiber-planet-option';button.dataset.planet=p.id;button.setAttribute('aria-label','Seleziona pianeta '+p.name);
    const pic=document.createElement('span');pic.className='kiber-planet-thumbnail';paint(pic,p.id);
    const title=document.createElement('span');title.textContent=p.name;
    button.append(pic,title);button.onclick=()=>select(host,p.id);host.append(button);
  });
  select(host,initial);
 }
 function select(host,id){
  host.dataset.selectedPlanet=safe(id);
  host.querySelectorAll('[data-planet]').forEach(b=>{const current=b.dataset.planet===host.dataset.selectedPlanet;b.classList.toggle('selected',current);b.setAttribute('aria-pressed',String(current))});
 }
 function selection(host){const el=typeof host==='string'?document.getElementById(host):host;return safe(el?.dataset.selectedPlanet||read().planet)}
 function refresh(){
  const p=read(),id=safe(p.planet);
  ['avatar','xauProfileAvatar'].forEach(name=>paint(document.getElementById(name),id));
  const x=document.getElementById('xauProfileName');if(x)x.textContent=p.name||'Profilo';
  const b=document.getElementById('profileNameTop');if(b)b.textContent=p.name||'Profilo';
 }
 function init(){
  const b=document.getElementById('bnbPlanetChoices');
  const x=document.getElementById('xauPlanetChoices');
  if(b){build(b,read().planet);document.getElementById('saveProfile')?.addEventListener('click',()=>{
    write({name:document.getElementById('profileName')?.value?.trim().slice(0,60)||'',planet:selection(b)});
  });}
  if(x){build(x,read().planet);document.getElementById('xauProfileForm')?.addEventListener('submit',()=>{
    write({name:document.getElementById('xauProfileEditName')?.value?.trim().slice(0,60)||'',planet:selection(x)});
  });}
  refresh();
 }
 root.KiberPlanets={items,read,write,svg,paint,build,select,selection,refresh};
 if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
 }
 if(typeof window!=='undefined')window.addEventListener('storage',e=>{if(e.key===KEY)refresh()});
})(typeof window!=='undefined'?window:globalThis);