/* Kibernetic XAU/USD · Biblioteca educativa indicatori v1 (sola lettura).
 * 5 metodi tecnici su candele M5 CHIUSE, 1 contesto macro non collegato.
 * Non produce ordini, raccomandazioni, soglie di ingresso o stime di performance.
 * Fonti: CME, Fidelity, Schwab, World Gold Council (link nelle lezioni).
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.KiberXauLearning=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const round=(x,n=2)=>finite(x)?Number(x.toFixed(n)):null;
 const format=x=>finite(x)?x.toLocaleString('it-IT',{minimumFractionDigits:2,maximumFractionDigits:2}):'—';
 const labels=['adx','bollinger','macd','stochastic','structure'];
 const waiting=(reason)=>({
  ready:false,status:'DATI DA VERIFICARE',summary:reason,updated:'—',
  methods:Object.fromEntries(labels.map(id=>[id,{status:'IN ATTESA',reading:reason}])),
  macro:{status:'STUDIO · NON LIVE',reading:'Non disponiamo di una serie DXY e rendimenti reali USA sincronizzati con il feed XAU/USD.'},
  executable:false,decision:'WAIT'
 });
 function validateM5(data,now){
  if(!Array.isArray(data)||data.length<80)return false;
  let last=-Infinity;
  for(const b of data){
   const t=typeof b?.time==='string'?Date.parse(b.time):NaN;
   if(!finite(t)||t<=last||t+300000>now+5000)return false;
   if(![b.open,b.high,b.low,b.close].every(x=>finite(x)&&x>0))return false;
   if(b.high<Math.max(b.open,b.close,b.low)||b.low>Math.min(b.open,b.close,b.high))return false;
   last=t;
  }
  const lag=now-last-300000;
  return lag>=-5000&&lag<=720000;
 }
 function calcAdx(bars,n=14){
  if(bars.length<2*n+2)return null;
  const raw=[];
  for(let i=1;i<bars.length;i++){
   const b=bars[i],p=bars[i-1],up=b.high-p.high,down=p.low-b.low;
   raw.push({
    tr:Math.max(b.high-b.low,Math.abs(b.high-p.close),Math.abs(b.low-p.close)),
    plus:up>down&&up>0?up:0,minus:down>up&&down>0?down:0
   });
  }
  let tr=0,plus=0,minus=0;
  for(let i=0;i<n;i++){tr+=raw[i].tr;plus+=raw[i].plus;minus+=raw[i].minus;}
  const dx=[];
  let plusDI=0,minusDI=0;
  function pushDx(){
   plusDI=tr>0?100*plus/tr:0;
   minusDI=tr>0?100*minus/tr:0;
   const sum=plusDI+minusDI;
   dx.push(sum>0?100*Math.abs(plusDI-minusDI)/sum:0);
  }
  pushDx();
  for(let i=n;i<raw.length;i++){
   tr=tr-tr/n+raw[i].tr;plus=plus-plus/n+raw[i].plus;minus=minus-minus/n+raw[i].minus;
   pushDx();
  }
  if(dx.length<n)return null;
  let adx=dx.slice(0,n).reduce((a,b)=>a+b,0)/n;
  for(let i=n;i<dx.length;i++)adx=(adx*(n-1)+dx[i])/n;
  return {adx,plusDI,minusDI};
 }
 function bollinger(bars,period=20){
  if(bars.length<period+21)return null;
  const closes=bars.map(b=>b.close),widths=[];
  let current=null;
  for(let i=period-1;i<closes.length;i++){
   const win=closes.slice(i-period+1,i+1);
   const mid=win.reduce((a,b)=>a+b,0)/period;
   const variance=win.reduce((a,b)=>a+(b-mid)**2,0)/period;
   const dev=Math.sqrt(Math.max(0,variance));
   const upper=mid+2*dev,lower=mid-2*dev;
   const width=mid>0?100*(upper-lower)/mid:null;
   if(!finite(width))return null;
   widths.push(width);
   if(i===closes.length-1)current={mid,upper,lower,width,price:closes[i]};
  }
  const previous=widths.slice(Math.max(0,widths.length-61),-1);
  if(previous.length<20)return null;
  const sorted=[...previous].sort((a,b)=>a-b);
  const median=(sorted[Math.floor((sorted.length-1)/2)]+sorted[Math.floor(sorted.length/2)])/2;
  return {...current,previousMedian:median};
 }
 function emaSeries(closes,period){
  const arr=Array(closes.length).fill(null);
  if(closes.length<period)return arr;
  let e=closes.slice(0,period).reduce((a,b)=>a+b,0)/period;
  arr[period-1]=e;
  for(let i=period;i<closes.length;i++){
   e=e*(1-2/(period+1))+closes[i]*2/(period+1);
   arr[i]=e;
  }
  return arr;
 }
 function macd(bars){
  const close=bars.map(x=>x.close),a=emaSeries(close,12),b=emaSeries(close,26);
  const line=close.map((x,i)=>finite(a[i])&&finite(b[i])?a[i]-b[i]:null);
  const good=line.filter(finite);
  if(good.length<10)return null;
  const signal=emaSeries(good,9);
  const j=good.length-1;
  if(!finite(signal[j])||!finite(signal[j-1]))return null;
  const hist=good[j]-signal[j],previous=good[j-1]-signal[j-1];
  return {line:good[j],signal:signal[j],hist,previous};
 }
 function stochastic(bars,n=14){
  if(bars.length<n+6)return null;
  const raw=[];
  for(let i=n-1;i<bars.length;i++){
   const s=bars.slice(i-n+1,i+1);
   const lo=Math.min(...s.map(x=>x.low)),hi=Math.max(...s.map(x=>x.high));
   raw.push(hi>lo?100*(bars[i].close-lo)/(hi-lo):50);
  }
  const slow=[];
  for(let i=2;i<raw.length;i++)slow.push((raw[i]+raw[i-1]+raw[i-2])/3);
  if(slow.length<3)return null;
  return {k:slow.at(-1),d:(slow.at(-1)+slow.at(-2)+slow.at(-3))/3};
 }
 function swings(bars,n=2){
  const highs=[],lows=[];
  for(let i=n;i<bars.length-n;i++){
   const b=bars[i];let high=true,low=true;
   for(let j=1;j<=n;j++){
    if(!(b.high>bars[i-j].high&&b.high>bars[i+j].high))high=false;
    if(!(b.low<bars[i-j].low&&b.low<bars[i+j].low))low=false;
   }
   if(high)highs.push({price:b.high,time:b.time});
   if(low)lows.push({price:b.low,time:b.time});
  }
  return {highs:highs.slice(-2),lows:lows.slice(-2)};
 }
 function evaluate(context,now=Date.now()){
  const q=context?.quality;
  if(q?.ok!==true||q?.tick?.ok!==true||q?.tick?.fresh!==true)
   return waiting('Le quotazioni esterne non superano la verifica di freschezza e coerenza.');
  const src=context?.strategySeries?.m5;
  if(src?.interval!=='5min'||src?.recent!==true||!validateM5(src.candles,now))
   return waiting('Servono almeno 80 candele M5 valide e recenti, con timestamp UTC.');
  const bars=src.candles;
  const A=calcAdx(bars),B=bollinger(bars),M=macd(bars),S=stochastic(bars),P=swings(bars);
  if(!A||!B||!M||!S)return waiting('Indicatori incompleti: calcolo interrotto anziché usare numeri stimati.');
  const adxStatus=A.adx>=25?'TREND MARCATO':A.adx<20?'TREND DEBOLE':'ZONA INTERMEDIA';
  const adxDir=A.plusDI>A.minusDI?'pressione +DI prevalente':A.plusDI<A.minusDI?'pressione −DI prevalente':'pressioni equilibrate';
  const bStatus=B.width<=B.previousMedian*.75?'COMPRESSIONE':B.width>=B.previousMedian*1.25?'ESPANSIONE':'VOLATILITÀ NORMALE';
  const bandLoc=B.price>B.upper?'sopra la banda superiore':B.price<B.lower?'sotto la banda inferiore':'all’interno delle bande';
  const macdStatus=M.hist>0?'MOMENTUM POSITIVO':M.hist<0?'MOMENTUM NEGATIVO':'MOMENTUM NEUTRO';
  const macdChange=M.hist>M.previous?'in aumento':M.hist<M.previous?'in diminuzione':'stabile';
  const stochStatus=S.k>=80?'ZONA ALTA':S.k<=20?'ZONA BASSA':'ZONA INTERMEDIA';
  const stochCross=S.k>S.d?'%K sopra %D':S.k<S.d?'%K sotto %D':'%K uguale a %D';
  let structStatus='STRUTTURA INCOMPLETA',structRead='Mancano due massimi e due minimi locali confermati.';
  if(P.highs.length>=2&&P.lows.length>=2){
   const hiUp=P.highs[1].price>P.highs[0].price,loUp=P.lows[1].price>P.lows[0].price;
   const hiDown=P.highs[1].price<P.highs[0].price,loDown=P.lows[1].price<P.lows[0].price;
   structStatus=hiUp&&loUp?'MASSIMI/MINIMI CRESCENTI':hiDown&&loDown?'MASSIMI/MINIMI DECRESCENTI':'STRUTTURA MISTA';
   structRead='Ultimi massimi locali '+format(P.highs[0].price)+' → '+format(P.highs[1].price)+
     ', minimi '+format(P.lows[0].price)+' → '+format(P.lows[1].price)+' USD/oz. Pivot confermati dopo due candele chiuse.';
  }
  return {
   ready:true,status:'5 METODI CALCOLATI',updated:bars.at(-1).time,
   summary:'5 letture M5 distinte; il contesto USD/tassi è solo didattico. Nessuna previsione certificata.',
   methods:{
    adx:{status:adxStatus,reading:'ADX14 '+format(A.adx)+' · +DI '+format(A.plusDI)+
      ' · −DI '+format(A.minusDI)+'. '+adxDir+'. L’ADX misura la forza, non il verso da solo.'},
    bollinger:{status:bStatus,reading:'Larghezza bande '+format(B.width)+'%, confronto storico recente '+
      format(B.previousMedian)+'%. Chiusura '+bandLoc+'. Una compressione non anticipa da sola la direzione.'},
    macd:{status:macdStatus,reading:'MACD(12,26,9) '+format(M.line)+' · segnale '+format(M.signal)+
      ' · istogramma '+format(M.hist)+' ('+macdChange+'). È un indicatore ritardato del momentum.'},
    stochastic:{status:stochStatus,reading:'Stocastico lento (14,3,3): %K '+format(S.k)+
      ', %D '+format(S.d)+'; '+stochCross+'. Valori alti/bassi non impongono un’inversione.'},
    structure:{status:structStatus,reading:structRead}
   },
   macro:{status:'STUDIO · NON LIVE',reading:'USD e rendimenti reali non collegati al feed: nessuna correlazione corrente o probabilità calcolata.'},
   dataSource:String(context.source||'feed esterno'),
   executable:false,decision:'WAIT'
  };
 }
 return {evaluate,validateM5,calcAdx,bollinger,macd,stochastic,swings};
});
