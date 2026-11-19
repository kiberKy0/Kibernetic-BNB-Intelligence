# Kiber AI: ragionamento fondato sulla ricerca cloud BNB (19/11/2026)

## Problema osservato
- Il backend dell'assistente ha già provider Gemini (`gemini-3.5-flash-lite`) e TinyFish configurati, ma il GET `/api/kiber?provider=1` dice `configured_unverified`: non certifica che una conversazione abbia effettivamente ottenuto risposta.
- Il monitoraggio Supabase esistente acquisisce snapshot ogni minuto sui token selezionati, ma il chat assistant riceveva soltanto metriche dell'interfaccia, spesso con timestamp/fonte non verificati.
- In assenza del modello, le risposte locali erano più limitate della reale attività del server.

## Miglioramenti distribuiti in questo ramo
1. Nuovo `server/kiber-cloud-evidence.cjs`: interroga in sola lettura l'endpoint Supabase Edge già presente. Usa esclusivamente HTTPS, un host fisso, richiede indirizzi BSC validi, verifica compatibilità del token e contrassegna come STALE una scansione o uno snapshot oltre 190 secondi. Se il token non è nel gruppo monitorato, non gli attribuisce i dati di BNB. Il numero dei token monitorati viene sempre distinto dal limite massimo del collector.
2. La chat Kiber invia soltanto l'indirizzo pubblico della moneta aperta, non il wallet, password o dati sensibili. Il server consulta la fonte autonomamente e inserisce la valutazione verificata in `context.verifiedCloud`.
3. Gemini riceve istruzioni esplicite: distinguere osservazioni da previsioni, cercare contraddizioni, rispettare timestamp e fonte; nessuna dichiarazione di copertura totale BNB Chain o segnale automatico di acquisto.
4. Se il provider AI fallisce, alle richieste sul monitoraggio continuo il backend può fornire una risposta locale basata sulla fonte verificata (stato, 5m, 15m, liquidità, anomalie), senza inventare dettagli.
5. Gli stati della UI non scrivono più «risposta verificata» solo perché il modello ha risposto; la verifica dati è distinta dalla disponibilità di Gemini.
6. Memoria chat: resta nel browser, disattivata per default e attivabile dall'utente. La nuova funzione non addestra Gemini e non archivia automaticamente nuove conversazioni.
7. Nessun nuovo serverless endpoint e nessun provider aggiuntivo a pagamento. Nessuna firma Wallet o negoziazione.

## Limiti e prossimi controlli
- La qualità delle risposte del modello va verificata con domande reali: il GET di stato provider è solo un controllo di configurazione. La verifica del servizio in produzione va fatta dopo il deploy.
- I segnali on-chain WebSocket non sono ancora attivi; solo gli snapshot HTTP del collector esistente.
- La ricerca cloud non monitora automaticamente tutto il mercato, ma al momento 4 contratti BNB (capacità del collector: max 12).
- Regressioni XAU/USD devono rimanere isolate da questa modifica del ramo BNB.
