// App.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import Login from "./pages/Login";
import Users from "./pages/Users";
import Subjects from "./pages/Subjects";
import Tests from "./pages/Tests";
import TestRunner from "./pages/TestRunner";
import Layout from "./components/Layout";

function AdminRoute({ children }) {
  const { role } = useAuthStore();
  return role === "admin" ? children : <Navigate to="/tests" />;
}

export default function App() {
  const { init, user, loading } = useAuthStore();
  useEffect(() => {
    init();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Navigate to="/tests" />} />
          <Route path="/tests" element={<Tests />} />
          <Route path="/tests/:id" element={<TestRunner />} />
          <Route
            path="/users"
            element={
              <AdminRoute>
                <Users />
              </AdminRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <AdminRoute>
                <Subjects />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
