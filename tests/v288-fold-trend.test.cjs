const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const T=require('../sector-trend-utils.js');
const now=Date.parse('2026-11-06T03:00:00Z');
const data={updatedAt:'2026-11-06T02:00:00Z',sampleSize:12,covered:6,sectors:[
 {name:'Dexs',change7d:8,tvl:108,count:2},
 {name:'Lending',change7d:-10,tvl:90,count:2},
 {name:'Yield',change7d:3,tvl:103,count:1},
 {name:'Bridge',change7d:12,tvl:112,count:1}
]};

test('Token 24h direction is transparent and does not confuse zero with missing data',()=>{
 assert.equal(T.periodChange(null).state,'unknown');
 assert.equal(T.periodChange('').state,'unknown');
 assert.equal(T.periodChange(0).state,'flat');
 assert.equal(T.periodChange(-3.52).label,'DOWN');
 assert.equal(T.periodChange(2.12).label,'UP');
 assert.equal(T.periodChange('not available').state,'unknown');
});
test('Strongest sector uses observed 7d BSC TVL and sample, never arbitrary ranking',()=>{
 const top=T.strongest(data,now);
 assert.equal(top.name,'Bridge');assert.equal(top.label,'UP');
 assert.equal(top.value,12);assert.equal(top.sample,6);
 const allDown={...data,sectors:[{name:'Dexs',change7d:-8,tvl:90,count:1},{name:'Lending',change7d:-4,tvl:95,count:1}]};
 assert.equal(T.strongest(allDown,now).label,'DOWN');
 assert.equal(T.strongest(allDown,now).name,'Lending');
});
test('Do not claim current sectors from stale or malformed provider data',()=>{
 assert.equal(T.strongest({...data,updatedAt:'2026-10-01T00:00:00Z'},now),null);
 assert.equal(T.strongest({...data,updatedAt:''},now),null);
 assert.equal(T.strongest({...data,sectors:[]},now),null);
});
test('DeFi matching groups are weighted by initial capital, not average return',()=>{
 const watch={sector:()=>({name:'DeFi',source:'categorie CoinGecko'})};
 const d=T.matchingSector({},data,watch,now);
 const weighted=(108+90+103)/(108/1.08+90/.9+103/1.03)-1;
 assert.equal(d.name,'DeFi');assert.ok(Math.abs(d.value-weighted*100)<1e-7);
 assert.equal(d.count,5);
});
test('Unclassified AI/Meme token cannot inherit another sector trend',()=>{
 const watch={sector:x=>({name:x.sector,source:'test'})};
 assert.equal(T.matchingSector({sector:'Meme'},data,watch,now).state,'unknown');
 assert.equal(T.matchingSector({sector:'AI & Compute'},data,watch,now).state,'unknown');
 assert.equal(T.matchingSector({sector:'DeFi'},{...data,updatedAt:'2025-01-01'},watch,now).state,'unknown');
});
test('UI scripts parse as JavaScript and the Kiber logo button remains accessible',()=>{
 for(const file of ['sector-trend-utils.js','compact-trends.js','kiber-assistant.js','access-guide.js']){
   assert.doesNotThrow(()=>new vm.Script(fs.readFileSync(path.join(root,file),'utf8'),{filename:file}));
 }
 const k=fs.readFileSync(path.join(root,'kiber-assistant.js'),'utf8');
 assert.match(k,/logo\.src='assets\/kiber-logo\.svg'/);
 assert.match(k,/aria-label','Apri assistente Kiber/);
 assert.doesNotMatch(k,/kiber-fab','✦ Kiber'/);
});
test('Fold chevrons retain section titles and never wrap chart code or token buttons',()=>{
 const src=fs.readFileSync(path.join(root,'compact-trends.js'),'utf8');
 assert.match(src,/selector:'#kiberAccessGuide'/);
 assert.match(src,/selector:'\.v269-chart'/);
 assert.match(src,/selector:'#kiberAutoToken'/);
 assert.match(src,/aria-expanded/);
 assert.match(src,/host\.append\(btn\)/);
 const css=fs.readFileSync(path.join(root,'compact-trends.css'),'utf8');
 assert.match(css,/data-kiber-fold-closed/);
 assert.match(css,/\.v269-chart/);
});
test('V28.8 bootstrap mounts the trend helper before the panel script',()=>{
 const src=fs.readFileSync(path.join(root,'index.html'),'utf8');
 assert(src.includes('compact-trends.css'));
 assert(src.indexOf("'sector-trend-utils.js'")<src.indexOf("'compact-trends.js'"));
 assert(src.includes("V='288-20261106-trends'"));
});
