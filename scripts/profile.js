import { auth, db } from './auth.js';
import { doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
  const profileForm = document.getElementById('profile-form');
  const usernameInput = document.getElementById('username');
  const displayNameInput = document.getElementById('display-name');
  const bioInput = document.getElementById('bio-input');
  const userIdeasDiv = document.getElementById('user-ideas');

  if (auth.currentUser) {
    const userDoc = await getDoc(doc(db, 'kullanicilar', auth.currentUser.uid));
    if (userDoc.exists()) {
      const userData = userDoc.data();
      usernameInput.value = userData.kullaniciAdi;
      displayNameInput.value = userData.gorunenAd || '';
      bioInput.value = userData.bio || '';
    }

    profileForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await setDoc(doc(db, 'kullanicilar', auth.currentUser.uid), {
        kullaniciAdi: usernameInput.value,
        gorunenAd: displayNameInput.value,
        bio: bioInput.value,
        updatedAt: new Date()
      }, { merge: true });
      alert('Profil güncellendi!');
    });
  }
});