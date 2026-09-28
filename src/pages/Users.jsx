// src/pages/Users.jsx
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { adminCreateUser } from "../firebase/adminCreateUser";
import Modal from "../components/Modal";
import {
  Button,
  Input,
  Label,
  Select,
  Badge,
  PageHeader,
  Card,
} from "../components/ui";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    displayName: "",
    role: "user",
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, []);

  const reset = () => {
    setForm({ email: "", password: "", displayName: "", role: "user" });
    setError("");
  };

  const handleCreate = async () => {
    setError("");
    if (!form.email || !form.password || !form.displayName) {
      setError("Барча майдонларни тўлдиринг");
      return;
    }
    if (form.password.length < 6) {
      setError("Парол камида 6 та белгидан иборат бўлиши керак");
      return;
    }
    try {
      setCreating(true);
      await adminCreateUser(form);
      setOpen(false);
      reset();
    } catch (e) {
      setError(e.message || "Яратишда хатолик");
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id, email) => {
    if (email === "dilik@mail.ru") return;
    if (!window.confirm(`${email} фойдаланувчиси ўчирилсинми?`)) return;
    await deleteDoc(doc(db, "users", id));
  };

  const handleRoleChange = async (id, role) => {
    await updateDoc(doc(db, "users", id), { role });
  };

  return (
    <div>
      <PageHeader
        title="Фойдаланувчилар"
        subtitle={`Жами: ${users.length}`}
        action={
          <Button onClick={() => setOpen(true)}>
            <span className="text-lg leading-none">+</span> Фойдаланувчи яратиш
          </Button>
        }
      />

      {/* Мобильный список — карточки */}
      <div className="md:hidden space-y-3">
        {users.map((u) => (
          <Card key={u.id} className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 flex-shrink-0 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center">
                {u.email?.[0]?.toUpperCase() || "?"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">{u.email}</p>
                <p className="text-sm text-slate-500 truncate mt-0.5">
                  {u.displayName || "—"}
                </p>
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  {u.email === "dilik@mail.ru" ? (
                    <Badge color="brand">admin</Badge>
                  ) : (
                    <>
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                      <Button
                        variant="danger"
                        onClick={() => handleDelete(u.id, u.email)}
                        className="!px-2.5 !py-1 !text-xs"
                      >
                        Ўчириш
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
        {users.length === 0 && (
          <Card className="p-10 text-center text-slate-400">
            Ҳозирча фойдаланувчилар мавжуд эмас
          </Card>
        )}
      </div>

      {/* Десктоп — таблица */}
      <Card className="hidden md:block overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                <th className="text-left font-semibold text-slate-500 px-6 py-3">
                  Email
                </th>
                <th className="text-left font-semibold text-slate-500 px-6 py-3">
                  Исм
                </th>
                <th className="text-left font-semibold text-slate-500 px-6 py-3">
                  Роль
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 font-bold flex items-center justify-center text-sm">
                        {u.email?.[0]?.toUpperCase() || "?"}
                      </div>
                      <span className="font-medium text-slate-800">
                        {u.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {u.displayName || "—"}
                  </td>
                  <td className="px-6 py-4">
                    {u.email === "dilik@mail.ru" ? (
                      <Badge color="brand">admin</Badge>
                    ) : (
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/30"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Button
                      variant="danger"
                      disabled={u.email === "dilik@mail.ru"}
                      onClick={() => handleDelete(u.id, u.email)}
                      className="!px-3 !py-1.5 !text-xs"
                    >
                      Ўчириш
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-16 text-center text-slate-400"
                  >
                    Ҳозирча фойдаланувчилар мавжуд эмас
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          reset();
        }}
        title="Фойдаланувчи яратиш"
      >
        <div className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="user@mail.ru"
            />
          </div>
          <div>
            <Label>Парол</Label>
            <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder="камида 6 та белги"
            />
          </div>
          <div>
            <Label>Кўрсатиладиган исм</Label>
            <Input
              value={form.displayName}
              onChange={(e) =>
                setForm({ ...form, displayName: e.target.value })
              }
              placeholder="Иван Иванов"
            />
          </div>
          <div>
            <Label>Роль</Label>
            <Select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">Фойдаланувчи</option>
              <option value="admin">Администратор</option>
            </Select>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="!w-full sm:!w-auto"
            >
              Бекор қилиш
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating}
              className="!w-full sm:!w-auto"
            >
              {creating ? "Яратилмоқда..." : "Яратиш"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
