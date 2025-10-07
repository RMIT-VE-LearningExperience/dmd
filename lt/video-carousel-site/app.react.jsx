const { useState, useRef, useEffect, useMemo, useCallback } = React;

const DURATION_MS = 6500; // auto-advance duration

function useMouseIdle(timeout=2000){
  const [idle, setIdle] = useState(false);
  useEffect(()=>{
    let timer;
    const onMove = ()=>{
      setIdle(false);
      clearTimeout(timer);
      timer = setTimeout(()=> setIdle(true), timeout);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('keydown', onMove);
    onMove();
    return ()=>{
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('keydown', onMove);
      clearTimeout(timer);
    };
  }, [timeout]);
  return idle;
}

function ProgressBar({ progress }){
  return (
    <div className="h-1 w-full bg-slate-800/70 overflow-hidden">
      <div className="h-full bg-[color:var(--accent)] transition-all" style={{ width: `${Math.min(progress,100)}%` }} />
    </div>
  );
}

function VideoCard({ item, isActive, onPlayClick }){
  return (
    <div className={"relative w-[78vw] sm:w-[420px] shrink-0 select-none transition-transform " + (isActive ? "scale-100" : "scale-[.94] opacity-90")}>
      <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
        {item.profile_image && <img src={item.profile_image} className="absolute inset-0 w-full h-full object-cover" alt={item.name} />}
        <span className="absolute left-3 top-3 text-[11px] px-2 py-1 rounded-full bg-black/50 border border-slate-700 text-slate-300 backdrop-blur">{item.cluster||""}</span>
        <button onClick={()=>onPlayClick(item)} className="absolute right-3 bottom-3 px-3 py-2 rounded-full bg-black/55 border border-slate-700 text-slate-200 font-semibold">Play</button>
      </div>
      <div className="flex items-center gap-3 p-3">
        <img className="w-10 h-10 rounded-full border border-slate-700 object-cover bg-[#0c0f16]" src={item.profile_image||""} alt={item.name} />
        <div>
          <div className="font-brand text-[15px] leading-tight">{item.name}</div>
          <div className="text-slate-400 text-[13px]">{item.title||""}</div>
        </div>
      </div>
    </div>
  );
}

function ModalPlayer({ open, onClose, item }){
  useEffect(()=>{
    function onKey(e){ if(e.key === 'Escape') onClose(); }
    if(open){ window.addEventListener('keydown', onKey); }
    return ()=> window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if(!open) return null;
  const url = item?.video || "";
  let player = null;
  try{
    const u = new URL(url);
    if(u.hostname.includes('youtu')){
      let id = u.searchParams.get('v');
      if(!id && u.hostname==='youtu.be'){ id = u.pathname.slice(1); }
      if(id){
        player = <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${id}`} title="YouTube" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen />;
      }
    }
  }catch(e){}
  if(!player && url){
    player = <video className="w-full h-full" controls preload="metadata" src={url} />;
  }
  if(!player){
    player = <div className="grid place-items-center h-full text-slate-400">No video provided</div>;
  }

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative z-10 max-w-5xl mx-auto my-10 glass rounded-2xl overflow-hidden shadow-2xl">
        <button className="absolute right-3 top-2 text-3xl leading-none text-slate-300 hover:text-white" aria-label="Close" onClick={onClose}>&times;</button>
        <div className="aspect-video bg-black border-b border-slate-800">{player}</div>
        <div className="flex items-center gap-4 p-4">
          <img className="w-12 h-12 rounded-full border border-slate-700 object-cover" src={item?.profile_image||""} alt={item?.name||""} />
          <div>
            <div className="font-brand text-xl">{item?.name||""}</div>
            <div className="text-slate-400 text-sm">{item?.title||""}</div>
            {item?.external_url ? <a className="inline-block mt-1 text-sky-300 underline" href={item.external_url} target="_blank" rel="noopener">External link</a> : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Carousel({ items }){
  const [idx, setIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const [paused, setPaused] = useState(false);
  const idle = useMouseIdle(1800);
  const trackRef = useRef(null);

  const count = items.length;
  const clamp = (i)=> (i + count) % count;

  const to = useCallback((i)=>{
    setIdx(clamp(i));
    setProgress(0);
  }, [count]);

  const next = useCallback(()=> to(idx+1), [idx, to]);
  const prev = useCallback(()=> to(idx-1), [idx, to]);

  useEffect(()=>{
    const el = trackRef.current;
    if(!el) return;
    const activeCard = el.children[idx];
    if(activeCard){
      const offset = activeCard.offsetLeft - (el.clientWidth - activeCard.clientWidth)/2;
      el.scrollTo({ left: offset, behavior: 'smooth' });
    }
  }, [idx]);

  useEffect(()=>{
    let raf, start;
    function tick(ts){
      if(start == null) start = ts;
      const elapsed = ts - start;
      const p = Math.min(100, (elapsed / DURATION_MS) * 100);
      if(!paused) setProgress(p);
      if(!paused && p >= 100){
        start = ts;
        setProgress(0);
        setIdx((i)=> (i+1) % count);
      }
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return ()=> cancelAnimationFrame(raf);
  }, [paused, count]);

  useEffect(()=>{
    function onKey(e){
      if(e.key === 'ArrowRight') next();
      if(e.key === 'ArrowLeft') prev();
    }
    window.addEventListener('keydown', onKey);
    return ()=> window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  return (
    <div className="relative">
      <ProgressBar progress={progress} />
      <div 
        className="mt-4 flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        ref={trackRef}
        onMouseEnter={()=> setPaused(true)}
        onMouseLeave={()=> setPaused(false)}
      >
        {items.map((it, i)=> (
          <div key={i} className="snap-center">
            <VideoCard item={it} isActive={i===idx} onPlayClick={()=>setPaused(true) || window.dispatchEvent(new CustomEvent('open-modal', { detail: it }))} />
          </div>
        ))}
      </div>

      {/* arrows */}
      <button onClick={prev} className={"absolute left-0 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full border border-slate-700 bg-black/40 hover:bg-black/60 " + (idle ? "opacity-0" : "opacity-100")}>‹</button>
      <button onClick={next} className={"absolute right-0 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full border border-slate-700 bg-black/40 hover:bg-black/60 " + (idle ? "opacity-0" : "opacity-100")}>›</button>

      {/* dots */}
      <div className="flex items-center justify-center gap-1 mt-4">
        {items.map((_, i)=> (
          <button key={i} onClick={()=>to(i)} className={"w-2 h-2 rounded-full " + (i===idx ? "bg-[color:var(--accent)]" : "bg-slate-600")} />
        ))}
      </div>
    </div>
  );
}

function App(){
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [modalItem, setModalItem] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(()=>{
    async function run(){
      const res = await fetch('videos.json');
      const data = await res.json();
      setItems(data);
      setFiltered(data);
      // build clusters
      const uniq = Array.from(new Set(data.map(x=>x.cluster).filter(Boolean))).sort();
      const sel = document.getElementById('clusterFilter');
      uniq.forEach(c => { const o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o); });
      // attach UI filters
      const filterFn = ()=>{
        const q = document.getElementById('search').value.trim().toLowerCase();
        const c = document.getElementById('clusterFilter').value;
        const out = data.filter(it => {
          const hay = (it.name + ' ' + it.title + ' ' + it.cluster).toLowerCase();
          const okQ = !q || hay.includes(q);
          const okC = !c || it.cluster === c;
          return okQ && okC;
        });
        setFiltered(out);
      };
      document.getElementById('search').addEventListener('input', filterFn);
      document.getElementById('clusterFilter').addEventListener('change', filterFn);
      document.getElementById('resetBtn').addEventListener('click', ()=>{
        document.getElementById('search').value='';
        document.getElementById('clusterFilter').value='';
        filterFn();
      });
    }
    run();
  }, []);

  useEffect(()=>{
    function onOpen(e){ setModalItem(e.detail); setOpen(true); }
    window.addEventListener('open-modal', onOpen);
    return ()=> window.removeEventListener('open-modal', onOpen);
  }, []);

  return (
    <div className="space-y-10">
      {filtered.length ? <Carousel items={filtered} /> : <div className="text-slate-400">No items</div>}
      <ModalPlayer open={open} item={modalItem} onClose={()=> setOpen(false)} />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
