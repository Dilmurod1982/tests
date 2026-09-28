// firebase/config.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";// ← нужен export

export const firebaseConfig = {
    apiKey: "AIzaSyDUeKJP9rVulqDPs7-tx9uE-deNBzK6DT4",
    authDomain: "tests-d986b.firebaseapp.com",
    projectId: "tests-d986b",
    storageBucket: "tests-d986b.firebasestorage.app",
    messagingSenderId: "955816147063",
    appId: "1:955816147063:web:f7c2450bc2e883a0b32e72"
  };

  const app = initializeApp(firebaseConfig);

export { app };
export const auth = getAuth(app);
export const db = getFirestore(app);