// store/authStore.js
import { create } from "zustand";
import { auth, db } from "../firebase/config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export const useAuthStore = create((set) => ({
  user: null,
  role: null,
  loading: true,

  init: () => {
    onAuthStateChanged(auth, async (u) => {
      if (!u) return set({ user: null, role: null, loading: false });

      // dilik@mail.ru — всегда админ
      let role = "user";
      if (u.email === "dilik@mail.ru") {
        role = "admin";
      } else {
        const snap = await getDoc(doc(db, "users", u.uid));
        role = snap.exists() ? snap.data().role : "user";
      }
      set({ user: u, role, loading: false });
    });
  },
}));