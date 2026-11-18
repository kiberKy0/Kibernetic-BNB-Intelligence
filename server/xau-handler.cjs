'use strict';

// Dati XAU/USD ottenuti da un provider autorizzato e separati dal feed BNB.
// Impostare TWELVEDATA_API_KEY nelle variabili d'ambiente Vercel. Non esporre chiavi al browser.
const intervals = { '5min': 5, '15min': 15, '1h': 60, '4h': 240, '1day': 1440 };

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'private, no-store, max-age=0');
  if (req.method !== 'GET') return res.status(405).json({ error: 'Metodo non consentito' });
  const interval = String(req.query?.interval || '15min');
  if (!intervals[interval]) return res.status(400).json({ error: 'Intervallo non supportato' });
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) return res.status(503).json({
    error: 'Feed XAU/USD non configurato', code: 'NO_FEED',
    help: 'Collegare una fonte dati autorizzata impostando TWELVEDATA_API_KEY in Vercel'
  });
  const url = new URL('https://api.twelvedata.com/time_series');
  url.searchParams.set('symbol', 'XAU/USD');
  url.searchParams.set('interval', interval);
  url.searchParams.set('outputsize', '120');
  url.searchParams.set('timezone', 'UTC');
  url.searchParams.set('apikey', key);
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 11000);
    let upstream;
    try { upstream = await fetch(url, { signal: controller.signal }); }
    finally { clearTimeout(timer); }
    if (!upstream.ok) return res.status(502).json({ error: 'Provider dati non disponibile (' + upstream.status + ')' });
    const response = await upstream.json();
    if (!Array.isArray(response.values)) {
      return res.status(503).json({
        error: 'Feed non disponibile: controllare permessi, credito API e copertura XAU/USD',
        code: 'FEED_ERROR'
      });
    }
    const now = Date.now();
    const intervalMs = intervals[interval] * 60000;
    // Only COMPLETED candles are exposed. Reject malformed timestamps instead of
    // silently treating a received API response as a current quote.
    const values = response.values.map(v => {
      const raw = String(v?.datetime || '');
      if (!/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}(:\d{2})?$/.test(raw)) return null;
      const ms = Date.parse(raw.replace(' ', 'T') + 'Z');
      if (!Number.isFinite(ms)) return null;
      const candle = {
        time: new Date(ms).toISOString(),
        open: Number(v.open), high: Number(v.high), low: Number(v.low), close: Number(v.close)
      };
      if (![candle.open, candle.high, candle.low, candle.close].every(x => Number.isFinite(x) && x > 0)
        || candle.high < Math.max(candle.open,candle.close,candle.low)
        || candle.low > Math.min(candle.open,candle.close,candle.high)) return null;
      return candle;
    }).filter(v => v && Date.parse(v.time) + intervalMs <= now - 60000);
    if (!values.length) return res.status(503).json({ error: 'Nessuna candela chiusa disponibile' });
    return res.status(200).json({
      symbol: 'XAU/USD', interval, source: 'Twelve Data', feedStatus: 'completed-ohlc-unverified-latency',
      timestamp: new Date(now).toISOString(),
      lastCandleStart: values[0]?.time || null,
      note: 'OHLC completate, non prezzi tick MT5. Freschezza e disponibilità dipendono dal provider.',
      candles: values.reverse()
    });
  } catch (error) {
    return res.status(502).json({ error: error?.name === 'AbortError' ?
      'Timeout del provider dati' : 'Impossibile leggere il feed XAU/USD' });
  }
};
