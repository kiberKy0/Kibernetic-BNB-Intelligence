'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const handler=require('../api/finance-headlines.js');
const root=path.join(__dirname,'..');
const html=name=>fs.readFileSync(path.join(root,name),'utf8');

function fakeResponse(){
  return {
    headers:{},code:200,body:null,
    setHeader(key,value){this.headers[key]=value},
    status(status){this.code=status;return this},
    json(payload){this.body=payload;return this}
  };
}
function rss(pub,title='BCE annuncia decisione sui tassi'){
  return '<?xml version="1.0"?><rss><channel><item><title>'+title+
    '</title><link>https://news.google.com/articles/example</link>'+
    '<pubDate>'+new Date(pub).toUTCString()+'</pubDate><source>Fonte test</source></item></channel></rss>';
}
test('finance landing links to three independent sectors and loads its data providers',()=>{
  const page=html('index.html');
  assert.match(page,/Kiber IA Finance/);
  for(const sector of ['bnb-chain.html','xau-usd.html','bustabit.html'])assert.ok(page.includes('href="/'+sector+'"'));
  assert.ok(page.includes('/api/finance-headlines'));
  assert.ok(page.includes('type=coin_detail&id=bitcoin'));
  assert.ok(page.includes('type=coin_chart&id=bitcoin'));
  assert.ok(page.includes('assets/kiber-mascot.webp'));
  for(const script of page.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)){
    assert.doesNotThrow(()=>new vm.Script(script[1]));
  }
});
test('finance headlines return one dated real link per category',async()=>{
  const orig=global.fetch;
  global.fetch=async url=>{const q=decodeURIComponent(String(url));const title=q.includes('Wall Street')?'Wall Street e Nasdaq chiudono la seduta':q.includes('bitcoin')?'Bitcoin e Ethereum sul mercato crypto':'BCE annuncia decisione sui tassi';return {ok:true,text:async()=>rss(Date.now()-30000,title)};};
  try{
    const res=fakeResponse();
    await handler({method:'GET'},res);
    assert.equal(res.code,200);
    assert.equal(res.body.items.length,3);
    for(const entry of res.body.items){
      assert.equal(entry.status,'available');
      assert.equal(entry.source,'Fonte test');
      assert.match(entry.url,/^https:\/\//);
    }
  }finally{global.fetch=orig}
});
test('finance headlines do not present yesterday as news from today',async()=>{
  const orig=global.fetch;
  global.fetch=async()=>({ok:true,text:async()=>rss(Date.now()-35*3600000)});
  try{
    const res=fakeResponse();await handler({method:'GET'},res);
    assert.equal(res.code,200);
    for(const entry of res.body.items)assert.equal(entry.status,'unavailable');
  }finally{global.fetch=orig}
});
test('Bustabit scanner is local and does not claim guaranteed prediction',()=>{
  const page=html('bustabit.html');
  assert.match(page,/non permettono di prevedere/);
  assert.ok(page.includes('split(/[\\s;]+/)'));
  assert.doesNotThrow(()=>new vm.Script(page.match(/<script>([\s\S]*?)<\/script>/i)[1]));
});

test('a macro headline cannot be incorrectly reused as the crypto headline',async()=>{
  const orig=global.fetch;
  global.fetch=async()=>({ok:true,text:async()=>rss(Date.now()-30000,'BCE annuncia decisione sui tassi')});
  try{
    const res=fakeResponse();await handler({method:'GET'},res);
    assert.equal(res.body.items.find(x=>x.category==='macro').status,'available');
    assert.equal(res.body.items.find(x=>x.category==='crypto').status,'unavailable');
  }finally{global.fetch=orig}
});
