import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const provider = new GoogleAuthProvider();

// Oturum kalıcılığını ayarla
setPersistence(auth, browserLocalPersistence)
  .catch(error => console.error('Oturum kalıcılığı ayarlanamadı:', error));

// Oturum durumunu kontrol et
function updateAuthUI(user) {
  const authLink = document.getElementById('auth-link');
  const spinner = document.getElementById('loading-spinner');
  const main = document.querySelector('main');
  if (!authLink || !spinner || !main) {
    console.error('auth-link, spinner veya main bulunamadı');
    return;
  }

  if (user) {
    authLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Çıkış';
    authLink.href = '#'; // Çıkış için href kaldırmak
    authLink.onclick = (e) => {
      e.preventDefault();
      logout();
    };
  } else {
    authLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş';
    authLink.href = '/giris';
    authLink.onclick = null;
  }
  spinner.classList.add('hidden');
  main.classList.remove('hidden');
}

auth.onAuthStateChanged(user => {
  updateAuthUI(user);
});

// Tüm bağlantılar için yönlendirme
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('a:not(#auth-link)').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href) {
        window.location.href = href;
      }
    });
  });
});

export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = '/';
  } catch (error) {
    console.error('Giriş hatası:', error);
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
    console.error('Kayıt hatası:', error);
    throw error;
  }
}

export async function googleSignIn() {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    await setDoc(doc(db, 'kullanicilar', user.uid), {
      uid: user.uid,
      kullaniciAdi: user.displayName || 'User' + user.uid.slice(0, 5),
      gorunenAd: user.displayName || 'User' + user.uid.slice(0, 5),
      bio: '',
      profilResmi: user.photoURL || '',
      proUye: false,
      kayitTarihi: new Date()
    }, { merge: true });
    window.location.href = '/';
  } catch (error) {
    console.error('Google giriş hatası:', error);
    throw error;
  }
}

export function logout() {
  auth.signOut().then(() => {
    window.location.href = '/';
  }).catch(error => {
    console.error('Çıkış hatası:', error);
  });
}