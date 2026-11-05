# KIBERNETIC BNB INTELLIGENCE — Benchmark concorrenti e roadmap automazioni
Data: 2026-11-06. Stato di partenza: V28.4 pubblicata in produzione. Documento di riferimento del progetto, non conferma di implementazione delle funzioni elencate.

## Richiesta consolidata
Confrontare sistematicamente le funzioni degli strumenti più competitivi e integrarle progressivamente nell'Oracolo BNB già esistente, senza creare piattaforme parallele. Obiettivo: scanner ampio, informazioni verificabili, superanalisi multi-fonte, automazioni, strategie e gestione del capitale sottoposta a limiti. Preferenza vincolante: zero nuovi costi iniziali. Nessuna promessa di affidabilità, profitti o trading autonomo finché non validati. Tenere la priorità del lavoro IA dell'utente separata, da non sacrificare per questa roadmap.

## Baseline tecnica verificata (2026-11-06)
- Repository kiberKy0/Kibernetic-BNB-Intelligence; produzione https://kibernetic-bnb-intelligence.vercel.app/; release V28.4.
- Ultimo audit 2026-10-12: catalogo categoria BNB Ecosystem con 250 ID iniziali (NON elenco di tutti i contratti BNB Chain), grafici limitati da quota CoinGecko.
- V28.4: navigazione paginata, fino a 5 pagine e massimo teorico di 1.250 ID, caricamento a richiesta, deduplica per ID, verifica BSC address senza dedurre dal ticker; il massimo teorico non equivale a monete realmente disponibili.
- Supabase aveva 1.863 contratti distinti nello storico market_snapshots e 4 asset nella raccolta al minuto, 4 cron attivi e stato recente 'ok' nelle tabelle dei processi.
- Watchlist in parte locale: non confondere la campanella con monitoraggio cloud permanente per qualunque token.
- Chat analitica a regole / deterministica: OpenAI non attiva; trading reale e gestione autonoma capitale non attivi; vantaggio predittivo non provato.

## Benchmark delle funzioni concorrenti e gap
| Concorrente | Punti forti documentati | Gap prioritario Kiber | Piano di integrazione a budget zero |
|---|---|---|---|
| CoinGecko | catalogo, market data, storico e categorie | qualità, ampiezza e freschezza verificata | paginazione controllata, cache e fallback, stato fonte, contratto BSC verificato |
| DEX Screener | nuove coppie, liquidity/volume, transazioni e pool per contratto, batch | scansione DEX e ranking pool | endpoint documentati, batch per indirizzi, dedup pool, rispetto quote |
| GeckoTerminal | new/trending pools e OHLCV dei pool | grafico on-chain solido, controllo pool e storia | OHLCV con provenienza, fallback e TTL; non confondere mercato globale/pool |
| TradingView | grafici, indicatori, backtesting e alert server/webhook | test strategie e alert persistenti | implementare backtest e alert lato server internamente; webhook solo se piano/permessi disponibili |
| DefiLlama | TVL, stablecoin, fees/revenue, yields, fundamentals | analisi flussi strutturali di protocolli e settori | API libera solo sugli endpoint realmente disponibili; verificare termini e modifiche: free yields /pools e /chart/{pool} saranno ritirati 2026-11-13 |
| Nansen | Smart Money, holders, exchange flows, wallet intelligence | cluster wallet, flussi e concentrazione | costruire metriche gratuite onchain e plugin premium solo più avanti; API Nansen richiede accesso |
| Arkham | etichette, visualizer, alert, analisi entity/wallet | mappatura fondi e wallet noti | link di approfondimento e metriche pubbliche; API labels avanzate non presumere gratis |
| Bubblemaps | cluster detentori, collegamenti tra wallet e storico | possibili gruppi di holder coordinati | analisi top holders BSC mediante dati autorizzati, visualizzazione cluster sperimentale |
| GoPlus | token security, malicious address, approval security, EVM transaction simulation | rischio honeypot, autorizzazioni, vendibilità | API gratuite nei limiti e verifica pre-simulazione, blocco su dati critici mancanti |
| Token Sniffer | scam risk, contratto e rating | secondo controllo della sicurezza | riferimento comparativo e verifica licenze prima di integrazione API |
| BscScan | token contract, holders, transfers, explorers | stato dettagliato on-chain con prova | lettura contratti / eventi pubblici, key gratuita ove disponibile e permessa |
| GMGN | auto buy/sell, copy trade, order management | motore ordini e operatività | prima paper trading rigoroso; esecuzione in componente indipendente solo in seguito |

