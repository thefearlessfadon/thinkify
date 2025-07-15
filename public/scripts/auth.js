// scripts/auth.js
import { auth } from './firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { db } from './firebase.js';

const provider = new GoogleAuthProvider();

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password)
    .then(() => window.location.href = '/')
    .catch(error => alert('Login failed: ' + error.message));
}

export function register(email, password, username) {
  createUserWithEmailAndPassword(auth, email, password)
    .then(userCredential => {
      const user = userCredential.user;
      return setDoc(doc(db, 'kullanicilar', user.uid), {
        uid: user.uid,
        kullaniciAdi: username,
        bio: '',
        proUye: false,
        kayitTarihi: new Date()
      }).then(() => window.location.href = '/');
    })
    .catch(error => alert('Registration failed: ' + error.message));
}

export function googleSignIn() {
  signInWithPopup(auth, provider)
    .then(result => {
      const user = result.user;
      return setDoc(doc(db, 'kullanicilar', user.uid), {
        uid: user.uid,
        kullaniciAdi: user.displayName || 'User' + user.uid.slice(0, 5),
        bio: '',
        proUye: false,
        kayitTarihi: new Date()
      }, { merge: true }).then(() => window.location.href = '/');
    })
    .catch(error => alert('Google Sign-In failed: ' + error.message));
}

export function logout() {
  auth.signOut().then(() => window.location.href = '/');
}