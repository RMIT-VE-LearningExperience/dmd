async function loadData(){
  const res = await fetch('videos.json');
  if(!res.ok){ throw new Error('Failed to fetch videos.json'); }
  return await res.json();
}

function ytEmbed(url){
  try{
    const u = new URL(url);
    if(u.hostname.includes('youtu')){
      // supports youtu.be/ID and youtube.com/watch?v=ID
      let id = u.searchParams.get('v');
      if(!id && u.hostname === 'youtu.be'){
        id = u.pathname.slice(1);
      }
      if(id){
        return `<iframe width="100%" height="100%" src="https://www.youtube.com/embed/${id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
      }
    }
  }catch(e){/* ignore */}
  return ""; // not a youtube link
}

function videoTag(url){
  return `<video width="100%" height="100%" controls preload="metadata" src="${url}"></video>`;
}

function cardTemplate(item){
  const img = item.profile_image ? `<img src="${item.profile_image}" alt="${item.name}" loading="lazy">` : `<img src="" alt="No image">`;
  return `<article class="card" data-name="${item.name}" data-title="${item.title}" data-cluster="${item.cluster}" data-video="${item.video}" data-profile="${item.profile_image}" data-external="${item.external_url||''}">
    <div class="thumb">
      ${img}
      <span class="badge">${item.cluster||'—'}</span>
      <button class="play" type="button">Play</button>
    </div>
    <div class="meta">
      <img class="avatar" src="${item.profile_image||''}" alt="${item.name}">
      <div>
        <h3 class="title">${item.name}</h3>
        <p class="role">${item.title||''}</p>
      </div>
    </div>
  </article>`;
}

function buildFilters(items){
  const unique = Array.from(new Set(items.map(x=>x.cluster).filter(Boolean))).sort();
  const sel = document.getElementById('clusterFilter');
  unique.forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  });
}

function attachHandlers(items){
  const grid = document.getElementById('grid');
  grid.addEventListener('click', (e)=>{
    const btn = e.target.closest('.play');
    const card = e.target.closest('.card');
    if(btn && card){
      openModal(card.dataset);
    }
  });

  document.querySelectorAll('[data-close]').forEach(el=>{
    el.addEventListener('click', closeModal);
  });

  document.getElementById('search').addEventListener('input', filter);
  document.getElementById('clusterFilter').addEventListener('change', filter);
  document.getElementById('resetBtn').addEventListener('click', ()=>{
    document.getElementById('search').value='';
    document.getElementById('clusterFilter').value='';
    filter();
  });
}

function filter(){
  const q = document.getElementById('search').value.trim().toLowerCase();
  const c = document.getElementById('clusterFilter').value;
  const cards = document.querySelectorAll('.card');
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
  if(!embed && data.video){
    embed = videoTag(data.video);
  }
  player.innerHTML = embed || '<div style="display:grid;place-items:center;height:100%;color:#94a3b8">No video provided</div>';

  if(data.external){
    ext.classList.remove('hidden');
    ext.href = data.external;
  }else{
    ext.classList.add('hidden');
    ext.removeAttribute('href');
  }

  modal.setAttribute('aria-hidden','false');
}

function closeModal(){
  const modal = document.getElementById('modal');
  const player = document.getElementById('playerContainer');
  player.innerHTML = '';
  modal.setAttribute('aria-hidden','true');
}

(async function init(){
  try{
    const items = await loadData();
    buildFilters(items);
    const grid = document.getElementById('grid');
    grid.innerHTML = items.map(cardTemplate).join('');
    attachHandlers(items);
  }catch(err){
    const grid = document.getElementById('grid');
    grid.innerHTML = `<div style="color:#fca5a5">Error loading data: ${String(err)}</div>`;
  }
})();