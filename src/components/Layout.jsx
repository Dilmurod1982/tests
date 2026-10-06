// src/components/Layout.jsx
import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuthStore } from "../store/authStore";
import { useIdleLogout } from "../hooks/useIdleLogout";
import { useT } from "../i18n/useT";
import ProfileModal from "./ProfileModal";
import LangSwitch from "./LangSwitch";
import { LogoutIcon } from "./icons";

export default function Layout() {
  const { user, role } = useAuthStore();
  const isAdmin = role === "admin";
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);
  const t = useT();

  // Пункты меню. key / shortKey — ключи из src/i18n/strings.js
  const navItems = [
    ...(isAdmin
      ? [
          { to: "/users", key: "users", icon: "👥", shortKey: "usersShort" },
          { to: "/subjects", key: "subjects", icon: "📚" },
        ]
      : []),
    { to: "/tests", key: "tests", icon: "📝" },
    {
      to: "/dashboard",
      key: "dashboard",
      icon: "📊",
      shortKey: "dashboardShort",
    },
  ];

  // Авто-выход при бездействии 4 минуты
  useIdleLogout({
    timeout: 4 * 60 * 1000,
    onIdle: () => navigate("/login", { replace: true }),
  });

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 pt-safe">
        <div className="h-full px-3 sm:px-4 md:px-8 flex items-center justify-between gap-2">
          {/* Лого */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30 text-sm sm:text-base">
              T
            </div>
            <span className="font-bold text-base sm:text-lg text-slate-900 hidden sm:inline truncate">
              TestApp
            </span>
          </div>

          {/* Правая часть */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
            {/* Переключатель LAT / КИР */}
            <LangSwitch />

            {/* Email + роль (только на sm+) */}
            <div className="hidden sm:flex flex-col items-end leading-tight max-w-[180px]">
              <span className="text-sm font-medium text-slate-700 truncate">
                {user?.email}
              </span>
              <span className="text-xs font-semibold text-brand-600">
                {isAdmin ? t("admin") : t("user")}
              </span>
            </div>

            {/* Аватар — клик открывает профиль */}
            <button
              onClick={() => setProfileOpen(true)}
              className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm hover:bg-brand-200 active:scale-95 transition"
              aria-label={t("profile")}
              title={t("profile")}
            >
              {user?.email?.[0]?.toUpperCase() || "?"}
            </button>

            {/* Выход */}
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition flex-shrink-0 flex items-center gap-1.5"
              aria-label={t("logout")}
              title={t("logout")}
            >
              <LogoutIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t("logout")}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* ─── Sidebar (md+) ─── */}
        <aside className="w-60 hidden md:flex flex-col gap-1 p-4 bg-white border-r border-slate-200">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive
                    ? "bg-brand-50 text-brand-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <span className="text-base">{item.icon}</span>
              {t(item.key)}
            </NavLink>
          ))}
        </aside>

        {/* ─── Bottom nav (mobile) ─── */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 flex pb-safe">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                  isActive ? "text-brand-600" : "text-slate-500"
                }`
              }
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <span className="truncate max-w-full px-1">
                {t(item.shortKey || item.key)}
              </span>
            </NavLink>
          ))}
        </nav>

        {/* ─── Контент ─── */}
        <main className="flex-1 px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>

      {/* ─── Модалка профиля ─── */}
      <ProfileModal open={profileOpen} onClose={() => setProfileOpen(false)} />
    </div>
  );
}
