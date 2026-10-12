# Mappa della piattaforma e audit — 12 ottobre 2026

Ambito: versione 28.3, primo livello **analisi**. OpenAI, wallet operativo e trading automatico sono esclusi da questo rilascio. La mappa distingue codice presente, funzionamento osservato e capacità ancora da dimostrare. Il confronto usa documentazione ufficiale; non è un test sperimentale dei concorrenti.

## Esito

Kiber è un prototipo operativo di scanner con lettura contestuale del grafico. Il punto distintivo è riunire punto selezionato, movimenti, ricorrenze e spiegazione in una scheda semplice. Non è ancora equivalente ai grandi concorrenti per copertura, profondità dei dati, continuità, notifiche e validazione delle previsioni. Un’AI conversazionale da sola non risolve queste lacune.

### Copertura delle verifiche

| Area | Verifica | Limite concreto |
|---|---|---|
| Catalogo | 250 ID unici inventariati | Ecosistema BNB, non tutti i contratti BNB Chain |
| Grafici a 30 giorni | 116 richieste completate: 32 disponibili, 84 errori del fornitore | 134 non verificati; numerosi HTTP 429. Non sono 84 token dimostrati difettosi |
| Altri periodi e dettagli | Controlli su percorsi rappresentativi e regressioni | Nessuna verifica esaustiva token × periodo × pool × sicurezza |
| Interfaccia | Percorsi home, mercato, scanner, monitorati, intelligence, confronto, chat e profilo | Non ogni bottone di ogni asset è stato eseguito individualmente |
| Server | Quattro lavori pianificati attivi, raccolta minuto e refresh attivi | Quattro asset coperti dalla raccolta attuale; limite configurato 12 |
| Previsioni registrate | 8 letture, 6 valutate, 0 direzionali nel controllo | Nessun vantaggio predittivo misurabile dimostrato |
| Notifiche | Impostazioni e avvisi locali presenti | Consegna push H24 a browser chiuso non certificata |

Dati puntuali e non promesse di disponibilità futura. Il JSON del catalogo conserva le righe controllate e quelle non controllate. L’inventario dei moduli è statico: rilevare un bottone o un endpoint nel codice non dimostra che tutto il suo percorso sia funzionante.

## Mappa funzionale

| Schermata | Azione | Risultato utile | Stato e controllo da mantenere |
|---|---|---|---|
| Home | Ricerca token | Trova un asset e apre la scheda | Distinguere ID CoinGecko e contratto BSC |
| Home | Grafico BNB | Prezzo, tempo, selezione del punto, contesto | Fonte e data devono restare visibili |
| Home | Mercato / Monitorati / Intelligence | Accesso alle tre aree | Navigazione distinta, senza duplicare l’analisi |
| Mercato | Classifica, ricerca, ordinamento, caricamento altre righe | Catalogo e confronto di prezzo, capitalizzazione e volume | Categoria ecosistema; valori mancanti mostrati come mancanti |
| Mercato | Mercato on-chain | Coppie, liquidità e attività DEX | Copertura diversa dal catalogo globale |
| Token scanner | Periodo, zoom +/−, punto del grafico | Cambia finestra e punto temporale analizzato | Periodi non supportati nascosti; nessun riciclo dei dati del token precedente |
| Token scanner | Aggiorna | Ricarica i dati del token | Errori terminali leggibili, senza loader infinito |
| Token scanner | Indietro / chiudi | Torna alla schermata precedente | Conservare un percorso comprensibile |
| Token scanner | Analizza | Apre Kiber con token e punto selezionati | Un ingresso principale; niente pulsanti chat equivalenti |
| Token scanner | Movimenti UP/DOWN | Date, durata, variazioni e sequenza attorno al punto | Selezione e lista devono riferirsi allo stesso contesto |
| Token scanner | Previsione e approfondimento | Precedenti, possibili esiti, conferme e invalidazione | Uno scenario debole non diventa un segnale di acquisto |
| Token scanner | Campanella | Aggiunge il token ai monitorati | Nessun duplicato dello stesso asset; non implica raccolta cloud H24 |
| Monitorati | Apri / rimuovi / aggiorna | Gestisce solo i token scelti | Stato locale; verificare persistenza sul dispositivo |
| Monitorati | Notizie token e settore | Mostra aggiornamenti pertinenti senza ricerca separata | Corrispondenza diretta nome/simbolo e settore; non tutte le news hanno metadati |
| Intelligence — Stato BNB Chain | Prezzo, TVL, stablecoin, DEX, rapporti e settori | Capisce se capitale e attività si stanno muovendo | Un rapporto strutturale non è un rendimento né un segnale autonomo |
| Intelligence — Nuove coppie | Apri token e campanella | Passa dalla coppia al contratto base BSC | Usa relazione token, non indirizzo del pool; raggruppa pool dello stesso token |
| Intelligence — Nuove coppie | Indicatore di attività | Evidenzia cosa merita approfondimento | Non misura rendimento atteso o sicurezza |
| Intelligence — Protocolli | TVL, variazioni e commissioni | Legge fondamentali dei protocolli | TVL globale separato da commissioni BNB; categorie diverse non equivalenti |
| Intelligence — Confronta | Seleziona fino a tre protocolli e confronta | Spiegazione dei protocolli realmente selezionati | Risposta locale specifica; niente risposta BNB generica |
| Profilo | Nome e salva | Personalizza il dispositivo | Nessun account/cloud implicito |
| Profilo | Abilita notifiche | Richiede autorizzazione del browser | Non dimostra consegna a browser chiuso |
| Chat Kiber | Scrivi e invia, ritorna | Spiega dati e contesto disponibili | Motore locale a regole; non conversazione OpenAI universale |

