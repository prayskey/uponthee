function togglePanel(header) {
  const body = header.nextElementSibling;
  const chev = header.querySelector('.chev');
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chev.classList.toggle('open-chev', !isOpen);
}

function showToast(msg, type) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => { t.className = 'toast'; }, 3500);
}

// Password form
document.getElementById('pw-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const np = document.getElementById('new-pw').value, cp = document.getElementById('confirm-pw').value;
  const err = document.getElementById('pw-mismatch');
  if (np !== cp) { err.classList.remove('hidden'); return; }
  err.classList.add('hidden');
  try {
    const res = await fetch('/settings/update-password', { method:'POST', headers:{'Content-Type':'application/json'}, credentials:'same-origin', body:JSON.stringify({ current_password:this.current_password.value, new_password:np }) });
    showToast(res.ok ? 'Password updated successfully.' : 'Failed to update password.', res.ok ? 'success' : 'error');
    if (res.ok) this.reset();
  } catch { showToast('Something went wrong.', 'error'); }
});

// Delete modal
function confirmDelete() {
  const modal = document.getElementById('delete-modal');
  modal.classList.remove('hidden'); modal.classList.add('flex');
  document.body.style.overflow = 'hidden';
  document.getElementById('delete-confirm-input').value = '';
  const btn = document.getElementById('confirm-delete-btn');
  btn.disabled = true; btn.style.opacity = '0.5';
}

document.getElementById('delete-confirm-input').addEventListener('input', function () {
  const btn = document.getElementById('confirm-delete-btn'), valid = this.value.trim() === 'DELETE';
  btn.disabled = !valid; btn.style.opacity = valid ? '1' : '0.5';
});

async function executeDelete() {
  try {
    const res = await fetch('/settings/delete-account', { method:'POST', credentials:'same-origin' });
    if (res.ok) window.location.href = '/';
    else showToast('Failed to delete account. Please contact support.', 'error');
  } catch { showToast('Something went wrong.', 'error'); }
}

document.getElementById('delete-modal').addEventListener('click', function (e) {
  if (e.target === this) { this.classList.add('hidden'); this.classList.remove('flex'); document.body.style.overflow = ''; }
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { const m = document.getElementById('delete-modal'); m.classList.add('hidden'); m.classList.remove('flex'); document.body.style.overflow = ''; }
});
