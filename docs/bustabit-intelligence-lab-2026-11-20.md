# Kiber Bustabit Intelligence Lab | 20 novembre 2026

## Architettura
Terzo reparto indipendente della dashboard BNB, separato da BNB Chain e XAU/USD.
Il pulsante Bustabit è aggiunto alla navigazione esistente, il contenitore apre /bustabit-lab.html e torna a BNB senza interferire con il portafoglio.

## Realizzato
- Scanner JavaScript locale su storici manuali, TXT, CSV, JSON, fino a 200.000 round e 8 MB.
- Input cronologico dal più vecchio al più recente, validazione errori e nessun dato simulato di default.
- Medie e mediane 5/15/50, rossi/verdi, frequenze soglie da 1.2x a 100x, gap 5x/10x, volatilità, estremi.
- 21 pattern descrittivi, categorie CAT (5), SEQ (5), DIR (4), PIC (4), REG (3). Non è dimostrata equivalenza con i detector dei bot originali.
- ROI retrospettivo teorico per puntata costante di 1 bit; intervallo di confidenza Wilson.
- Controllo fuori campione 70% sviluppo / 30% verifica cronologica, target selezionato soltanto sui dati di sviluppo.
- Guida alle regole, descrizione strategie, catalogo delle versioni precedenti e audit.

## Sorgenti storici
Rintracciati nella Libreria privata, NON copiati nel repository pubblico in questa modifica:
- CYBERSTRIKER_ADAPTIVE_CORE_V3_5_LIVE.js: 29/29 test locali nel relativo report, game reale non verificato.
- KIBER_STRIKER_V4_0_EVENT_AUDIT.js: sorgente presente, runtime game non verificato.
- KIBER_STRIKER_V3_3_BALANCED_2600.js: sintassi storicamente testata, runtime game non verificato.
- Altri: Kiber Striker V3.6 Restored, Cyberstriker V3.4, versioni antecedenti. Deduplicare prima di integrare.

Il catalogo NON esegue i bot. Le etichette SCOUT, FLOW, PATTERN, BAYES, ADAPTIVE, STRIKE, DEEP STRIKE, SENTINEL identificano famiglie di analisi e non sistemi attivi nella pagina.
Nessun auto-bet, login, wallet, scraping, collegamento al game o dati live.

## Vincoli matematici
Bustabit dichiara 1% di vantaggio del banco. Provably fair dimostra verificabilità, non previsione.
Il riferimento teorico della pagina è approssimativamente P(crash >= t) = 0,99/t e ROI atteso -1% sulla somma puntata. Distribuzione esatta e arrotondamenti devono essere verificati dalla documentazione di fairness.
Il detection di streak, gap, picchi o mediane NON dimostra che il futuro sia prevedibile. Non usare i segnali descrittivi come inviti a puntare.

## Requisiti per un bot realmente operativo
1. Audit della sorgente originale e del versioning.
2. Compatibilità con API bustabit/autobet: GAME_STARTING, GAME_STARTED, GAME_ENDED, history e ordine eventi.
3. Conversione bits/satoshi: 1 bit = 100 satoshi, e prevenzione delle doppie puntate.
4. Test con replay e storici verificati; gestione game id null, warmup, eccezioni e limiti di rischio.
5. Conferma indipendente su runtime Bustabit prima di dichiarare operatività. Fino ad allora NON VERIFICATO LIVE.

## Test attesi
node --test tests/bustabit-scanner.test.cjs
node --test tests/*.test.cjs
node --check bustabit-scanner.js
node --check bustabit-lab-ui.js
node --check bustabit-shell.js

## Fonti
https://bustabit.com/help/how-to-play
https://bustabit.com/help/house-edge
https://bustabit.com/help/provable-fairness
https://github.com/bustabit/autobet
https://bustabit.com/backtesting
