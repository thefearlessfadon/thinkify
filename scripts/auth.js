import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, setPersistence, browserLocalPersistence, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAIuCiOUDLY6ZKDBKS0561SlNgiDDvaak",
  authDomain: "thinkify-2ed59.firebaseapp.com",
  projectId: "thinkify-2ed59",
  storageBucket: "thinkify-2ed59.firebasestorage.app",
  messagingSenderId: "481098565530",
  appId: "1:481098565530:web:7c6b8a6b5b3e4e9f8c7d2e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM yüklendi, oturum kalıcılığı ayarlanıyor');
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Oturum kalıcılığı ayarlandı: browserLocalPersistence');
    })
    .catch(error => {
      console.error('Oturum kalıcılığı hatası:', error);
    });

  const authLink = document.querySelector('a[href="/giris"], #auth-link');
  const profileLink = document.querySelector('a[href="/profil"]');
  const feedLink = document.querySelector('a[href="/akis"]');
  const shareLink = document.querySelector('a[href="/paylas"]');

  onAuthStateChanged(auth, (user) => {
    console.log('onAuthStateChanged tetiklendi, user:', user ? user.uid : 'yok');
    if (user) {
      if (authLink) {
        authLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Çıkış';
        authLink.href = '#';
        authLink.onclick = () => signOut(auth).then(() => window.location.href = '/giris').catch(error => {
          console.error('Çıkış hatası:', error);
          alert('Çıkış başarısız: ' + error.message);
        });
      }
      if (profileLink) profileLink.style.display = 'block';
      if (feedLink) feedLink.style.display = 'block';
      if (shareLink) shareLink.style.display = 'block';
    } else {
      if (authLink) {
        authLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş';
        authLink.href = '/giris';
        authLink.onclick = null;
      }
      if (profileLink) profileLink.style.display = 'none';
      if (feedLink) feedLink.style.display = 'none';
      if (shareLink) feedLink.style.display = 'none';
    }

    // Yönlendirme kontrolü
    const publicPages = ['/giris', '/login.html', '/kayit', '/sifremi-unuttum'];
    if (!publicPages.includes(window.location.pathname)) {
      setTimeout(() => {
        console.log('Oturum kontrolü, currentUser:', auth.currentUser ? auth.currentUser.uid : 'yok');
        if (!auth.currentUser) {
          console.log('Kullanıcı giriş yapmamış, yönlendiriliyor: /giris');
          window.location.href = '/giris';
        } else {
          console.log('Kullanıcı oturumu doğrulandı, yönlendirme yapılmadı');
        }
      }, 2000); // 2000ms bekle
    }
  });

  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i> Beyaz Tema';
    }
    themeToggle.addEventListener('click', () => {
      document.body.classList.toggle('dark-theme');
      const isDark = document.body.classList.contains('dark-theme');
      themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i> Beyaz Tema' : '<i class="fas fa-moon"></i> Siyah Tema';
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    });
  }
});

export { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword };