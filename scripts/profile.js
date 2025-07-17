import { auth, db, storage } from './firebase.js';
import { doc, getDoc, updateDoc, collection, getDocs, query, where, setDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const profileForm = document.getElementById('profile-form');
const profileImage = document.getElementById('profile-image');
const profileImageInput = document.getElementById('profile-image-input');
const uploadImageButton = document.getElementById('upload-image-button');
const usernameInput = document.getElementById('username');
const displayNameInput = document.getElementById('display-name');
const bioInput = document.getElementById('bio-input');
const userIdeasDiv = document.getElementById('user-ideas');
const usernameDiv = document.getElementById('username');
const bioDiv = document.getElementById('bio');
const followButton = document.getElementById('follow-button');
const followingDiv = document.getElementById('following');

async function followUser(userId) {
  if (!auth.currentUser) {
    alert('Takip etmek için giriş yapmalısınız!');
    window.location.href = '/giris';
    return;
  }
  try {
    const followRef = doc(db, `kullanicilar/${auth.currentUser.uid}/takipEdilen`, userId);
    await setDoc(followRef, { userId });
    alert('Kullanıcı takip edildi!');
    return true;
  } catch (error) {
    console.error('Takip etme hatası:', error);
    alert('Takip etme başarısız: ' + error.message);
  }
}

async function unfollowUser(userId) {
  if (!auth.currentUser) {
    alert('Takibi bırakmak için giriş yapmalısınız!');
    window.location.href = '/giris';
    return;
  }
  try {
    const followRef = doc(db, `kullanicilar/${auth.currentUser.uid}/takipEdilen`, userId);
    await deleteDoc(followRef);
    alert('Kullanıcı takibi bırakıldı!');
    return true;
  } catch (error) {
    console.error('Takibi bırakma hatası:', error);
    alert('Takibi bırakma başarısız: ' + error.message);
  }
}

async function checkFollowing(userId) {
  if (!auth.currentUser) return false;
  const followRef = doc(db, `kullanicilar/${auth.currentUser.uid}/takipEdilen`, userId);
  const followDoc = await getDoc(followRef);
  return followDoc.exists();
}

async function loadFollowing() {
  if (!followingDiv) return;
  followingDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Takip edilenler yükleniyor...</p>';
  try {
    const querySnapshot = await getDocs(collection(db, `kullanicilar/${auth.currentUser.uid}/takipEdilen`));
    followingDiv.innerHTML = '';
    if (querySnapshot.empty) {
      followingDiv.innerHTML = '<p>Henüz kimseyi takip etmiyorsunuz.</p>';
      return;
    }
    for (const docSnap of querySnapshot.docs) {
      const followData = docSnap.data();
      const userDoc = await getDoc(doc(db, 'kullanicilar', followData.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `
          <p><strong>${userData.kullaniciAdi}</strong> (${userData.gorunenAd})</p>
          <button class="follow-button" onclick="unfollowUser('${followData.userId}')"><i class="fas fa-user-minus"></i> Takibi Bırak</button>
        `;
        followingDiv.appendChild(div);
      }
    }
  } catch (error) {
    console.error('Takip edilenler yükleme hatası:', error);
    followingDiv.innerHTML = '<p>Takip edilenler yüklenemedi: ' + error.message + '</p>';
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
        throw new Error('Görünen ad boş olamaz!');
      }
      await updateDoc(doc(db, 'kullanicilar', auth.currentUser.uid), {
        gorunenAd: displayName,
        bio: bio
      });
      alert('Profil başarıyla güncellendi!');
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
    if (file.size > 2 * 1024 * 1024) {
      alert('Resim boyutu 2MB'dan küçük olmalı!');
      return;
    }
    if (!file.type.startsWith('image/')) {
      alert('Sadece resim dosyaları yüklenebilir!');
      return;
    }
    try {
      const imageRef = ref(storage, `profile_images/${auth.currentUser.uid}`);
      await uploadBytes(imageRef, file);
      const url = await getDownloadURL(imageRef);
      await updateDoc(doc(db, 'kullanicilar', auth.currentUser.uid), {
        profilResmi: url
      });
      profileImage.src = url;
      alert('Profil resmi başarıyla yüklendi!');
    } catch (error) {
      console.error('Resim yükleme hatası:', error);
      alert('Resim yükleme başarısız: ' + error.message);
    }
  });
}

if (usernameDiv && userIdeasDiv) {
  const userId = window.location.pathname.split('/').pop();
  async function loadUserProfile() {
    try {
      const userDoc = await getDoc(doc(db, 'kullanicilar', userId));
      if (!userDoc.exists()) {
        alert('Kullanıcı bulunamadı!');
        window.location.href = '/';
        return;
      }
      const user = userDoc.data();
      usernameDiv.textContent = user.kullaniciAdi + ' (' + user.gorunenAd + ')';
      bioDiv.textContent = user.bio || 'Bio yok';
      if (followButton) {
        const isFollowing = await checkFollowing(userId);
        followButton.textContent = isFollowing ? 'Takibi Bırak' : 'Takip Et';
        followButton.classList.toggle('following', isFollowing);
        followButton.innerHTML = isFollowing ? '<i class="fas fa-user-minus"></i> Takibi Bırak' : '<i class="fas fa-user-plus"></i> Takip Et';
        followButton.onclick = async () => {
          if (isFollowing) {
            if (await unfollowUser(userId)) {
              followButton.textContent = 'Takip Et';
              followButton.classList.remove('following');
              followButton.innerHTML = '<i class="fas fa-user-plus"></i> Takip Et';
            }
          } else {
            if (await followUser(userId)) {
              followButton.textContent = 'Takibi Bırak';
              followButton.classList.add('following');
              followButton.innerHTML = '<i class="fas fa-user-minus"></i> Takibi Bırak';
            }
          }
        };
      }
      userIdeasDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Fikirler yükleniyor...</p>';
      const querySnapshot = await getDocs(query(collection(db, 'fikirler'), where('olusturanId', '==', userId)));
      userIdeasDiv.innerHTML = '';
      if (querySnapshot.empty) {
        userIdeasDiv.innerHTML = '<p>Henüz fikir yok.</p>';
        return;
      }
      querySnapshot.forEach(doc => {
        const idea = doc.data();
        const div = document.createElement('div');
        div.className = 'idea';
        div.innerHTML = `
          <h3 data-id="${doc.id}">${idea.baslik}</h3>
          ${idea.resim ? `<img src="${idea.resim}" alt="Fikir Resmi">` : ''}
          <p>${idea.aciklama}</p>
          <p>Kategori: ${idea.kategori}</p>
          <p><i class="fas fa-thumbs-up"></i> Oy: ${idea.oySayisi} | <i class="fas fa-comment"></i> Yorum: ${idea.yorumSayisi}</p>
        `;
        userIdeasDiv.appendChild(div);
        div.querySelector(`h3[data-id="${doc.id}"]`).addEventListener('click', () => {
          window.location.href = `/fikir/${doc.id}`;
        });
      });
    } catch (error) {
      console.error('Kullanıcı profili yükleme hatası:', error);
      userIdeasDiv.innerHTML = '<p>Fikirler yüklenemedi: ' + error.message + '</p>';
    }
  }
  loadUserProfile();
}

if (profileImage && usernameInput && userIdeasDiv) {
  async function loadProfile() {
    if (!auth.currentUser) {
      window.location.href = '/giris';
      return;
    }
    try {
      const userDoc = await getDoc(doc(db, 'kullanicilar', auth.currentUser.uid));
      if (!userDoc.exists()) {
        alert('Kullanıcı verisi bulunamadı!');
        window.location.href = '/giris';
        return;
      }
      const user = userDoc.data();
      usernameInput.value = user.kullaniciAdi;
      displayNameInput.value = user.gorunenAd;
      bioInput.value = user.bio || '';
      profileImage.src = user.profilResmi || 'https://via.placeholder.com/100';
      userIdeasDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Fikirler yükleniyor...</p>';
      const querySnapshot = await getDocs(query(collection(db, 'fikirler'), where('olusturanId', '==', auth.currentUser.uid)));
      userIdeasDiv.innerHTML = '';
      if (querySnapshot.empty) {
        userIdeasDiv.innerHTML = '<p>Henüz fikir yok.</p>';
        return;
      }
      querySnapshot.forEach(doc => {
        const idea = doc.data();
        const div = document.createElement('div');
        div.className = 'idea';
        div.innerHTML = `
          <h3 data-id="${doc.id}">${idea.baslik}</h3>
          ${idea.resim ? `<img src="${idea.resim}" alt="Fikir Resmi">` : ''}
          <p>${idea.aciklama}</p>
          <p>Kategori: ${idea.kategori}</p>
          <p><i class="fas fa-thumbs-up"></i> Oy: ${idea.oySayisi} | <i class="fas fa-comment"></i> Yorum: ${idea.yorumSayisi}</p>
        `;
        userIdeasDiv.appendChild(div);
        div.querySelector(`h3[data-id="${doc.id}"]`).addEventListener('click', () => {
          window.location.href = `/fikir/${doc.id}`;
        });
      });
      loadFollowing();
    } catch (error) {
      console.error('Profil yükleme hatası:', error);
      userIdeasDiv.innerHTML = '<p>Fikirler yüklenemedi: ' + error.message + '</p>';
    }
  }
  loadProfile();
}