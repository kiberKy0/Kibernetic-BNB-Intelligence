// Chronological forecast validation; descriptive directional test, not a trading backtest.
// Usage: node scripts/validate-forecast.cjs /path/to/OHLC-or-points.json
const fs=require('node:fs'),A=require('../analysis-utils.js');
const d=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
const raw=d.points?.map(x=>({t:x.t,p:x.p,v:null}))||d.candles?.map(x=>({t:x.t*1000,p:x.close,v:x.quoteVolume}))||d.technical?.candles?.map(x=>({t:x[0]*1000,p:x[4],v:x[5]}));
if(!raw)throw Error('Expected points or candles');const a=A.clean(raw);let evaluated=0,issued=0,correct=0;const confusion={},outcomes={up:0,down:0,range:0};
for(let i=150;i+6<a.length;i+=30){const f=A.forecast(a.slice(0,i+1));evaluated++;const ret=(a[i+6].p/a[i].p-1)*100,actual=ret>f.rangeBand?'up':ret<-f.rangeBand?'down':'range';if(!Number.isFinite(f.rangeBand))continue;outcomes[actual]++;if(f.scenario){issued++;correct+=f.scenario===actual;const k=f.scenario+'→'+actual;confusion[k]=(confusion[k]||0)+1}}
console.log(JSON.stringify({method:'fixed chronological evaluation, 30-bar spacing, six-bar outcomes',samples:a.length,evaluated,issued,coverage:issued/evaluated,accuracy:issued?correct/issued:null,unconditionalOutcomes:outcomes,confusion,validated:false,limitations:'Single asset and resolution. No parameter tuning, trade execution, fees, slippage or probability calibration. Do not claim predictive edge.'},null,2));
