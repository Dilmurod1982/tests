// src/i18n/useT.js
import { useLangStore } from "../store/langStore";
import { pick } from "./strings";

export function useT() {
  const lang = useLangStore((s) => s.lang);
  return (key) => pick(key, lang);
}