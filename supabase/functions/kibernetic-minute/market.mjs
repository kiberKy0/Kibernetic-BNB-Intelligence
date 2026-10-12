export const fixed = [
  {asset:'binancecoin',address:'0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'},
  {asset:'pancakeswap-token',address:'0x0e09fabb73bd3ade0a17ecc321fd13a19e81ce82'},
  {asset:'chainlink',address:'0xf8a0bf9cf54bb92f17374d9e9a321e6a111a51bd'}
];
export function tracked(watched){const result=[...fixed],seen=new Set(result.map(x=>x.address));for(const w of watched||[]){const address=String(w.token_address||'').toLowerCase();if(/^0x[a-f0-9]{40}$/.test(address)&&!seen.has(address)&&result.length<12){seen.add(address);result.push({asset:'address:'+address,address})}}return result}
const number=v=>v!==null&&v!==undefined&&v!==''&&Number.isFinite(Number(v))&&Number(v)>=0?Number(v):null;
export function snapshots(pairs,assets,at){if(!Array.isArray(pairs))throw Error('Invalid provider response');return assets.flatMap(a=>{const p=pairs.filter(p=>p.chainId==='bsc'&&String(p.baseToken?.address||'').toLowerCase()===a.address&&/^0x[a-f0-9]{40}$/i.test(p.pairAddress||'')).sort((a,b)=>(number(b.liquidity?.usd)||0)-(number(a.liquidity?.usd)||0))[0];const price=number(p?.priceUsd);if(!p||!price)return [];return [{asset:a.asset,bucket:new Date(Math.floor(Date.parse(at)/60000)*60000).toISOString(),captured_at:at,pool_address:p.pairAddress.toLowerCase(),price_usd:price,liquidity_usd:number(p.liquidity?.usd),volume_24h_usd:number(p.volume?.h24),buys_24h:number(p.txns?.h24?.buys),sells_24h:number(p.txns?.h24?.sells),source:'DEX Screener · pool principale BSC'}]})}
