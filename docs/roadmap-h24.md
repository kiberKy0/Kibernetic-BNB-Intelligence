# Attività pianificate — 12 ottobre 2026

Stato: da sviluppare, non attivate.

1. Motore server oracolo: controllo ogni minuto anche senza utenti connessi; prezzi, liquidità, scambi e notizie; storico, deduplicazione, ricalcolo delle analisi interessate, verifica degli esiti, timestamp visibili, recupero errori e prevenzione sovrapposizioni. Definire copertura, limiti API e costi; il controllo ogni minuto non garantisce identica freschezza delle fonti.
2. OpenAI: collegamento della chat ai dati dell’oracolo, chiavi solo sul server, controllo costi e gestione errori. Attivazione in una fase successiva.
3. Server futuro Bustabit H24: progetto separato per funzionare indipendentemente dal telefono. Verificare modalità supportate, autenticazione e budget; prevedere log, riavvio controllato, stop remoto, limiti di perdita e protezione dalle esecuzioni duplicate.

Ordine: motore continuo oracolo → OpenAI → hosting bot Bustabit. Questa annotazione non attiva servizi né acquista abbonamenti.
