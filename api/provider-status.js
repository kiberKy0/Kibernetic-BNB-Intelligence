module.exports=async function handler(req,res){
  if(req.method!=='GET')return res.status(405).json({error:'Method not allowed'});
  res.setHeader('Cache-Control','s-maxage=120, stale-while-revalidate=300');
  const has=k=>!!String(process.env[k]||'').trim();
  return res.status(200).json({
    version:'24.0',
    providers:{
      openai:{connected:has('OPENAI_API_KEY'),role:'Kiber AI'},
      coingecko:{connected:has('COINGECKO_API_KEY'),role:'Market data'},
      etherscan:{connected:has('ETHERSCAN_API_KEY'),role:'Wallet / holder intelligence'},
      nansen:{connected:has('NANSEN_API_KEY'),role:'Smart Money / wallet labels'},
      arkham:{connected:has('ARKHAM_API_KEY'),role:'Entity & fund flow intelligence'},
      lunarcrush:{connected:has('LUNARCRUSH_API_KEY'),role:'Social & narrative intelligence'}
    },
    publicSources:{defillama:true,geckoterminal:true},
    note:'Only connection availability is exposed. API keys are never returned.'
  });
};
