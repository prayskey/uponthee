const PER_PAGE = 9;
let currentPage = 1, activeFilter = 'all', searchQuery = '', sortMode = 'default';
const savedIds = new Set(JSON.parse(localStorage.getItem('uponthee_saved') || '[]'));

function fmt(n) { return '₦' + Number(n).toLocaleString('en-NG'); }

function getFiltered() {
  let data = [...ALL_LODGES];
  if (activeFilter === 'available') data = data.filter(l => l.available);
  else if (activeFilter !== 'all')  data = data.filter(l => l.community === activeFilter);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    data = data.filter(l => l.name.toLowerCase().includes(q) || l.community.toLowerCase().includes(q));
  }
  if (sortMode === 'price-asc')  data.sort((a, b) => a.price - b.price);
  if (sortMode === 'price-desc') data.sort((a, b) => b.price - a.price);
  if (sortMode === 'rating')     data.sort((a, b) => b.rating - a.rating);
  return data;
}

function render() {
  const data = getFiltered(), total = data.length;
  const pages = Math.ceil(total / PER_PAGE);
  currentPage = Math.min(currentPage, pages || 1);
  const slice = data.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);
  const gridEl = document.getElementById('lodges-grid');
  const emptyEl = document.getElementById('empty');
  const countEl = document.getElementById('results-count');

  countEl.textContent = total + ' lodge' + (total !== 1 ? 's' : '') + ' found';

  if (!slice.length) {
    gridEl.innerHTML = '';
    emptyEl.classList.remove('hidden');
    document.getElementById('pagination').innerHTML = '';
    return;
  }

  emptyEl.classList.add('hidden');
  gridEl.innerHTML = slice.map((l, i) => `
    <a href="/select-lodge/${l.id}" class="lodge-card relative block overflow-hidden rounded-[18px] border border-black/[0.06] bg-white text-inherit no-underline" style="animation-delay:${i * 60}ms;">
      <button class="save-btn ${savedIds.has(l.id) ? 'saved' : ''}" data-id="${l.id}" onclick="event.preventDefault();toggleSave(this,${l.id})" aria-label="Save">
        <svg style="width:15px;height:15px;" fill="none" stroke="#55142A" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"/>
        </svg>
      </button>
      <div class="img-wrap">
        <img src="${l.image}" alt="${l.name}" class="h-[200px] w-full object-cover" loading="lazy" />
      </div>
      <div class="p-4">
        <div class="mb-1 flex items-start justify-between gap-2">
          <h3 class="text-sm font-medium leading-snug text-gray-900">${l.name}</h3>
          <span class="${l.available ? 'avail-yes' : 'avail-no'} shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium">${l.available ? 'Available' : 'Full'}</span>
        </div>
        <p class="mb-2 text-xs capitalize text-gray-400">${l.community}</p>
        <div class="flex items-center justify-between">
          <span class="text-[15px] font-semibold text-[#55142A]">${fmt(l.price)}<span class="text-[11px] font-normal text-gray-400"> /yr</span></span>
          <div class="flex items-center gap-1">
            <svg class="h-3 w-3 fill-amber-400" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
            <span class="text-xs text-gray-700">${l.rating}</span>
          </div>
        </div>
      </div>
    </a>`).join('');

  // Pagination
  const pagEl = document.getElementById('pagination');
  if (pages <= 1) { pagEl.innerHTML = ''; return; }
  let html = `<button class="page-btn" onclick="goPage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>← Prev</button>`;
  for (let p = 1; p <= pages; p++) {
    html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" onclick="goPage(${p})">${p}</button>`;
  }
  html += `<button class="page-btn" onclick="goPage(${currentPage + 1})" ${currentPage === pages ? 'disabled' : ''}>Next →</button>`;
  pagEl.innerHTML = html;
}

function goPage(p) {
  currentPage = p;
  render();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function toggleSave(btn, id) {
  if (savedIds.has(id)) { savedIds.delete(id); btn.classList.remove('saved'); }
  else { savedIds.add(id); btn.classList.add('saved'); }
  localStorage.setItem('uponthee_saved', JSON.stringify([...savedIds]));
  fetch('/saved/toggle', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    credentials: 'same-origin', body: JSON.stringify({ lodge_id: id }),
  }).catch(() => {});
}

function sortChanged(el) { sortMode = el.value; currentPage = 1; render(); }

document.addEventListener('DOMContentLoaded', function () {
  // Filter pills
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      currentPage = 1;
      render();
    });
  });

  // Search with debounce
  let searchTimer;
  document.getElementById('lodge-search').addEventListener('input', function () {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => { searchQuery = this.value.trim(); currentPage = 1; render(); }, 280);
  });

  // Read community param from URL
  const params = new URLSearchParams(window.location.search);
  const communityParam = params.get('community');
  if (communityParam) {
    activeFilter = communityParam;
    document.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.toggle('active', b.dataset.filter === communityParam);
    });
    const titleEl = document.getElementById('community-title');
    const labelEl = document.getElementById('community-label');
    if (titleEl) titleEl.textContent = communityParam.charAt(0).toUpperCase() + communityParam.slice(1) + ' Lodges';
    if (labelEl) labelEl.textContent = 'Community';
  }

  render();
});
