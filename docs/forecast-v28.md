# V28.0 — storico coerente e verifica cronologica

## Operativo

- API /api/forecast-v28: richieste GET validate, fonti fisse, timeout complessivo, massimo tre pagine, cache breve e limitata.
- Binance BNB/USDT: fino a 3.000 candele alla stessa risoluzione del grafico. Esclusione della candela ancora aperta, usando fine intervallo per il tempo effettivo dell'analisi.
- CoinGecko: fino a 90 giorni orari oppure 365 giorni giornalieri, compatibilmente con piano e disponibilità. Prezzi aggregati USD, volume mobile escluso. Nessuna sostituzione automatica con un'altra fonte o risoluzione.
- GeckoTerminal: fino a 3.000 candele paginate, stesso pool BNB Chain e indirizzo token esplicito. Identità verificata su metadata; intervalli senza trade non riempiti artificialmente. Copertura parziale e dati invalidi dichiarati.
- Grafico principale e scanner token: riquadro automatico con copertura, precedenti e verifica storica; contesto esteso passato alla chat. Risposte tardive non sostituiscono il contesto corrente.
- Valutazione walk-forward con parametri invariati, massimo 50 punti separati di 30 barre e confronto a sei barre. Baseline: esito più frequente nelle finestre precedenti, misurato sugli stessi scenari emessi. Numero di scenari, conteggio esiti, copertura e intervallo Wilson 95% nell'API. Nessuna probabilità calibrata esposta.
- Se almeno cinque scenari valutati non superano la baseline, il riquadro non sceglie una direzione. Altri risultati restano esplorativi, anche con più casi analoghi. La soglia di cinque è una salvaguardia iniziale e non una prova statistica.
- Controlli GoPlus attuali: holder count, honeypot/restrizioni vendita, mintabilità e tasse quando disponibili. Valori sconosciuti restano sconosciuti. Non è un audit né uno storico di wallet.
- Correzioni scanner: pool selezionati soltanto se il token richiesto è il base asset; FDV non sostituisce market cap nel punteggio; liquidità mancante non trattata come bassa; conteggi buy/sell non chiamati flussi monetari; notizie filtrate; caricamento periodo non riutilizza dati di un'altra finestra; timeout libreria grafica.

## Prove reali iniziali (11 ottobre 2026)

- BNB CoinGecko orario: 2.160 osservazioni, 28 analoghi al punto corrente; 50 punti cronologici valutati, due scenari, un esito coerente; baseline uno. Nessun vantaggio dimostrato.
- CAKE pool GeckoTerminal orario: 2.997 candele chiuse, tre pagine; 32 analoghi; 42 punti valutabili, cinque scenari, tre esiti coerenti; baseline tre. Nessun vantaggio dimostrato, scenario direzionale disabilitato.
- BNB Binance quattro ore: 2.999 candele chiuse, tre pagine; 50 punti valutati, uno scenario coerente; baseline zero. Un caso è insufficiente.

Questi numeri cambiano con punto, periodo e nuovi dati. Non sono rendimenti di operazioni: gas, commissioni, slippage e regole di esecuzione non sono simulati. Il modello non è certificato affidabile da questo test, e non si ottimizzano parametri su questi risultati per presentarli come nuovi test indipendenti.

## Limiti ancora reali

Non esiste un archivio condiviso permanente di liquidità, flussi dei wallet e snapshot holder. Nessun dato storico viene inventato dalla fotografia attuale. I feed pubblici hanno limiti di profondità e richieste; token giovani o con intervalli irregolari possono avere pochi precedenti. Notizie e sicurezza attuale sono contesto separato, non fattori del modello storico. Per calibrazione e ricerca successiva servono un corpus multi-token e periodi indipendenti di validazione; serve storage persistente per dati non disponibili dai provider.

## Fonti tecniche

https://docs.coingecko.com/reference/pool-ohlcv-contract-address
https://docs.coingecko.com/reference/coins-id-market-chart-range
https://developers.binance.com/en/docs/catalog/core-trading-spot-trading/api/rest-api/market
https://docs.gopluslabs.io/reference/tokensecurityusingget_1

## Guida decisionale e verifica integrata (11 ottobre 2026)

La lettura iniziale separa analisi del movimento, prospettiva storica e guida condizionata. La guida indica acquisto da valutare, vendita da valutare per chi possiede il token, oppure attesa. Include motivazioni, livelli di conferma, invalidazione e orizzonte del confronto. Non esegue ordini. Scenari discordanti, storico inadeguato, liquidità mancante o ridotta, rischio di vendita segnalato, confronto di base non superato e variazione centrale inferiore ai costi ipotizzati impediscono una lettura favorevole all'acquisto. Lo 0,60% è un costo teorico; gas, tasse e quotazione effettiva restano da verificare.

La verifica cronologica ora valuta anche le distribuzioni dei precedenti nei punti senza segnale. Riporta Brier multicategoria 0–2 (più basso è meglio), stesso punteggio per una baseline storica, errore assoluto della variazione mediana, copertura dell'intervallo centrale e frequenze stimate/osservate in gruppi. Le frequenze sono smussate con add-one; non sono probabilità calibrate. Nessuna soglia direzionale è stata ridotta per far comparire segnali. La validazione resta descrittiva, con `validated: false` e `calibrated: false`.

Riferimenti metodologici primari: https://scikit-learn.org/stable/modules/model_evaluation.html e https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html.

I dati archiviati vengono filtrati per token e data di acquisizione prima del punto scelto. La variazione di liquidità viene calcolata solo per snapshot dello stesso pool. Conteggi buy/sell e volume 24 ore restano finestre mobili, non flussi monetari. Le notizie archiviate devono essere state pubblicate e acquisite entro il punto. Nessun dato mancante viene ricostruito artificialmente.

Il collector orario aggiunge contratti abilitati nei monitorati cloud al pannello BNB/CAKE/LINK, fino a 12 asset per ciclo. Snapshot in parallelo; massimo 3 rapporti nuovi per ciclo, con budget di 125 secondi e rinvio del lavoro restante. Registra gli esiti successivi anche per le astensioni. Per i pool DEX, l'esito usa il pool archiviato prima della registrazione. L'archivio cresce dall'attivazione; non copre automaticamente il passato né tutti i token della chain. I monitorati soltanto locali non vengono inviati al cloud da questo aggiornamento.
