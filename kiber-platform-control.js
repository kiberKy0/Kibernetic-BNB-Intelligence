(()=>{
'use strict';
// Kiber Platform Control V1: solo azioni locali consentite, senza permessi economici o di deploy.
// Il modello IA non puo' eseguire JavaScript arbitrario, modificare chiavi o inviare ordini.
const $=id=>document.getElementById(id);
const blocked=/^(?:.*\b(?:compra|acquista|vendi|trasferisci|preleva|scommetti|punta|invia bitcoin|paga|esegui trade)\b.*)$/i;
function normalize(q){return String(q||'').trim().toLowerCase().replace(/[!?.,:;]+/g,' ').replace(/\s+/g,' ').replace(/^(?:ehi|hey|ok)\s+/,'').replace(/^kiber\s+/,'').trim();}
function match(raw){
 const q=normalize(raw);
 if(!q||q.length>280)return null;
 if(blocked.test(q))return{kind:'blocked'};
 if(/^(?:aggiorna|modifica|cambia|pubblica|distribuisci|deploy|riscrivi|correggi)\b.*\b(?:codice|sito|piattaforma|software|progetto|versione|app)\b/.test(q)||/\b(?:autoaggiornati|autoprogrammati)\b/.test(q))return{kind:'code-update'};
 if(/^(?:quali|che|dimmi|elenca|mostrami)\s+(?:comandi|istruzioni)\b|^(?:aiuto comandi|comandi vocali|help comandi)$/.test(q))return{kind:'help'};
 if(/^(?:aggiorna|ricarica|rinfresca|avvia|scansiona|fai partire)\b.*\bscanner\b|^(?:aggiorna|ricarica|scansiona)\s+scanner$/.test(q))return{kind:'refresh-scanner'};
 if(/^(?:aggiorna|ricarica|rinfresca|sincronizza)\b.*\b(?:dati|prezzi|quotazioni|mercato|grafico)\b/.test(q))return{kind:'refresh-data'};
 const token=q.match(/^(?:cerca|trova|apri|analizza)\s+(?:il\s+)?(?:token|moneta|coin)\s+(.{2,80})$/);
 if(token)return{kind:'search-token',value:token[1]};
 const navigation=/^(?:apri|mostra|vai(?:\s+a|\s+su|\s+alla|\s+al)?|portami\s+(?:a|su|alla|al)|fammi vedere|mostrami|visualizza|naviga\s+(?:a|su|alla|al)|spostati\s+(?:a|su|alla|al))\s+(.+)$/;
 const m=q.match(navigation);
 if(!m)return null;
 const part=m[1].replace(/^(?:il|lo|la|le|i|gli|l|sul|sulla|nella|nello|nel|nella)\s+/,'').trim();
 if(/scanner|nuov[ei]\s+(?:pool|monet)|scoperta/.test(part))return{kind:'section',section:'scanner'};
 if(/monitorat|preferit|watchlist|osservat/.test(part))return{kind:'section',section:'watch'};
 if(/notizi|news|eventi/.test(part))return{kind:'section',section:'news'};
 if(/settori|settore/.test(part))return{kind:'section',section:'sectors'};
 if(/macro|sec\b|economia/.test(part))return{kind:'section',section:'macro'};
 if(/grafico|candela|chart/.test(part))return{kind:'section',section:'chart'};
 if(/analisi|laboratorio|dossier/.test(part))return{kind:'section',section:'lab'};
 if(/mercato|token|monete|catalogo/.test(part))return{kind:'section',section:'market'};
 if(/oracolo|chat|assistente/.test(part))return{kind:'section',section:'kiber'};
 return null;
}
function show(section){
 if(section==='scanner'){
   const btn=$('freeScanNav'),node=$('freeScanner');
   if(!node)return false;
   if(btn)btn.click();node.classList.add('open');node.scrollIntoView({behavior:'smooth',block:'start'});
   return true;
 }
 const selected=section==='chart'?'lab':section;
 const node=$('section-'+selected);
 if(!node)return false;
 const btn=document.querySelector('#hubNav [data-section="'+selected+'"]');
 if(btn)btn.click();
 if(!node.classList.contains('open'))node.querySelector('.section-head')?.click();
 node.scrollIntoView({behavior:'smooth',block:'start'});
 if(section==='chart'){
   const chartTab=document.querySelector('#section-lab .subnav [data-tab="chart"],#section-lab [data-tab="chart"]');
   if(chartTab)chartTab.click();
   const chart=document.querySelector('#v269Chart,#v268Chart,#priceChart');
   if(chart)chart.scrollIntoView({behavior:'smooth',block:'center'});
 }
 return true;
}
function execute(cmd){
 if(!cmd)return{handled:false};
 if(cmd.kind==='blocked')return{handled:true,closeChat:false,message:'Comando non eseguito: acquisti, vendite, trasferimenti e scommesse non sono abilitati al controllo vocale.'};
 if(cmd.kind==='code-update')return{handled:true,closeChat:false,message:'Posso aiutarti a progettare aggiornamenti del software, ma non pubblico modifiche tramite comandi vocali. Servono accesso verificato del proprietario, test e conferma esplicita.'};
 if(cmd.kind==='help')return{handled:true,closeChat:false,message:'Puoi dire: «Kiber apri scanner», «aggiorna scanner», «mostra monitorati», «apri settori», «apri notizie», «apri mercato», «mostra il grafico», «cerca token CAKE». Per gli aggiornamenti del codice serve approvazione del proprietario.'};
 if(cmd.kind==='section'){
   const ok=show(cmd.section);
   const labels={scanner:'Scanner FREE',watch:'Token monitorati',news:'Notizie',sectors:'Settori',macro:'Macro e SEC',chart:'Grafico',lab:'Analisi',market:'Mercato',kiber:'Kiber'};
   return{handled:true,closeChat:false,message:ok?'Ho aperto '+labels[cmd.section]+'.':'Questa sezione non è disponibile nella schermata corrente.'};
 }
 if(cmd.kind==='refresh-scanner'){
   const b=$('freeScanRefresh');if(!b)return{handled:true,message:'Lo scanner non è disponibile in questa schermata.',closeChat:false};
   const wasBusy=b.disabled;show('scanner');if(!b.disabled)b.click();
   return{handled:true,closeChat:false,message:wasBusy?'Lo scanner è già in aggiornamento.':'Ho richiesto un aggiornamento dello scanner. Controlla l’orario dei dati per verificare la freschezza.'};
 }
 if(cmd.kind==='refresh-data'){
   const refresh=$('freeScanRefresh');let done=0;
   if(refresh&&!refresh.disabled){refresh.click();done++}
   const active=document.querySelector('[data-v269-days].active');if(active){active.click();done++}
   return{handled:true,closeChat:false,message:done?'Ho richiesto l’aggiornamento dei dati disponibili. Le fonti possono avere cache o limiti di frequenza.':'Nessun aggiornamento manuale disponibile qui. Le quotazioni vengono ricaricate dalle funzioni della piattaforma quando previsto.'};
 }
 if(cmd.kind==='search-token'){
   const field=$('tokenSearch'),btn=$('searchBtn');if(!field||!btn)return{handled:true,closeChat:false,message:'La ricerca dei token non è disponibile in questa schermata.'};
   field.value=cmd.value;btn.click();
   return{handled:true,closeChat:false,message:'Ho avviato la ricerca di '+cmd.value+'. Verifica i risultati e l’indirizzo del contratto prima di interpretarli.'};
 }
 return{handled:false};
}
window.KiberPlatformControl=Object.freeze({match,execute,version:'1.0',readonly:true});
})();