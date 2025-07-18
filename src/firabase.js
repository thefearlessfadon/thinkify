import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBAIuCiOUDLY6ZKDBKS0561SlNgiDDvaak",
  authDomain: "thinkify-2ed59.firebaseapp.com",
  databaseURL: "https://thinkify-2ed59-default-rtdb.firebaseio.com",
  projectId: "thinkify-2ed59",
  storageBucket: "thinkify-2ed59.firebasestorage.app",
  messagingSenderId: "481098565530",
  appId: "1:481098565530:web:12d3dfc0ba044c66161c23"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();