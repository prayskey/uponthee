document.addEventListener('DOMContentLoaded', function () {

  let saved  = [...SAVED_DATA];
  let sortBy = 'saved';

  const AFFORDABLE_THRESHOLD = 25000;

  function fmt(n) {
    return '₦' + Number(n).toLocaleString('en-NG');
  }

  function updateStats() {
    document.getElementById('stat-total').textContent      = saved.length;
    document.getElementById('stat-affordable').textContent = saved.filter(l => l.price <= AFFORDABLE_THRESHOLD).length;
    document.getElementById('stat-premium').textContent    = saved.filter(l => l.price > AFFORDABLE_THRESHOLD).length;
  }

  function getSorted() {
    const data = [...saved];
    if (sortBy === 'price-asc')  data.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') data.sort((a, b) => b.price - a.price);
    if (sortBy === 'saved')      data.sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt));
    return data;
  }

  function stars(rating) {
    return '★'.repeat(Math.round(rating)) + '☆'.repeat(5 - Math.round(rating));
  }

  function render() {
    const listEl  = document.getElementById('saved-list');
    const emptyEl = document.getElementById('empty-state');
    updateStats();

    if (!saved.length) {
      listEl.innerHTML    = '';
      emptyEl.style.display = 'block';
      return;
    }

    emptyEl.style.display = 'none';
    listEl.innerHTML = getSorted().map((lodge, i) => `
      <div class="lodge-card" style="animation-delay:${i * 70}ms;" data-id="${lodge.id}">
        <div style="position:relative; overflow:hidden;">
          ${lodge.image
            ? `<img src="${lodge.image}" alt="${lodge.name}" class="lodge-img" />`
            : `<div class="lodge-img" style="display:flex;align-items:center;justify-content:center;">
                <svg style="width:36px;height:36px;color:#d1d5db;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.2"><rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor"/><path stroke-linecap="round" d="m21 15-5-5L5 21"/></svg>
              </div>`
          }
          <div class="price-badge">${fmt(lodge.price)}/yr</div>
          <button class="remove-btn" onclick="removeLodge(${lodge.id})" aria-label="Remove from saved">
            <svg style="width:14px;height:14px;color:#ef4444;" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9z"/>
            </svg>
          </button>
        </div>
        <div style="padding:16px 18px 18px;">
          <div style="display:flex; align-items:flex-start; justify-content:space-between; gap:8px; margin-bottom:6px;">
            <h3 style="font-family:'Cormorant Garamond',serif; font-size:17px; font-weight:500; color:#111827; line-height:1.3;">${lodge.name}</h3>
            <span style="font-size:11px; color:#f59e0b; flex-shrink:0; letter-spacing:-1px;">${stars(lodge.rating)}</span>
          </div>
          <div style="display:flex; align-items:center; gap:4px; margin-bottom:14px;">
            <svg style="width:12px;height:12px;color:#9ca3af;flex-shrink:0;" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0z"/></svg>
            <p style="font-size:12px; color:#9ca3af;">${lodge.location}</p>
          </div>
          <div style="display:flex; gap:8px;">
            <a href="/lodges/${lodge.id}" style="flex:1; display:block; text-align:center; background:#55142A; color:white; padding:9px; border-radius:10px; font-size:12px; font-weight:500; text-decoration:none; transition:background 0.2s;" onmouseover="this.style.background='#6e1a35'" onmouseout="this.style.background='#55142A'">
              View lodge
            </a>
            <a href="/lodges/${lodge.id}?book=true" style="flex:1; display:block; text-align:center; background:white; color:#55142A; padding:9px; border-radius:10px; font-size:12px; font-weight:500; text-decoration:none; border:1px solid #e5e7eb; transition:background 0.15s;" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background='white'">
              Book now
            </a>
          </div>
        </div>
      </div>
    `).join('');
  }

  window.removeLodge = async function (id) {
    const card = document.querySelector(`[data-id="${id}"]`);
    if (card) {
      card.style.transition = 'opacity 0.3s, transform 0.3s';
      card.style.opacity = '0';
      card.style.transform = 'scale(0.95)';
      await new Promise(r => setTimeout(r, 300));
    }
    saved = saved.filter(l => l.id !== id);

    try {
      await fetch(`/saved/${id}`, { method: 'DELETE', credentials: 'same-origin' });
    } catch (err) {
      console.error('Remove failed:', err);
    }

    render();
  };

  // Sort buttons
  document.querySelectorAll('.sort-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      sortBy = btn.dataset.sort;
      render();
    });
  });

  render();
});
