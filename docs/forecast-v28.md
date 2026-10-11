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
