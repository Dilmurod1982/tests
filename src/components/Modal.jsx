// src/components/Modal.jsx
import { useT } from "../i18n/useT";

export default function Modal({ open, onClose, title, children, size = "md" }) {
  const t = useT();
  if (!open) return null;

  const widths = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-lg",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-4xl",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-[fadeIn_.15s_ease-out]"
      onClick={onClose}
    >
      <div
        className={`bg-white w-full ${widths[size]} rounded-t-2xl sm:rounded-2xl shadow-2xl shadow-slate-900/10 max-h-[92vh] sm:max-h-[90vh] overflow-y-auto animate-[slideUp_.2s_ease-out] pb-safe`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 rounded-full bg-slate-200" />
        </div>

        <div className="flex items-center justify-between px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 gap-3">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 break-words">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex-shrink-0 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            aria-label={t("close")}
          >
            ✕
          </button>
        </div>
        <div className="px-4 sm:px-6 pb-5 sm:pb-6">{children}</div>
      </div>
    </div>
  );
}
