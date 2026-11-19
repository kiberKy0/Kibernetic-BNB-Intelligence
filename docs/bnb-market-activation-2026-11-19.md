# Kibernetic BNB: attivazione del monitor di mercato, 19 novembre 2026

Ambito esclusivo: BNB Smart Chain (chain ID 56). La dashboard esistente deve restare mobile-first. La sezione XAU/USD rimane separata.

## Modifiche effettivamente applicate
- In Supabase progetto associato all'Oracolo BNB sono state create mediante migrazione remota le tabelle `public.kibernetic_bnb_pool_registry`, `public.kibernetic_bnb_swap_events`, `public.kibernetic_bnb_stream_state`.
- RLS attivata su tutte e tre; nessun GRANT ad `anon` o `authenticated`. Lettura/scrittura solo server-side con credenziale privilegiata. NON esporre la chiave nel browser, nel repository o nei log.
- Lo stato iniziale del worker `kibernetic_bnb_v3_main` è `NOT_CONFIGURED`: nessuna pool iscritta, nessuna connessione WSS reale dichiarata attiva.
- `server/bnb-pool-verify.cjs`: verifica on-chain `token0`, `token1`, `fee` e `PancakeV3Factory.getPool` su BSC; l'identità della pool non dimostra che il token sia sicuro. Endpoint `/api/bnb-pool-verify?pool=0x...` tramite proxy Vercel esistente.
- `server/bnb-ws-subscribe.cjs`: sottoscrizione WSS di log swap PancakeSwap V3, filtro topic/indirizzo, chain 56, deduplica locale, reorg removed.
- `server/bnb-ws-worker.cjs`: servizio persistente Node 22+ che recupera pool abilitate, le rivalida on-chain, avvia stream WSS e scrive eventi con vincolo SQL unico; blocca l'avvio se mancano pool o nodo WSS. Non esegue ordini.
- `bnb-trading-panel.js`: la scheda del token verifica la pool V3 e visualizza il risultato distinguendolo dall'analisi di sicurezza del token.

## Configurazione cloud da completare senza PC (tramite dashboard del provider da smartphone)
1. Scegliere un nodo RPC BNB WSS che supporti `eth_subscribe logs`, ed eventualmente un endpoint HTTPS con `eth_call` e `eth_getLogs` per recuperare eventi persi. Gli RPC pubblici BSC non garantiscono `eth_getLogs`.
2. Preparare un servizio Node 22+ **sempre acceso** che lanci `node server/bnb-ws-worker.cjs` nello stesso repository. Una funzione Vercel Hobby non può mantenere un WebSocket 24/7.
3. Configurare come variabili segrete sul worker: `BSC_WSS_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`; facoltativa `BSC_RPC_HTTP_URL` (altrimenti RPC pubblico ufficiale).
4. Verificare con una pool PancakeSwap V3 realmente esistente, confrontando contratto e parametri con la factory. Solo dopo registrarla come `verified_onchain=true` e `enabled=true` nel database. Non attivare pool soltanto perché sono elencate su un aggregatore.
5. Attivare il worker; controllare che `kibernetic_bnb_stream_state` passi da `NOT_CONFIGURED` a `SUBSCRIBED` e che gli eventi arrivino nella tabella con hash on-chain e `price_usd=null`. Serve inoltre il recupero delle lacune nei blocchi dopo ogni riconnessione, prima di poter definire i dati completi.
6. Per il grafico al secondo servono decodifica del prezzo, dimensioni dei token, pool V2 quando necessarie, filtri di freschezza e un canale verso l'interfaccia mobile. Il semplice refresh al secondo di un elemento grafico **non** equivale a nuovi dati al secondo.
7. Prima di trading reale: Smart Router quote firmate, test di slippage, sicurezza token e wallet operativo con autorizzazioni revocabili. Per ora il motore continua in `paper`.

## Verifiche
- Test BNB in `tests/bnb-*.test.cjs` e controllo CI `.github/workflows/verify-bnb-market.yml`; verificare il risultato effettivo della pipeline dopo ogni commit, non considerare gli unit test prova di affidabilità del servizio H24.
- La sintassi degli otto moduli JavaScript esaminati nel turno di sviluppo risulta corretta.
- Vercel ha costruito versioni preview della PR, ma il worker H24 non risulta distribuito.
- Nessun token di accesso privato è stato raccolto o pubblicato.

## Rischi non ancora risolti
- Provider RPC WSS non configurato; il collegamento WebSocket H24 **non è operativo**.
- L'attuale adattatore non esegue `eth_getLogs` di recupero dopo le disconnessioni: i blocchi persi richiedono riconciliazione prima di generare segnali automatici.
- Nessun grafico on-chain live al secondo e nessuna transazione automatica attivati.
- PR #19 è in bozza e non si deve fondere in main prima di riconciliare le variazioni successive, il check della build e i test.
