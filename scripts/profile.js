import { auth, db, storage } from './firebase.js';
import { doc, getDoc, setDoc, collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const usernameInput = document.getElementById('username');
const displayNameInput = document.getElementById('display-name');
const bioInput = document.getElementById('bio-input');
const profileForm = document.getElementById('profile-form');
const userIdeasDiv = document.getElementById('user-ideas');
const profileImage = document.getElementById('profile-image');
const profileImageInput = document.getElementById('profile-image-input');
const uploadImageButton = document.getElementById('upload-image-button');

async function loadProfile(userId) {
  try {
    const userDoc = await getDoc(doc(db, 'kullanicilar', userId));
    if (!userDoc.exists()) {
      alert('Kullanıcı bulunamadı!');
      window.location.href = '/giris';
      return;
    }
    const userData = userDoc.data();
    usernameInput.value = userData.kullaniciAdi;
    displayNameInput.value = userData.gorunenAd || userData.kullaniciAdi;
    bioInput.value = userData.bio || '';
    profileImage.src = userData.profilResmi || 'https://via.placeholder.com/100';
    const q = query(collection(db, 'fikirler'), where('olusturanId', '==', userId));
    const querySnapshot = await getDocs(q);
    userIdeasDiv.innerHTML = querySnapshot.empty ? '<p>Henüz fikriniz yok.</p>' : '';
    querySnapshot.forEach(doc => {
      const idea = doc.data();
      const div = document.createElement('div');
      div.className = 'idea';
      div.innerHTML = `
        <h3><a href="/fikir/${doc.id}">${idea.baslik}</a></h3>
        <p>${idea.aciklama}</p>
        <p>Kategori: ${idea.kategori}</p>
        <p><i class="fas fa-thumbs-up"></i> Oy: ${idea.oySayisi} | <i class="fas fa-comment"></i> Yorum: ${idea.yorumSayisi}</p>
      `;
      userIdeasDiv.appendChild(div);
    });
  } catch (error) {
    console.error('Profil yükleme hatası:', error);
    alert('Profil yüklenemedi: ' + error.message);
  }
}

if (profileForm) {
  profileForm.addEventListener('submit', async e => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('Profil güncellemek için giriş yapmalısınız!');
      window.location.href = '/giris';
      return;
    }
    try {
      const displayName = displayNameInput.value.trim();
      const bio = bioInput.value.trim();
      if (!displayName) {
        alert('Görünen ad boş olamaz!');
        return;
      }
      await setDoc(doc(db, 'kullanicilar', auth.currentUser.uid), {
        gorunenAd: displayName,
        bio: bio
      }, { merge: true });
      alert('Profil güncellendi!');
      loadProfile(auth.currentUser.uid);
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      alert('Profil güncelleme başarısız: ' + error.message);
    }
  });
}

if (uploadImageButton && profileImageInput) {
  uploadImageButton.addEventListener('click', async () => {
    if (!auth.currentUser) {
      alert('Resim yüklemek için giriş yapmalısınız!');
      window.location.href = '/giris';
      return;
    }
    const file = profileImageInput.files[0];
    if (!file) {
      alert('Lütfen bir resim seçin!');
      return;
    }
    try {
      const storageRef = ref(storage, `profile_images/${auth.currentUser.uid}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await setDoc(doc(db, 'kullanicilar', auth.currentUser.uid), {
        profilResmi: downloadURL
      }, { merge: true });
      profileImage.src = downloadURL;
      alert('Profil resmi yüklendi!');
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      alert('Resim yükleme başarısız: ' + error.message);
    }
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