Fonti principali verificate 2026-11-06:
- https://docs.dexscreener.com/api/reference
- https://api.geckoterminal.com/docs/index.html
- https://www.coingecko.com/en/api/pricing
- https://www.tradingview.com/support/solutions/43000529348-how-to-configure-webhook-alerts/
- https://api-docs.defillama.com/
- https://docs.nansen.ai/api/token-god-mode/holders
- https://docs.nansen.ai/api/smart-money
- https://info.arkm.com/research/how-to-use-arkham-intel-guide-explained
- https://bubblemaps.io/v2
- https://docs.gopluslabs.io/reference/api-overview
- https://tokensniffer.com/
- https://info.bscscan.com/apis/
- https://docs.gmgn.ai/index
- https://developer.pancakeswap.finance/sdks/overview
- https://docs.safe.global/advanced/smart-account-supported-networks

## Architettura target
Discovery BNB: rete, contract, pool, DEX, liquidity, age, price and sources.
Identity map: chainId 56 / contract checksum / verified metadata / pools (non symbol only).
Data router: API free prioritized, batch requests, caching, expiry, retry with jitter, rate-limit circuit breakers, timestamp/source and missing-data representation.
Tiered collectors: broad low-frequency discovery -> medium candidate refresh -> high-frequency watched/risk positions; quota-aware, never every token every minute on free services.
Risk: contract taxes, admin permissions, locked liquidity where checkable, concentration, correlated wallet clusters, honeypot and approval assessment, EVM simulation where available.
Intelligence: OHLCV, volume, liquidity, netflows, onchain changes, macro/BNB, stablecoins, revenue, news with timestamps and evidence; separate causal claims from coincidental time alignment.
Forecast: conditional scenarios plus reason, invalidation and observed data quality. Walk-forward / prospective out-of-sample validation, baseline comparisons, no look-ahead or survivorship bias, costs and spreads/slippage/taxes/gas.
Strategy: screening -> eligibility -> propose scenario -> risk engine -> paper trade -> audit/result feedback. Independent risk engine can veto model.
Portfolio: exposures, unrealized and realized P&L, daily max loss, max concentration, kill switch; never store a wallet seed in ChatGPT, never issue unapproved real transactions.
Automation and command: server schedules plus job state, retry/dedupe, diagnostics, alerts even when the phone is closed (requires delivery channel authorization); ChatGPT voice/text for status and permissioned orchestration, not magical unconnected access.

## Ordine di sviluppo
P0A: data identity registry and reliability dashboard; explicit count of tokens discovered / chartable / safe-evaluable / minute-monitored / stale and exact source timestamps.
P0B: broaden collected candidate pool within provider limits and add DEX Screener batch, GeckoTerminal OHLCV, GoPlus safety, BscScan data; work in small monitored batches.
P0C: safety gates and evidence quality; missing security data never treated as 'safe'.
P1A: backtesting engine and forward audit, sample coverage and baseline; evaluate not just accuracy but calibration and after-cost performance.
P1B: server alert queue and unified watchlist across device and collector, with guaranteed status (not guarantee of delivery).
P2A: simulated multi-token portfolio and rules with automatic order simulation, slippage + latency modelling, drawdown.
P2B: consider authorized onchain execution via PancakeSwap SDK + Safe smart account and explicit spending restrictions, only after serious security review and measured paper performance.

## Pass/fail criteria for public reliability claims
Data sources timestamped, contract-pool identity verified, graceful error and provider quotas respected; tests and live observation for representative assets/timeframes/buttons; automation independent of browser only where confirmed. Predictive superiority cannot be claimed without prospective out-of-sample results, statistically meaningful sample, baseline, costs, falsifiability and published methodology. 'All BNB coins' cannot be promised through a finite category feed.

## Budget limits
Only free and already-connected services unless user separately authorizes costs. Avoid subscription dependence for core P0. Free-provider restrictions vary; GeckoTerminal public docs/support rate-limit numbers currently differ, enforce a conservative configurable cap and 429 backoff. No work started merely by recording this roadmap.
