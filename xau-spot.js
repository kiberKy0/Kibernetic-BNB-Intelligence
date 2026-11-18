/* Unauthenticated read-only indicative spot overlay for the existing XAU section. */
(function(){
 'use strict';
 const market=document.getElementById('xauCompactTop');
 if(!market)return;
 const wrap=market.querySelector('.xau-compact-price');
 const meta=document.getElementById('xauCompactMeta');
 if(!wrap||!meta)return;
 const originalPrice=document.getElementById('xauCompactPrice');
 if(originalPrice){
   const old=document.createElement('div');old.className='xau-ohlc-note';
   old.append(document.createTextNode('Chiusura OHLC Decoder: '),originalPrice);
   meta.prepend(old);
 }
 wrap.querySelector('small').textContent='SPOT INDICATIVO · NON MT5';
 const display=wrap.querySelector('strong');
 display.replaceChildren();
 const price=document.createElement('span');price.id='xauSpotPrice';price.textContent='—';
 const unit=document.createElement('span');unit.className='xau-compact-unit';unit.textContent=' USD/oz';
 display.append(price,unit);
 const note=document.createElement('div');note.id='xauSpotNote';note.className='xau-spot-note';
 note.textContent='Fonte spot: collegamento in corso…';
 wrap.append(note);
 let checked=0,pending=false;
 const safeText=s=>String(s||'').slice(0,180);
 async function refresh(){
   if(pending)return;
   pending=true;checked=Date.now();
   try{
     const response=await fetch('/api/xau-spot',{cache:'no-store'});
     if(!response.ok)throw Error('HTTP '+response.status);
     const data=await response.json();
     const t=Date.parse(String(data.quoteTime||''));
     const age=Number.isFinite(t)?Math.round((Date.now()-t)/1000):Infinity;
     const value=Number(data.price);
     if(data.status==='recent'&&Number.isFinite(value)&&value>0&&age>=-30&&age<=180){
       price.textContent=value.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2});
       const time=new Date(t).toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
       note.textContent='gold-api.com · aggiornato '+time+' · '+age+' s fa · solo riferimento';
       wrap.dataset.spot='recent';
     }else{
       price.textContent='—';
       wrap.dataset.spot='stale';
       note.textContent='Spot non verificato o non recente: '+safeText(data.message);
     }
   }catch(e){
     price.textContent='—';
     wrap.dataset.spot='error';
     note.textContent='Prezzo spot non disponibile. Grafico e Decoder indipendenti.';
   }finally{pending=false;}
 }
 refresh();
 // The public spot-reference endpoint permits limited periodic requests.
 // Avoid polling while the phone screen is not viewing this section.
 setInterval(()=>{if(!document.hidden&&Date.now()-checked>=30000)void refresh();},10000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden&&Date.now()-checked>30000)void refresh();});
})();
