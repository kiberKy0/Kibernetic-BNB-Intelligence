# V27.9 — previsione esplorativa dai pattern

La previsione è separata dalla sequenza UP/DOWN retrospettiva. La sequenza mostra cosa è accaduto dopo un punto storico; il confronto previsionale usa soltanto le osservazioni fino al punto. Le osservazioni OHLC sono prezzi di chiusura delle candele, non prezzi intrabar conosciuti all'apertura.

## Requisiti e riferimenti

- TradingView: evitare informazioni future, includere commissioni, slippage ed esecuzione realistica nei backtest di strategie. https://www.tradingview.com/pine-script-docs/en/v5/concepts/Strategies.html/
- scikit-learn TimeSeriesSplit: valutazione cronologica su tempi uniformi, con separazione tra training e test. https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.TimeSeriesSplit.html
- QuantConnect: walk-forward su periodi successivi; parametri ottimizzati nel passato e controllo dell'overfitting. https://www.quantconnect.com/docs/v2/writing-algorithms/optimization/walk-forward-optimization

## Implementato

Finestre di 24 osservazioni confrontate per forma normalizzata, trend, momentum, posizione nel range e volatilità. Volume confrontato solo quando disponibile su tutte le osservazioni della finestra; il volume mobile CoinGecko viene escluso perché non è volume della candela. Esiti a 6 osservazioni, intervallo temporale esplicito; stessa cadenza entro una tolleranza del 10%. Il filtro dei precedenti elimina le finestre che sovrappongono il periodo corrente. I precedenti selezionati non si sovrappongono tra loro; massimo 50. Conteggi rialzo/ribasso/range, mediana e quartili dei rendimenti, soglie di scenario e motivo dell'astensione. Le soglie sono scelte iniziali, non parametri ottimizzati o validati.

Un esito prevalente è mostrato soltanto con almeno 20 finestre separate e quota osservata almeno 60%; anche allora è esplorativo, non una probabilità calibrata né un segnale di acquisto/vendita. Lo storico breve rende spesso impossibile raggiungere questo campione. Non mescolare lo storico giornaliero esteso con le finestre orarie: occorre archivio alla medesima risoluzione.

Correzioni: RSI Wilder, RSI 50 per prezzi piatti; EMA20/50 assenti prima del rispettivo warmup; volume delle candele di fallback non ricostruito sommando volumi mobili 24h; cadenza delle statistiche storiche determinata solo dal passato.

## Prima verifica cronologica

Dataset BNB/USDT Binance: 3.262 candele giornaliere dal novembre 2017. Valutazione a intervalli fissi di 30 barre dopo 150 osservazioni iniziali, esiti a 6 barre: 104 punti, 1 scenario emesso, 1 esito coerente. Questo NON dimostra accuratezza: un solo scenario e copertura inferiore all'1% sono insufficienti. Nessun parametro modificato per migliorare il risultato. Finestra BNB 30 giorni/180 candele: un punto valutabile, nessuno scenario. Lo script scripts/validate-forecast.cjs è riproducibile con JSON punti/candele; non è un backtest di operazioni.

## Ancora necessario

1. Archivio ampio alla stessa risoluzione per ogni token/pool, con identità verificata, controlli di completezza, candele chiuse e provenienza del dato.
2. Liquidità storica, volumi buy/sell monetari, flussi wallet/holder, regime BTC/BNB/settore; sicurezza contratto e slippage per token piccoli. News filtrate e timestamp affidabili.
3. Validazione multi-token su periodi rialzisti/ribassisti/range, benchmark di base sullo stesso sottoinsieme di punti, copertura, errori e calibrazione prima di esporre probabilità.
4. Eventuale strategia operativa con gas, commissioni, slippage e regole di esecuzione; distinta dalla statistica di prezzo.
5. AI come spiegazione/interrogazione dei risultati strutturati. La chiave OpenAI non sostituisce dati storici né validazione.
