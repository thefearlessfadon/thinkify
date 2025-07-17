import { auth, db } from './firebase.js';
import { collection, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const feedDiv = document.getElementById('feed');

async function loadFeed() {
  if (!auth.currentUser) {
    window.location.href = '/giris';
    return;
  }
  feedDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Akış yükleniyor...</p>';
  try {
    const followingSnapshot = await getDocs(collection(db, `kullanicilar/${auth.currentUser.uid}/takipEdilen`));
    if (followingSnapshot.empty) {
      feedDiv.innerHTML = '<p>Takip ettiğiniz kullanıcılardan henüz fikir yok.</p>';
      return;
    }
    const userIds = followingSnapshot.docs.map(doc => doc.data().userId);
    const q = query(collection(db, 'fikirler'), where('olusturanId', 'in', userIds));
    const querySnapshot = await getDocs(q);
    feedDiv.innerHTML = '';
    if (querySnapshot.empty) {
      feedDiv.innerHTML = '<p>Takip ettiğiniz kullanıcılardan henüz fikir yok.</p>';
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
        <p><i class="fas fa-thumbs-up"></i> Oy: <span class="vote-count-${doc.id}">${idea.oySayisi}</span> | <i class="fas fa-comment"></i> Yorum: ${idea.yorumSayisi}</p>
        <div class="vote-buttons">
          <button class="vote-button" onclick="vote('${doc.id}', 1)"><i class="fas fa-thumbs-up"></i> +1</button>
          <button class="vote-button" onclick="vote('${doc.id}', -1)"><i class="fas fa-thumbs-down"></i> -1</button>
        </div>
        <form class="comment-form-${doc.id}">
          <textarea placeholder="Yorumunuzu yazın" required></textarea>
          <button type="submit" class="accent"><i class="fas fa-comment"></i> Yorum Yap</button>
        </form>
      `;
      feedDiv.appendChild(div);
      div.querySelector(`.comment-form-${doc.id}`).addEventListener('submit', async e => {
        e.preventDefault();
        const comment = div.querySelector(`.comment-form-${doc.id} textarea`).value.trim();
        if (await window.addComment(doc.id, comment)) {
          div.querySelector(`.comment-form-${doc.id} textarea`).value = '';
          alert('Yorum başarıyla eklendi!');
          loadFeed();
        }
      });
      div.querySelector(`h3[data-id="${doc.id}"]`).addEventListener('click', () => {
        window.location.href = `/fikir/${doc.id}`;
      });
    });
  } catch (error) {
    console.error('Akış yükleme hatası:', error);
    feedDiv.innerHTML = '<p>Akış yüklenemedi: ' + error.message + '</p>';
  }
}

if (feedDiv) {
  loadFeed();
}

// Global addComment fonksiyonu
window.addComment = async function(ideaId, comment) {
  console.log('Yorum ekleniyor (feed), ideaId:', ideaId, 'comment:', comment);
  if (!auth.currentUser) {
    alert('Yorum yapmak için giriş yapmalısınız!');
    window.location.href = '/giris';
    return;
  }
  try {
    const filteredComment = window.filterContent(comment);
    if (!filteredComment) {
      alert('Yorum boş olamaz!');
      return;
    }
    const userDoc = await getDoc(doc(db, 'kullanicilar', auth.currentUser.uid));
    await addDoc(collection(db, `fikirler/${ideaId}/yorumlar`), {
      yorum: filteredComment,
      kullaniciId: auth.currentUser.uid,
      kullaniciAdi: userDoc.data().kullaniciAdi,
      tarih: new Date()
    });
    await updateDoc(doc(db, 'fikirler', ideaId), { yorumSayisi: increment(1) });
    return true;
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    alert('Yorum ekleme başarısız: ' + error.message);
  }
};