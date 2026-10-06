// src/components/LangSwitch.jsx
import { useLangStore } from "../store/langStore";

export default function LangSwitch() {
  const lang = useLangStore((s) => s.lang);
  const toggle = useLangStore((s) => s.toggle);

  return (
    <button
      onClick={toggle}
      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition"
      title={lang === "lat" ? "Кириллга ўтиш" : "Лотинга ўтиш"}
      aria-label="Til almashtirish"
    >
      <span className={lang === "lat" ? "text-brand-700" : "text-slate-400"}>
        LAT
      </span>
      <span className="text-slate-300">/</span>
      <span className={lang === "cyr" ? "text-brand-700" : "text-slate-400"}>
        КИР
      </span>
    </button>
  );
}
