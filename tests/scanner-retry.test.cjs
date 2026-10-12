const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
function fixture(){
  const nodes=new Map(),requests=[];
  const node=id=>{if(!nodes.has(id))nodes.set(id,{textContent:'',innerHTML:'',dataset:{},disabled:false,hidden:false,classList:{add(){},remove(){}},querySelectorAll(){return[]},remove(){nodes.delete(id)}});return nodes.get(id)};
  const document={getElementById:node,querySelectorAll:()=>[],dispatchEvent(){},body:{classList:{add(){},remove(){}}}};
  const window={KiberTokenLoading:{resolveCoin:()=>null}};
  const context={document,window,Event,AbortSignal,fetch:async url=>{requests.push(url);return{ok:false,status:503,json:async()=>({error:'Feed temporarily unavailable'})}}};
  vm.createContext(context);
  const source=fs.readFileSync(require.resolve('../v27-1.js'),'utf8').replace("document.readyState==='loading'?document.addEventListener('DOMContentLoaded',boot,{once:true}):boot();","window.test={openById,openByAddress,reloadAll,state:S};");
  vm.runInContext(source,context);return{...window.test,requests,node};
}
test('Refresh retries the selected catalog ID after details failed and keeps analysis disabled',async()=>{const f=fixture();await f.openById('missing-asset');assert.equal(f.state.coin,null);assert.equal(f.node('v275TokenAnalyze').disabled,true);await f.reloadAll();assert.equal(f.requests.length,2);assert(f.requests.every(x=>x.includes('id=missing-asset')))});
test('Refresh retries the selected contract after on-chain opening failed',async()=>{const f=fixture(),address='0x'+'a'.repeat(40);await f.openByAddress(address);await f.reloadAll();assert.equal(f.requests.length,2);assert(f.requests.every(x=>x.includes('address='+address)));assert.equal(f.node('v275TokenAnalyze').disabled,true)});
