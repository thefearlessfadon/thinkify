import { auth, db, storage } from './firebase.js';
import { collection, addDoc, getDocs, doc, getDoc, setDoc, updateDoc, increment, query, where } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { ref as storageRef, uploadBytes as storageUploadBytes, getDownloadURL as storageGetDownloadURL } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const ideasDiv = document.getElementById('ideas');
const categoryFilter = document.getElementById('category-filter');
const shareForm = document.getElementById('share-form');
const shareButton = document.getElementById('share-button');
const cancelButton = document.getElementById('cancel-button');
const loadingSpinner = document.getElementById('loading-spinner');
const ideaTitle = document.getElementById('idea-title');
const ideaDescription = document.getElementById('idea-description');
const ideaCategory = document.getElementById('idea-category');
const ideaVotes = document.getElementById('idea-votes');
const ideaCommentsCount = document.getElementById('idea-comments-count');
const ideaImage = document.getElementById('idea-image');
const upvoteBtn = document.getElementById('upvote');
const downvoteBtn = document.getElementById('downvote');
const commentsDiv = document.getElementById('comments');
const commentForm = document.getElementById('comment-form');
const commentInput = document.getElementById('comment-input');

// Uygunsuz kelime filtresi
const badWords = ['kötü', 'sapık', '18+', 'adult', 'uygunsuz'];
function filterContent(content) {
  if (!content) return content;
  const lowerContent = content.toLowerCase();
  for (const word of badWords) {
    if (lowerContent.includes(word)) {
      throw new Error('Uygunsuz içerik tespit edildi!');
    }
  }
  return content;
}

async function vote(ideaId, value) {
  console.log('Oy verme başlıyor, ideaId:', ideaId, 'value:', value, 'user:', auth.currentUser ? auth.currentUser.uid : 'null');
  if (!auth.currentUser) {
    alert('Oy vermek için giriş yapmalısınız!');
    window.location.href = '/giris';
    return;
  }
  const voteValue = parseInt(value);
  if (![1, -1].includes(voteValue)) {
    console.error('Geçersiz oy değeri:', value);
    alert('Geçersiz oy değeri!');
    return;
  }
  try {
    const voteRef = doc(db, `fikirler/${ideaId}/oylar`, auth.currentUser.uid);
    const ideaRef = doc(db, 'fikirler', ideaId);
    console.log('Oy kaydediliyor, voteRef:', voteRef.path);
    await setDoc(voteRef, { kullaniciId: auth.currentUser.uid, deger: voteValue });
    console.log('Oy kaydedildi, toplam oyları güncelliyor');
    const votesSnapshot = await getDocs(collection(db, `fikirler/${ideaId}/oylar`));
    let totalVotes = 0;
    votesSnapshot.forEach(voteDoc => totalVotes += voteDoc.data().deger);
    console.log('Toplam oylar:', totalVotes);
    await updateDoc(ideaRef, { oySayisi: totalVotes });
    return totalVotes;
  } catch (error) {
    console.error('Oy verme hatası:', error);
    alert('Oy verme başarısız: ' + error.message);
  }
}

async function likeComment(ideaId, commentId) {
  console.log('Yorum beğenme başlıyor, ideaId:', ideaId, 'commentId:', commentId, 'user:', auth.currentUser ? auth.currentUser.uid : 'null');
  if (!auth.currentUser) {
    alert('Yorum beğenmek için giriş yapmalısınız!');
    window.location.href = '/giris';
    return;
  }
  try {
    const likeRef = doc(db, `fikirler/${ideaId}/yorumlar/${commentId}/begeniler`, auth.currentUser.uid);
    const commentRef = doc(db, `fikirler/${ideaId}/yorumlar`, commentId);
    console.log('Beğeni kaydediliyor, likeRef:', likeRef.path);
    await setDoc(likeRef, { kullaniciId: auth.currentUser.uid, deger: 1 });
    console.log('Beğeni kaydedildi, beğeni sayısı güncelleniyor');
    const likesSnapshot = await getDocs(collection(db, `fikirler/${ideaId}/yorumlar/${commentId}/begeniler`));
    const totalLikes = likesSnapshot.size;
    console.log('Toplam beğeni:', totalLikes);
    await updateDoc(commentRef, { begeniSayisi: totalLikes });
    return totalLikes;
  } catch (error) {
    console.error('Yorum beğenme hatası:', error);
    alert('Yorum beğenme başarısız: ' + error.message);
  }
}