## Correzioni di questo audit

1. Tolta la scheda separata **Dossier automatico**, duplicata rispetto al rapporto del token.
2. Tolta la seconda anteprima delle nuove coppie dallo Stato BNB Chain.
3. Tolte anteprime duplicate del profilo, modalità di visualizzazione senza effetto e controlli voce non utilizzabili con le autorizzazioni attuali.
4. Tolto il pulsante AI generico nel mercato; il token resta il punto di ingresso dell’analisi.
5. Nuove coppie: contratto del token ricavato dalla relazione GeckoTerminal; l’indirizzo del pool non viene spacciato per token. Se il contratto manca, l’apertura non viene promessa.
6. Raggruppati pool dello stesso token; viene presentato quello più liquido con il numero di pool rilevati.
7. Confronto protocolli: la risposta usa la selezione effettiva e distingue categoria, TVL globale e commissioni BNB.
8. Rimossi punteggi sintetici poco spiegati dai fondamentali dei protocolli; escluse categorie CEX e Risk Curators da questa lista DeFi.
9. Etichette del catalogo chiarite: appartenenza all’ecosistema e contratto BSC verificato sono informazioni diverse.
10. Valori assenti separati da zero; per CoinGecko il volume mobile delle 24 ore non è più disegnato come volume della singola candela.
11. Richieste pubbliche GET simultanee uguali condivise; nessuna nuova cache persistente di errore, cancellazione del singolo chiamante indipendente.
12. Cambio token: pulizia dello stato analitico e cancellazione della previsione precedente; richieste legate all’indirizzo catturato, non a un token mutabile.
13. Notizie dei monitorati collegate anche direttamente a nome e simbolo; aggiornamento dei settori quando la pagina è visibile.

Queste correzioni non costituiscono una riscrittura completa dei moduli storici. I file di compatibilità rimangono, anche quando i relativi elementi duplicati non sono più mostrati.

### Verifica dopo la pubblicazione

84 test passati. Nel browser pubblico: navigazione senza Dossier duplicato; confronto di Aave V3, LayerZero V2 e Morpho Blue con risposta specifica e commissioni mancanti esplicite; apertura di un token da una nuova coppia con contratto corretto ma storico DEX assente; apertura Chainlink con grafico disponibile e analisi della selezione del 28 settembre alle 09:00. Questi esempi verificano percorsi rappresentativi, non tutti gli asset. Durante il cambio token è stata corretta anche l’identità residua nell’intestazione e rimossa la campanella precedente fino al caricamento del nuovo token.

