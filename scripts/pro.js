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