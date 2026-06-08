
(function(){
  const toggle=document.querySelector('[data-mobile-toggle]');
  const menu=document.querySelector('[data-mobile-menu]');
  if(toggle&&menu){toggle.addEventListener('click',()=>menu.classList.toggle('open'));}
  const slides=[...document.querySelectorAll('.hero-slide')];
  const dots=[...document.querySelectorAll('.hero-dot')];
  if(slides.length){let idx=0;const show=n=>{idx=(n+slides.length)%slides.length;slides.forEach((s,i)=>s.classList.toggle('is-active',i===idx));dots.forEach((d,i)=>d.classList.toggle('is-active',i===idx));};dots.forEach((d,i)=>d.addEventListener('click',()=>show(i)));setInterval(()=>show(idx+1),5200);}
  const filterRoot=document.querySelector('[data-filter-root]');
  if(filterRoot){
    const search=filterRoot.querySelector('[data-filter-search]');
    const year=filterRoot.querySelector('[data-filter-year]');
    const sort=filterRoot.querySelector('[data-filter-sort]');
    const cards=[...filterRoot.querySelectorAll('.movie-card')];
    const apply=()=>{
      const q=(search&&search.value||'').trim().toLowerCase();
      const y=(year&&year.value||'');
      cards.forEach(card=>{const hay=[card.dataset.title,card.dataset.region,card.dataset.type,card.dataset.genre].join(' ').toLowerCase();const ok=(!q||hay.includes(q))&&(!y||String(card.dataset.year)===y);card.classList.toggle('hidden',!ok);});
      if(sort){const grid=filterRoot.querySelector('.movie-grid'); const sorted=cards.slice().sort((a,b)=>{if(sort.value==='score')return Number(b.dataset.score)-Number(a.dataset.score); if(sort.value==='old')return Number(a.dataset.year)-Number(b.dataset.year); return Number(b.dataset.year)-Number(a.dataset.year);}); sorted.forEach(c=>grid.appendChild(c));}
    };
    [search,year,sort].filter(Boolean).forEach(el=>el.addEventListener('input',apply));
  }
})();
