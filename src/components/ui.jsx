// src/components/ui.jsx
// Button — сделаем паддинг чуть меньше на маленьких экранах
export function Button({ variant = "primary", className = "", ...props }) {
  const styles = {
    primary:
      "bg-brand-500 hover:bg-brand-600 text-white shadow-sm shadow-brand-500/20 disabled:bg-brand-300",
    secondary:
      "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 disabled:opacity-50",
    danger:
      "bg-red-50 hover:bg-red-100 text-red-600 border border-red-100 disabled:opacity-50",
    ghost: "bg-transparent hover:bg-slate-100 text-slate-600",
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium text-sm transition-colors duration-150 disabled:cursor-not-allowed ${styles[variant]} ${className}`}
      {...props}
    />
  );
}

export function Input({ className = "", ...props }) {
  return (
    <input
      className={`w-full px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition ${className}`}
      {...props}
    />
  );
}
// То же для Select и Textarea

export function Select({ className = "", ...props }) {
  return (
    <select
      className={`w-full px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition ${className}`}
      {...props}
    />
  );
}

export function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full px-3 sm:px-4 py-2.5 rounded-lg sm:rounded-xl border border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition ${className}`}
      {...props}
    />
  );
}

export function Label({ className = "", ...props }) {
  return (
    <label
      className={`block text-sm font-medium text-slate-600 mb-1.5 ${className}`}
      {...props}
    />
  );
}

export function Card({ className = "", ...props }) {
  return (
    <div
      className={`bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50 ${className}`}
      {...props}
    />
  );
}

export function Badge({ children, color = "brand" }) {
  const colors = {
    brand: "bg-brand-100 text-brand-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    slate: "bg-slate-100 text-slate-700",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${colors[color]}`}
    >
      {children}
    </span>
  );
}

// src/components/ui.jsx (только PageHeader)
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between mb-6 sm:mb-8">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="text-sm sm:text-base text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex-shrink-0 [&>button]:w-full sm:[&>button]:w-auto">
          {action}
        </div>
      )}
    </div>
  );
}
