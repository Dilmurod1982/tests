// src/store/langStore.js
import { create } from "zustand";
import { toCyrillic } from "../utils/transliterate";

const STORAGE_KEY = "app:lang";

export const useLangStore = create((set) => ({
  lang: localStorage.getItem(STORAGE_KEY) || "lat",

  setLang: (lang) => {
    localStorage.setItem(STORAGE_KEY, lang);
    set({ lang });
  },

  toggle: () => {
    set((state) => {
      const next = state.lang === "lat" ? "cyr" : "lat";
      localStorage.setItem(STORAGE_KEY, next);
      return { lang: next };
    });
  },
}));

export function useTr() {
  const lang = useLangStore((s) => s.lang);
  return (text) => (lang === "cyr" ? toCyrillic(text) : text);
}