'use strict';

// Dati XAU/USD ottenuti da un provider autorizzato e separati dal feed BNB.
// Impostare TWELVEDATA_API_KEY nelle variabili d'ambiente Vercel. Non esporre chiavi al browser.
const intervals = { '5min': 5, '15min': 15, '1h': 60, '4h': 240, '1day': 1440 };

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=30');
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
    const values = response.values.map(v => ({
      time: new Date(String(v.datetime).replace(' ', 'T') + 'Z').toISOString(),
      open: Number(v.open), high: Number(v.high), low: Number(v.low), close: Number(v.close)
    })).filter(v => [v.open, v.high, v.low, v.close].every(Number.isFinite)
      && Date.parse(v.time) + intervalMs <= now - 60000);
    if (!values.length) return res.status(503).json({ error: 'Nessuna candela chiusa disponibile' });
    return res.status(200).json({
      symbol: 'XAU/USD', interval, source: 'Twelve Data', feedStatus: 'provider',
      timestamp: new Date(now).toISOString(), candles: values.reverse()
    });
  } catch (error) {
    return res.status(502).json({ error: error?.name === 'AbortError' ?
      'Timeout del provider dati' : 'Impossibile leggere il feed XAU/USD' });
  }
};
