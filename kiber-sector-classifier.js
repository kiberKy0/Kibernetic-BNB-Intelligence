/* Kibernetic token sectors: prefer provider metadata and verified identities, never infer unknown assets from a shared ticker. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.KiberSector=api})(typeof window==='object'?window:globalThis,()=>{
'use strict';
const sectorMap={
 'binancecoin':['Layer 1','Asset nativo BNB Chain'],'bitcoin':['Layer 1','Blockchain Bitcoin'],'ethereum':['Layer 1','Smart contract'],'solana':['Layer 1','Smart contract'],'tron':['Layer 1','Blockchain TRON'],'the-open-network':['Layer 1','TON'],'avalanche-2':['Layer 1','Avalanche'],'cardano':['Layer 1','Cardano'],'polkadot':['Layer 0 / Interoperabilità','Interoperabilità'],'cosmos':['Layer 0 / Interoperabilità','IBC'],'near':['Layer 1','NEAR'],'sui':['Layer 1','Sui'],'aptos':['Layer 1','Aptos'],'kaspa':['Layer 1','Kaspa'],'litecoin':['Layer 1','Pagamenti'],'ripple':['Pagamenti','XRP Ledger'],'stellar':['Pagamenti','Stellar'],'hedera-hashgraph':['Layer 1','Hedera'],'bitcoin-cash':['Pagamenti','Bitcoin Cash'],
 'matic-network':['Layer 2','Polygon'],'polygon-ecosystem-token':['Layer 2','Polygon'],'arbitrum':['Layer 2','Arbitrum'],'optimism':['Layer 2','Optimism'],'mantle':['Layer 2','Mantle'],'base-protocol':['Infrastructure','Protocollo Base'],
 'tether':['Stablecoin','Dollaro ancorato'],'usd-coin':['Stablecoin','Dollaro ancorato'],'dai':['Stablecoin','Dollaro decentralizzato'],'usds':['Stablecoin','Dollaro decentralizzato'],'first-digital-usd':['Stablecoin','FDUSD'],'ethena-usde':['Stablecoin','Dollaro sintetico Ethena'],'ethena-staked-usde':['Stablecoin','Risparmio su USDe'],'staked-usde':['Stablecoin','Risparmio su USDe'],'frax':['Stablecoin','FRAX'],'true-usd':['Stablecoin','TUSD'],'pax-dollar':['Stablecoin','USDP'],'paypal-usd':['Stablecoin','PYUSD'],'usdd':['Stablecoin','USDD'],'usde':['Stablecoin','Dollaro sintetico Ethena'],'binance-usd':['Stablecoin','BUSD'],
 'uniswap':['DeFi','DEX'],'pancakeswap-token':['DeFi','DEX'],'sushi':['DeFi','DEX'],'curve-dao-token':['DeFi','DEX stablecoin'],'aave':['DeFi','Lending'],'compound-governance-token':['DeFi','Lending'],'maker':['DeFi','Lending / stablecoin'],'lido-dao':['DeFi','Liquid staking'],'rocket-pool':['DeFi','Liquid staking'],'jupiter-exchange-solana':['DeFi','Aggregatore DEX'],'1inch':['DeFi','Aggregatore DEX'],'thorchain':['DeFi','Cross-chain DEX'],'venus':['DeFi','Lending BNB Chain'],'venus-protocol':['DeFi','Lending BNB Chain'],'beefy-finance':['DeFi','Yield optimization'],'pendle':['DeFi','Yield trading'],'ethena':['DeFi','Dollaro sintetico'],'hyperliquid':['DeFi','DEX derivati'],'synthetix-network-token':['DeFi','Derivati'],'gmx':['DeFi','Derivati'],'dydx-chain':['DeFi','Derivati'],'pancakeswap':['DeFi','DEX'],
 'chainlink':['Data & Oracle','Oracle decentralizzato'],'the-graph':['Data & Oracle','Indicizzazione blockchain'],'pyth-network':['Data & Oracle','Oracle prezzi'],'band-protocol':['Data & Oracle','Oracle'],'api3':['Data & Oracle','Oracle'],'tellor':['Data & Oracle','Oracle'],
 'render-token':['AI & Compute','Rendering decentralizzato'],'render':['AI & Compute','Rendering decentralizzato'],'bittensor':['AI & Compute','Intelligenza artificiale'],'fetch-ai':['AI & Compute','Agenti IA'],'artificial-superintelligence-alliance':['AI & Compute','Agenti IA'],'singularitynet':['AI & Compute','Intelligenza artificiale'],'ocean-protocol':['AI & Compute','Dati IA'],'akash-network':['DePIN','Cloud decentralizzato'],'io-net':['DePIN','Compute decentralizzato'],
 'ondo-finance':['RWA','Asset tokenizzati'],'ondo':['RWA','Asset tokenizzati'],'pax-gold':['RWA','Oro tokenizzato'],'tether-gold':['RWA','Oro tokenizzato'],'mantra-dao':['RWA','Tokenizzazione'],'centrifuge':['RWA','Credito tokenizzato'],
 'dogecoin':['Meme','Memecoin'],'shiba-inu':['Meme','Memecoin'],'pepe':['Meme','Memecoin'],'floki':['Meme','Memecoin'],'bonk':['Meme','Memecoin'],'dogwifcoin':['Meme','Memecoin'],'baby-doge-coin':['Meme','Memecoin'],'official-trump':['Meme','Memecoin'],
 'the-sandbox':['Gaming & Metaverse','Metaverso'],'decentraland':['Gaming & Metaverse','Metaverso'],'axie-infinity':['Gaming & Metaverse','Gioco blockchain'],'immutable-x':['Gaming & Metaverse','Gaming Layer 2'],'gala':['Gaming & Metaverse','Ecosistema gaming'],'beam-2':['Gaming & Metaverse','Gaming'],
 'apecoin':['NFT & Social','NFT / cultura'],'blur':['NFT & Social','NFT marketplace'],'ens':['Identity','Nomi decentralizzati'],'ethereum-name-service':['Identity','Nomi decentralizzati'],
 'filecoin':['Storage & DePIN','Archiviazione'],'arweave':['Storage & DePIN','Archiviazione'],'helium':['DePIN','Reti wireless'],'helium-mobile':['DePIN','Reti wireless'],'theta-token':['DePIN','Streaming infrastrutturale']
};
const rules=[
 ['Stablecoin',/\bstablecoins?\b|stablecoin|synthetic dollar|usd-pegged|stablecoin issuer|dollar-backed/i,'Stabilità / dollaro'],
 ['Layer 2',/\blayer[\s-]*2\b|\bl2\b|optimistic rollup|zk.?rollup|rollup ecosystem/i,'Scaling'],
 ['Layer 1',/\blayer[\s-]*1\b|\bl1\b|smart contract platform|proof of stake|proof of work/i,'Blockchain'],
 ['Data & Oracle',/oracle|data availability|indexing protocol|data infrastructure/i,'Dati / Oracle'],
 ['AI & Compute',/artificial intelligence|ai agents?|machine learning|decentralized computing|gpu computing/i,'IA / Compute'],
 ['RWA',/real.world.asset|tokenized asset|tokenized gold|\brwa\b/i,'Asset del mondo reale'],
 ['DePIN',/\bdepin\b|decentralized physical|wireless network|physical infrastructure/i,'Infrastruttura fisica'],
 ['Gaming & Metaverse',/gaming|gamefi|metaverse|blockchain game/i,'Gaming'],
 ['Meme',/\bmeme\b|memecoin|meme coin/i,'Meme'],
 ['Privacy & Cybersecurity',/privacy|zero knowledge privacy|cybersecurity/i,'Privacy'],
 ['NFT & Social',/\bnft\b|socialfi|social token|nft marketplace/i,'NFT / Social'],
 ['DeFi',/\bdefi\b|decentralized finance|dex|decentralized exchange|lending|yield farming|liquid staking|derivatives|perpetuals/i,'Finanza decentralizzata'],
 ['Payments',/payment|remittance|merchant acceptance/i,'Pagamenti'],
 ['Identity',/decentralized identit|domain name/i,'Identità'],
 ['Storage & DePIN',/decentralized storage|file storage/i,'Storage'],
 ['Infrastructure & Interoperability',/bridge|interoperab|cross.chain|modular blockchain|infrastructure|blockchain infrastructure/i,'Infrastruttura']
];
const CACHE='kiber_sector_cache_v1';let cache={};try{cache=JSON.parse(localStorage.getItem(CACHE)||'{}')||{}}catch{}
const cleanId=x=>String(x||'').toLowerCase().trim();
const validSector=x=>typeof x==='string'&&x.trim()&&!/^(?:altro|other|unclassified|non classificato|da verificare|non disponibile|unknown)$/i.test(x.trim());
const normalizedCategories=arr=>Array.isArray(arr)?arr.filter(x=>typeof x==='string'&&x.length<160).slice(0,25):[];
function classify(asset={}){
 const id=cleanId(asset.id||asset.coinId);const cats=normalizedCategories(asset.categories||asset.coin?.categories);
 const special=Object.hasOwn(sectorMap,id)?sectorMap[id]:null;
 // Known coin identity overrides the generic ecosystem label and generic trading categories.
 if(special)return{name:special[0],detail:special[1],source:'Progetto identificato',verified:true};
 const matched=rules.find(([,rx])=>rx.test(cats.join(' · ')));
 if(matched)return{name:matched[0],detail:matched[2],source:'Categorie CoinGecko',verified:true};
 if(validSector(asset.sector))return{name:String(asset.sector),detail:String(asset.subsector||''),source:asset.sectorSource||'Dati del token',verified:true};
 const saved=id&&Object.hasOwn(cache,id)?cache[id]:null;
 if(saved&&Array.isArray(saved.categories)&&saved.categories.length){
  const r=rules.find(([,rx])=>rx.test(saved.categories.join(' · ')));
  if(r)return{name:r[0],detail:r[2],source:'Categorie CoinGecko · cache',verified:true};
 }
 return{name:'Da verificare',detail:'Fonte senza categoria',source:'Categoria non fornita',verified:false};
}
function remember(id,categories){
 const key=cleanId(id),arr=normalizedCategories(categories);
 if(!/^[a-z0-9][a-z0-9-]{0,119}$/.test(key)||!arr.length)return false;
 cache[key]={categories:arr,at:Date.now()};
 const entries=Object.entries(cache).filter(([,v])=>v&&Date.now()-(v.at||0)<30*86400000).slice(-1200);
 cache=Object.fromEntries(entries);
 try{localStorage.setItem(CACHE,JSON.stringify(cache))}catch{}
 return true;
}
const inflight=new Map();let lastFetch=0,fetched=0;
async function enrich(asset){
 const id=cleanId(asset?.id||asset?.coinId);
 if(!id||!/^[a-z0-9][a-z0-9-]{0,119}$/.test(id))return classify(asset);
 if(classify(asset).verified)return classify(asset);
 if(inflight.has(id))return inflight.get(id);
 if(fetched>=12||Date.now()-lastFetch<16000||typeof fetch!=='function'||(typeof document!=='undefined'&&document.hidden))return classify(asset);
 lastFetch=Date.now();fetched++;
 const task=(async()=>{
  try{
   const r=await fetch('/api/coingecko?type=coin_detail&id='+encodeURIComponent(id),{signal:AbortSignal.timeout(10500)});
   if(!r.ok)return classify(asset);
   const d=await r.json();if(d?.coin?.id===id)remember(id,d.coin.categories);
  }catch{}finally{inflight.delete(id)}
  return classify(asset);
 })();
 inflight.set(id,task);
 return task;
}
return{classify,remember,enrich,version:'1.0'};
});
