/* Original Bustabit historical catalog (Sep-Nov 2026).
 * Metadata/fingerprints only. NO original betting source or live credentials in public files.
 */
(function(root){
'use strict';
const primary=[
{id:'strike14',name:'Kiber Strike V1.4 CALIBRATED',file:'kiber_strike_v1_4_calibrated.js',sha:'445035851811de28738f8cee1a0e0bbd1a230a8493d62a6d8061cf4fed5d61d3',bytes:40585,lines:1317,family:'Kiber Strike',test:'Sintassi JS verificata · runtime LIVE non certificato',state:'CODICE STORICO ORIGINALE',detail:'Observer Memory 5/14/30, fasi NEGATIVE/POSITIVE/HOT, Confidence Score, Target Potential, Outcome Feedback, Recovery e Capital Shield.'},
{id:'negative13',name:'Negative Breaker V1.3 LIVE',file:'Kiber_Negative_Breaker_v1_3_LIVE.js',sha:'e01d7965e417fe8f1af209010179037df516057223bc261c5eda7cbca8853412',bytes:13938,lines:549,family:'Negative Breaker',test:'Sintassi JS verificata · verificare scommesse dai log account',state:'VERSIONE LIVE DICHIARATA · NON CERTIFICATA',detail:'Riconoscimento NEG_BREAK, 50–65 ingressi/100 come obiettivo, DEFENSE, Recovery, riserva e Moonshot 80x–500x.'},
{id:'trident11',name:'Kiber Trident V1.1 ADAPTIVE RESERVE',file:'kiber_trident_v1_1_adaptive_reserve.js',sha:'9a8e4374c9ddb2df4155c67f4f8405dbf72d369b308fb82ab7fe894f0964f051',bytes:27389,lines:896,family:'Trident',test:'Sintassi JS verificata · log storici analizzati',state:'SCRIPT STORICO · LIVE DA CONFERMARE',detail:'Tre stili PRUDENT / OFFENSIVE / EXTREME, blocchi 5/12/24, riserva adattiva e controllo del capitale. Vecchi log riportano 41 puntate; il rendimento non è stabile.'},
{id:'cyber30',name:'Cyber Striker 3.0 ORIGINALE',file:'CYBER_STRIKER_3_0.js',sha:'0fd0b84598be91711f2f3fd537db3a320459ea8af3fdde2e3c41f063a0bd098c',bytes:33681,lines:1027,family:'Cyber Striker 3.0',test:'Audit log 94: 6.212 BET/risultati · log 95: 6.493 · simulazione',state:'LOG CON PUNTATE SIMULATE',detail:'L1/L2/L3/L4, BONUS e HUNT: log 94 +108,01 bit ma log 95 −567,34 bit. Coppie BET/esito coerenti, nessuna prova di ordine su conto reale.'},
{id:'kiber30',name:'Kiber Striker V3.0 COMPLETO UNICO',file:'KIBER_STRIKER_V3_0_COMPLETO_UNICO.js',sha:'5e85c18d5206cce91e9c5c872a7541e53f4d7678b75805905209a2406e4d6d20',bytes:165194,lines:3644,family:'Kiber Striker 3.0',test:'15.000 sessioni SHADOW, 2.375.000 round sintetici',state:'MOTORI TESTATI IN SHADOW · LIVE NON VERIFICATO',detail:'Versione consolidata: BASE/ATTACK/PATTERN/CLASSIC21/HUNT/DEEP_STRIKE/RECOVERY, ML, Governor, Ensemble, Drift, SENTINEL, controllo rischio. 5 su 7 famiglie hanno puntato nei test isolati.'}
];
const variants=[
{id:'strike13',name:'Kiber Strike V1.3',file:'kiber_strike_v1_3.js',sha:'bb79202e0e3ac1010caf9fb80dc8f71b2e907b5ceb923d22f5bcc604fc6076b2',bytes:31951,lines:1056,family:'Kiber Strike',test:'Sorgente recuperato, sintassi non ancora rivalidata',state:'ORIGINALE · PRE-V1.4',detail:'Base storica della serie Kiber Strike. Da confrontare senza mescolare parametri della V1.4.'},
{id:'strike131',name:'Kiber Strike V1.3.1 LIVE FIX',file:'kiber_strike_v1_3_1_live_fix.js',sha:'49bb453f91368a4981326e83232d0cdcd3735783ee616fa7f2abfc8f0eaed942',bytes:32547,lines:1070,family:'Kiber Strike',test:'Sorgente originale recuperato',state:'ORIGINALE · LIVE FIX NOMINALE',detail:'Revisione intermedia prima della V1.4. La dicitura LIVE FIX è il nome storico, non una certificazione.'},
{id:'negative1',name:'Negative Breaker V1',file:'Kiber_Negative_Breaker_v1.js',sha:'a2414bced0a556ea052c6c16400917002ff03d948c34f43415aa4997243158c5',bytes:11073,lines:334,family:'Negative Breaker',test:'Log storico: blocco dopo primo ingresso riportato',state:'ORIGINALE · BUG DOCUMENTATO',detail:'Prima versione della famiglia. Il log storico segnala blocco dopo il primo ingresso, corretto nelle revisioni successive.'},
{id:'negative11',name:'Negative Breaker V1.1',file:'Kiber_Negative_Breaker_v1_1.js',sha:'b32d57ebbccfd8652142bef0a20dbc52d0d1d7e5ce62fe7aa2e7062750c293e7',bytes:10841,lines:501,family:'Negative Breaker',test:'Log: 23 puntate (10 W / 13 L) e errore Moonshot',state:'ORIGINALE · BUG DOCUMENTATO',detail:'Corretto il blocco post-prima-puntata; restava problema di puntata Moonshot non intera nei log.'},
{id:'negative12',name:'Negative Breaker V1.2',file:'Kiber_Negative_Breaker_v1_2.js',sha:'dc496349d48e795410437b2362544924cca838cc922cc0281a3b108a501654e1',bytes:11827,lines:454,family:'Negative Breaker',test:'Risultati contrastanti in test 100 round',state:'ORIGINALE · ESITI VARIABILI',detail:'Correzioni Moonshot; risultati storici divergenti fra sessioni, senza evidenza di vantaggio stabile.'},
{id:'negative12fix',name:'Negative Breaker V1.2 LIVE FIX',file:'Kiber_Negative_Breaker_v1_2_LIVE_FIX.js',sha:'dc79bddeee09a1021bc99cd930d904f4ac4f40299ed0b437de51104ce63290bd',bytes:12259,lines:null,family:'Negative Breaker',test:'Versione FIX recuperata',state:'ORIGINALE · DA VALIDARE',detail:'Variante distinta dalla V1.2 originale. Fingerprint separata, mai sostituita automaticamente.'},
{id:'trident1',name:'Kiber Trident V1',file:'kiber_trident_v1.js',sha:'13408a93adf8d5a6a5e077ffdf3a98fe4e7f49b0e8438698f9ea928362e6098a',bytes:22337,lines:743,family:'Trident',test:'Sorgente originale e tre modalità',state:'ORIGINALE',detail:'PRUDENT/OFFENSIVE/EXTREME, blocchi di storico e stake variabile. Precede Adaptive Reserve.'},
{id:'striker20',name:'Kiber Striker V2.0 CONTINUOUS 35',file:'KIBER_STRIKER_2_0_CONTINUOUS_35_CAPITAL_ADAPTIVE.js',sha:'d7c93034c8434027aff7292fe39284474fb7aadf71ac1b8f4f903508a4a3ee5d',bytes:63346,lines:1884,family:'Kiber Striker',test:'Sintassi JS verificata',state:'ORIGINALE · BRIDGE 2.x',detail:'Observer 5/14/30, Break Watch, Confidence, Target Potential, Recovery, feedback, adattamento del capitale e analisi 5x.'},
{id:'regime11',name:'Kiber Regime Intelligence V1.1',file:'Kiber_Regime_Intelligence_v1.1.js',sha:'6987a72c8eb60a3317624dd52f419c89834845c52d34ac62925f08e7035bc8b5',bytes:39542,lines:1361,family:'Regime Intelligence',test:'Sintassi JS verificata',state:'ORIGINALE · MODULO AUTONOMO',detail:'Classifica regimi e comportamenti del game. Mantieni il codice separato dai bot di puntata.'},
{id:'fusion3',name:'Cyberstriker Fusion V3 ORIGINALS',file:'CYBERSTRIKER_FUSION_V3_ORIGINALS.js',sha:'398e0191d7e181adeb8fb0e4979386c989197d70462b3a818709238944d5f913',bytes:187757,lines:null,family:'Fusion / Archivio',test:'Contiene rappresentazioni di sorgenti precedenti',state:'COMPOSITO · NON SOSTITUISCE GLI ORIGINALI',detail:'Archivio composito della famiglia, contenente versioni codificate come dati; non confonderlo con il file unico originale di ciascun bot.'}
];
const bands=[
['U','MICRO','1,00–<1,20x'],
['B','BASSO','1,20–<2,00x'],
['M','MEDIO','2,00–<5,00x'],
['A','ALTO','5,00–<10,00x'],
['V','MOLTO ALTO','10,00–<50,00x'],
['R','RARO','50,00–<100x'],
['E','ESTREMO','100–<500x'],
['X','ECCEZIONALE','≥500x']
];
const audits=[
{title:'Cyber Striker 3.0 · log 94',bets:6212,wins:3515,net:108.01,flag:'SIMULAZIONE (BET/ESITO COERENTI)',note:'Audit logs (94).csv: 6.212 coppie BET/esito su 10.000 round dichiarati, 0 mismatch; mancano ID/hash e 3.788 risultati dei round non giocati.'},
{title:'Cyber Striker 3.0 · log 95',bets:6493,wins:2854,net:-567.34,flag:'SIMULAZIONE (PERDITA)',note:'Audit logs (95).csv: 6.493 coppie su 10.000 round dichiarati; massimo drawdown del saldo 72,23%. Non è un risultato LIVE verificato.'},
{title:'Kiber Striker V3.0 · test 15.000 sessioni',bets:128166,wins:112930,net:null,flag:'SHADOW SINTETICO',note:'2.375.000 round in 15.000 sessioni isolate, 128.166 ingressi virtuali; copertura ingressi 5/7 strategie, nessun runtime Bustabit reale testato.'}
];
const explanations=[
['KIBER STRIKE 1.4','La V1.4 CALIBRATED combina fasi NEGATIVE/POSITIVE/HOT, medie e mediane 5/14/30, Confidence Score, Target Potential, feedback dopo l’esito e gestione del capitale. Il codice originale è lungo 1.317 righe.'],
['NEGATIVE BREAKER','La serie NEGATIVE BREAKER da V1 a V1.3 studia interruzioni dei blocchi negativi, riserva, recovery e Moonshot. I log precedenti mostrano errori corretti per versioni, ma non forniscono un edge dimostrato.'],
['TRIDENT','TRIDENT applica tre modalità: PRUDENT, OFFENSIVE ed EXTREME, con valutazioni 5/12/24. La V1.1 aggiunge una riserva adattiva. Gli esiti di alcune sessioni divergono: va analizzato ogni log separatamente.'],
['CYBER STRIKER 3.0','Cyber Striker 3.0 usa le modalità L1, L2, L3, L4, BONUS e HUNT. Log 94 chiude +108,01 bit su 6.212 puntate simulate, log 95 chiude −567,34 bit su 6.493: non è una strategia con risultato ripetibile dimostrato.'],
['KIBER STRIKER 3.0','Kiber Striker V3.0 è un altro sorgente: 3.644 righe, ML, PATTERN, CLASSIC21, DEEP, Governor, Ensemble, Drift e Recovery. I test di 15.000 sessioni sono SHADOW, non ordini su Bustabit.'],
['FASCE DEL GAME','Le otto fasce U/B/M/A/V/R/E/X classificano moltiplicatori da 1,00x a oltre 500x e vengono dal catalogo originale Pattern Intelligence V1.3. La classificazione non permette di predire il prossimo round.']
];
root.KiberBustabitLegacy=Object.freeze({primary,variants,bands,audits,explanations});
/* The existing private-code vault validates file hashes from its original registry. 
 * Extend the metadata list only; do not change or embed actual user source bytes. */
const archive=root.KiberBustabitArchiveData;
if(archive && Array.isArray(archive.codes))archive.codes.unshift(...primary,...variants);
})(typeof window!=='undefined'?window:globalThis);
