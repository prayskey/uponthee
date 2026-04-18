document.addEventListener('DOMContentLoaded', function () {
  let saved  = [...SAVED_DATA];
  let sortBy = 'saved';
  const AFFORDABLE_THRESHOLD = 25000;

  function fmt(n) { return '₦' + Number(n).toLocaleString('en-NG'); }

  function updateStats() {
    document.getElementById('stat-total').textContent      = saved.length;
    document.getElementById('stat-affordable').textContent = saved.filter(l => l.price <= AFFORDABLE_THRESHOLD).length;
    document.getElementById('stat-premium').textContent    = saved.filter(l => l.price > AFFORDABLE_THRESHOLD).length;
  }

  function getSorted() {
    const data = [...saved];
    if (sortBy === 'price-asc')  data.sort((a,b) => a.price - b.price);
    if (sortBy === 'price-desc') data.sort((a,b) => b.price - a.price);
    if (sortBy === 'saved')      data.sort((a,b) => new Date(b.savedAt) - new Date(a.savedAt));
    return data;
  }

  function stars(r) {
    let s = '';
    for (let i=0; i<5; i++) s += `<svg style="width:11px;height:11px;" fill="${i < Math.round(r) ? '#f59e0b' : '#e5e7eb'}" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;
    return s;
  }

  function render() {
    updateStats();
    const listEl  = document.getElementById('saved-list');
    const emptyEl = document.getElementById('empty-state');

    if (!saved.length) { listEl.innerHTML = ''; emptyEl.classList.remove('hidden'); return; }
    emptyEl.classList.add('hidden');

    listEl.innerHTML = getSorted().map((lodge, i) => `
      <div class="lodge-card relative overflow-hidden rounded-[20px] border border-black/[0.06] bg-white" style="animation-delay:${i*70}ms;" data-id="${lodge.id}">
        <button class="remove-btn" onclick="removeLodge(${lodge.id})" aria-label="Remove from saved">
          <svg style="width:13px;height:13px;color:#ef4444;" fill="currentColor" viewBox="0 0 24 24"><path d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9z"/></svg>
        </button>
        <div class="relative overflow-hidden">
          <img src="${lodge.image}" alt="${lodge.name}" class="card-img h-[200px] w-full object-cover" loading="lazy" />
          <div class="absolute bottom-3 left-3 rounded-lg bg-black/60 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">${fmt(lodge.price)}/yr</div>
        </div>
        <div class="p-4">
          <div class="mb-1 flex items-start justify-between gap-2">
            <h3 class="text-[15px] font-medium leading-snug text-gray-900" style="font-family:'Cormorant Garamond',serif;">${lodge.name}</h3>
            <div class="flex shrink-0 items-center gap-0.5">${stars(lodge.rating)}</div>
          </div>
          <div class="mb-4 flex items-center gap-1">
            <svg class="h-3 w-3 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"/></svg>
            <p class="text-xs text-gray-400">${lodge.location}</p>
          </div>
          <div class="flex gap-2">
            <a href="/select-lodge/${lodge.id}" class="flex-1 rounded-xl bg-[#55142A] py-2 text-center text-xs font-medium text-white transition hover:bg-[#6e1a35]">View lodge</a>
            <a href="/select-lodge/${lodge.id}?book=true" class="flex-1 rounded-xl border border-gray-200 py-2 text-center text-xs font-medium text-[#55142A] transition hover:bg-[#55142A]/5">Book now</a>
          </div>
        </div>
      </div>`).join('');
  }

  window.removeLodge = async function (id) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) { card.style.transition = 'opacity 0.3s,transform 0.3s'; card.style.opacity = '0'; card.style.transform = 'scale(0.95)'; await new Promise(r => setTimeout(r, 300)); }
    saved = saved.filter(l => l.id !== id);
    try { await fetch(`/saved/${id}`, { method:'DELETE', credentials:'same-origin' }); } catch {}
    render();
  };

  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active'); sortBy = btn.dataset.sort; render();
    });
  });

  render();
});
