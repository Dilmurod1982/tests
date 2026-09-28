// src/components/Layout.jsx
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuthStore } from "../store/authStore";
import { useIdleLogout } from "../hooks/useIdleLogout";

const adminNav = [
  { to: "/users", label: "Фойдаланувчилар", icon: "👥", short: "Юзерлар" },
  { to: "/subjects", label: "Фанлар", icon: "📚", short: "Фанлар" },
  { to: "/tests", label: "Тестлар", icon: "📝", short: "Тестлар" },
  { to: "/dashboard", label: "Статистика", icon: "📊", short: "Стат." },
];

const userNav = [
  { to: "/dashboard", label: "Статистика", icon: "📊", short: "Стат." },
  { to: "/tests", label: "Тестлар", icon: "📝", short: "Тестлар" },
];

export default function Layout() {
  const { user, role } = useAuthStore();
  const isAdmin = role === "admin";
  const navItems = isAdmin ? adminNav : userNav;
  const navigate = useNavigate();

  // Авто-выход через 4 минуты
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
      <header className="sticky top-0 z-30 h-14 sm:h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 pt-safe">
        <div className="h-full px-3 sm:px-4 md:px-8 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30 text-sm sm:text-base">
              T
            </div>
            <span className="font-bold text-base sm:text-lg text-slate-900 hidden sm:inline truncate">
              TestApp
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="hidden sm:flex flex-col items-end leading-tight max-w-[200px]">
              <span className="text-sm font-medium text-slate-700 truncate">
                {user?.email}
              </span>
              <span className="text-xs font-semibold text-brand-600">
                {isAdmin ? "Администратор" : "Фойдаланувчи"}
              </span>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
              {user?.email?.[0]?.toUpperCase() || "?"}
            </div>
            <button
              onClick={handleLogout}
              className="text-xs sm:text-sm px-2 sm:px-3 py-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition flex-shrink-0"
            >
              <span className="hidden sm:inline">Чиқиш</span>
              <span className="sm:hidden" aria-hidden>
                ⏻
              </span>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* Sidebar — md+ */}
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
              {item.label}
            </NavLink>
          ))}
        </aside>

        {/* Bottom nav — mobile */}
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
              <span className="truncate max-w-full px-1">{item.short}</span>
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-3 sm:px-4 md:px-8 py-4 sm:py-6 md:py-8 max-w-7xl mx-auto w-full pb-24 md:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
