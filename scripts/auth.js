import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Oturum kalıcılığını ayarla
setPersistence(auth, browserSessionPersistence).catch(error => {
  console.error('Oturum kalıcılığı ayarlama hatası:', error);
});

function updateAuthLink(user) {
  const authLink = document.getElementById('auth-link');
  if (!authLink) return;
  if (user) {
    authLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Çıkış';
    authLink.removeAttribute('href');
    authLink.onclick = () => {
      auth.signOut().then(() => {
        window.location.href = '/giris';
      }).catch(error => {
        console.error('Çıkış hatası:', error);
        alert('Çıkış başarısız: ' + error.message);
      });
    };
  } else {
    authLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş';
    authLink.href = '/giris';
    authLink.onclick = null;
  }
}

function toggleTheme() {
  const body = document.body;
  const themeToggle = document.getElementById('theme-toggle');
  if (body.classList.contains('dark-theme')) {
    body.classList.remove('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-moon"></i> Siyah Tema';
    localStorage.setItem('theme', 'light');
  } else {
    body.classList.add('dark-theme');
    themeToggle.innerHTML = '<i class="fas fa-sun"></i> Beyaz Tema';
    localStorage.setItem('theme', 'dark');
  }
}

export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = '/';
  } catch (error) {
    throw error;
  }
}

export async function register(email, password, username, displayName) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await setDoc(doc(db, 'kullanicilar', user.uid), {
      uid: user.uid,
      kullaniciAdi: username,
      gorunenAd: displayName || username,
      bio: '',
      profilResmi: '',
      proUye: false,
      kayitTarihi: new Date()
    });
    window.location.href = '/';
  } catch (error) {
    throw error;
  }
}

export async function resetPassword(email) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw error;
  }
}

export function logout() {
  auth.signOut().then(() => {
    window.location.href = '/giris';
  }).catch(error => {
    console.error('Çıkış hatası:', error);
    alert('Çıkış başarısız: ' + error.message);
  });
}

// Oturum durumu kontrolü
auth.onAuthStateChanged(user => {
  console.log('onAuthStateChanged:', user ? 'Kullanıcı var: ' + user.uid : 'Kullanıcı yok');
  const publicPages = ['/giris', '/login.html'];
  if (!user && !publicPages.includes(window.location.pathname)) {
    console.log('Kullanıcı giriş yapmamış, yönlendiriliyor: /giris');
    window.location.href = '/giris';
  } else {
    updateAuthLink(user);
  }
});

// Tema kontrolü
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM yüklendi, auth-link ve tema kontrol ediliyor');
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-theme');
      themeToggle.innerHTML = '<i class="fas fa-sun"></i> Beyaz Tema';
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i> Siyah Tema';
    }
    themeToggle.addEventListener('click', toggleTheme);
  }
});