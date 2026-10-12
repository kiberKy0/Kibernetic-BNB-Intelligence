# Raccolta al minuto — 12 ottobre 2026

Attivata su Supabase: job `kibernetic-minute-market`, cron `* * * * *`, funzione `kibernetic-minute`. Indipendente dai browser degli utenti.

Copertura: BNB/WBNB, CAKE, LINK e fino a nove indirizzi validi della watchlist cloud; massimo 12 token, una richiesta DEX Screener batch per ciclo. Pool BSC con token base esatto e liquidità maggiore; la quotazione è DEX, non Binance Spot. Conteggi acquisti/vendite e volume sono finestre mobili 24h, non flussi di capitale né delta del minuto.

Archivio minuto: 24 ore, massimo 17.280 campioni a copertura piena; archivio orario precedente mantenuto. L’endpoint evidence integra gli ultimi 12 campioni minuto anteriori al punto richiesto con lo storico orario. La scelta del punto storico non riceve campioni futuri.

Protezione: autenticazione collector preesistente, lease atomica tramite UPDATE condizionale, massimo un tentativo per minuto, lease 90 secondi, timeout fonte 18 secondi e database 5 secondi, backoff errori due minuti. Stato distingue ok/partial/error. Nessun accesso client diretto alle nuove tabelle: RLS abilitata, autorizzazioni solo service_role.

Il primo ciclo reale ha raccolto 4/4 token in 600 ms. Questo non è un benchmark garantito. Una singola funzione ogni minuto equivale a 43.200 invocazioni in 30 giorni; consumo complessivo dell’organizzazione, traffico e crescita database restano da monitorare.

Non cambia la frequenza delle notizie, la verifica giornaliera delle previsioni, o l’aggiornamento automatico del grafico nel browser. Non abilita OpenAI, apprendimento automatico o trading. Le analisi leggono i nuovi campioni quando richieste; il ricalcolo completo continuo va sviluppato separatamente. La freschezza dei provider non è garantita dal cron.

Stato pubblico: `https://iytjxruxpvwjjhbndkzo.supabase.co/functions/v1/kibernetic-minute` (GET). Disattivazione: `select cron.unschedule('kibernetic-minute-market');`. Il ciclo orario resta indipendente.
