'use strict';
const fs = require('node:fs');
const path = require('node:path');
const STEP = 4 * 3600_000;
const HORIZON = 6;
const sigmoid = x => 1 / (1 + Math.exp(-x));
const score = (w, x) => sigmoid(w.reduce((s, v, i) => s + v * x[i], 0));

function features(bars, i) {
  return [1, ...[1, 6, 24].map(lag =>
    Math.max(-4, Math.min(4, 50 * Math.log(bars[i].p / bars[i - lag].p))))];
}

function train(bars, stop) {
  const w = [0, 0, 0, 0];
  for (let epoch = 0; epoch < 8; epoch++) {
    for (let i = 24; i + HORIZON < stop; i++) {
      const x = features(bars, i);
      const error = Number(bars[i + HORIZON].p > bars[i].p) - score(w, x);
      x.forEach((v, j) => { w[j] += 0.005 * (error * v - 0.001 * w[j]); });
    }
  }
  return w;
}

async function candles(end) {
  const url = new URL('https://data-api.binance.vision/api/v3/klines');
  url.search = new URLSearchParams({symbol:'BNBUSDT', interval:'4h', limit:'1000', endTime:String(end - 1)});
  const res = await fetch(url, {signal: AbortSignal.timeout(20000)});
  if (!res.ok) throw Error('Binance HTTP ' + res.status);
  const bars = (await res.json()).map(row => {
    const [o,h,l,p] = row.slice(1,5).map(Number);
    const t = Number(row[0]) + STEP;
    if (![o,h,l,p].every(v => Number.isFinite(v) && v > 0) ||
        h < Math.max(o,p) || l > Math.min(o,p) || t % STEP !== 0 ||
        Number(row[6]) !== t - 1 || t > end) throw Error('Invalid or open candle');
    return {t,p,v:Number(row[7])};
  });
  if (bars.length !== 1000 || bars.at(-1).t !== end ||
      bars.some((b,i) => i && b.t !== bars[i-1].t + STEP)) throw Error('Incomplete candle history');
  return bars;
}

function cycle(state, bars, now) {
  const i = bars.length - 1;
  const bar = bars[i];
  const prices = new Map(bars.map(b => [b.t,b.p]));
  for (const row of state.forecasts) {
    if (row.actual == null && prices.has(row.due)) {
      row.actual = Number(prices.get(row.due) > row.entry);
      row.settledAt = now;
      if (row.oracle && Number.isFinite(row.oracle.band)) {
        const change = 100 * (prices.get(row.due) / row.entry - 1);
        row.oracle.actual = change > row.oracle.band ? 'up' : change < -row.oracle.band ? 'down' : 'range';
      }
    }
  }
  if (state.forecasts.some(r => r.t === bar.t)) return;
  // Reserve the final 300 bars for 50 non-overlapping, unseen outcomes.
  const split = bars.length - 300;
  const candidate = train(bars, split);
  const prior = state.weights;
  const losses = [0,0,0];
  let n = 0;
  let rises = 0;
  for (let j = 24; j + HORIZON < split; j += HORIZON)
    rises += Number(bars[j + HORIZON].p > bars[j].p);
  const base = rises / Math.ceil((split - HORIZON - 24) / HORIZON);
  for (let j = split - 1; j + HORIZON <= i; j += HORIZON) {
    const x = features(bars,j);
    const y = Number(bars[j + HORIZON].p > bars[j].p);
    [score(candidate,x),score(prior,x),base].forEach((p,k) => { losses[k] += (p-y)**2; });
    n++;
  }
  const [challenger, incumbent, baseline] = losses.map(v => v/n);
  // A frozen incumbent must also predate the full evaluation window.
  const eligible = state.trainedThrough == null || state.trainedThrough < bars[split-1].t;
  const promoted = eligible && n >= 50 && challenger + 0.005 < Math.min(incumbent,baseline);
  if (promoted) {
    state.weights = candidate;
    state.trainedThrough = bars[split-1].t;
  }
  if (now >= bar.t + STEP) throw Error('Stale forecast origin');
  const oracle = require('../analysis-utils.js').forecast(bars);
  state.forecasts.push({oracle:{scenario:oracle.scenario ?? null, band:oracle.rangeBand ?? null}, t:bar.t, issuedAt:now, due:bar.t+HORIZON*STEP, entry:bar.p,
    probabilityUp:score(state.weights,features(bars,i)), baseline:base, actual:null,
    validation:{n,challenger,incumbent,baselineLoss:baseline,promoted}});
}

async function main() {
  const file = process.argv[2];
  const state = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file)) :
    {symbol:'BNBUSDT', interval:'4h', horizonHours:24, weights:[0,0,0,0], forecasts:[]};
  const end = Math.floor(Date.now()/STEP)*STEP;
  const bars = await candles(end);
  cycle(state,bars,Date.now());
  fs.mkdirSync(path.dirname(file),{recursive:true});
  fs.writeFileSync(file,JSON.stringify(state,null,2)+'\n');
  console.log(JSON.stringify(state.forecasts.at(-1)));
}
if (require.main === module) main().catch(e => { console.error(e.message); process.exitCode=1; });
module.exports = {cycle};
