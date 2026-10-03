(()=>{
  const $=id=>document.getElementById(id);
  const q=(s,r=document)=>r.querySelector(s);

  function enforceV23(){
    document.documentElement.dataset.kiberVersion='23';
    document.title='Kiber BNB Intelligence V23';
    const st=$('v23Status')||$('v22Status')||$('v21Status')||$('v20Status');
    if(st){st.id='v23Status';st.textContent='V23 · KIBER BNB INTELLIGENCE · CONTEXT AI'}
    const eye=q('.hero .eyebrow');
    if(eye)eye.textContent='KIBER BNB INTELLIGENCE · V23';
  }

  function fixAiLogo(){
    const img=q('#v23AiIntro .v23-ai-head img');
    const brand=q('.brand-mark');
    if(!img||img.dataset.v23Fixed==='1')return;
    let replacement=img;
    if(brand){
      replacement=brand.cloneNode(true);
      replacement.removeAttribute('id');
      replacement.className='v23-ai-logo';
      replacement.alt='Kiber';
      img.replaceWith(replacement);
    }else{
      img.className='v23-ai-logo';
      replacement=img;
    }
    replacement.dataset.v23Fixed='1';
  }

  async function repairAdvancedChart(){
    const canvas=$('v19ChartCanvas');
    if(!canvas)return;
    try{
      if(typeof V19==='undefined'||typeof v19RenderChart!=='function')return;
      if(!V19.lib){
        canvas.innerHTML='<div class="v19-chart-loading">Caricamento grafico finanziario…</div>';
        const lib=await import('https://cdn.jsdelivr.net/npm/lightweight-charts@5.2.1/+esm');
        V19.lib=lib;
      }
      const shell=$('v19ChartShell');
      if(shell)shell.style.display='';
      const old=$('priceChart');
      if(old)old.style.setProperty('display','none','important');
      if((V19.rows?.length||0)>1){
        v19RenderChart();
      }else if(typeof state!=='undefined'&&Array.isArray(state.history)&&state.history.length>1){
        if(typeof drawHistory==='function')drawHistory(state.history,state.period||'24h');
      }else{
        canvas.innerHTML='<div class="v19-chart-loading">Scegli un token e un periodo per caricare il grafico.</div>';
      }
    }catch(e){
      const shell=$('v19ChartShell');
      if(shell)shell.style.display='none';
      const old=$('priceChart');
      if(old)old.style.setProperty('display','block','important');
      const story=$('chartStory');
      if(story)story.textContent='Grafico avanzato non disponibile: è attivo il grafico base.';
    }
  }

  function watchChart(){
    document.addEventListener('click',e=>{
      if(e.target.closest('.periods button,[data-v19-mode],[data-v19-detail],[data-v19-metric]'))setTimeout(repairAdvancedChart,120);
    },true);
    const observer=new MutationObserver(()=>{
      fixAiLogo();
      const lab=$('labContent');
      if(lab&&!lab.hidden&&typeof state!=='undefined'&&state.history?.length>1)setTimeout(repairAdvancedChart,80);
    });
    observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class']});
  }

  function boot(){
    enforceV23();
    fixAiLogo();
    repairAdvancedChart();
    watchChart();
    setTimeout(enforceV23,650);
    setTimeout(enforceV23,1600);
    setTimeout(fixAiLogo,400);
    setTimeout(repairAdvancedChart,900);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
