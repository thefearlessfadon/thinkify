import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM yüklendi, oturum kalıcılığı ayarlanıyor');
  setPersistence(auth, browserLocalPersistence)
    .then(() => {
      console.log('Oturum kalıcılığı ayarlandı: browserLocalPersistence');
    })
    .catch(error => {
      console.error('Oturum kalıcılığı ayarlama hatası:', error);
      alert('Oturum başlatma hatası: ' + error.message);
    });
});

function updateAuthLinks(user) {
  console.log('updateAuthLinks:', user ? 'Kullanıcı var: ' + user.uid : 'Kullanıcı yok');
  const authLink = document.querySelector('a[href="/giris"], #auth-link');
  const profileLink = document.querySelector('a[href="/profil"]');
  const feedLink = document.querySelector('a[href="/akis"]');
  
  if (user) {
    if (authLink) {
      authLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Çıkış';
      authLink.removeAttribute('href');
      authLink.onclick = () => {
        auth.signOut().then(() => {
          console.log('Kullanıcı çıkış yaptı');
          window.location.href = '/giris';
        }).catch(error => {
          console.error('Çıkış hatası:', error);
          alert('Çıkış başarısız: ' + error.message);
        });
      };
    }
    if (profileLink) profileLink.style.display = 'block';
    if (feedLink) feedLink.style.display = 'block';
  } else {
    if (authLink) {
      authLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş';
      authLink.href = '/giris';
      authLink.onclick = null;
    }
    if (profileLink) profileLink.style.display = 'none';
    if (feedLink) profileLink.style.display = 'none';
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
    console.log('Giriş yapılıyor, email:', email);
    await signInWithEmailAndPassword(auth, email, password);
    console.log('Giriş başarılı, yönlendiriliyor: /');
    window.location.href = '/';
  } catch (error) {
    console.error('Giriş hatası:', error);
    throw error;
  }
}

export async function register(email, password, username, displayName) {
  try {
    console.log('Kayıt olunuyor, email:', email, 'username:', username);
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
    console.log('Kayıt başarılı, kullanıcı ID:', user.uid);
    window.location.href = '/';
  } catch (error) {
    console.error('Kayıt hatası:', error);
    throw error;
  }
}

export async function resetPassword(email) {
  try {
    console.log('Şifre sıfırlama e-postası gönderiliyor, email:', email);
    await sendPasswordResetEmail(auth, email);
    console.log('Şifre sıfırlama e-postası gönderildi');
  } catch (error) {
    console.error('Şifre sıfırlama hatası:', error);
    throw error;
  }
}

export function logout() {
  console.log('Çıkış yapılıyor');
  auth.signOut().then(() => {
    console.log('Çıkış başarılı, yönlendiriliyor: /giris');
    window.location.href = '/giris';
  }).catch(error => {
    console.error('Çıkış hatası:', error);
    alert('Çıkış başarısız: ' + error.message);
  });
}

// Oturum durumu kontrolü
auth.onAuthStateChanged(user => {
  console.log('onAuthStateChanged:', user ? 'Kullanıcı var: ' + user.uid : 'Kullanıcı yok');
  const publicPages = ['/giris', '/login.html', '/kayit', '/sifremi-unuttum'];
  updateAuthLinks(user);
  if (!user && !publicPages.includes(window.location.pathname)) {
    setTimeout(() => {
      if (!auth.currentUser) {
        console.log('Kullanıcı giriş yapmamış, yönlendiriliyor: /giris');
        window.location.href = '/giris';
      } else {
        console.log('Oturum gecikmeli yüklendi, kullanıcı var:', auth.currentUser.uid);
      }
    }, 1000); // 1000ms bekle
  }
});

// Tema kontrolü
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM yüklendi, tema kontrol ediliyor');
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