## Come funziona l’analisi e cosa può davvero prevedere

| Componente | Cosa calcola | Lettura corretta | Miglioramento necessario |
|---|---|---|---|
| Movimenti UP/DOWN | Escursioni del prezzo con soglia adattiva, inizio, fine e durata | Descrive movimenti osservati | Controllare sensibilità a intervallo, soglia e rumore |
| Ricorrenze | Conteggi e intervalli tra movimenti simili | Riassume lo storico disponibile | Distribuzioni e dispersione; una media non è una scadenza |
| Precedenti simili | Finestre storiche separate e andamento successivo | Confronto empirico | Ricerca solo nei dati già disponibili al punto; evitare finestre sovrapposte e selezione favorevole |
| Modello esteso | Osservazioni tecniche e consenso di più segnali | Scenario condizionato | Validazione fuori campione, stabilità per regime e asset |
| Guida alla scelta | Qualità, liquidità, rischio e costi prima del segnale | Condizioni da verificare | Soglie documentate, profondità per importo e dati di sicurezza completi |
| Verifica cronologica | Esiti, confronto semplice e metriche di previsione | Misura solo scenari effettivamente emessi | Calibrazione e vantaggio non ancora dimostrati |
| Simulazione dei costi | Ipotesi andata/ritorno 0,60% | Simulazione teorica | Gas, tasse token, funding e quote eseguibili non inclusi |
| Registro prima dell’esito | Conserva lettura prima del risultato | Base per verifica prospettica | Più casi direzionali e un campione rappresentativo |
| Mercato e notizie | Confronto con mercato e articoli pertinenti | Contesto del movimento | Correlazione non identifica automaticamente una causa |
| Sicurezza | Informazioni disponibili del contratto | Segnali di rischio attuale | Non equivale ad audit del contratto o garanzia di vendibilità |

Presentazione raccomandata entro dieci secondi: **cosa sta facendo → quale scenario prevale → perché → cosa lo conferma → cosa lo smentisce → qualità dei dati**. Le date e i livelli vanno messi in righe leggibili. Se i precedenti sono discordanti, scrivere “non emerge una direzione affidabile” e mostrare le condizioni utili, senza inventare una scelta compra/vendi.

## Dati, server e frequenze

GitHub conserva il codice; Vercel pubblica frontend e API; Supabase conserva dati e registri e avvia lavori pianificati. Non è un feed tick per tick.

| Processo | Frequenza attuale | Copertura / limite |
|---|---|---|
| Grafico visibile | Aggiornamento circa ogni minuto | Dipende dall’endpoint e dai limiti del provider |
| Collector server | Cron ogni minuto | Quattro asset attuali, massimo configurato 12 |
| Refresh server | Cron ogni minuto | News e rotazione dei rapporti; non ogni token ricalcolato ogni minuto |
| Snapshot recenti | Raccolta minuto con finestra recente | Non ricostruisce liquidità storica mai acquisita |
| Monitor storico | Ogni 15 minuti | Ruolo distinto dal collector minuto |
| Evidenze storiche | Ogni ora | Ruolo distinto, conservazione e verifiche |
| News dei monitorati | Circa ogni minuto durante l’uso | Browser attivo e feed disponibile |
| Settori | Circa ogni dieci minuti se visibili | Non aggiornamento minuto per tutti i settori |

Gli avvisi locali e la raccolta cloud hanno ambiti differenti. Aggiungere una campanella non dimostra che quell’asset venga raccolto H24 sul server. La priorità è unificare questa copertura e renderla visibile al cliente. Non rimuovere i quattro lavori pianificati solo perché sembrano simili: svolgono compiti diversi.

## Confronto con i concorrenti

