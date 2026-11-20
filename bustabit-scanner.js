/* Kiber Bustabit Intelligence Lab: offline statistical scanner, never places bets. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.KiberBustabitScanner=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null,function(){
'use strict';
const MAX_ROUNDS=200000;
const TYPES=['CAT','SEQ','DIR','PIC','REG'];
function assert(v){const n=Number(String(v).replace(/x$/i,'').trim().replace(',','.'));if(!Number.isFinite(n)||n<1||n>1e12)throw Error('Moltiplicatore non valido: '+String(v).slice(0,30));return n}
function parse(input){
  const s=String(input||'').trim();
  if(!s)throw Error('Inserisci uno storico reale. Nessun dato inventato.');
  let rows;
  if(s[0]==='['||s[0]==='{'){
    let o;try{o=JSON.parse(s)}catch{throw Error('JSON non valido')}
    if(!Array.isArray(o))o=o.rounds||o.games||o.history;
    if(!Array.isArray(o))throw Error('JSON: serve una lista di round.');
    rows=o.map(v=>typeof v==='object'&&v!==null?(v.multiplier??v.bust??v.crash??v.payout):v);
  }else{
    const lines=s.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
    if(lines.every(x=>/^\d+,\d+x?$/i.test(x))){rows=lines.map(x=>x.replace(',','.'));}
    else if(lines[0]&&/[a-z]/i.test(lines[0].replace(/[\dx.,;|\s]/gi,''))){
      const sep=lines[0].includes(';')?';':lines[0].includes('\t')?'\t':lines[0].includes('|')?'|':',';
      const cols=lines[0].split(sep).map(x=>x.trim().toLowerCase());
      const index=cols.findIndex(x=>/^(bust|crash|multiplier|payout|crashpoint|crash_point)$/.test(x));
      if(index<0)throw Error('CSV: manca colonna bust, crash o multiplier.');
      rows=lines.slice(1).map(x=>x.split(sep)[index]);
    }else rows=s.split(/[\s;|]+/).flatMap(t=>t.split(/,(?=\s*\d+(?:[.,]\d+)?x?(?:,|$))/i));
  }
  if(rows.length>MAX_ROUNDS)throw Error('Limite '+MAX_ROUNDS.toLocaleString('it-IT')+' round per scansione.');
  if(rows.some(x=>x===null||x===undefined||x===''))throw Error('Valore vuoto in uno o più round.');
  const data=rows.map(assert);
  if(!data.length)throw Error('Nessun round valido.');
  return data;
}
function avg(a){return a.length?a.reduce((s,x)=>s+x,0)/a.length:null}
function median(a){if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),h=s.length>>1;return s.length%2?s[h]:(s[h-1]+s[h])/2}
function std(a){if(a.length<2)return null;const m=avg(a);return Math.sqrt(a.reduce((s,x)=>s+(x-m)**2,0)/(a.length-1))}
function pct(x){return Number.isFinite(x)?(x*100).toFixed(2)+'%':'—'}
function gap(data,threshold){let n=0;for(let i=data.length-1;i>=0;i--){if(data[i]>=threshold)return n;n++}return n}
function streak(a,predicate){let n=0;for(let i=a.length-1;i>=0&&predicate(a[i]);i--)n++;return n}
function quantile(a,q){if(!a.length)return null;const s=[...a].sort((x,y)=>x-y),p=(s.length-1)*q,i=Math.floor(p),f=p-i;return s[i]+(s[Math.min(i+1,s.length-1)]-s[i])*f}
function wilson(success,n){if(!n)return null;const z=1.959963984540054,p=success/n,den=1+z*z/n,centre=(p+z*z/(2*n))/den,half=z*Math.sqrt(p*(1-p)/n+z*z/(4*n*n))/den;return [Math.max(0,centre-half),Math.min(1,centre+half)]}
function windowData(data,n){return data.slice(-n)}
function patterns(data){
 const n=data.length,a5=windowData(data,5),a15=windowData(data,15),a50=windowData(data,50);
 const cnt=(a,fn)=>a.filter(fn).length;
 const recent2=a15.slice(-2), recent3=a15.slice(-3);
 const prior15=data.slice(-30,-15);
 const definitions=[
 ['CAT01','CAT','Rossi consecutivi',3,streak(data,x=>x<2)>=3],
 ['CAT02','CAT','Verdi consecutivi',3,streak(data,x=>x>=2)>=3],
 ['CAT03','CAT','Prevalenza rossi su 15',15,cnt(a15,x=>x<2)>=11],
 ['CAT04','CAT','Prevalenza verdi su 15',15,cnt(a15,x=>x>=2)>=11],
 ['CAT05','CAT','Cinque sotto 1.40x',5,cnt(a5,x=>x<1.4)===5],
 ['SEQ01','SEQ','Due sotto 2x',2,recent2.length===2&&recent2.every(x=>x<2)],
 ['SEQ02','SEQ','Tre sotto 2x',3,recent3.length===3&&recent3.every(x=>x<2)],
 ['SEQ03','SEQ','Alternanza 4 round',4,(()=>{const a=data.slice(-4);return a.length===4&&a.every((v,i)=>i===0||(v>=2)!==(a[i-1]>=2))})()],
 ['SEQ04','SEQ','Doppio alto >=5x',2,recent2.length===2&&recent2.every(x=>x>=5)],
 ['SEQ05','SEQ','Gap da >=10x oltre 20',21,gap(data,10)>=20],
 ['DIR01','DIR','Media 5 sopra media 15',15,avg(a5)>avg(a15)],
 ['DIR02','DIR','Mediana 5 sopra mediana 15',15,median(a5)>median(a15)],
 ['DIR03','DIR','Media 15 sopra media 50',50,avg(a15)>avg(a50)],
 ['DIR04','DIR','Mediana 15 sopra mediana 50',50,median(a15)>median(a50)],
 ['PIC01','PIC','Massimo 15 >=10x',15,Math.max(...a15)>=10],
 ['PIC02','PIC','Massimo 50 >=25x',50,Math.max(...a50)>=25],
 ['PIC03','PIC','Almeno 2 picchi >=5x su 15',15,cnt(a15,x=>x>=5)>=2],
 ['PIC04','PIC','Almeno 2 picchi >=10x su 50',50,cnt(a50,x=>x>=10)>=2],
 ['REG01','REG','Dispersione elevata su 15',15,std(a15)>avg(a15)],
 ['REG02','REG','Coda superiore dominante su 50',50,quantile(a50,.95)>4*median(a50)],
 ['REG03','REG','Aumento frequenza verdi tra blocchi',30,cnt(a15,x=>x>=2)>cnt(prior15,x=>x>=2)]
 ];
 return definitions.map(([id,type,name,min,active])=>({id,type,name,samples:n>=min?min:null,status:n<min?'DATI_INSUFFICIENTI':active?'RILEVATO':'NON_RILEVATO',trigger:n>=min&&active?(n>=Math.max(50,min*2)?'CONFERMA_DESCRITTIVA':'PREALLERTA_DESCRITTIVA'):null}));
}
function estimate(data,target){
 target=Number(target);
 if(!(target>1)&&target!==1)throw Error('Target non valido.');
 if(target<=1||target>100000)throw Error('Il target deve essere tra 1.01x e 100000x.');
 const wins=data.filter(v=>v>=target).length;
 const rate=wins/data.length,ci=wilson(wins,data.length);
 return {target,rounds:data.length,wins,losses:data.length-wins,hitRate:rate,confidence95:ci,profitBits:wins*(target-1)-(data.length-wins),roi:(wins*target/data.length)-1,modelHitRate:.99/target,modelRoi:-.01};
}
function scan(data,opts={}){
 if(!Array.isArray(data)||!data.length||data.length>MAX_ROUNDS)throw Error('Storico non valido o troppo grande.');
 data=data.map(assert);
 const threshold=Number(opts.target||2), w5=windowData(data,5),w15=windowData(data,15),w50=windowData(data,50);
 const count=t=>data.filter(x=>x>=t).length, total=data.length;
 const source=opts.source==='manual'?'Inserito manualmente':opts.source==='file'?'File locale':'Non dichiarata';
 const distribution=[1.2,1.4,2,3,5,10,20,50,100].map(t=>({target:t,count:count(t),rate:count(t)/total}));
 const rate2=count(2)/total,ci2=wilson(count(2),total);
 const trainSize=Math.floor(total*.7),train=data.slice(0,trainSize),test=data.slice(trainSize);
 const candidates=[1.2,1.35,2,3,5,10,20];
 const selected=train.length>=60?candidates.map(t=>estimate(train,t)).sort((a,b)=>b.roi-a.roi)[0]:null;
 return {
  source,rounds:total,latest:data[total-1],range:[Math.min(...w50),Math.max(...w50)],
  frequency:distribution,median:{last5:median(w5),last15:median(w15),last50:median(w50)},
  mean:{last5:avg(w5),last15:avg(w15),last50:avg(w50)},
  max:{last15:Math.max(...w15),last50:Math.max(...w50)},
  red:total-count(2),green:count(2),rate2,interval95:ci2,
  std15:std(w15),gap5:gap(data,5),gap10:gap(data,10),
  patterns:patterns(data),target:estimate(data,threshold),
  holdout:selected&&test.length>=30?{trainSize,testSize:test.length,chosenTarget:selected.target,trainRoi:selected.roi,test:estimate(test,selected.target)}:null,
  caution:'Solo statistiche descrittive. Nessun pattern o modello garantisce il prossimo crash. 1% di vantaggio del banco dichiarato.'
 };
}
return {MAX_ROUNDS,TYPES,parse,scan,patterns,estimate,wilson,median};
});