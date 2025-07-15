// scripts/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBAIuCiOUDLY6ZKDBKS0561SlNgiDDvaak",
  authDomain: "thinkify-2ed59.firebaseapp.com",
  databaseURL: "https://thinkify-2ed59-default-rtdb.firebaseio.com",
  projectId: "thinkify-2ed59",
  storageBucket: "thinkify-2ed59.firebasestorage.app",
  messagingSenderId: "481098565530",
  appId: "481098565530"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };