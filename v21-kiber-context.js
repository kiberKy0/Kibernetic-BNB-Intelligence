(()=>{
  function clean(s){return String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  async function askWithSector(){
    const sector=window.KIBER_SECTOR_CONTEXT;
    const input=document.getElementById('chatInput');
    const messages=document.getElementById('chatMessages');
    if(!sector||!input||!messages||location.hostname.includes('githack'))return false;
    const question=input.value.trim();
    if(!question)return true;
    input.value='';
    messages.insertAdjacentHTML('beforeend',`<div class="user-msg">${clean(question)}</div>`);
    messages.insertAdjacentHTML('beforeend','<div class="assistant-msg" id="v21KiberThinking">Kiber sta analizzando…</div>');
    messages.scrollTop=messages.scrollHeight;
    try{
      const t=typeof state!=='undefined'?state.selected:null;
      const body={
        message:question,
        sector:{title:sector.title,text:sector.text,metrics:sector.metrics,risks:sector.risks},
        token:t?{baseToken:{symbol:t.symbol,name:t.name},priceUsd:t.priceUsd,priceChange:{h24:t.change24},liquidity:{usd:t.liquidityUsd},volume:{h24:t.volume24hUsd},marketCap:t.marketCap}:null,
        watchlist:typeof state!=='undefined'?state.watch:[],
        news:typeof state!=='undefined'?(state.news||[]).slice(0,8):[]
      };
      const r=await fetch('/api/kiber',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      const d=await r.json();
      if(!r.ok)throw new Error(d.error||'Kiber non disponibile');
      const thinking=document.getElementById('v21KiberThinking');
      if(thinking){thinking.removeAttribute('id');thinking.textContent=d.answer||'Risposta non disponibile.'}
      const mode=document.getElementById('chatMode');
      if(mode)mode.textContent='Kiber AI · OpenAI · contesto '+sector.title;
    }catch(e){
      const thinking=document.getElementById('v21KiberThinking');
      if(thinking){thinking.removeAttribute('id');thinking.textContent='Kiber AI non è ancora configurato sul server. La guida del settore resta disponibile.'}
    }
    messages.scrollTop=messages.scrollHeight;
    return true;
  }
  function bind(){
    const send=document.getElementById('chatSend');
    const input=document.getElementById('chatInput');
    if(send&&!send.dataset.v21SectorAi){
      send.dataset.v21SectorAi='1';
      const base=send.onclick;
      send.onclick=async e=>{if(await askWithSector())return;return typeof base==='function'?base.call(send,e):undefined};
    }
    if(input&&!input.dataset.v21SectorAi){
      input.dataset.v21SectorAi='1';
      const base=input.onkeydown;
      input.onkeydown=async e=>{if(e.key==='Enter'&&window.KIBER_SECTOR_CONTEXT){e.preventDefault();await askWithSector();return}return typeof base==='function'?base.call(input,e):undefined};
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
  setTimeout(bind,800);
})();