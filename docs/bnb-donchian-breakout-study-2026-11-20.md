# Kibernetic BNB: strategia speculativa in sola lettura

Data: 20 novembre 2026. Questa strategia è **un metodo da studiare e testare**, non una strategia provata redditizia e non un sistema per eseguire ordini.

## Metodo
Una variante didattica di trend following / breakout Donchian20 con filtro EMA20/EMA50, conferma di volume e attesa del retest. È una **combinazione di regole nostre** basata su tecniche note, non un prodotto o una strategia certificata da Binance.

1. Universi: solo token con contratto BNB Chain 56 e dati della stessa pool DEX, non prezzo Binance Spot mischiato al prezzo della pool.
2. Dati: almeno 60 candele OHLC reali (non campioni di prezzo ricostruiti) con timestamp regolari, volumi validi e recente chiusura; timeframe 1 minuto–4 ore. La pool dello storico e quella della liquidità devono coincidere.
3. Liquidità: almeno 100.000 USD nel campione DEX, soglia progettuale *da validare*, non garanzia di qualità.
4. Trend: EMA20 sopra EMA50, ultimo prezzo chiuso sopra EMA20.
5. Breakout: chiusura superiore al massimo delle 20 candele precedenti, volume della candela >=1,5 volte la media dei 20 volumi precedenti.
6. Retest: nelle 4 candele seguenti, l'ultima candela chiusa scende in zona dell'ex resistenza +/-0,5 ATR14 e richiude sopra. **Solo allora** lo studio può marcare `CANDIDATO_DIDATTICO`.
7. Stop/target esemplificativi: prezzo chiusura come proxy di ingresso, stop 1,5×ATR14 sotto l'ex resistenza, target teorico a 2R. Non sono quotazioni PancakeSwap né prezzi garantiti.
8. Il limite teorico di rischio 0,5% del capitale è una **regola di ricerca**, non riduce il rischio di non esecuzione di uno stop on-chain. Per uno swap reale servono stima quote/price impact, gas, fee, slippage, verifica contratto, rischio MEV e approvazioni esplicite. Qui non vengono collegate.
9. Stato `NON_VALUTATA`, `DATI_INSUFFICIENTI`, `DATI_OBSOLETI` o `ATTESA` quando mancano le condizioni.

## Posizione nell'app
La Home BNB mostra una sola linguetta compatta «Strategia BNB · Breakout + retest · Studio». La scheda del token mostra la valutazione condizionale nella linguetta «Strategia speculativa · Donchian 20 + EMA · sola lettura», se è disponibile il vero OHLC DEX attuale nel contesto di quel token.

## Provenienza / limiti
Il motore di studio `bnb-speculative-strategy.js` calcola condizioni sui dati raccolti dalla piattaforma, *non* interroga servizi in autonomia. `v27-1.js` passa unicamente lo storico DEX e la pool del medesimo token. Il pannello `bnb-speculative-panel.js` non invia richieste per ordini. Nessun WebSocket on-chain o trading automatico abilitato.

Per parlare di efficacia economica serve prima: dati storici sufficienti per varie condizioni di mercato, backtest corretto, simulazione realisticamente al netto di commissioni/impact e forward test fuori campione. Nessuno dei risultati è ancora verificato.

## Fonti tecniche e didattiche
- Binance Academy: https://www.binance.com/en/academy/articles/a-beginners-guide-to-swing-trading-cryptocurrency
- Binance Academy: https://www.binance.com/en/academy/articles/trading-strategies-with-moving-averages
- PancakeSwap: https://docs.pancakeswap.finance/trade/pancakeswap-exchange/fees-and-routes
- PancakeSwap: https://docs.pancakeswap.finance/trading-tools/pancakeswap-auto-slippage

Il nuovo accesso MetaMask resta informativo e non rappresenta un wallet connesso o autorizzato: non si firma niente. CoinGecko rimane un collegamento esterno ufficiale.
