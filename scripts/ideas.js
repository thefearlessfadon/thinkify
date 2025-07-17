import { auth, db, signInWithEmailAndPassword, createUserWithEmailAndPassword } from './auth.js';
import { collection, addDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

document.addEventListener('DOMContentLoaded', () => {
  const shareForm = document.getElementById('share-form');
  const cancelShare = document.getElementById('cancel-share');
  const ideasDiv = document.getElementById('ideas');

  if (shareForm) {
    shareForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('idea-title').value;
      const content = document.getElementById('idea-content').value;
      const category = document.getElementById('idea-category').value;

      if (auth.currentUser) {
        await addDoc(collection(db, 'ideas'), {
          title, content, category, userId: auth.currentUser.uid, votes: 0, createdAt: new Date()
        });
        shareForm.reset();
        shareForm.classList.add('hidden');
        loadIdeas();
      }
    });

    cancelShare.addEventListener('click', () => {
      shareForm.classList.add('hidden');
      shareForm.reset();
    });

    document.querySelector('main').addEventListener('click', (e) => {
      if (e.target.closest('button')?.textContent === 'Fikir Paylaş') {
        shareForm.classList.remove('hidden');
      }
    });
  }

  async function loadIdeas() {
    ideasDiv.innerHTML = '';
    const querySnapshot = await getDocs(collection(db, 'ideas'));
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      const ideaDiv = document.createElement('div');
      ideaDiv.className = 'idea';
      ideaDiv.innerHTML = `
        <h3>${data.title}</h3>
        <p>${data.content}</p>
        <div class="vote-buttons">
          <button class="vote-button" data-id="${doc.id}" data-vote="up"><i class="fas fa-thumbs-up"></i> +1</button>
          <span>${data.votes}</span>
          <button class="vote-button" data-id="${doc.id}" data-vote="down"><i class="fas fa-thumbs-down"></i> -1</button>
        </div>
      `;
      ideasDiv.appendChild(ideaDiv);
    });

    document.querySelectorAll('.vote-button').forEach(button => {
      button.addEventListener('click', async () => {
        if (auth.currentUser) {
          const ideaRef = doc(db, 'ideas', button.dataset.id);
          const vote = button.dataset.vote === 'up' ? 1 : -1;
          await updateDoc(ideaRef, { votes: data.votes + vote });
          loadIdeas();
        }
      });
    });
  }

  loadIdeas();
});