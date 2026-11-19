# Kibernetic Oracolo BNB — sei fasi del trading
Data: 18 novembre 2026. Ambito esclusivo BNB Smart Chain, chain ID 56. Si estende la dashboard telefonica esistente; XAU/USD rimane separato.

## Stato attuale
Base software e controlli automatici creati. Il trading reale NON è abilitato, nessuna autorizzazione wallet è stata richiesta, nessun servizio 24/7 o WebSocket di mercato è collegato a questi nuovi moduli. Il pannello nella sezione Laboratorio Token distingue ciò che è pronto da ciò che manca.

## Sei interfacce da collegare
1. ANALIZZA: provider WebSocket BSC per eventi reali delle pool PancakeSwap, riconnessione, controlli freschezza e provenienza, serie storiche, trigger verificabili. Aggiornare la UI ogni secondo non significa ricevere un nuovo prezzo ogni secondo.
2. VERIFICA: sicurezza token via GoPlus e fonti on-chain, honeypot/tasse/blacklist, liquidità, saldo on-chain, BNB per gas, whitelist dei token, limiti su importi e perdite. Dato mancante = operazione negata.
3. CALCOLA: route e quote dal PancakeSwap Smart Router; lavorare in interi raw / BigInt, verificare router, token, importo minimo ricevibile, fee, slippage, block age e timestamp del preventivo.
4. ESEGUE: executor su infrastruttura cloud isolata con firma autorizzata in maniera esplicita, limitata e revocabile; vietato memorizzare la seed phrase di MetaMask nel browser, in chat, nel repository o nel database. Prima della firma prenotare atomicamente una chiave di idempotenza, così due trigger identici non creano due acquisti.
5. MONITORA: ascolto delle ricevute, conferme blockchain, posizioni e condizioni di uscita. Una richiesta scaduta o un timeout non significa che la transazione sia fallita: sospendere i tentativi, riconciliare usando il tx hash.
6. REGISTRA: database Supabase con cronologia decisionale, chiave univoca per wallet+strategia+segnale, stato invio e ricezione, fee reali, risultati, errori, contesto del segnale e revisione della strategia. Audit append-only sul server.

## Contratto tecnico già presente
- bnb-trading-core.js: createPipeline(adapters, options).run(request)
- Adapter richiesti: analyze, verify, quote, isAuthorized, reserveOrder, execute, monitor, record.
- Default mode = paper. Live requires mode = live, liveEnabled true, una delega valida, ledger persistente, un executor, un monitor e il router in allowedRouters. I controlli sul server dovranno applicare gli stessi limiti, senza fidarsi del browser.
- Parametri: tokenIn e tokenOut come contratti BEP-20 validati, wallet, amountInRaw come stringa intera, chainId 56, strategyId, signalId e slippageBps massimo 200. Sono input, non raccomandazioni di trading.
- bnb-trading-panel.js: solo visualizzazione della predisposizione dentro Laboratorio Token, collassata per non ingombrare la dashboard.
- tests/bnb-trading-core.test.cjs: test delle sei fasi, rischio, scadenza dati, chain, slippage, duplicazioni e stato inconcluso.

## Passaggi indispensabili per l'operatività reale
A. Fornitore RPC/WebSocket BNB affidabile, stream di eventi delle pool e storico con identificazione degli indirizzi.
B. Adapters PancakeSwap Router/Quoter e sicurezza token con verifiche indipendenti.
C. Worker cloud sempre attivo, separato dalle funzioni Vercel che rispondono a richieste brevi.
D. Database persistente Supabase con autorizzazioni, RLS, ordine univoco e lock atomico. Protezione da corse concorrenti, backoff e riconciliazione transazioni.
E. Wallet operativo separato oppure MetaMask Smart Account con deleghe specifiche supportate su BNB Chain; limiti di token, spesa, durata e possibilità di revoca, mai autorizzazioni illimitate per default.
F. Paper trading verificato, test su fork/testnet e, solo dopo, prove con importi minimi autorizzati. Stop d'emergenza server-side e limiti di perdita.

Eseguire test locali: node --test tests/bnb-trading-core.test.cjs

Questo ramo non esegue ordini. Non fornisce segnali affidabili o rendimenti garantiti; è una struttura per collegare in sicurezza i servizi mancanti.

## Primo collegamento di mercato implementato (ramo PR #19)
- **Snapshot read-only**: GET \`/api/bnb-dex-live?address=<contratto-BSC>\`, riscritto verso \`/api/coingecko?type=bnb-dex-live\`, che usa \`server/bnb-dex-snapshot.cjs\`. Utilizza DEX Screener per scegliere la pool PancakeSwap BSC con maggiore liquidità dove il contratto richiesto è **base token**, non quote token.
- Dati esposti: prezzo USD, liqudità, volume 24h, acquisti/vendite 24h, market cap/FDV se presenti, indirizzo pool, fonte, ora di **acquisizione**. Non promette il timestamp dell'ultima transazione; non è una quotazione eseguibile e non giustifica un ordine.
- Pannello mobile preesistente nel Laboratorio Token: solo quando aperto, acquisisce al massimo ogni 15 secondi; aggiorna ogni secondo soltanto il testo sulla vecchiaia del campione; a pannello chiuso non continua il polling e non svolge lavoro H24.
- **Stream on-chain predisposto ma non attivo**: \`server/bnb-ws-subscribe.cjs\` sottoscrive eventi \`Swap\` PancakeSwap V3 filtrati per pool tramite \`eth_subscribe logs\`, verifica \`eth_chainId=0x38\`, controlla indirizzi e topic, deduplica, segnala reconnect e removed. Reagisce solo a eventi reali. **Non** fornisce ancora prezzi USD, necessita di pool verificate contro la factory, decimali dei token, sorgente RPC WSS e servizio cloud persistente. Per pool V2 serve un decoder separato.
- Il nuovo endpoint non crea la 13ª funzione Vercel: viene gestito dal proxy esistente per rispettare il limite Hobby di 12 funzioni serverless.
- Le API pubbliche BNB non garantiscono \`eth_getLogs\`: per lo stream continuativo occorre un endpoint RPC WebSocket affidabile compatibile con \`eth_subscribe logs\`. Conservare URL e chiavi di connessione esclusivamente nei Secrets del worker.
- Test in \`tests/bnb-dex-live.test.cjs\` e \`tests/bnb-ws-subscribe.test.cjs\`. Non equivalgono a test di tenuta con dati reali per 24 ore.

### Prossimi requisiti di integrazione
1. Verifica on-chain della pool V3 scelta e relativa identità/decimali dei token; fonte primaria dello stato pool.
2. Configurazione sicura del nodo WSS nel worker cloud sempre attivo, recupero gap di blocchi dopo una disconnessione, e un canale per aggiornare grafici del telefono.
3. Monitoraggio ricorrente server-side dei token scelti anche quando il telefono è spento.
4. Quote Smart Router e controllo della sicurezza prima della firma, poi registro Supabase idempotente e transazioni via wallet operativo strettamente limitato.

Questo ramo **non** esegue operazioni reali e **non** aggiorna ancora i grafici ad ogni nuovo evento on-chain.
