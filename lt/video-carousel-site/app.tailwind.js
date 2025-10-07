async function loadData(){ const r = await fetch('videos.json'); if(!r.ok) throw new Error('videos.json failed'); return r.json(); }
function ytEmbed(url){
  try{ const u = new URL(url); if(u.hostname.includes('youtu')){
    let id = u.searchParams.get('v'); if(!id && u.hostname==='youtu.be'){ id = u.pathname.slice(1); }
    if(id) return `<iframe class="w-full h-full" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
  }}catch(e){} return '';
}
function videoTag(url){ return `<video class="w-full h-full" controls preload="metadata" src="${url}"></video>`; }

function cardTemplate(it){
  const img = it.profile_image ? `<img src="${it.profile_image}" alt="${it.name}" class="absolute inset-0 w-full h-full object-cover" loading="lazy">` : '';
  return `<article class="group rounded-2xl border border-slate-800 overflow-hidden bg-[#0d1320] shadow-lg hover:shadow-xl transition">
    <div class="relative aspect-video">
      ${img}
      <span class="absolute left-2 top-2 text-[11px] px-2 py-1 rounded-full bg-black/50 border border-slate-700 text-slate-300 backdrop-blur">${it.cluster||''}</span>
      <button class="absolute right-2 bottom-2 px-3 py-2 rounded-full bg-black/50 border border-slate-700 text-slate-200 font-semibold">Play</button>
    </div>
    <div class="flex items-center gap-3 p-3">
      <img class="w-10 h-10 rounded-full border border-slate-700 object-cover" src="${it.profile_image||''}" alt="${it.name}">
      <div>
        <h3 class="font-brand text-[15px] leading-tight">${it.name}</h3>
        <p class="text-slate-400 text-[13px]">${it.title||''}</p>
      </div>
    </div>
  </article>`;
}

function buildFilters(items){
  const unique = Array.from(new Set(items.map(x=>x.cluster).filter(Boolean))).sort();
  const sel = document.getElementById('clusterFilter');
  unique.forEach(c=>{ const o=document.createElement('option'); o.value=c; o.textContent=c; sel.appendChild(o); });
}

function attachHandlers(){
  const grid = document.getElementById('grid');
  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('button'); const card = e.target.closest('article');
    if(btn && card){ openModal(card.dataset); }
  });
  document.querySelectorAll('[data-close]').forEach(el=> el.addEventListener('click', closeModal));
  document.getElementById('search').addEventListener('input', filter);
  document.getElementById('clusterFilter').addEventListener('change', filter);
  document.getElementById('resetBtn').addEventListener('click', ()=>{ document.getElementById('search').value=''; document.getElementById('clusterFilter').value=''; filter(); });
}

function filter(){
  const q = document.getElementById('search').value.trim().toLowerCase();
  const c = document.getElementById('clusterFilter').value;
  const cards = document.querySelectorAll('#grid article');
  cards.forEach(card=>{
    const hay = (card.dataset.name + ' ' + card.dataset.title + ' ' + card.dataset.cluster).toLowerCase();
    const okQ = !q || hay.includes(q);
    const okC = !c || card.dataset.cluster === c;
    card.style.display = (okQ && okC) ? '' : 'none';
  });
}

function openModal(data){
  const modal = document.getElementById('modal');
  const player = document.getElementById('playerContainer');
  const title = document.getElementById('modalTitle');
  const subtitle = document.getElementById('modalSubtitle');
  const avatar = document.getElementById('modalAvatar');
  const ext = document.getElementById('externalLink');

  title.textContent = data.name || '';
  subtitle.textContent = data.title || '';
  avatar.src = data.profile || '';

  let embed = ytEmbed(data.video);
  if(!embed && data.video){ embed = videoTag(data.video); }
  player.innerHTML = embed || '<div class="grid place-items-center h-full text-slate-400">No video provided</div>';

  if(data.external){ ext.classList.remove('hidden'); ext.href = data.external; } else { ext.classList.add('hidden'); ext.removeAttribute('href'); }
  modal.classList.remove('hidden'); modal.setAttribute('aria-hidden','false');
}

function closeModal(){
  const modal = document.getElementById('modal'); const player = document.getElementById('playerContainer');
  player.innerHTML = ''; modal.classList.add('hidden'); modal.setAttribute('aria-hidden','true');
}

(async function init(){
  const items = await loadData();
  buildFilters(items);
  const grid = document.getElementById('grid');
  grid.innerHTML = items.map(it => {
    return cardTemplate(it).replace('<article','<article data-name="'+(it.name||'')+'" data-title="'+(it.title||'')+'" data-cluster="'+(it.cluster||'')+'" data-video="'+(it.video||'')+'" data-profile="'+(it.profile_image||'')+'" data-external="'+(it.external_url||'')+'"');
  }).join('');
  attachHandlers();
})();