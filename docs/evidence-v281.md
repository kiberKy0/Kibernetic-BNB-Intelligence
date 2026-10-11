# V28.1 — evidence, not certified prediction

- Public archive reads existing Supabase market snapshots and dated news, excluding acquisitions after the selected point. Historical external news search remains separate.
- Collector runs hourly at minute 7, independently of an open browser. Fixed BSC panel: WBNB, CAKE, LINK. Saves the first observation in each hourly bucket; never overwrites it. These are main-pool snapshots, not wallet dollar flows or executable depth.
- Daily model reports for BNB (Binance 4h), CAKE and LINK (CoinGecko 1h). Maximum 150 chronological evaluation points, with per-quarter counts and a matched baseline. Provider coverage limits still apply.
- Paper results use 10bp commission + 20bp slippage per leg (60bp round trip), a fixed notional, no leverage and no transaction in a range scenario. Short scenarios are theoretical. Gas, token tax and funding are excluded. This is not an executable strategy backtest.
- Future audit stores actual emitted/abstained forecasts before their horizons end. First results remain pending until later observations arrive. The target must match the exact timestamp and source; no forward filling. Outcomes are hidden from historical views until acquired.
- BTC/BNB comparisons align exact closed-bar timestamps and exclude irregular returns. Statistical relation is not a cause and USD versus USDT differs.
- Missing volume, holes, stale and partial history are explicit. These quality metrics do not mean prediction probability.
- Alerts support percent movement, price above and price below. Boundary alerts rearm only after the price leaves the condition. Polling/notification delivery requires the page open; no background push subscription was enabled.
- One Analyze path remains. Extra evidence is under a single expandable explanation; no extra chat buttons.
- New archive tables have RLS with no public policies and revoked anon/authenticated grants. Only the backend writes. Public GET returns market evidence only; collector POST verifies a dedicated hashed Vault token. No client keys or secrets are stored in git.

## Still required

OpenAI credential reuse decision; actual router quotes by amount/route; genuine holder-wallet flows; automatic push delivery and account-scoped watch sync; broader independent validation and calibration. None is represented as active. Pattern efficacy remains unvalidated. More observations alone do not establish an edge.

## Verification

54 tests: existing 45 plus nine checks for gaps/missing volume, aligned benchmarks, no future candle, pool-liquidity versus quote distinction, chronological cost deduction and invalid archive timestamps, collector authentication, empty insert responses and future-outcome hiding. Live GET/POST boundaries, collector inserts, production APIs and graph-point UI must also be checked.
