# Kiber XAU/USD — Studio fonti e verifica strategie (20 novembre 2026)

Ambito: soltanto Oracolo XAU/USD, non BNB. Questa scheda distingue contenuti pubblicati, ipotesi implementate e risultati da verificare. Non è una certificazione di rendimento.

## Matteo Zanni: cosa è documentato pubblicamente

Riferimenti:
- [MATTE XAU archivio generale](https://telemetr.io/en/channels/2176304936-B_wraj-1fDEyNDI0/posts)
- [MATTE XAU: 19 novembre, rotture M1 e stop](https://telemetr.io/es/channels/2176304936-B_wraj-1fDEyNDI0/posts?cursor=IBQ%3D)
- [MATTE XAU: SELL STOP, stop e mercato laterale](https://telemetr.io/en/channels/2176304936-B_wraj-1fDEyNDI0/posts?cursor=IBQ%3D)
- [MATTE XAU: tre esempi di scalp e gestione dinamica](https://telemetr.io/uk/channels/2176304936-B_wraj-1fDEyNDI0/posts?cursor=IBQ%3D)
- [Video su Hammer e Shooting Star](https://www.youtube.com/watch?v=WAsw86Lrt1I) indicato nei suoi post; trascrizione integrale non acquisita
- [Resoconto delle tre modalità di gestione pubblicamente descritte](https://amicobot.it/blog/matteo-zanni-risultati-online/), fonte secondaria

Nei contenuti pubblici Zanni parla di Hammer e Shooting Star M5, rottura dei massimi/minimi, ritorno al livello rotto, ordini stop a favore del trend, scalp M1, stop su precedenti massimi/minimi, trasferimento dello stop a pareggio e successivo trailing, uscite parziali e operazioni successive a notizie. Mostra anche casi di attesa quando la struttura è laterale o poco chiara.

Non è possibile stabilire le formule esatte del suo indicatore proprietario, replicare tutte le regole del canale VIP o verificare tutte le esecuzioni. Anche esempi di profitto e testimonianze positivi non sostituiscono uno storico integrale.

[Myfxbook XAU COPY USD](https://www.myfxbook.com/members/MatteoZanni2/xau-copy-usd/12118724): il link esiste ed è indicizzato, ma l'accesso al dettaglio completo è risultato limitato. Da qui non certifico un rendimento corrente, un win rate o un drawdown.

## Altri riferimenti effettivamente ricercati

- [Al Brooks: dieci pattern price action](https://www.brookstradingcourse.com/price-action/10-best-price-action-trading-patterns/): rotture, pullback, trend, inversioni, mercato laterale. Non è una validazione specifica di XAU/USD.
- [Al Brooks: rischi delle rotture fallite](https://www.brookstradingcourse.com/ask-al/trading-range-breakout-failures/).
- Linda Bradford Raschke e Toby Crabel: lavori storici su opening range e price action. [Bibliografia e NR7](https://www.xauusdglobal.com/blog/nr7-breakout-gold/) e [spiegazioni Raschke](https://www.forexfactory.com/thread/post/13200649).
- [Test London breakout XAUUSD con controllo casuale](https://untilnextsession.com/experiments/london-breakout-gold/): 89 operazioni su 169 giorni; il test non ha superato la soglia di significatività prestabilita. Non adottare il breakout come vantaggio già dimostrato.

## Matrice dei metodi del laboratorio

| Metodo | Riferimento | Stato Kiber |
|---|---|---|
| Hammer M5 | Zanni, pattern classico | Riconoscimento sperimentale |
| Shooting Star M5 | Zanni, pattern classico | Riconoscimento sperimentale |
| Breakout del range 20 M5 | Zanni, rotture | Riconoscimento sperimentale |
| Direzione M5/M15/H1 | Zanni: trend; EMA scelta Kiber | Analisi descrittiva |
| TP1/TP2, pareggio | Zanni, gestione rischio | Studio di uscite, non backtest |
| Rottura più retest M5 | Zanni, livelli e strutture | Nuovo filtro sperimentale |
| Falsa rottura e rientro nel range | Price action generale | Nuovo filtro sperimentale |
| Pullback su EMA20 | Brooks: pullback in generale | Filtro con EMA20 definita da Kiber |
| Scalp M1 di continuazione | Zanni, scalping M1 | Regola dei 10 M1 scelta da Kiber |
| Range d'apertura Londra/New York | Crabel/Raschke, opening range | Misura di finestre orarie, non trading |
| Filtro notizie USA | Calendario esterno; Zanni post-news | Veto su notizie ad alto impatto |

Le regole e gli ATR buffer numerici sono *ipotesi tecniche Kiber*, non attribuzioni di formule proprietarie agli autori.

## Livelli di ingresso e uscita

Il sistema può mostrare esclusivamente uno scenario didattico quando è rilevata una configurazione sull'ultima candela completa e sono disponibili feed, M5/M1, controllo spread e calendario. Ingresso teorico oltre l'estremo del pattern; stop teorico oltre il livello d'invalidazione; TP1 = 1R e TP2 = 2R, dove R è la distanza assoluta fra entrata e stop.

La visualizzazione dei livelli NON implica esecuzione, disponibilità del prezzo, corretto dimensionamento dei lotti o margine disponibile. Il conto IC Markets/cTrader personale e i costi di negoziazione non sono collegati. Il validatore mantiene sempre WAIT e executable=false.

## Verifiche ancora necessarie

1. Acquisire un archivio multi-annuale di Bid/Ask e spread reali XAU/USD, distinguendo i feed dei broker.
2. Backtest su tutte le operazioni, anche perdenti; ingresso realmente riempibile, stop/target nella stessa candela, slippage, commissioni e rollover.
3. Separare dati di scelta dei parametri, dati di convalida e campione fuori dal test; eseguire walk-forward.
4. Calcolare risultato netto, numero di operazioni, percentuale vincite, profit factor, drawdown, stabilità per anno e per regime.
5. Confrontare ogni strategia con una regola casuale a pari orari e costi e segnalare quando il campione non è sufficiente.
6. Non attivare ordini reali o copy trading prima della validazione e dell'autorizzazione esplicita.

## Codice e test

Moduli: xau-methods.js, xau-strategy-research.js, xau-research-ui.js, server/xau-biquote.cjs. Test: tests/xau-strategy-research.test.cjs e tests/xau-biquote.test.cjs.

I test automatici provano la coerenza del codice e i blocchi di sicurezza, non l'aspettativa di profitto.

Nessuna password o chiave broker nel browser; non modificare il ramo BNB.
