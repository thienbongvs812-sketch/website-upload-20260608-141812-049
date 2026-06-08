
(function(){
  const root=document.querySelector('[data-search-page]');
  if(!root||!window.MOVIE_SEARCH_DATA)return;
  const params=new URLSearchParams(location.search);
  const input=root.querySelector('input[name="q"]');
  const count=root.querySelector('[data-result-count]');
  const grid=root.querySelector('[data-search-results]');
  const q=params.get('q')||'';
  input.value=q;
  const render=()=>{
    const term=input.value.trim().toLowerCase();
    const rows=window.MOVIE_SEARCH_DATA.filter(m=>!term||[m.title,m.year,m.region,m.type,m.genre,m.tags,m.oneLine].join(' ').toLowerCase().includes(term)).slice(0,160);
    count.textContent=term?`找到 ${rows.length} 条相关结果`:'输入关键词后可检索影片标题、地区、类型、标签和简介';
    grid.innerHTML=rows.map(m=>`<article class="movie-card"><a href="${m.url}" class="poster-link"><img src="${m.image}" alt="${escapeHtml(m.title)}" loading="lazy"><span class="play-mini">播放</span></a><div class="movie-card-body"><div class="card-meta"><span>${escapeHtml(m.year)}</span><span>${escapeHtml(m.region)}</span><span>${escapeHtml(m.type)}</span></div><h3><a href="${m.url}">${escapeHtml(m.title)}</a></h3><p>${escapeHtml(m.oneLine||'')}</p><div class="tag-list"><span>${escapeHtml(m.genre)}</span></div></div></article>`).join('') || '<div class="empty-note">没有找到匹配影片，可换一个关键词。</div>';
  };
  function escapeHtml(s){return String(s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));}
  root.querySelector('form').addEventListener('submit',e=>{e.preventDefault(); const url=new URL(location.href); url.searchParams.set('q',input.value.trim()); history.replaceState(null,'',url); render();});
  input.addEventListener('input',render);
  render();
})();
