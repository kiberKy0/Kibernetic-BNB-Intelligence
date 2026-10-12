(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.KiberTokenLoading=factory()})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
function resolveCoin(id,detail,catalog=[]){if(detail?.coin?.id===id)return detail.coin;const row=catalog.find(x=>x.id===id);if(!row)return null;return {...row,id,address:/^0x[a-f0-9]{40}$/i.test(row.address||'')?row.address:'',categories:row.categories||[],dataLimited:true}}
return {resolveCoin};
});
