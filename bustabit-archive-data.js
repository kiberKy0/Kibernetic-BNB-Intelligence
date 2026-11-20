/* Kiber Bustabit code registry. Fingerprints are from byte-for-byte archived user files.
 * Public page contains metadata and aggregated evidence ONLY; original source stays private
 * until a user imports it into their own browser. Never run uploaded scripts.
 */
(function(root){
'use strict';
const data={
revision:'2.0',updated:'2026-11-20',
evidence:{
 name:'KIBER_V28_333_PUNTATE_VERIFICATE_LOG.csv',
 sha256:'acbd2299ffe32af23869cb08721037ba7c9a64bf2072ba5dbfce42df23b954f0',
 sessions:3,bets:333,wins:139,netBits:-29.5,
 status:'REGISTRO DI PUNTATE · LIVE NON CERTIFICATO',
 note:'Righe originali presenti nell’archivio privato. Senza conferme server/account e log wager non possono essere considerate scommesse con denaro reale provate.',
 sources:'logs del 7 novembre 2026; tre sessioni registrate',
 },
 strategies:[
 {name:'SCOUT',bets:80,wins:55,net:2.5,what:'Studia ingressi a cashout basso e frequenza dei risultati. Nel registro 333 lo storico è lievemente positivo, ma non prova un vantaggio.'},
 {name:'FLOW',bets:80,wins:38,net:-4,what:'Confronta il contesto dei round tramite finestre statistiche, medie e mediane. La sequenza passata non modifica l’esito indipendente successivo.'},
 {name:'PATTERN',bets:52,wins:22,net:.75,what:'Classifica strutture CAT, SEQ, DIR, PIC e REG e le confronta con i dati successivi. Un pattern osservato non è una previsione.'},
 {name:'BAYES',bets:45,wins:10,net:-12.5,what:'Aggiorna punteggi e incertezze secondo evidenza osservata. Occorrono verifica fuori campione e confronto contro la probabilità teorica.'},
 {name:'ADAPTIVE',bets:38,wins:10,net:2.75,what:'Modifica criteri e punteggi in base ai risultati disponibili, rischiando sovradattamento ai dati storici.'},
 {name:'STRIKE',bets:27,wins:4,net:-8,what:'Analizza target medio-alti e frequenze dei picchi, che sono eventi più rari e comportano serie di perdite.'},
 {name:'DEEP_STRIKE',bets:11,wins:0,net:-11,what:'Esamina code estreme e moltiplicatori elevati. Nell’archivio di 333 puntate: 0 su 11, non evidenza di efficacia.'}
 ],
 codes:[
  {id:'c35',name:'Cyberstriker Adaptive Core V3.5',file:'CYBERSTRIKER_ADAPTIVE_CORE_V3_5_LIVE.js',sha:'59ba2e6871900d57762cd09e4f0e611ece8ea3146baa557b9a90902bc4a05be9',bytes:41641,test:'29/29 test locali superati',state:'SIMULATORE TESTATO · LIVE NON CONFERMATO',detail:'Config, 21 pattern, eventi, rischi, SENTINEL e riconciliazione controllati nel report JSON di test. Test locali, non certificazione server.'},
  {id:'k40',name:'Kiber Striker V4.0 Event Audit',file:'KIBER_STRIKER_V4_0_EVENT_AUDIT.js',sha:'8058d5a64f6855313bc6b021b5514cea326df9ec8c45761b48921e43564a137c',bytes:159351,test:'Sorgente originale individuato',state:'AUDIT LIVE DA COMPLETARE',detail:'Versione con audit eventi. Nessun log di riconciliazione server attestato per questa specifica revisione.'},
  {id:'k33',name:'Kiber Striker V3.3 Balanced',file:'KIBER_STRIKER_V3_3_BALANCED_2600.js',sha:'6104bd258ceb6203166da1e23f6607548b612f36fa2ea1fcdc9e7b958f615ada',bytes:157850,test:'Report storico disponibile',state:'SHADOW / REPLAY',detail:'Nel confronto V3.4 risultano 346 puntate SHADOW su 1.300 round registrati, saldo −2,90 bit. Non sono scommesse LIVE certificate.'},
  {id:'k36',name:'Kiber Striker V3.6 Restored Core',file:'KIBER_STRIKER_V3_6_RESTORED_CORE.js',sha:'9404241277101422047f8e77e2667689007496b7ffb10b45d4a0c1ddd12c86a2',bytes:159093,test:'File storico recuperato',state:'DA VALIDARE',detail:'Sorgente originale recuperato; test end-to-end e risultati attribuibili alla versione ancora da certificare.'},
  {id:'c34',name:'Cyberstriker Adaptive Core V3.4',file:'CYBERSTRIKER_ADAPTIVE_CORE_V3_4_LIVE.js',sha:'b9f33776c21ccfcb26b943d71b3d5919fea619f1aed04542cfda3a81ce6986fc',bytes:39523,test:'Report locale individuato',state:'SIMULATORE · LIVE NON CONFERMATO',detail:'Sorgente originale recuperato, da distinguere dal differente file KIBER V3.4 Active Audit.'},
  {id:'k34',name:'Kiber V3.4 Active Audit Shadow',file:'KIBER_V3_4_ACTIVE_AUDIT_SHADOW.js',sha:'2863c2d2c91afdb674d480cf16da2aa9745cab07cb7c96369bedc6a41a6e5a73',bytes:35142,test:'Report 150.000 + 150.000 round',state:'BACKTEST / SHADOW',detail:'Report audit: 21.941 ingressi simulati V3.3 e 31.160 V3.4 in due insiemi da 150.000 round, entrambi negativi. Non prova betting LIVE.'}
 ],
 controls:[
 ['SENTINEL','Blocco di ingressi non validi, stop, audit e gestione del rischio. Non genera un vantaggio matematico.'],
 ['RECOVERY','Meccanismo storico di recupero: può incrementare esposizione e perdite. Non va trattato come garanzia di recupero.'],
 ['MEMORIA','La persistenza dei modelli va distinta dalla memoria temporanea del singolo script. Una registrazione del codice non attiva ML.'],
 ['21 PATTERN','Le 21 etichette del decoder sono rilevatori descrittivi, non una chiave per predire un gioco provably fair.']
 ]
};
root.KiberBustabitArchiveData=Object.freeze(data);
})(typeof window!=='undefined'?window:globalThis);
