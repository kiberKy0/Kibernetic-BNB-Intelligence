# Sincronizzazione automatica — 12 ottobre 2026

Il raccoglitore mercato al minuto resta indipendente. Aggiunto un ciclo server separato per notizie e rapporti, con autenticazione collector, lease 90 secondi, deduplicazione dei titoli e date di acquisizione immutabili, archivio notizie 14 giorni e massimo un asset analizzato per ciclo.

I rapporti ruotano sui token coperti (massimo 12): un controllo al minuto non significa un rapporto completo per ogni token ogni minuto. A quattro token la rotazione richiede circa quattro minuti quando le fonti rispondono. Il modello viene ricalcolato alla nuova candela conclusa o al cambio del pool; il contesto attuale è separato dal punto del modello. I risultati sono salvati anche a browser chiuso. Le news arricchiscono il contesto, non sono inserite come cause certe o fattori predittivi nel modello dei pattern.

Vercel recupera i feed RSS in modalità compatta per il collector; Supabase conserva e deduplica. La ricerca delle notizie storiche di un giorno resta distinta. Le notizie acquisite dopo un punto non possono diventare informazioni disponibili prima di quel punto.

La piattaforma riaggiorna grafico BNB e token aperto ogni minuto mentre visibile, mantenendo punto e zoom. Al ritorno in primo piano esegue un controllo. Gli errori mantengono il grafico precedente e segnalano il mancato aggiornamento. I browser possono sospendere le schede: il lavoro server prosegue.

Cache dello storico e limiti delle fonti possono ritardare la novità dei dati. Non è un feed tick-by-tick. Il contatore cloud distingue raccolta mercato e notizie/rapporti parziali. OpenAI e trading automatico restano disattivati.

Endpoint stato: `/api/oracle-live`. Rollback ciclo: `select cron.unschedule('kibernetic-oracle-refresh');`; il job mercato al minuto non cambia.
