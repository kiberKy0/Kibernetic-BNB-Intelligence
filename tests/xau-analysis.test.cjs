'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const xau = require('../xau-analysis.js');
const now = Date.parse('2026-11-17T12:00:00Z');
function bars(trend = 1, count = 90, age = 15) {
  let close = 3000;
  return Array.from({ length: count }, (_, index) => {
    if (index) close += trend * (index % 4 === 0 ? -0.60 : 0.35);
    const time = new Date(now - (age + (count - index - 1) * 15) * 60000).toISOString();
    return { time, open: close, high: close + 0.5, low: close - 0.5, close };
  });
}
test('returns WAIT without sufficient confirmed OHLC candles', () => {
  const a = xau.analyze(bars(1, 20), '15min', now);
  assert.equal(a.signal, 'WAIT');
  assert.equal(a.ready, false);
});
test('returns WAIT on stale data regardless of apparent trend', () => {
  const a = xau.analyze(bars(1, 90, 180), '15min', now);
  assert.equal(a.signal, 'WAIT');
  assert.match(a.reasons.join(' '), /non aggiornata/);
});
test('never gives live signal for unsupported timeframe', () => {
  assert.equal(xau.analyze(bars(), 'undefined', now).signal, 'WAIT');
});
test('filters invalid candles without inventing data', () => {
  const input = bars(1, 60).map((row, index) =>
    index % 2 ? { ...row, high: row.low - 1 } : row);
  assert.equal(xau.analyze(input, '15min', now).signal, 'WAIT');
});
test('technical BUY setup requires positive but non-overbought confluence', () => {
  const a = xau.analyze(bars(1), '15min', now);
  assert.equal(a.signal, 'BUY');
  assert.ok(a.metrics.rsi14 >= 52 && a.metrics.rsi14 <= 68);
});
test('technical SELL setup requires negative but non-oversold confluence', () => {
  const a = xau.analyze(bars(-1), '15min', now);
  assert.equal(a.signal, 'SELL');
  assert.ok(a.metrics.rsi14 >= 32 && a.metrics.rsi14 <= 48);
});
test('no signal for future-dated candles', () => {
  assert.equal(xau.analyze(bars(1, 90, -400), '15min', now).signal, 'WAIT');
});
