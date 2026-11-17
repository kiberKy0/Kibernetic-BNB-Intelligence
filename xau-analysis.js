(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.XauDecoder = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const minutes = { '5min': 5, '15min': 15, '1h': 60, '4h': 240, '1day': 1440 };
  const average = (list) => list.reduce((a, b) => a + b, 0) / list.length;
  const round = (x, dp = 2) => Number.isFinite(x) ? Number(x.toFixed(dp)) : null;

  function cleanCandles(input) {
    if (!Array.isArray(input)) return [];
    const byTime = new Map();
    for (const row of input) {
      const time = new Date(row.time || row.datetime || row.date).getTime();
      const open = Number(row.open), high = Number(row.high), low = Number(row.low), close = Number(row.close);
      if (!Number.isFinite(time) || ![open, high, low, close].every(x => Number.isFinite(x) && x > 0)) continue;
      if (high < Math.max(open, close) || low > Math.min(open, close) || high < low) continue;
      byTime.set(time, { time: new Date(time).toISOString(), open, high, low, close });
    }
    return [...byTime.values()].sort((a, b) => a.time.localeCompare(b.time)).slice(-2000);
  }

  function ema(series, period) {
    if (series.length < period) return null;
    let value = average(series.slice(0, period));
    const k = 2 / (period + 1);
    for (let i = period; i < series.length; i++) value = series[i] * k + value * (1 - k);
    return value;
  }

  function rsi(series, period = 14) {
    if (series.length <= period) return null;
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
      const d = series[i] - series[i - 1];
      gains += Math.max(0, d); losses += Math.max(0, -d);
    }
    gains /= period; losses /= period;
    for (let i = period + 1; i < series.length; i++) {
      const d = series[i] - series[i - 1];
      gains = (gains * (period - 1) + Math.max(0, d)) / period;
      losses = (losses * (period - 1) + Math.max(0, -d)) / period;
    }
    if (gains === 0 && losses === 0) return 50;
    if (losses === 0) return 100;
    if (gains === 0) return 0;
    return 100 - 100 / (1 + gains / losses);
  }

  function atr(bars, period = 14) {
    if (bars.length <= period) return null;
    const trueRanges = [];
    for (let i = 1; i < bars.length; i++) {
      const p = bars[i - 1].close, b = bars[i];
      trueRanges.push(Math.max(b.high - b.low, Math.abs(b.high - p), Math.abs(b.low - p)));
    }
    let value = average(trueRanges.slice(0, period));
    for (let i = period; i < trueRanges.length; i++) value = (value * (period - 1) + trueRanges[i]) / period;
    return value;
  }

  function analyze(input, interval = '15min', now = Date.now()) {
    const bars = cleanCandles(input);
    const base = { symbol: 'XAU/USD', interval, signal: 'WAIT', label: 'ATTESA', reasons: [], ready: false,
      samples: bars.length, sourceRequired: true, metrics: {}, time: bars.at(-1)?.time || null,
      score: 0, scoreMeaning: 'Coerenza di indicatori, non probabilità di profitto' };
    if (!minutes[interval]) { base.reasons.push('Intervallo non supportato'); return base; }
    if (bars.length < 60) { base.reasons.push('Servono almeno 60 candele OHLC complete e valide'); return base; }
    const times = bars.map(b => Date.parse(b.time));
    const recentGaps = times.slice(-20).map((t, i, a) => i ? t - a[i - 1] : 0).filter(Boolean);
    if (recentGaps.some(g => g <= 0)) { base.reasons.push('Ordine temporale non valido'); return base; }
    const age = now - times.at(-1);
    // Nessuna raccomandazione su serie fuori tempo o prive di data attendibile.
    if (age < -minutes[interval] * 60000 || age > Math.max(minutes[interval] * 3 * 60000, 15 * 60000)) {
      base.reasons.push('Serie storica non aggiornata: attendere nuove candele'); return base;
    }
    const closes = bars.map(b => b.close), price = closes.at(-1);
    const e20 = ema(closes, 20), e50 = ema(closes, 50), rv = rsi(closes), av = atr(bars);
    const volatility = av / price * 100;
    const high20 = Math.max(...bars.slice(-21, -1).map(b => b.high));
    const low20 = Math.min(...bars.slice(-21, -1).map(b => b.low));
    const bullish = e20 > e50, bearish = e20 < e50;
    const momentumUp = price > closes.at(-2), momentumDown = price < closes.at(-2);
    base.ready = true;
    base.sourceRequired = false;
    base.metrics = { price: round(price), ema20: round(e20), ema50: round(e50), rsi14: round(rv),
      atr14: round(av), atrPct: round(volatility), resistance20: round(high20), support20: round(low20) };
    base.reasons.push(bullish ? 'Trend EMA: rialzista' : bearish ? 'Trend EMA: ribassista' : 'EMA senza direzione');
    base.reasons.push('RSI(14): ' + round(rv, 1));
    base.reasons.push('Volatilità ATR: ' + round(volatility, 2) + '% del prezzo');
    if (volatility > 3 || !Number.isFinite(volatility)) {
      base.reasons.push('Volatilità troppo alta per questo filtro: nessun segnale');
      return base;
    }
    const buy = bullish && price > e20 && rv >= 52 && rv <= 68 && momentumUp;
    const sell = bearish && price < e20 && rv >= 32 && rv <= 48 && momentumDown;
    if (buy) {
      base.signal = 'BUY'; base.label = 'SETUP ACQUISTO';
      base.reasons.push('Trend, prezzo, RSI e momentum concordano al rialzo');
    } else if (sell) {
      base.signal = 'SELL'; base.label = 'SETUP VENDITA';
      base.reasons.push('Trend, prezzo, RSI e momentum concordano al ribasso');
    } else base.reasons.push('Indicatori discordanti o movimento esteso: restare in attesa');
    const checks = buy ? [bullish, price > e20, rv >= 52 && rv <= 68, momentumUp] :
      sell ? [bearish, price < e20, rv >= 32 && rv <= 48, momentumDown] : [];
    base.score = checks.filter(Boolean).length;
    return base;
  }
  return { cleanCandles, ema, rsi, atr, analyze, minutes };
});
