(()=>{
'use strict';
function initial(){
 const n=(document.getElementById('profileName')?.value||document.getElementById('profileNameTop')?.textContent||'Profilo').trim();
 return ((n.match(/[A-Za-zÀ-ÿ0-9]/)||['P'])[0]||'P').toUpperCase();
}
function ensure(){
 const a=document.getElementById('avatar');
 if(a){
  if(window.KiberPlanets?.refresh)window.KiberPlanets.refresh();
  else{a.textContent=initial();a.classList.add('v26-profile-top')}
 }
 const p=document.getElementById('v23ProfileAvatar');
 if(p){p.textContent=initial();p.classList.add('v274-profile-initial')}
 const hidden=document.getElementById('avatarSelect');
 if(hidden)hidden.hidden=true;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ensure,{once:true});
else ensure();
setTimeout(ensure,500);
window.addEventListener('pageshow',ensure);
})();