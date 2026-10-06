// src/components/ChangePasswordModal.jsx
import { useState } from "react";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from "firebase/auth";
import { auth } from "../firebase/config";
import { useT } from "../i18n/useT";
import Modal from "./Modal";
import { Button, Input, Label } from "./ui";

export default function ChangePasswordModal({ open, onClose }) {
  const t = useT();
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
      setError(t("fillAllFields"));
      return;
    }
    if (form.next.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }
    if (form.next !== form.confirm) {
      setError(t("passwordsDontMatch"));
      return;
    }
    if (form.next === form.current) {
      setError(t("newPasswordMustDiffer"));
      return;
    }

    const u = auth.currentUser;
    if (!u || !u.email) {
      setError(t("userNotFound"));
      return;
    }

    try {
      setLoading(true);
      const cred = EmailAuthProvider.credential(u.email, form.current);
      await reauthenticateWithCredential(u, cred);
      await updatePassword(u, form.next);

      setSuccess(true);
      setForm({ current: "", next: "", confirm: "" });
      setTimeout(close, 1500);
    } catch (err) {
      const map = {
        "auth/wrong-password": t("currentPasswordWrong"),
        "auth/invalid-credential": t("currentPasswordWrong"),
        "auth/weak-password": t("weakPassword"),
        "auth/requires-recent-login": t("requiresRecentLogin"),
        "auth/too-many-requests": t("tooManyRequests"),
      };
      setError(map[err.code] || err.message || t("errorOccurred"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={close} title={t("changePassword")}>
      <div className="space-y-4">
        <div>
          <Label>{t("currentPassword")}</Label>
          <Input
            type="password"
            autoFocus
            value={form.current}
            onChange={(e) => setForm({ ...form, current: e.target.value })}
            placeholder="••••••"
          />
        </div>

        <div>
          <Label>{t("newPassword")}</Label>
          <Input
            type="password"
            value={form.next}
            onChange={(e) => setForm({ ...form, next: e.target.value })}
            placeholder={t("passwordHint")}
          />
        </div>

        <div>
          <Label>{t("confirmPassword")}</Label>
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
            ✓ {t("passwordChanged")}
          </div>
        )}

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
          <Button
            variant="secondary"
            onClick={close}
            className="!w-full sm:!w-auto"
            disabled={loading}
          >
            {t("cancel")}
          </Button>
          <Button
            onClick={submit}
            disabled={loading || success}
            className="!w-full sm:!w-auto"
          >
            {loading ? t("changing") : t("change")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
