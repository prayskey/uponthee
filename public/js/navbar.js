(function () {
  'use strict';

  // ── DOM refs ──────────────────────────────────────────────
  const menuToggle    = document.getElementById('menu-toggle');
  const menuCloseBtn  = document.getElementById('menu-close-btn');
  const mobileMenu    = document.getElementById('mobile-menu');
  const menuOverlay   = document.getElementById('menu-overlay');
  const profileToggle = document.getElementById('profile-toggle');
  const profileDrop   = document.getElementById('profile-dropdown');
  const chevron       = document.getElementById('dropdown-chevron');

  // ── State ─────────────────────────────────────────────────
  let menuOpen    = false;
  let dropOpen    = false;

  // ── Mobile menu ───────────────────────────────────────────
  function openMenu() {
    menuOpen = true;
    mobileMenu.classList.add('open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    menuOverlay.classList.add('open');
    menuToggle.classList.add('menu-is-open');
    document.body.style.overflow = 'hidden';
  }

  function closeMenu() {
    menuOpen = false;
    mobileMenu.classList.remove('open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    menuOverlay.classList.remove('open');
    menuToggle.classList.remove('menu-is-open');
    document.body.style.overflow = '';
  }

  menuToggle.addEventListener('click', () => menuOpen ? closeMenu() : openMenu());
  menuCloseBtn.addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', closeMenu);

  // ── Profile dropdown ──────────────────────────────────────
  function openDrop() {
    dropOpen = true;
    profileDrop.classList.add('open');
    profileDrop.classList.remove('hidden');
    chevron.style.transform = 'rotate(180deg)';
    profileToggle.setAttribute('aria-expanded', 'true');
  }

  function closeDrop() {
    dropOpen = false;
    profileDrop.classList.remove('open');
    chevron.style.transform = 'rotate(0deg)';
    profileToggle.setAttribute('aria-expanded', 'false');
    // wait for transition before hiding
    setTimeout(() => {
      if (!dropOpen) profileDrop.classList.add('hidden');
    }, 180);
  }

  profileToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropOpen ? closeDrop() : openDrop();
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (dropOpen && !profileDrop.contains(e.target) && !profileToggle.contains(e.target)) {
      closeDrop();
    }
  });

  // Close dropdown on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (dropOpen) closeDrop();
      if (menuOpen) closeMenu();
    }
  });

  // Close menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768 && menuOpen) closeMenu();
  });

  // ── Active nav link highlight ─────────────────────────────
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.style.color = '#ffffff';
      link.style.opacity = '1';
    }
  });

})();
