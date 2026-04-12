document.addEventListener('DOMContentLoaded', function () {
  const menuToggle = document.getElementById('menu-toggle');
  const menuCloseBtn = document.getElementById('menu-close-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const menuOverlay = document.getElementById('menu-overlay');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');

  let menuOpen = false;

  function openMenu() {
    mobileMenu.classList.add('open');
    menuOverlay.classList.add('open');
    iconOpen.classList.add('hidden');
    iconClose.classList.remove('hidden');
    menuOpen = true;
  }

  function closeMenu() {
    mobileMenu.classList.remove('open');
    menuOverlay.classList.remove('open');
    iconOpen.classList.remove('hidden');
    iconClose.classList.add('hidden');
    menuOpen = false;
  }

  menuToggle.addEventListener('click', () => {
    menuOpen ? closeMenu() : openMenu();
  });

  menuCloseBtn.addEventListener('click', closeMenu);
  menuOverlay.addEventListener('click', closeMenu);
});

// Profile dropdown
const profileToggle = document.getElementById('profile-toggle');
const profileDropdown = document.getElementById('profile-dropdown');

profileToggle.addEventListener('click', (e) => {
  e.stopPropagation();
  profileDropdown.classList.toggle('hidden');
});

// Close dropdown when clicking outside
document.addEventListener('click', () => {
  profileDropdown.classList.add('hidden');
});
