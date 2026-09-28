// src/components/PrivateRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export default function PrivateRoute({ children, requireAdmin = false }) {
  const { user, role, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Юкланмоқда...
      </div>
    );
  }

  if (!user) {
    // сохраняем, куда юзер хотел попасть — чтобы после логина вернуть
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (requireAdmin && role !== "admin") {
    return <Navigate to="/tests" replace />;
  }

  return children;
}