async function addComment(ideaId, comment) {
  console.log('Yorum ekleniyor, ideaId:', ideaId, 'comment:', comment);
  if (!auth.currentUser) {
    alert('Yorum yapmak için giriş yapmalısınız!');
    window.location.href = '/giris';
    return;
  }
  try {
    const filteredComment = filterContent(comment);
    if (!filteredComment) {
      alert('Yorum boş olamaz!');
      return;
    }
    const userDoc = await getDoc(doc(db, 'kullanicilar', auth.currentUser.uid));
    console.log('Kullanıcı verisi alındı:', userDoc.exists() ? userDoc.data() : 'Bulunamadı');
    if (!userDoc.exists()) {
      throw new Error('Kullanıcı verisi bulunamadı!');
    }
    const commentDoc = await addDoc(collection(db, `fikirler/${ideaId}/yorumlar`), {
      yorum: filteredComment,
      kullaniciId: auth.currentUser.uid,
      kullaniciAdi: userDoc.data().kullaniciAdi,
      begeniSayisi: 0,
      tarih: new Date()
    });
    console.log('Yorum eklendi, ID:', commentDoc.id, 'yorum sayısı güncelleniyor');
    await updateDoc(doc(db, 'fikirler', ideaId), { yorumSayisi: increment(1) });
    return true;
  } catch (error) {
    console.error('Yorum ekleme hatası:', error);
    alert('Yorum ekleme başarısız: ' + error.message);
  }
}

async function uploadIdeaImage(ideaId, file) {
  if (!file) return null;
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('Resim boyutu 2MB\'dan küçük olmalı!');
  }
  if (!file.type.startsWith('image/')) {
    throw new Error('Sadece resim dosyaları yüklenebilir!');
  }
  try {
    const imageRef = storageRef(storage, `idea_images/${ideaId}`);
    await storageUploadBytes(imageRef, file);
    const url = await storageGetDownloadURL(imageRef);
    console.log('Resim yüklendi, URL:', url);
    return url;
  } catch (error) {
    console.error('Resim yükleme hatası:', error);
    throw error;
  }
}

if (ideasDiv) {
  async function loadIdeas() {
    ideasDiv.innerHTML = '<p><i class="fas fa-spinner fa-spin"></i> Fikirler yükleniyor...</p>';
    try {
      const q = categoryFilter?.value
        ? query(collection(db, 'fikirler'), where('kategori', '==', categoryFilter.value))
        : collection(db, 'fikirler');
      const querySnapshot = await getDocs(q);
      ideasDiv.innerHTML = '';
      if (querySnapshot.empty) {
        ideasDiv.innerHTML = '<p>Henüz fikir bulunmuyor.</p>';
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
        ideasDiv.appendChild(div);
        div.querySelector(`.comment-form-${doc.id}`).addEventListener('submit', async e => {
          e.preventDefault();
          const comment = div.querySelector(`.comment-form-${doc.id} textarea`).value.trim();
          if (await addComment(doc.id, comment)) {
            div.querySelector(`.comment-form-${doc.id} textarea`).value = '';
            alert('Yorum başarıyla eklendi!');
            loadIdeas();
          }
        });
        div.querySelector(`h3[data-id="${doc.id}"]`).addEventListener('click', () => {
          window.location.href = `/fikir/${doc.id}`;
        });
      });
    } catch (error) {
      console.error('Fikir yükleme hatası:', error);
      ideasDiv.innerHTML = '<p>Fikirler yüklenemedi: ' + error.message + '</p>';
    }
  }
  loadIdeas();
  if (categoryFilter) categoryFilter.addEventListener('change', loadIdeas);
}