| Piattaforma | Funzionamento di riferimento | Kiber oggi | Divario utile da colmare |
|---|---|---|---|
| CoinGecko | Catalogo, storico, portafoglio e avvisi | Catalogo ecosistema e grafico contestuale | Copertura affidabile, prezzi coerenti, portafoglio e quote API adeguate |
| DEX Screener | Coppie, prezzi, liquidità, volume e transazioni DEX | Vista on-chain e apertura token | Scelta pool, profondità, transazioni e continuità su più asset |
| GeckoTerminal | Pool e OHLCV on-chain | Fonte nuove coppie e fallback | Identità token/pool, storico e limiti gestiti stabilmente |
| TradingView | Grafici, indicatori, strategie, backtest e avvisi server | Selezione punto, forensics e scenari | Strumenti grafici maturi, backtest riproducibile, alert persistenti |
| DefiLlama | TVL, commissioni, ricavi e classificazione protocolli | Fondamentali e confronto | Separazione chain/globale e confronti della stessa categoria |
| Nansen | Holder e flussi dei wallet, segmentazione Smart Money | Dati di sicurezza e contesto limitati | Holder, concentrazione, flussi e identità wallet storiche |
| Santiment | Attività on-chain e flussi exchange | Contesto prezzo e news | Serie temporali on-chain e segnali social documentati |
| GoPlus | Sicurezza del token e rischi del contratto | Verifiche quando disponibili | Copertura, gestione dati mancanti e rischi spiegati chiaramente |

La forza possibile di Kiber è la semplicità della lettura contestuale. La presenza di pattern non dimostra prestazioni predittive superiori a questi prodotti. Confrontare rendimento, precisione o affidabilità richiede esperimenti comuni, non un confronto di schermate.

## Priorità successive

### P0 — necessarie prima di dichiarare il sistema affidabile

- Piano dati con quote e licenze adeguate, gestione del 429, stato di copertura per token e aggiornamento realmente osservato. Non martellare il provider gratuito.
- Registro unico ID → rete → contratto → pool → fonte. Nessuna associazione BSC dedotta dalla sola categoria.
- Monitorati locali e raccolta server unificati, con stato “raccolto / non raccolto / ritardo” e nessuna promessa H24 per asset fuori copertura.
- Validazione delle previsioni fuori campione e prospettica: confronto con baseline sugli stessi casi, costi, drawdown, calibrazione, numerosità e periodi di regime diverso. Il sistema può correttamente astenersi.
- Consolidare i numerosi moduli di versione in responsabilità uniche: catalogo, identità, grafico, analisi, chat, monitor e notifiche. Le sovrapposizioni aumentano rischio e manutenzione.

### P1 — profondità competitiva

- Storico di liquidità, flussi, holder e concentrazione, non soltanto snapshot correnti.
- Quote per importo, profondità, slippage e costi realmente applicabili al pool scelto.
- News con data, fonti e rilevanza del token, aggregate automaticamente al punto selezionato; copertura storica esplicita.
- Avvisi persistenti con consegna a browser chiuso, autorizzazioni e prova di consegna.
- Confronti di protocolli omogenei per categoria e chain.
- Derivati: open interest, funding e liquidazioni solo per asset/mercati dove quei dati esistono.

### P2 — sviluppi successivi

- OpenAI con strumenti collegati al contesto, limiti di costo e verifiche della risposta. Attivare una chiave da sola non rende la chat attuale universale: serve instradamento client/server.
- Wallet manuale come secondo livello, mantenendo chiara la scelta dell’utente.
- Automazione a pagamento come terzo livello soltanto dopo validazione e controllo operativo; nessuna esecuzione attiva in questo audit.
- Voce soltanto quando permessi e percorso funzionano realmente.

## Fonti ufficiali del confronto

- CoinGecko: https://www.coingecko.com/en/portfolio
- Volume storico CoinGecko: https://coingecko-api-v3.readme.io/reference/coins-id-market-chart
- DEX Screener: https://docs.dexscreener.com/api/reference
- GeckoTerminal: https://api.geckoterminal.com/docs/index.html
- TradingView strategie: https://www.tradingview.com/support/solutions/43000562362-what-are-strategies-backtesting-and-forward-testing/
- TradingView avvisi server: https://www.tradingview.com/support/solutions/43000481368-strategy-alerts/
- DefiLlama: https://defillama.com/revenue
- Nansen: https://docs.nansen.ai/api/token-god-mode/holders
- Santiment: https://academy.santiment.net/metrics/exchange-funds-flow/
- GoPlus: https://docs.gopluslabs.io/reference/response-details
