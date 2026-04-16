document.addEventListener('DOMContentLoaded', function () {

  let activeFilter = 'all';
  let searchQuery = '';

  function fmt(n) {
    return '₦' + Number(n).toLocaleString('en-NG');
  }

  function fmtDate(d) {
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function iconHTML(type) {
    const icons = {
      payment: { bg: 'payment', color: '#16a34a', path: 'M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5z' },
      refund: { bg: 'refund', color: '#2563eb', path: 'M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3' },
      pending: { bg: 'pending', color: '#ca8a04', path: 'M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z' },
      failed: { bg: 'failed', color: '#dc2626', path: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z' },
    };
    const ic = icons[type] || icons.payment;
    return `<div class="tx-icon ${ic.bg}">
      <svg style="width:20px;height:20px;color:${ic.color};" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="${ic.path}"/>
      </svg>
    </div>`;
  }

  function badgeHTML(status) {
    const map = {
      success: ['Successful', 'badge-success'],
      refund: ['Refunded', 'badge-refund'],
      pending: ['Pending', 'badge-pending'],
      failed: ['Failed', 'badge-failed'],
    };
    const [label, cls] = map[status] || ['Unknown', 'badge-pending'];
    return `<span class="badge ${cls}">${label}</span>`;
  }

  function updateStats(data) {
    const all = HISTORY_DATA;
    const spent = all.filter(t => t.status === 'success').reduce((s, t) => s + Number(t.amount), 0);
    document.getElementById('spent').textContent = fmt(spent);
    document.getElementById('success-count').textContent = all.filter(t => t.status === 'success').length;
    document.getElementById('refund-count').textContent = all.filter(t => t.status === 'refund').length;
    document.getElementById('pending-count').textContent = all.filter(t => t.status === 'pending').length;
  }

  function render() {
    let data = [...HISTORY_DATA];

    if (activeFilter !== 'all') {
      data = data.filter(t => {
        if (activeFilter === 'payment') return t.status === 'success';
        if (activeFilter === 'refund') return t.status === 'refund';
        if (activeFilter === 'pending') return t.status === 'pending';
        if (activeFilter === 'failed') return t.status === 'failed';
        return true;
      });
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(t =>
        t.lodge.toLowerCase().includes(q) ||
        t.ref.toLowerCase().includes(q) ||
        t.location.toLowerCase().includes(q)
      );
    }

    updateStats();

    const listEl = document.getElementById('history-list');
    const emptyEl = document.getElementById('empty-state');

    if (!data.length) {
      listEl.innerHTML = '';
      emptyEl.style.display = 'block';
      return;
    }

    emptyEl.style.display = 'none';
    listEl.innerHTML = data.map((t, i) => `
      <div class="tx-row" style="animation-delay:${i * 60}ms;">
        ${iconHTML(t.type)}
        <div style="flex:1; min-width:0;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap;">
            <p style="font-size:14px; font-weight:500; color:#111827; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${t.lodge}</p>
            <p style="font-size:15px; font-weight:500; color:${t.status === 'refund' ? '#2563eb' : t.status === 'failed' ? '#dc2626' : '#111827'}; white-space:nowrap;">
              ${t.status === 'refund' ? '+' : ''}${fmt(t.amount)}
            </p>
          </div>
          <div style="display:flex; align-items:center; justify-content:space-between; gap:12px; margin-top:4px; flex-wrap:wrap;">
            <div style="display:flex; align-items:center; gap:10px;">
              <p style="font-size:12px; color:#9ca3af;">${t.location} · ${fmtDate(t.date)}</p>
              <p style="font-size:11px; color:#d1d5db; font-family:monospace;">${t.ref}</p>
            </div>
            ${badgeHTML(t.status)}
          </div>
        </div>
      </div>
    `).join('');
  }

  // Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.dataset.filter;
      render();
    });
  });

  // Search
  document.getElementById('tx-search').addEventListener('input', function () {
    searchQuery = this.value.trim();
    render();
  });

  render();
});
