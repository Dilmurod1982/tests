// src/App.jsx
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tests from "./pages/Tests";
import TestRunner from "./pages/TestRunner";
import Users from "./pages/Users";
import Subjects from "./pages/Subjects";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";

function HomeRedirect() {
  const { role } = useAuthStore();
  return <Navigate to={role === "admin" ? "/tests" : "/dashboard"} replace />;
}

export default function App() {
  const { init, user, loading } = useAuthStore();

  useEffect(() => {
    init();
  }, [init]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Юкланмоқда...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />

        <Route
          element={
            <PrivateRoute>
              <Layout />
            </PrivateRoute>
          }
        >
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/tests/:id" element={<TestRunner />} />
          <Route
            path="/users"
            element={
              <PrivateRoute requireAdmin>
                <Users />
              </PrivateRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <PrivateRoute requireAdmin>
                <Subjects />
              </PrivateRoute>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
