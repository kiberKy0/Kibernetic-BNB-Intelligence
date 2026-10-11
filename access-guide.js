(()=>{
'use strict';
const home=document.getElementById('v241Home');
if(!home||document.getElementById('kiberAccessGuide'))return;
const guide=document.createElement('section');guide.id='kiberAccessGuide';guide.setAttribute('aria-label','Come usare Kiber');
guide.innerHTML=`<style>
#kiberAccessGuide{margin:0 0 20px;padding:20px;border:1px solid #203b4c;border-radius:22px;background:#081925;color:#dcecff;line-height:1.55;text-align:left}#kiberAccessGuide h2{margin:0 0 8px;font-size:22px}#kiberAccessGuide p{margin:8px 0;color:#b6ccd9}#kiberAccessGuide summary{cursor:pointer;font-weight:700;color:#59d7ff;padding:12px 0;min-height:24px}#kiberAccessGuide ol{padding-left:23px;margin:8px 0}#kiberAccessGuide li{margin:12px 0}#kiberAccessGuide strong{color:#edf7ff}#kiberAccessGuide .guide-note{font-size:13px;color:#98afbf}
</style><h2>Vedi, analizza, verifica.</h2><p>Kiber riunisce token della BNB Chain, grafici, settori e notizie per aiutarti a capire i movimenti e valutare i possibili scenari successivi.</p>
<p><strong>Inizia così:</strong> apri un token in Mercato, scegli il periodo e tocca o trascina un punto sul grafico. Poi premi <strong>Analizza</strong>.</p>
<details><summary>Come funziona e cosa controllare</summary><ol>
<li><strong>Guarda dove sei.</strong> Il punto scelto ha data, ora e prezzo. Sotto trovi i movimenti UP e DOWN collegati a quel momento, con date, durata e variazione. Senza una selezione vedi gli ultimi movimenti disponibili.</li>
<li><strong>Capisci il movimento.</strong> Kiber confronta andamento, volatilità e casi storici simili; usa il volume quando è disponibile. Puoi approfondire liquidità, contesto BTC/BNB e notizie del giorno scelto. Una notizia vicina al movimento aiuta a capire il contesto, ma non dimostra da sola la causa.</li>
<li><strong>Leggi la previsione.</strong> Il paragrafo Previsione mostra lo scenario ricavato dalle ricorrenze, l’orizzonte e i casi confrontati. Se i casi sono pochi o i risultati sono deboli, Kiber lo segnala: una ricorrenza non garantisce che il movimento si ripeta.</li>
<li><strong>Verifica prima di decidere.</strong> Controlla token e rete, data del punto, fonte, ultimo aggiornamento e dati mancanti. Apri “Approfondisci dati, mercato e verifiche”: guarda quanti casi sono stati verificati e se il risultato supera il confronto di base. Le prove storiche e le previsioni registrate prima dell’esito sono separate. Un esito in attesa non è ancora un successo.</li>
<li><strong>Segui quello che ti interessa.</strong> In BNB Chain esplori settori, rialzi, ribassi, nuovi progetti e liquidità. La campanella aggiunge il token ai Monitorati; da lì imposti avvisi di prezzo o variazione e segui token e settori. Gli avvisi del browser funzionano mentre la pagina è aperta.</li>
<li><strong>Approfondisci con Kiber.</strong> Analizza porta il contesto del grafico nella chat, dove puoi continuare le domande. In questa versione le risposte sono generate dal motore dati: l’integrazione OpenAI è ancora da attivare.</li>
</ol><p><strong>Perché farlo:</strong> leggere insieme movimento, ricorrenze e contesto rende più chiaro cosa osservare e quali condizioni confermano o indeboliscono uno scenario.</p><p class="guide-note">Questo è il livello Analisi. Il wallet operativo e l’automazione degli acquisti o delle vendite sono passaggi successivi. L’attendibilità delle previsioni è ancora in verifica; lo storico copre i dati disponibili per ciascuna fonte.</p></details>`;
home.prepend(guide);
})();
