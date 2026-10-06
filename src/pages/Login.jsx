// src/pages/Login.jsx
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useT } from "../i18n/useT";
import { Button, Input, Label } from "../components/ui";

export default function Login() {
  const t = useT();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/");
    } catch (err) {
      const map = {
        "auth/invalid-email": t("errInvalidEmail"),
        "auth/user-not-found": t("errUserNotFound"),
        "auth/wrong-password": t("errWrongPassword"),
        "auth/invalid-credential": t("errInvalidCredential"),
        "auth/too-many-requests": t("errTooManyRequests"),
      };
      setError(map[err.code] || err.message || t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 via-slate-50 to-slate-100 p-3 sm:p-4 relative overflow-hidden">
      <div className="absolute -top-32 -left-32 w-72 sm:w-96 h-72 sm:h-96 bg-brand-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-72 sm:w-96 h-72 sm:h-96 bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />

      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-md bg-white/90 backdrop-blur-xl rounded-2xl sm:rounded-3xl shadow-2xl shadow-brand-900/10 border border-white/60 p-6 sm:p-8 md:p-10"
      >
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-xl sm:text-2xl font-bold shadow-lg shadow-brand-500/30 mb-3 sm:mb-4">
            T
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t("welcome")}
          </h1>
          <p className="text-slate-500 text-sm mt-1">{t("loginToApp")}</p>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="siz@mail.ru"
            />
          </div>

          <div>
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••"
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 text-base"
          >
            {loading ? t("loggingIn") : t("login")}
          </Button>

          <div className="flex items-center gap-2 pt-2">
            <div className="flex-1 h-px bg-slate-100" />
            <p className="text-xs text-slate-400 tracking-wide">
              Create by D.Karimov
            </p>
            <div className="flex-1 h-px bg-slate-100" />
          </div>
        </div>
      </form>
    </div>
  );
}
