// src/components/ProfileModal.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase/config";
import { useAuthStore } from "../store/authStore";
import Modal from "./Modal";
import { Button, Badge } from "./ui";
import ChangePasswordModal from "./ChangePasswordModal";

export default function ProfileModal({ open, onClose }) {
  const { user, role } = useAuthStore();
  const isAdmin = role === "admin";
  const navigate = useNavigate();
  const [changePassOpen, setChangePassOpen] = useState(false);

  const handleLogout = async () => {
    onClose();
    await signOut(auth);
    navigate("/login");
  };

  const joined = user?.metadata?.creationTime
    ? new Date(user.metadata.creationTime).toLocaleDateString("uz-UZ", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "—";

  const lastSignIn = user?.metadata?.lastSignInTime
    ? new Date(user.metadata.lastSignInTime).toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  return (
    <>
      <Modal open={open} onClose={onClose} title="Профил">
        <div className="space-y-5">
          {/* Шапка профиля */}
          <div className="flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-brand-500/30 mb-3">
              {user?.email?.[0]?.toUpperCase() || "?"}
            </div>
            <p className="font-semibold text-slate-800 text-base sm:text-lg break-all">
              {user?.email}
            </p>
            <div className="mt-2">
              {isAdmin ? (
                <Badge color="brand">Администратор</Badge>
              ) : (
                <Badge color="slate">Фойдаланувчи</Badge>
              )}
            </div>
          </div>

          {/* Данные */}
          <div className="rounded-2xl bg-slate-50 divide-y divide-slate-100">
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-xs sm:text-sm text-slate-500">
                Рўйхатдан ўтган
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-700 text-right">
                {joined}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="text-xs sm:text-sm text-slate-500">
                Сўнгги кириш
              </span>
              <span className="text-xs sm:text-sm font-medium text-slate-700 text-right">
                {lastSignIn}
              </span>
            </div>
          </div>

          {/* Действия */}
          <div className="space-y-2">
            <Button onClick={() => setChangePassOpen(true)} className="!w-full">
              🔒 Паролни ўзгартириш
            </Button>
            <Button
              variant="secondary"
              onClick={handleLogout}
              className="!w-full !text-red-600 !border-red-200 hover:!bg-red-50"
            >
              Чиқиш
            </Button>
          </div>
        </div>
      </Modal>

      <ChangePasswordModal
        open={changePassOpen}
        onClose={() => setChangePassOpen(false)}
      />
    </>
  );
}
