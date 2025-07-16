import { auth, db } from './firebase.js';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const usernameSpan = document.getElementById('username');
const bioSpan = document.getElementById('bio');
const bioForm = document.getElementById('bio-form');
const userIdeasDiv = document.getElementById('user-ideas');

async function loadProfile(userId) {
  const userDoc = await getDoc(doc(db, 'kullanicilar', userId));
  if (!userDoc.exists()) return (window.location.href = '/giris');
  const userData = userDoc.data();
  usernameSpan.textContent = userData.kullaniciAdi;
  bioSpan.textContent = userData.bio || 'Bio yok';
  const q = query(collection(db, 'fikirler'), where('olusturanId', '==', userId));
  const querySnapshot = await getDocs(q);
  userIdeasDiv.innerHTML = '';
  querySnapshot.forEach(doc => {
    const idea = doc.data();
    const div = document.createElement('div');
    div.className = 'idea';
    div.innerHTML = `
      <h3><a href="/fikir/${doc.id}">${idea.baslik}</a></h3>
      <p>${idea.aciklama}</p>
      <p>Kategori: ${idea.kategori}</p>
      <p>Oy: ${idea.oySayisi} | Yorum: ${idea.yorumSayisi}</p>
    `;
    userIdeasDiv.appendChild(div);
  });
}

if (bioForm) {
  bioForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('Bio güncellemek için giriş yapmalısınız!');
      window.location.href = '/giris';
      return;
    }
    const bio = document.getElementById('bio-input').value;
    await setDoc(doc(db, 'kullanicilar', auth.currentUser.uid), { bio }, { merge: true });
    alert('Bio güncellendi!');
    loadProfile(auth.currentUser.uid);
  });
}

auth.onAuthStateChanged(user => {
  if (user) {
    loadProfile(user.uid);
  } else if (window.location.pathname.includes('/profil/')) {
    const username = window.location.pathname.split('/').pop();
    getDocs(query(collection(db, 'kullanicilar'), where('kullaniciAdi', '==', username)))
      .then(querySnapshot => {
        if (!querySnapshot.empty) {
          loadProfile(querySnapshot.docs[0].id);
        } else {
          window.location.href = '/';
        }
      });
  } else {
    window.location.href = '/giris';
  }
});