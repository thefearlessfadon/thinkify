import { auth } from './firebase.js';

auth.onAuthStateChanged(user => {
  const authLink = document.getElementById('auth-link');
  if (user) {
    authLink.textContent = 'Çıkış';
    authLink.onclick = () => import('./auth.js').then(module => module.logout());
  } else {
    authLink.textContent = 'Giriş';
    authLink.href = '/giris';
  }
});