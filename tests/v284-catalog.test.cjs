const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');

function setup(fetchStub){
  const nodes={v21CatalogList:{innerHTML:'',appendChild(){}},marketCount:{textContent:''},v21Meta:{textContent:''}};
  const document={
    getElementById:id=>nodes[id]||null,
    querySelectorAll:()=>[],
    createElement:()=>({className:'',textContent:'',disabled:false,onclick:null})
  };
  const window={};
  const context={document,window,fetch:fetchStub,localStorage:{setItem(){},getItem:()=>null},console};
  vm.createContext(context);
  const original=fs.readFileSync(path.join(__dirname,'../v21-market-v2.js'),'utf8');
  const terminal="if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();";
  assert(original.includes(terminal),'Expected known bootstrap hook');
  vm.runInContext(original.replace(terminal,"window.__testCatalog={state:V21,loadMoreCatalog,resolveAddress,renderCatalog};"),context);
  return {api:window.__testCatalog,nodes};
}

test('Additional ecosystem catalog page merges new IDs and never duplicates an asset',async()=>{
  const calls=[];
  const {api,nodes}=setup(async url=>{
    calls.push(url);
    return {ok:true,json:async()=>({items:Array.from({length:250},(_,i)=>({id:'extra-'+i,name:'Extra '+i,symbol:'EXT',price:1}))})};
  });
  api.state.items=Array.from({length:250},(_,i)=>({id:i===0?'extra-0':'base-'+i,name:'Base '+i,symbol:'BASE',price:1}));
  api.state.visible=250;
  await api.loadMoreCatalog();
  assert.equal(api.state.items.length,499);
  assert.equal(new Set(api.state.items.map(x=>x.id)).size,499);
  assert.equal(api.state.page,2);
  assert.equal(api.state.hasMore,true);
  assert.equal(api.state.visible,310);
  assert.equal(calls.length,1);
  assert.match(calls[0],/\/api\/coingecko\?type=bsc&per_page=250&page=2/);
  assert.match(nodes.v21Meta.textContent,/499/);
});

test('Catalog does not guess BSC contract from an ambiguous ticker symbol',async()=>{
  const calls=[];
  const {api}=setup(async url=>{calls.push(url);return {ok:true,json:async()=>({address:'',onBsc:false})}});
  const addr=await api.resolveAddress({id:'some-coin',symbol:'ETH',address:''});
  assert.equal(addr,'');
  assert.equal(calls.length,1);
  assert.match(calls[0],/type=resolve&id=some-coin/);
  assert.doesNotMatch(calls[0],/type=search/);
});

test('No claim that all watchlisted coins receive continuous server monitoring',()=>{
  const html=fs.readFileSync(path.join(__dirname,'../v20-production.html'),'utf8');
  assert.match(html,/solo una parte delle monete è raccolta dal server/);
  assert.doesNotMatch(html,/vengono controllati dal server H24/);
});
