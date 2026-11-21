'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const config=require('../vercel.json');
const root=path.join(__dirname,'..');

test('Hobby remains at 12 entrypoints while the public XAU revision route survives',()=>{
 const api=fs.readdirSync(path.join(root,'api')).filter(x=>x.endsWith('.js'));
 assert.equal(api.length,12);
 assert.equal(api.includes('xau-revision.js'),false);
 assert.deepEqual(config.rewrites.find(x=>x.source==='/api/xau-revision'),{
  source:'/api/xau-revision',destination:'/api/coingecko?type=xau-revision'
 });
 assert.match(fs.readFileSync(path.join(root,'api/coingecko.js'),'utf8'),/require\('\.\.\/server\/xau-revision\.cjs'\)/);
});

test('Revision status from GitHub remains read-only, with source/record checks',async()=>{
 const xau=require('../server/xau-revision.cjs');
 const old=global.fetch;
 const hash='f'.repeat(40),date='2026-11-21T09:00:00Z';
 let url='',options={};
 global.fetch=async(u,opts)=>{
  url=u;options=opts;
  return {ok:true,json:async()=>[{sha:hash,commit:{committer:{date},message:'fix(xau): layout'}}]};
 };
 const response={
  statusCode:200,headers:{},value:null,
  setHeader(key,v){this.headers[key]=v;return this;},
  status(code){this.statusCode=code;return this;},
  json(v){this.value=v;return this;}
 };
 try{
  await xau({method:'GET'},response);
  assert.equal(response.statusCode,200);
  assert.equal(response.value.ok,true);
  assert.equal(response.value.sha,'fffffff');
  assert.equal(response.value.at,date.replace('Z','.000Z'));
  assert.match(url,/^https:\/\/api\.github\.com\/repos\/kiberKy0\/Kibernetic-BNB-Intelligence\/commits/);
  assert.equal(options.method,undefined);
  assert.equal(options.headers.Authorization,undefined);
 }finally{global.fetch=old}
});

test('XAU standalone and embedded back buttons have a safe route and parent closes with origin check',()=>{
 const h=fs.readFileSync(path.join(root,'xau-usd.html'),'utf8');
 const n=fs.readFileSync(path.join(root,'xau-nav-orb.js'),'utf8');
 const shell=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert.match(h,/id="xauBackToBnb"/);
 assert.match(h,/Torna a BNB Chain/);
 assert.match(n,/getElementById|const \$=id=>document\.getElementById\(id\)/);
 assert.match(n,/\$\('xauBackToBnb'\)\?\.addEventListener\('click'/);
 assert.match(n,/postMessage\(\{type:'KIBER_XAU_CLOSE'\},location\.origin\)/);
 assert.match(n,/else navigate\('bnb'\)/);
 assert.match(shell,/e\.origin!==window\.location\.origin/);
});

test('BNB no longer shows the profile planet and speculation cannot trade',()=>{
 const h=fs.readFileSync(path.join(root,'v20-production.html'),'utf8');
 const start=h.indexOf('<header class="top kiber-wallet-top">');
 const end=h.indexOf('</header>',start);
 const visibleHeader=h.slice(start,end);
 assert.ok(start>=0&&end>start);
 assert.doesNotMatch(visibleHeader,/id="profileBtn"|id="avatar"/);
 assert.match(h,/#kiberLegacyProfileSlot,#profileDrawer,#profileBtn\{display:none!important\}/);
 for(const label of ['Oro · analisi','Bot · laboratorio','Wallet BNB','Dati · mercato'])assert.ok(visibleHeader.includes(label));
 const core=fs.readFileSync(path.join(root,'bnb-speculative-strategy.js'),'utf8');
 const panel=fs.readFileSync(path.join(root,'bnb-speculative-panel.js'),'utf8');
 assert.match(core,/Donchian breakout/);
 assert.match(core,/executionEnabled:false/);
 assert.match(core,/performanceVerified:false/);
 assert.match(panel,/Nessun ordine automatico/);
 assert.doesNotMatch(core,/eth_sendTransaction|wallet_requestPermissions|window\.ethereum/);
});