if (shareForm) {
  shareForm.addEventListener('submit', async e => {
    e.preventDefault();
    console.log('Paylaş formu gönderildi');
    if (!auth.currentUser) {
      alert('Fikir paylaşmak için giriş yapmalısınız!');
      window.location.href = '/giris';
      return;
    }
    shareButton.disabled = true;
    loadingSpinner.classList.remove('hidden');
    try {
      const title = filterContent(document.getElementById('title').value.trim());
      const description = filterContent(document.getElementById('description').value.trim());
      const category = document.getElementById('category').value;
      const imageFile = document.getElementById('idea-image').files[0];
      if (!title || !description || !category) {
        throw new Error('Tüm alanlar doldurulmalı!');
      }
      console.log('Fikir paylaşılıyor:', { title, description, category });
      const userDoc = await getDoc(doc(db, 'kullanicilar', auth.currentUser.uid));
      if (!userDoc.exists()) {
        throw new Error('Kullanıcı verisi bulunamadı!');
      }
      const newIdea = await addDoc(collection(db, 'fikirler'), {
        baslik: title,
        aciklama: description,
        kategori: category,
        olusturanId: auth.currentUser.uid,
        olusturanKullaniciAdi: userDoc.data().kullaniciAdi,
        oySayisi: 0,
        yorumSayisi: 0,
        tarih: new Date(),
        resim: null
      });
      let imageUrl = null;
      if (imageFile) {
        imageUrl = await uploadIdeaImage(newIdea.id, imageFile);
        await updateDoc(doc(db, 'fikirler', newIdea.id), { resim: imageUrl });
      }
      console.log('Fikir paylaşıldı, ID:', newIdea.id, 'Resim:', imageUrl);
      alert('Fikir başarıyla paylaşıldı!');
      window.location.href = '/';
    } catch (error) {
      console.error('Fikir paylaşımı hatası:', error);
      alert('Fikir paylaşımı başarısız: ' + error.message);
    } finally {
      shareButton.disabled = false;
      loadingSpinner.classList.add('hidden');
    }
  });
}

if (cancelButton) {
  cancelButton.addEventListener('click', () => {
    console.log('İptal butonuna tıklandı');
    window.location.href = '/';
  });
}

if (ideaTitle) {
  const ideaId = window.location.pathname.split('/').pop();
  async function loadIdea() {
    try {
      const ideaDoc = await getDoc(doc(db, 'fikirler', ideaId));
      if (!ideaDoc.exists()) {
        alert('Fikir bulunamadı!');
        window.location.href = '/';
        return;
      }
      const idea = ideaDoc.data();
      ideaTitle.textContent = idea.baslik;
      if (idea.resim) {
        ideaImage.src = idea.resim;
        ideaImage.style.display = 'block';
      }
      ideaDescription.textContent = idea.aciklama;
      ideaCategory.textContent = idea.kategori;
      ideaVotes.textContent = idea.oySayisi;
      ideaCommentsCount.textContent = idea.yorumSayisi;
    } catch (error) {
      console.error('Fikir yükleme hatası:', error);
      alert('Fikir yüklenemedi: ' + error.message);
    }
  }
  async function loadComments() {
    try {
      commentsDiv.innerHTML = '';
      const querySnapshot = await getDocs(collection(db, `fikirler/${ideaId}/yorumlar`));
      if (querySnapshot.empty) {
        commentsDiv.innerHTML = '<p>Henüz yorum yok.</p>';
        return;
      }
      querySnapshot.forEach(doc => {
        const comment = doc.data();
        const div = document.createElement('div');
        div.className = 'comment';
        div.innerHTML = `
          <p><strong>${comment.kullaniciAdi}</strong>: ${comment.yorum}</p>
          <p>${new Date(comment.tarih.toDate()).toLocaleString()}</p>
          <p><i class="fas fa-heart"></i> Beğeni: <span class="like-count-${doc.id}">${comment.begeniSayisi || 0}</span></p>
          <button class="vote-button" onclick="likeComment('${ideaId}', '${doc.id}')"><i class="fas fa-heart"></i> Beğen</button>
        `;
        commentsDiv.appendChild(div);
      });
    } catch (error) {
      console.error('Yorum yükleme hatası:', error);
      commentsDiv.innerHTML = '<p>Yorumlar yüklenemedi: ' + error.message + '</p>';
    }
  }
  if (commentForm) {
    commentForm.addEventListener('submit', async e => {
      e.preventDefault();
      const success = await addComment(ideaId, commentInput.value.trim());
      if (success) {
        commentInput.value = '';
        alert('Yorum başarıyla eklendi!');
        loadComments();
        loadIdea();
      }
    });
  }
  if (upvoteBtn && downvoteBtn) {
    upvoteBtn.addEventListener('click', async () => {
      const newVotes = await vote(ideaId, 1);
      if (newVotes !== undefined) {
        ideaVotes.textContent = newVotes;
        alert('Oyunuz kaydedildi!');
      }
    });
    downvoteBtn.addEventListener('click', async () => {
      const newVotes = await vote(ideaId, -1);
      if (newVotes !== undefined) {
        ideaVotes.textContent = newVotes;
        alert('Oyunuz kaydedildi!');
      }
    });
  }
  loadIdea();
  loadComments();
}

// Global fonksiyonlar
window.vote = vote;
window.likeComment = likeComment;