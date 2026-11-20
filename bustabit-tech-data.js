/* Named technologies and strictly version-scoped performance evidence.
   No executable betting source, no live claim, no inferred ROI.
   Sources: 2026-11-03 Trident technical audit; 2026-11-04 Cyber logs 94/95;
   2026-09-02 Kiber Strike 1.3.1 30x1000 report;
   2026-11-12 Kiber Striker V3.0 test reports.
 */
(function(root){
'use strict';
const M=(name,functions,what,when,how,why)=>({name,functions,what,when,how,why});
const strike=[
M('Observer Memory e statistiche',['buildSnapshot','metrics','currentLowStreak','currentHighStreak'],'Riassume i risultati già conclusi e le loro frequenze.','All’aggiornamento dello storico e prima di valutare un nuovo ingresso.','Costruisce finestre e misure come medie, mediane, serie di esiti bassi e alti.','Dà al motore una descrizione del contesto, senza prevedere il prossimo crash.'),
M('Phase Engine e Negative Break',['detectPhase','resolvePhaseWithPersistence','updateBreakWatch','detectNegativeBreak'],'Classifica il contesto e segnala cambi o rotture delle sequenze negative.','Quando arrivano nuovi risultati e prima dell’arbitraggio.','Confronta statistiche recenti e persistenza delle fasi.','Distinguere gli stati per applicare filtri diversi, non per garantire un esito.'),
M('Confidence Score e Target Potential',['computeConfidence','computeTargetPotential','evaluateEntry','choosePace'],'Valuta se la proposta soddisfa le soglie del codice.','Nella fase di valutazione prima di una puntata o di un WAIT.','Combina qualità del contesto, penalità, potenziale del target e ritmo.','Non eseguire ogni proposta senza verifiche.'),
M('Payout e scelta dell’importo',['chooseAdaptivePayout','chooseAdaptiveBetSize','placeBet','canBet'],'Calcola cashout, importo e vincoli tecnici dell’eventuale ingresso.','Quando è stato autorizzato un piano.','Applica configurazione e limiti, quindi nel runtime previsto invoca il motore di puntata.','Separare selezione e ordine; un file chiamato LIVE non prova che il server abbia accettato ordini.'),
M('Protezione capitale e Recovery',['updateProtection','updateGivebackBrake','evaluateRecovery','canUseCycleBudget'],'Gestisce protezioni, budget di ciclo e modalità di recupero.','Prima di autorizzare esposizione, e dopo esiti che modificano il saldo.','Controlla drawdown, profitti restituiti, soglie e budget disponibili.','Limitare le perdite operative: la Recovery può comunque aumentare il rischio.'),
M('Outcome Feedback',['recordOutcome','computeOutcomeFeedback','performancePenalty','summarizeOutcomes'],'Registra esiti e penalizza configurazioni deboli nelle versioni che lo includono.','Dopo la chiusura delle puntate osservate.','Memorizza i risultati recenti e aggiorna i punteggi usati dalle decisioni future.','Evitare di trattare tutte le condizioni come ugualmente affidabili; nessun ML persistente dimostrato.')
];
const breaker=[
M('Analisi del momento e Red Streak',['completedHistory','recent','redStreak','analyzeMoment'],'Misura lo storico disponibile e le sequenze di risultati bassi.','Quando il round precedente è concluso e si valuta il successivo.','Conta streak, esamina la finestra recente e prepara un contesto.','Capire quale condizione il bot sta classificando; la streak non anticipa esiti indipendenti.'),
M('Filtro di ingresso',['shouldPlay','regularPlan','chooseRegularPayout'],'Decide se un ingresso ordinario rispetta il piano.','Prima di preparare una puntata normale.','Controlla criteri di opportunità, cashout e limiti previsti.','Evitare ingressi obbligatori.'),
M('Moonshot e target rari',['moonshotReady','moonshotPlan'],'Valuta ingressi verso moltiplicatori molto alti.','Solo nelle condizioni e con la riserva richieste dal codice.','Controlla disponibilità della riserva, piano e limiti di importo.','Separare tentativi a payoff elevato dalle giocate comuni; frequenza di successo potenzialmente bassa.'),
M('DEFENSE, Recovery e protezione saldo',['updateRiskState','recoveryTarget','bankrollCapBits'],'Riduce o modifica l’esposizione in funzione del saldo e del rischio.','Dopo esiti negativi e prima di nuove puntate.','Usa debito di recupero, limiti al bankroll e modalità difensive se presenti nella versione.','Limitare danni; recuperare le perdite non è garantito.'),
M('Puntata intera e risultato',['safeBetSat','bitsToSat','placePlan','processLastResult'],'Converte gli importi, tenta la puntata e registra l’esito nel runtime previsto.','Alla preparazione dell’ordine e al termine del round.','Converte bit/satoshi e confronta risultato con piano e importo.','Evitare errori di formato e riconciliare gli eventi; accettazione LIVE non certificata.')
];
const trident=[
M('Block Intelligence 5/12/24',['blockStats','classifyBlock','analyzeBlocks','trailingBelow'],'Classifica i blocchi storici e la composizione dei risultati.','Dopo nuovi game completati e prima della selezione.','Usa frequenze, medie e altre misure sulle finestre del codice.','Interpretare regimi descrittivi senza assumere previsione.'),
M('PRUDENT',['prudentSignal','strategyEligible','strategyProfile'],'Valuta la modalità a obiettivo più contenuto.','Quando il blocco e i controlli di eleggibilità lo consentono.','Calcola segnale, profilo storico e limiti.','Ridurre esposizione rispetto ad altri stili, non annullare la probabilità di perdere.'),
M('OFFENSIVE',['offensiveSignal','variablePayout'],'Valuta la modalità più aggressiva.','Quando il selettore di modalità la considera idonea.','Usa un proprio segnale e cashout variabile.','Differenziare il profilo d’attacco; nei test può perdere.'),
M('EXTREME',['maybeStartExtreme','extremeStake','endExtremeSession'],'Gestisce tentativi rari e importi specifici della modalità estrema.','Solo se i controlli, il cooldown e il capitale lo permettono.','Avvia e termina finestre EXTREME con stake e limiti dedicati.','Contenere il numero di eventi ad alto rischio.'),
M('Arbitro e performance delle modalità',['chooseMode','recordPerf','perfStats','governorFactor'],'Sceglie fra i tre stili e aggiorna i loro punteggi.','Prima della puntata e dopo gli esiti.','Usa stato del blocco, registrazioni recenti e governor.','Non dare per scontato che una modalità resti efficace; i risultati del report sono negativi nel complesso.'),
M('Riserva adattiva e freni di rischio',['configuredWorkingReserve','availableCapital','updateProfitLock','hardStopFloor','modeRiskCap','buildBet'],'Isola capitale di lavoro, calcola la puntata e controlla gli stop.','Prima di ogni proposta e dopo variazioni del saldo.','Applica riserve, limiti di rischio, profit lock e arresto.','Evitare che una modalità consumi capitale oltre i limiti configurati.')
];
const cyber=[
M('Snapshot e regime',['buildSnapshot','metrics','detectPhase','medianBand'],'Raccoglie misure e classifica l’andamento dei moltiplicatori osservati.','Dopo gli esiti conclusi, prima della nuova decisione.','Combina media, mediana, fase e bande.','Fornire contesto alle quattro modalità.'),
M('L1, L2, L3 e L4',['selectAttackLevel','buildCoreEntry','evaluateLevel4','targetProfitForLevel'],'Seleziona uno dei quattro livelli di attacco.','Quando il motore CORE valuta un ingresso.','Pesa statistiche, obiettivi e restrizioni specifiche dei livelli.','Distribuire le decisioni fra stili diversi invece di un unico target.'),
M('BONUS e HUNT',['updateHighEventMemory','computeHighContext','evaluateHighHunt'],'Osserva grandi moltiplicatori e decide se proporre HUNT.','Dopo aver registrato eventi elevati e durante la scelta del prossimo ingresso.','Confronta frequenze e condizioni storiche con i vincoli del codice.','Tracciare eventi rari; non significa prevedere il prossimo picco.'),
M('Score, mediana e similarità',['confidenceScore','contextScore','rememberMedianBand','medianPatternScore','simpleSequenceSimilarity'],'Misura somiglianze del contesto e attribuisce punteggi.','Nel calcolo delle proposte prima della giocata.','Confronta finestre e pattern memorizzati.','Evitare ingressi senza le condizioni previste, senza prova di probabilità superiori.'),
M('Recovery, limiti e contabilizzazione',['updateRecoveryState','constructBet','placeCyberBet','canBet','rememberOutcome'],'Gestisce piano, rischio e registrazione dei risultati.','Prima e dopo gli eventuali ingressi.','Usa soglie di rischio, budget e memoria degli esiti.','Distinguere richiesta di puntata da esito effettivamente riconciliato.')
];
const striker30=[
...strike,
M('Kiber ML Brain V2.4',['createKiberV24Brain','k24Supervise','k24ActualArm'],'Aggiorna modelli statistici e controlli sulla qualità delle proposte.','Quando riceve risultati e quando vengono valutati ingressi.','Stima frequenze condizionate e calibrazione su dati disponibili.','Verificare l’incertezza. La frequenza storica non dimostra un vantaggio predittivo.'),
M('Pattern Engine V2.5',['createKiberV25PatternEngine'],'Riconosce pattern e produce candidature da verificare.','Dopo l’aggiornamento dello storico e prima dell’arbitro.','Classifica sequenze e condizioni con regole codificate.','Collegare analisi storica e proposte senza eliminare i controlli.'),
M('Classic21 V2.7',['createKiberV27Classic21'],'Analizza le 21 famiglie di pattern secondo il motore specifico.','Quando le finestre storiche richieste sono disponibili.','Applica riconoscitori e conferme del modulo.','Avere pattern nominati e distinguibili, non una pretesa di previsione certa.'),
M('Sentinel / KSI',['ksiPredict','ksiChooseHunt','ksiGuardAttack','ksiPrepareRound','ksiSettleLearning'],'Verifica contesti e memorizza esiti delle strategie specializzate.','Prima dell’ingresso e dopo che gli esiti diventano osservabili.','Usa criteri KSI e registri di apprendimento.','Limitare gli attacchi che non superano le verifiche previste.'),
M('Deep Strike V2.7',['createKiberV27DeepStrike'],'Gestisce i candidati a moltiplicatori elevati.','Solo dopo filtri propri e controlli dell’arbitro.','Genera proposte e le sottopone ai veti del sistema.','Isolare tentativi rari e ad alto rischio; nessuna efficacia LIVE dimostrata.'),
M('Governor V2.6',['createKiberV26Governor'],'Sospende o ammette candidature in base a regole e risultati.','Durante l’arbitraggio, soprattutto dopo prestazioni sfavorevoli.','Controlla profili e registri di rendimento per contesto.','Ridurre l’uso di famiglie temporaneamente deboli.'),
M('Ensemble / Arbitro V2.7',['createKiberV27Ensemble'],'Confronta candidati di più strategie e può imporre un veto.','Immediatamente prima di scegliere un unico ingresso.','Unifica segnali e applica limiti globali.','Evitare puntate contraddittorie o duplicate.'),
M('AutoMemory V2.6',['createKiberV26AutoMemory','k26MaybePersist'],'Salva/ripristina parte dello stato e dei modelli in ambienti supportati.','Ai checkpoint e al riavvio, ove il runtime lo permetta.','Serializza dati del modello con impronte e controlli.','Conservare apprendimento tra sessioni; persistenza Bustabit non verificata.'),
M('Drift V3.0',['createKiberV30Drift'],'Rileva prestazioni recenti peggiorate e introduce una pausa prudente.','Dopo una sequenza di decisioni con rendimento sfavorevole.','Confronta prestazioni e imposta veti o rivalutazioni.','Evitare inseguimento delle perdite in fasi di incertezza.'),
M('Recovery PROBE',['k30RecoveryProbe','k22QualityForProbe','k22BeginObserve','k22UpdateState'],'Gestisce stati OBSERVE/PROBE e una sonda di recupero selettiva.','Quando il capitale supera le soglie di cautela e dopo osservazione.','Richiede approvazioni specifiche, massimo rischio e condizioni minime.','Non obbligare il recupero: nei test la sonda può non partire.')
];
const regime=[
M('Regime Intelligence',['analyzeRegime','createRegimeStats','normalizedEntropy','chaosSignature'],'Descrive il grado di variabilità e le fasi del gioco.','Dopo l’aggiornamento dei risultati osservati.','Usa dispersione, trend locale ed entropia normalizzata.','Distinguere regimi per applicare limiti, non per prevedere il prossimo risultato.'),
M('Quota e frequenza',['targetAttacks','quotaDecision','closeQuotaBlockIfNeeded'],'Regola il numero di ingressi in finestre di round.','Prima di scegliere l’attacco.','Conta gli ingressi recenti e confronta la quota configurata.','Evitare di superare il ritmo previsto.'),
M('Attacchi speciali',['specialEvidence','specialDecision','buildSpecialCandidate','specialBetLimits'],'Valuta candidati speciali con capitale e punteggi dedicati.','Solo quando il segnale e il budget sono sufficienti.','Calcola prova di contesto, payout e vincoli di scommessa.','Tenere separate le proposte speciali da quelle ordinarie.'),
M('Esecuzione e rendiconto',['decideNextRound','calculateBet','settlePendingBet','report'],'Coordina proposta, puntata e registrazione degli esiti.','Alla preparazione del round e alla sua conclusione.','Registra saldo, risultato e decisione.','Consentire audit della logica; compatibilità live non certificata.')
];
const fusion=[
M('Replay dei codici originali',['originalReplay','run'],'Confronta logiche di versioni storiche in un contenitore composito.','Quando viene eseguito un replay di laboratorio.','Usa sorgenti e scenari storici inglobati nel file composito.','Confrontare differenze senza sostituire i file originali.'),
M('Fusion e simulazione',['combinedRun','synthetic','patterns'],'Prepara scenari e confronta più componenti.','Durante i test e le elaborazioni di laboratorio.','Valuta risposte di moduli differenti agli stessi input.','Supportare diagnosi comparative, non certificare puntate server.')
];
const performance={
strike131:[
{label:'30 sessioni × 1.000 round',kind:'SIMULAZIONE SINTETICA',bets:3384,wins:1819,net:-138.48,roi:-1.23,rounds:30000,dd:11.68,source:'KIBER_STRIKE_30x1000_REPORT.md',note:'Bug documentato: limite dichiarato 33 ingressi/100, osservato un picco di 35; Recovery bypassa il limite generale. Nessun test LIVE.'}
],
trident11:[
{label:'Test precedente',kind:'TEST REPLAY / LOG NON CERTIFICATI',bets:41,wins:27,net:51.55,roi:21.94,source:'Rapporto_finale_KIBER_TRIDENT_V1_1.pdf',note:'Campione piccolo. Non prova un vantaggio.'},
{label:'Secondo test (1.000 game)',kind:'TEST REPLAY / LOG NON CERTIFICATI',bets:64,wins:31,net:-68.10,roi:-15.23,rounds:1000,source:'Rapporto_finale_KIBER_TRIDENT_V1_1.pdf',note:'PRUDENT 22 ingressi, OFFENSIVE 21, EXTREME 21; saldo 1.000 → 931,90 bit.'},
{label:'Totale due test',kind:'SOMMA DI TEST',bets:105,wins:58,net:-16.55,roi:-2.43,source:'Rapporto_finale_KIBER_TRIDENT_V1_1.pdf',note:'Win 58/105; nessun vantaggio statistico dimostrato (audit 03/11/2026).'}
],
cyber30:[
{label:'Log simulazione 94',kind:'SIMULAZIONE · LOG BET/ESITO',bets:6212,wins:3515,net:108.01,roi:0.52,rounds:10000,dd:27.38,source:'KIBER_RAPPORTO_LOGS94_v1.0.md',note:'6.212 coppie coerenti; mancano gli esiti dei 3.788 round non puntati, ID game e hash.'},
{label:'Log simulazione 95',kind:'SIMULAZIONE · LOG BET/ESITO',bets:6493,wins:2854,net:-567.34,roi:-5.38,rounds:10000,dd:72.23,source:'KIBER_RAPPORTO_LOGS95_v1.1.md',note:'6.493 coppie coerenti; 3.507 esiti di round non puntati assenti, nessun hash server.'}
],
kiber30:[
{label:'15.000 sessioni isolate',kind:'SHADOW SU DATI SINTETICI',bets:128166,wins:112930,net:null,roi:null,rounds:2375000,source:'KIBER_V30_15000_SESSIONI_RAPPORTO_COMPLETO.md',note:'5/7 strategie hanno generato ingressi virtuali in sessioni isolate; HUNT e RECOVERY zero ingressi. Nessun saldo LIVE.'},
{label:'Una sessione di 27.000 round',kind:'SHADOW A SCENARI COSTRUITI',bets:5652,wins:null,net:null,roi:null,rounds:27000,source:'KIBER_V30_SESSIONE_UNICA_27000_RAPPORTO.md',note:'7/7 percorsi esercitati almeno una volta; DEEP_STRIKE 2 puntate virtuali, entrambe perse. Scenari costruiti, non esiti reali.'}
]
};
const descriptions={
strike14:['Analizza fasi e risultati con autocalibrazione dei punteggi.','Dopo il warmup e alle verifiche di ingresso.','Combina snapshot, Confidence, Target Potential, feedback, Recovery e limiti.','Selezionare condizioni conformi ai filtri; non garantisce una probabilità migliore.',strike],
strike13:['Versione iniziale della famiglia Strike con regime, Confidence e Recovery.','Nelle decisioni per il round successivo, dopo la raccolta dello storico.','Calcola snapshot, fase, Target Potential e protezioni.','Gestire entrate e rischio prima del feedback aggiunto in versioni successive.',strike],
strike131:['Revisione LIVE FIX V1.3.1 della famiglia Strike.','Nel simulatore, dopo il warmup e durante la valutazione pre-round.','Valuta fasi, Confidence, payout, capitale e Recovery.','Correggere il flusso storico; il test 30×1000 ha individuato un bug nel limite delle puntate.',strike],
negative13:['Negative Breaker con DEFENSE, riserva e Moonshot.','Quando le condizioni e i filtri consentono l’ingresso.','Analizza momento, sceglie piano normale o Moonshot, applica DEFENSE e aggiorna saldo.','Provare a limitare il rischio e separare gli ingressi rari; nessun successo LIVE certificato.',breaker],
negative1:['Prima versione storica del Negative Breaker.','Dopo la lettura di risultati conclusi.','Riconosce blocchi, decide piano e registra esito.','Costituire la base delle revisioni successive; bug storico di blocco dopo la prima puntata.',breaker],
negative11:['Versione 1.1 del Negative Breaker.','Durante la valutazione di un nuovo piano.','Come V1, con revisione della gestione del flusso.','Correggere il blocco iniziale; nei log restavano problemi di importo Moonshot.',breaker],
negative12:['Negative Breaker con controllo su wager e Moonshot.','Prima degli ingressi e dopo la chiusura del round.','Aggiunge safeBetSat e vincoli per importi interi.','Evitare puntate con formato non ammesso; i risultati storici restano variabili.',breaker],
negative12fix:['Versione LIVE FIX del Negative Breaker V1.2, distinta dal sorgente V1.2.','Nella costruzione del piano e del wager.','Conserva la logica V1.2 e specifiche correzioni operative.','Non confondere revisioni; compatibilità con server ancora da dimostrare.',breaker],
trident11:['Bot a tre modalità con riserva adattiva.','Quando l’arbitro seleziona una modalità idonea.','Classifica blocchi 5/12/24, valuta profili, cashout, riserve e stop.','Diversificare i criteri d’ingresso mantenendo limiti; nei test il netto aggregato è negativo.',trident],
trident1:['Prima versione del Trident con PRUDENT, OFFENSIVE ed EXTREME.','Dopo warmup, selezione blocco e filtri.','Unisce segnali di tre profili e limiti sui capitali.','Sviluppare modalità distinte, senza assumere efficacia predittiva.',trident],
cyber30:['Cyber Striker 3.0 con quattro livelli L1–L4, BONUS e HUNT.','Dopo calcolo di finestre e condizioni.','Seleziona livelli, target, HUNT e protezioni con log di esito.','Confrontare modalità; i log 94/95 sono contraddittori.',cyber],
kiber30:['Kiber Striker V3.0 multi-motore con ML, Pattern, Sentinel, Ensemble, Governor, Drift e Recovery.','Ogni round nel ciclo di decisione, con feedback dopo l’esito.','Coordina candidati e veti prima della puntata virtuale, poi memorizza gli esiti.','Auditare l’intero processo e limitare ingressi rischiosi; test LIVE non disponibile.',striker30],
striker20:['Evoluzione Kiber Striker 2.0 con osservazione continua, 5X e rischio adattivo.','Durante lettura dello storico, proposta e recovery.','Integra score di contesto, 5X Intelligence, budget e limiti.','Aggiungere filtri prima della serie 3.x.',[...strike,M('5X Timing Intelligence',['updateFiveXIntelligence','computeFiveXTimingScore','computeRecoveryPlanSignal'],'Descrive contesti con esiti almeno 5x e costruisce una proposta Recovery.','Quando la soglia e i filtri di rischio richiedono il modulo.','Compara frequenze, fasce e condizioni storiche.','Il nome 5X non implica capacità di prevedere un 5x futuro.')]],
regime11:['Modello di riconoscimento dei regimi con quote di ingresso e attacchi speciali.','Dopo lo storico e prima del round.','Usa entropia, volatilità e limiti su numero di attacchi.','Adattare il ritmo, senza garanzia predittiva.',regime],
fusion3:['Contenitore composito di sorgenti storici e simulatori.','Durante replay comparativi, non come singolo bot LIVE certificato.','Richiama logiche e scenari interni con funzioni di confronto.','Tracciare differenze fra versioni senza sostituire i file originali.',fusion]
};
const data={revision:'3.0',updated:'2026-11-20',descriptions,performance,levels:[
['CODICE INTEGRO','SHA-256 corrispondente agli originali recuperati.'],
['SINTASSI','Controllo JavaScript superato; non significa esecuzione sul server.'],
['BACKTEST / REPLAY','Test su dati sintetici o registrazioni senza accettazione ordini server.'],
['LIVE RICONCILIATO','Servono game ID, timestamp, wager, saldo/settlement e prove coerenti da account/server.']
]};
root.KiberBustabitTechData=Object.freeze(data);
})(typeof window!=='undefined'?window:globalThis);
