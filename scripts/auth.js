import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const provider = new GoogleAuthProvider();

export async function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then(() => window.location.href = '/')
    .catch(error => { throw error; });
}

export async function register(email, password, username, displayName) {
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
}

export async function googleSignIn() {
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
}

export function logout() {
  auth.signOut().then(() => window.location.href = '/');
}

auth.onAuthStateChanged(user => {
  const authLink = document.getElementById('auth-link');
  if (user) {
    authLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Çıkış';
    authLink.onclick = logout;
  } else {
    authLink.innerHTML = '<i class="fas fa-sign-in-alt"></i> Giriş';
    authLink.href = '/giris';
  }
});