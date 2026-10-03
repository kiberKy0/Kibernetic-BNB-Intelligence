(()=>{
  function applyBrand(){
    const mark=document.querySelector('.brand-shell .brand-mark');
    if(mark){mark.src='assets/kiber-logo.svg?v=241-brand';mark.alt='Kiber';mark.style.background='transparent';mark.style.objectFit='contain'}
    const strong=document.querySelector('.brand-copy strong');if(strong)strong.textContent='Kiber';
    const small=document.querySelector('.brand-copy small');if(small)small.textContent='BNB Chain';
    const status=document.querySelector('.brand-live,#v241Status,#v24Status,#v23Status,#v22Status,#v21Status,#v20Status');if(status){status.textContent='';status.hidden=true;status.style.display='none'}
    document.title='Kiber BNB Chain';
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyBrand,{once:true});else applyBrand();
  setTimeout(applyBrand,350);setTimeout(applyBrand,1200);
})();