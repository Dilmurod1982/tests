// src/firebase/adminCreateUser.js
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { db, firebaseConfig } from "./config";   // ← импорт вместо копипасты

export async function adminCreateUser({ email, password, displayName, role }) {
  const appName = `admin-create-${Date.now()}`;
  const secondary = initializeApp(firebaseConfig, appName);
  const secAuth = getAuth(secondary);

  try {
    const cred = await createUserWithEmailAndPassword(secAuth, email, password);
    const uid = cred.user.uid;

    await setDoc(doc(db, "users", uid), {
      email,
      displayName,
      role,
      createdAt: serverTimestamp(),
    });

    await signOut(secAuth);
    return uid;
  } finally {
    await deleteApp(secondary);
  }
}