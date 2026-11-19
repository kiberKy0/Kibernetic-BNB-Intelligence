# Kibernetic BNB: ricerca automatica ogni minuto (19 novembre 2026)

## Stato verificato sul progetto Supabase esistente
- Il collector `kibernetic-minute` era **già attivo** ogni minuto prima di questa modifica, con funzione `pg_cron` `kibernetic-minute-market`, sul piano Free. Raccoglieva 4 asset al momento del controllo: BNB, CAKE, LINK e un contratto monitorato; limite massimo dichiarato: 12 asset.
- Un nuovo processo SQL interno `kiber_internal.scan_bnb_market()` è attivo sullo stesso Supabase e viene richiamato da `cron.job` `kibernetic-bnb-continuous-analysis` ogni minuto (job ID 5 alla creazione).
- Il processo valuta gli snapshot HTTP già raccolti senza ulteriori chiamate all'aggregatore: freschezza (< 3 minuti), variazioni percentuali di prezzo a circa 5 e 15 minuti, cambi di liquidità a circa 15 minuti, cambio della pool principale. Non usa dati di altri token o future observations.
- Nuove tabelle del server: `kibernetic_bnb_scan_state` (ultimo stato per asset), `kibernetic_bnb_scan_findings` (solo anomalie, deduplicazione per fascia di 15 min, conservazione 7 giorni), `kibernetic_bnb_scan_health`. RLS attiva; **nessun permesso diretto** ad anon/authenticated. Le funzioni interne non sono esposte come RPC pubbliche.
- Soglie per osservazioni: prezzo 5m di almeno ±1,5%; liquidità 15m di almeno ±10%; modifica della pool principale segnalata come evento. Queste soglie sono euristiche di monitoraggio, **non** indicano un trading edge.
- La prima esecuzione e le successive attivazioni cron sono state verificate; il database ha registrato correttamente 4 asset analizzati e nessuna anomalia inventata.
- Funzione Supabase Edge `kibernetic-bnb-scan`: GET pubblico in **sola lettura** con CORS per l'Oracolo, stato del controllo globale e del token richiesto, risultati di anomalie e timestamp; credenziali di lettura elevate usate solo sul server. Niente scritture da client.
- La dashboard usa la sezione BNB già esistente, dentro `bnb-trading-panel.js`, e mostra stato cloud, numero asset, età della scansione, variazioni e ultima eventuale anomalia. Aggiornamento a pannello aperto ogni 60 s; il server continua anche a pagina chiusa. Se il token non è monitorato, o l'ultima scansione è vecchia, la UI lo dichiara. Se la pool dello scanner cloud differisce dalla pool DEX del pannello, i valori non vengono confrontati.
- Il WebSocket BNB V3 predisposto nel repository non è ancora stato collegato a un nodo e a un worker persistente. Nessuna osservazione on-chain al secondo né operazione automatica su MetaMask.

## Modalità d'uso
Apri l'Oracolo BNB > Mercato/Scanner > moneta > riquadro Strategie BNB. Il nuovo stato *Ricerca cloud* è dentro il riquadro esistente, senza duplicare i grafici. Attività massima di scansione: gli asset effettivamente raccolti nella watchlist cloud e il gruppo fisso. Le notizie e le previsioni hanno già job autonomi con frequenze diverse, non vengono eseguite ad ogni minuto.

## Limiti operativi
Il processo monitorizza snapshot di terza parte, non ogni transazione di BNB Chain. I dati del fornitore possono essere obsoleti anche con cron attiva, quindi età della scansione e età della fonte sono separate. Il sistema registra osservazioni ma non fa previsioni sicure, ordini, notifiche push a telefono spento, né ricerca esaustiva di tutte le monete. Una rilevazione segnalata richiede verifica indipendente.
