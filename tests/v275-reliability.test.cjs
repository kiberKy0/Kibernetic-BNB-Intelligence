const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.join(__dirname,'..');
function response(){return {code:200,headers:{},setHeader(k,v){this.headers[k]=v},status(c){this.code=c;return this},json(d){this.body=d;return this}}}
function load(file,extra={}){const context={module:{exports:{}},process:{env:{}},AbortSignal,console,...extra};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context);return context}
const now=Date.now();
function fixture(url,{cg=false,spot=true,history=true}={}){
 if(url.includes('binance.vision')){if(!spot)throw Error('Binance unavailable');return url.includes('ticker')?{lastPrice:'751.38',priceChangePercent:'2.5',quoteVolume:'90000000',highPrice:'770',lowPrice:'730',closeTime:now}:Array.from({length:40},(_,i)=>[now-(39-i)*864e5,'700','770','680',String(700+i),'1000']);}
 if(url.includes('coingecko')){if(!cg)throw Error('CoinGecko unavailable');return url.includes('markets?')?[{current_price:750,price_change_percentage_24h:2,market_cap:100e9,total_volume:200e6}]:{prices:Array.from({length:40},(_,i)=>[now-(39-i)*864e5,700+i])};}
 if(url.includes('historicalChain'))return history?Array.from({length:40},(_,i)=>({date:Math.floor((now-(39-i)*864e5)/1000),tvl:5e9+i*1e6})):[];
 if(url.includes('overview/dexs'))return {total24h:500e6,change_1d:-3,change_7d:-5};
 if(url.includes('stablecoins'))return [];
 return [{name:'BSC',tvl:5e9}];
}
async function chain(options){const context=load('api/chain.js',{fetch:async url=>({ok:true,json:async()=>fixture(url,options)})});const res=response();await context.module.exports({method:'GET'},res);return res}
test('CoinGecko failure preserves Binance price, 24h change, volume and history',async()=>{const r=await chain({});assert.equal(r.code,200);assert.equal(r.body.bnb.price,751.38);assert.equal(r.body.bnb.change24,2.5);assert.equal(r.body.bnb.volume24,90e6);assert.equal(r.body.bnb.marketCap,null);assert.equal(r.body.bnb.quote,'USDT');assert.equal(r.body.availability.bnb,true);assert.equal(r.body.history.bnb.length,40)});
test('Binance failure uses CoinGecko without inventing missing fields',async()=>{const r=await chain({cg:true,spot:false});assert.equal(r.body.bnb.price,750);assert.equal(r.body.bnb.source,'CoinGecko BNB/USD');assert.equal(r.body.bnb.high24,null);assert.equal(r.body.bnb.quote,'USD')});
test('All price providers unavailable leave explicit missing data and preserve Chain',async()=>{const r=await chain({spot:false,cg:false});assert.equal(r.code,200);assert.equal(r.body.bnb.price,null);assert.equal(r.body.availability.bnb,false);assert.equal(r.body.chain.tvl,5e9)});
test('Short TVL history must not be called 30-day performance',async()=>{const r=await chain({history:false});assert.equal(r.body.chain.tvlChange30d,null)});
test('Explicit BNB target overrides incidental Chain words in prompt',()=>{const c=load('api/kiber.js');const b={analysisSubject:'bnb',message:'BNB, DEX, TVL e BNB Chain',bnb:{change24:2,volume24:1e8},chain:{dexChange1d:-30}};assert.equal(c.chooseEvaluation(b).subject,'BNB');assert.equal(c.chooseEvaluation({...b,analysisSubject:'chain'}).subject,'BNB Chain');assert.equal(c.chooseEvaluation({...b,token:{symbol:'CAKE',name:'PancakeSwap'}}).subject,'PancakeSwap')});
test('V18 initializes on V20 markup with no legacy appStatus',()=>{const changed={};const elements={changedBtn:changed};const c=load('v18.js',{localStorage:{getItem:()=>null},state:{news:[]},setTimeout:()=>{},document:{title:'',querySelector:()=>null},$:id=>elements[id]||null});let started=0;c.ensureDossierPanel=()=>started++;c.renderDossier=()=>{};c.v18EnsureChart=()=>{};c.loadAlerts=()=>{};c.v18Start();assert.equal(started,1);assert.equal(typeof changed.onclick,'function')});
