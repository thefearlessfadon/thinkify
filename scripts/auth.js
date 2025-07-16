import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, setPersistence, browserSessionPersistence } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const provider = new GoogleAuthProvider();

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
        window.location.href = '/';
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
    throw error;
  }
}

export function logout() {
  auth.signOut().then(() => {
    window.location.href = '/';
  }).catch(error => {
    console.error('Çıkış hatası:', error);
    alert('Çıkış başarısız: ' + error.message);
  });
}

// Oturum durumu değiştiğinde auth-link'i güncelle
auth.onAuthStateChanged(user => {
  console.log('onAuthStateChanged:', user ? 'Kullanıcı var' : 'Kullanıcı yok');
  updateAuthLink(user);
});

// Sayfa yüklendiğinde auth-link'i kontrol et
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM yüklendi, auth-link kontrol ediliyor');
  updateAuthLink(auth.currentUser);
});