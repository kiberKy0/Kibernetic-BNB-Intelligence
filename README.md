# Kibernetic BNB Intelligence

**V17 Production Candidate** del progetto Kibernetic BNB Intelligence.

## Obiettivo
Raccogliere dati di mercato, storico, settori, news, macro e regolamentazione BNB Chain e trasformarli in informazioni più semplici da leggere: fatti osservati, segnali, rischi, ipotesi e fattori da monitorare.

## V17
- Interfaccia standalone senza iframe/versioni annidate
- Ricerca token BNB Chain
- Aggregazione multi-pool per prezzo, liquidità, volume e flussi
- Risk Score scomposto per componenti
- Profilo progetto e classificazione settore con livello di confidenza
- Storico 24H / 7G / 1M / 1A / 3A quando disponibile
- Watchlist senza duplicati con sincronizzazione cloud anonima
- Monitor server H24 ogni 15 minuti
- Snapshot storici e confronto “cosa è cambiato da ieri”
- Alert server per prezzo, liquidità, volume e rischio
- News Intelligence deduplicata con impatto e “perché conta”
- Dollaro / macro e SEC Monitor
- Profilo, avatar e temi
- PWA / service worker notifiche
- Kiber locale; endpoint Kiber AI già predisposto lato server
- Checkout Kibernetic PRO predisposto per Stripe

## Backend
Supabase Edge Functions:
- `kibernetic-data`: feed mercato/news/macro
- `kibernetic-intelligence`: token multi-pool, progetto, storico, news e alert
- `kibernetic-cloud`: dispositivo anonimo e watchlist cloud
- `kibernetic-monitor`: raccolta H24 e news pipeline

Il monitor viene eseguito automaticamente tramite `pg_cron` + `pg_net`.

## Production
`v17-production.html` è la candidate da testare prima di sostituire definitivamente la pagina principale.

Il file `vercel.json` è già preparato per servire V17 come root una volta importato il repository in Vercel.

## Integrazioni ancora da autorizzare
Per attivare completamente queste funzioni servono credenziali esterne che non devono essere salvate nel repository:
- `OPENAI_API_KEY` per Kiber AI
- Stripe (`STRIPE_SECRET_KEY` + `STRIPE_PRICE_ID`) per PRO €3,50/mese

## Principio dati
Le stime Kibernetic sono strumenti informativi. Correlazione temporale, news e movimenti di prezzo non vengono presentati automaticamente come rapporti causali certi.
