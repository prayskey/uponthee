function togglePanel(header) {
  const body = header.nextElementSibling;
  const chev = header.querySelector('.chev');
  const isOpen = body.classList.contains('open');
  body.classList.toggle('open', !isOpen);
  chev.classList.toggle('open-chev', !isOpen);
}

function showToast(msg, type) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.className = 'toast show' + (type ? ' ' + type : '');
  setTimeout(() => { toast.className = 'toast'; }, 3500);
}

// Password form
document.getElementById('pw-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const np  = document.getElementById('new-pw').value;
  const cp  = document.getElementById('confirm-pw').value;
  const err = document.getElementById('pw-mismatch');

  if (np !== cp) { err.style.display = 'block'; return; }
  err.style.display = 'none';

  try {
    const res = await fetch('/settings/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({
        current_password: this.current_password.value,
        new_password: np,
      }),
    });
    if (res.ok) {
      showToast('Password updated successfully.', 'success');
      this.reset();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.message || 'Failed to update password.', 'error');
    }
  } catch {
    showToast('Something went wrong. Please try again.', 'error');
  }
});

// Delete modal
function confirmDelete() {
  const modal = document.getElementById('delete-modal');
  modal.style.display = 'flex';
  document.getElementById('delete-confirm-input').value = '';
  document.getElementById('confirm-delete-btn').disabled = true;
  document.getElementById('confirm-delete-btn').style.opacity = '0.5';
}

document.getElementById('delete-confirm-input').addEventListener('input', function () {
  const btn = document.getElementById('confirm-delete-btn');
  const valid = this.value.trim() === 'DELETE';
  btn.disabled = !valid;
  btn.style.opacity = valid ? '1' : '0.5';
});

async function executeDelete() {
  try {
    const res = await fetch('/settings/delete-account', {
      method: 'POST',
      credentials: 'same-origin',
    });
    if (res.ok) {
      window.location.href = '/';
    } else {
      showToast('Failed to delete account. Please contact support.', 'error');
    }
  } catch {
    showToast('Something went wrong.', 'error');
  }
}

// Close modal on backdrop click
document.getElementById('delete-modal').addEventListener('click', function (e) {
  if (e.target === this) this.style.display = 'none';
});

// Escape key closes modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.getElementById('delete-modal').style.display = 'none';
});
