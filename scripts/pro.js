import { auth } from './firebase.js';

auth.onAuthStateChanged(user => {
  const authLink = document.getElementById('auth-link');
  if (user) {
    authLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Çıkış';
    authLink.onclick = () => import('./auth.js').then(module => module.logout());
  } else {
    authLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş';
    authLink.href = '/giris';
  }
});

// Tema toggle
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i> Beyaz Tema';
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i> Siyah Tema';
    }
    themeToggle.addEventListener('click', () => import('./auth.js').then(module => module.toggleTheme()));
  }
});