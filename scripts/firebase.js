import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAIuCiOUDLY6ZKDBKS0561SlNgiDDvaak",
  authDomain: "thinkify-2ed59.firebaseapp.com",
  projectId: "thinkify-2ed59",
  storageBucket: "thinkify-2ed59.firebasestorage.app",
  messagingSenderId: "481098565530",
  appId: "1:481098565530:web:7c6b8a6b5b3e4e9f8c7d2e"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };