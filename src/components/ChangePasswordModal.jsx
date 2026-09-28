// src/components/ChangePasswordModal.jsx
import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../firebase/config";
import Modal from "./Modal";
import { Button, Input, Label } from "./ui";

export default function ChangePasswordModal({ open, onClose }) {
  const [form, setForm] = useState({
    current: "",
    next: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const reset = () => {
    setForm({ current: "", next: "", confirm: "" });
    setError("");
    setSuccess(false);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = async () => {
    setError("");
    setSuccess(false);

    if (!form.current || !form.next || !form.confirm) {
      setError("Барча майдонларни тўлдиринг");
      return;
    }
    if (form.next.length < 6) {
      setError("Янги парол камида 6 та белгидан иборат бўлиши керак");
      return;
    }
    if (form.next !== form.confirm) {
      setError("Янги парол ва тасдиқ бир хил эмас");
      return;
    }
    if (form.next === form.current) {
      setError("Янги парол эскисидан фарқли бўлиши керак");
      return;
    }

    const u = auth.currentUser;
    if (!u || !u.email) {
      setError("Фойдаланувчи топилмади");
      return;
    }

    try {
      setLoading(true);
      // 1) Переаутентификация — Firebase требует свежий вход для updatePassword
      const cred = EmailAuthProvider.credential(u.email, form.current);
      await reauthenticateWithCredential(u, cred);

      // 2) Обновляем пароль
      await updatePassword(u, form.next);

      setSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
      // через 1.5 сек закрываем
      setTimeout(() => {
        close();
      }, 1500);
    } catch (err) {
      const map = {
        "auth/wrong-password": "Жорий парол нотўғри",
        "auth/invalid-credential": "Жорий парол нотўғри",
        "auth/weak-password": "Янги парол жуда оддий",
        "auth/requires-recent-login":
          "Илтимос, қайта киринг ва яна уриниб кўринг",
        "auth/too-many-requests":
          "Жуда кўп уриниш. Кейинроқ қайта уриниб кўринг",
      };
      setError(map[err.code] || err.message || "Хатолик юз берди");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title="Паролни ўзгартириш">
      <div className="space-y-4">
        <div>
          <Label>Жорий парол</Label>
          <Input
            type="password"
            autoFocus
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
            placeholder="••••••"
          />
        </div>

        <div>
          <Label>Янги парол</Label>
          <Input
            type="password"
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
            placeholder="камида 6 та белги"
          />
        </div>

        <div>
          <Label>Янги паролни тасдиқлаш</Label>
          <Input
            type="password"
            value={form.confirm}
            onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            placeholder="••••••"
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5">
            {error}
          </div>
        )}

        {success && (
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm px-4 py-2.5">
            ✓ Парол муваффақиятли ўзгартирилди
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={close}
            className="!w-full sm:!w-auto"
            disabled={loading}
          >
            Бекор қилиш
          </Button>
          <Button
            onClick={submit}
            disabled={loading || success}
            className="!w-full sm:!w-auto"
          >
            {loading ? "Ўзгартирилмоқда..." : "Ўзгартириш"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
