document.addEventListener('DOMContentLoaded', function () {
  let activeFilter = 'all';
  let searchQuery = '';

  function fmt(n) { return '₦' + Number(n).toLocaleString('en-NG'); }
  function fmtDate(d) { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }

  function iconHTML(type) {
    const map = {
      payment: { cls: 'tx-icon-payment', color: '#16a34a', path: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z' },
      refund: { cls: 'tx-icon-refund', color: '#2563eb', path: 'M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3' },
      pending: { cls: 'tx-icon-pending', color: '#ca8a04', path: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
      failed: { cls: 'tx-icon-failed', color: '#dc2626', path: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
    };
    const ic = map[type] || map.payment;
    return `<div class="${ic.cls} flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
      <svg style="width:20px;height:20px;color:${ic.color};" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="${ic.path}"/></svg>
    </div>`;
  }

  function badgeHTML(status) {
    const map = { success: ['Successful', 'badge-success'], refund: ['Refunded', 'badge-refund'], pending: ['Pending', 'badge-pending'], failed: ['Failed', 'badge-failed'] };
    const [label, cls] = map[status] || ['Unknown', 'badge-pending'];
    return `<span class="${cls} rounded-full px-2.5 py-0.5 text-[11px] font-medium whitespace-nowrap">${label}</span>`;
  }

  function updateStats() {
    const all = HISTORY_DATA;
    document.getElementById('spent').textContent = fmt(all.filter(t => t.status === 'success').reduce((s, t) => s + Number(t.amount), 0));
    document.getElementById('success-count').textContent = all.filter(t => t.status === 'success').length;
    document.getElementById('refund-count').textContent = all.filter(t => t.status === 'refund').length;
    document.getElementById('pending-count').textContent = all.filter(t => t.status === 'pending').length;
  }

  function render() {
    let data = [...HISTORY_DATA];
    if (activeFilter !== 'all') {
      data = data.filter(t => {
        if (activeFilter === 'payment') return t.status === 'success';
        return t.status === activeFilter;
      });
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(t => t.lodge.toLowerCase().includes(q) || t.ref.toLowerCase().includes(q) || t.location.toLowerCase().includes(q));
    }

    updateStats();
    const listEl = document.getElementById('history-list');
    const emptyEl = document.getElementById('empty-state');

    if (!data.length) { listEl.innerHTML = ''; emptyEl.classList.remove('hidden'); return; }
    emptyEl.classList.add('hidden');

    listEl.innerHTML = data.map((t, i) => `
      <div class="tx-row flex items-center gap-4 rounded-2xl border border-black/[0.06] bg-white px-5 py-4 transition hover:shadow-[0_4px_20px_rgba(0,0,0,0.07)]" style="animation-delay:${i * 60}ms;">
        ${iconHTML(t.type)}
        <div class="min-w-0 flex-1">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="truncate text-sm font-medium text-gray-900">${t.lodge}</p>
            <p class="whitespace-nowrap text-[15px] font-medium" style="color:${t.status === 'refund' ? '#2563eb' : t.status === 'failed' ? '#dc2626' : '#111827'};">${t.status === 'refund' ? '+' : ''}${fmt(t.amount)}</p>
          </div>
          <div class="mt-1 flex flex-wrap items-center justify-between gap-2">
            <div class="flex items-center gap-2">
              <p class="text-xs text-gray-400">${t.location} · ${fmtDate(t.date)}</p>
              <p class="font-mono text-[11px] text-gray-300">${t.ref}</p>
            </div>
            ${badgeHTML(t.status)}
          </div>
        </div>
      </div>`).join('');
  }

  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  document.getElementById('tx-search').addEventListener('input', function () {
    searchQuery = this.value.trim();
    render();
  });

  render();
});
