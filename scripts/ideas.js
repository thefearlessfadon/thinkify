import { db, auth } from './firebase.js';
import { collection, addDoc, getDocs, query, where, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', async () => {
  const ideasDiv = document.getElementById('ideas');
  const categoryFilter = document.getElementById('category-filter');
  const shareForm = document.getElementById('share-form');

  // Fikirleri yükle
  async function loadIdeas(category = '') {
    if (!ideasDiv) return;
    ideasDiv.innerHTML = '<div class="spinner"></div>';
    try {
      let ideasQuery = query(collection(db, 'fikirler'), orderBy('createdAt', 'desc'));
      if (category) {
        ideasQuery = query(collection(db, 'fikirler'), where('category', '==', category), orderBy('createdAt', 'desc'));
      }
      const querySnapshot = await getDocs(ideasQuery);
      ideasDiv.innerHTML = '';
      if (querySnapshot.empty) {
        ideasDiv.innerHTML = '<p>Henüz fikir bulunmuyor.</p>';
        return;
      }
      querySnapshot.forEach(doc => {
        const idea = doc.data();
        const ideaElement = document.createElement('div');
        ideaElement.className = 'idea';
        ideaElement.innerHTML = `
          <h3>${idea.title}</h3>
          <p>${idea.description}</p>
          <p>Kategori: ${idea.category}</p>
          <p><i class="fas fa-thumbs-up"></i> Oy: ${idea.votes || 0}</p>
          <p><a href="/fikir?id=${doc.id}"><i class="fas fa-comment"></i> Yorum Yap</a></p>
        `;
        ideasDiv.appendChild(ideaElement);
      });
    } catch (error) {
      console.error('Fikirler yüklenemedi:', error);
      ideasDiv.innerHTML = '<p>Fikirler yüklenirken hata oluştu: ' + error.message + '</p>';
    }
  }

  // Kategori filtresi
  if (categoryFilter) {
    categoryFilter.addEventListener('change', (e) => {
      loadIdeas(e.target.value);
    });
  }

  // Fikir paylaş
  if (shareForm) {
    shareForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('title').value;
      const description = document.getElementById('description').value;
      const category = document.getElementById('category').value;
      const shareButton = document.getElementById('share-button');
      shareButton.disabled = true;
      shareButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Paylaşılıyor...';
      try {
        if (!auth.currentUser) {
          alert('Fikir paylaşmak için giriş yapmalısınız!');
          window.location.href = '/giris';
          return;
        }
        await addDoc(collection(db, 'fikirler'), {
          title,
          description,
          category,
          votes: 0,
          olusturanId: auth.currentUser.uid,
          createdAt: new Date()
        });
        alert('Fikir başarıyla paylaşıldı!');
        window.location.href = '/';
      } catch (error) {
        console.error('Fikir paylaşma hatası:', error);
        alert('Fikir paylaşırken hata oluştu: ' + error.message);
      } finally {
        shareButton.disabled = false;
        shareButton.innerHTML = '<i class="fas fa-check"></i> Paylaş';
      }
    });

    const cancelButton = document.getElementById('cancel-button');
    if (cancelButton) {
      cancelButton.addEventListener('click', () => {
        window.location.href = '/';
      });
    }
  }

  // İlk yükleme
  loadIdeas();
});