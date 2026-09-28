// src/pages/Tests.jsx
import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { parseTest } from "../utils/parseTests";
import { useAuthStore } from "../store/authStore";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Input,
  Select,
  Textarea,
  Label,
  PageHeader,
  Card,
} from "../components/ui";

export default function Tests() {
  const { role } = useAuthStore();
  const isAdmin = role === "admin";
  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", subjectId: "", raw: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const u1 = onSnapshot(collection(db, "tests"), (s) =>
      setTests(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const u2 = onSnapshot(collection(db, "subjects"), (s) =>
      setSubjects(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => {
      u1();
      u2();
    };
  }, []);

  const createTest = async () => {
    setError("");
    if (!form.title.trim()) return setError("Тест номини киритинг");
    if (!form.subjectId) return setError("Фанни танланг");
    const questions = parseTest(form.raw);
    if (!questions.length)
      return setError("Биронта савол топилмади (# билан бошланиши керак)");

    await addDoc(collection(db, "tests"), {
      title: form.title.trim(),
      subjectId: form.subjectId,
      questions,
      createdAt: serverTimestamp(),
    });
    setOpen(false);
    setForm({ title: "", subjectId: "", raw: "" });
  };

  const removeTest = async (t) => {
    if (!window.confirm(`«${t.title}» тести ўчирилсинми?`)) return;
    try {
      await deleteDoc(doc(db, "tests", t.id));
    } catch (e) {
      alert("Ўчиришда хатолик: " + (e.message || e));
    }
  };

  const orphanTests = tests.filter(
    (t) => !subjects.find((s) => s.id === t.subjectId)
  );

  return (
    <div>
      <PageHeader
        title="Тестлар"
        subtitle={`Жами тестлар: ${tests.length}`}
        action={
          isAdmin && (
            <Button onClick={() => setOpen(true)}>
              <span className="text-lg leading-none">+</span> Тест яратиш
            </Button>
          )
        }
      />

      {tests.length === 0 ? (
        <Card className="p-10 sm:p-16 text-center">
          <div className="text-4xl sm:text-5xl mb-4">📝</div>
          <p className="text-slate-500 text-sm sm:text-base">
            Ҳозирча тестлар мавжуд эмас.
          </p>
        </Card>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {subjects.map((sub) => {
            const subTests = tests.filter((t) => t.subjectId === sub.id);
            if (!subTests.length) return null;
            return (
              <div key={sub.id}>
                <h2 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">
                  {sub.name}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {subTests.map((t) => (
                    <TestCard
                      key={t.id}
                      test={t}
                      isAdmin={isAdmin}
                      onDelete={() => removeTest(t)}
                      onClick={() => navigate(`/tests/${t.id}`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {orphanTests.length > 0 && (
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">
                Фансиз
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {orphanTests.map((t) => (
                  <TestCard
                    key={t.id}
                    test={t}
                    isAdmin={isAdmin}
                    onDelete={() => removeTest(t)}
                    onClick={() => navigate(`/tests/${t.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Тест яратиш"
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Тест номи</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Мисол: Ҳуқуқ асослари"
              />
            </div>
            <div>
              <Label>Фан</Label>
              <Select
                value={form.subjectId}
                onChange={(e) =>
                  setForm({ ...form, subjectId: e.target.value })
                }
              >
                <option value="">— Фанни танланг —</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label>
              Тест матни{" "}
              <span className="text-slate-400 font-normal">
                (# — савол, + — тўғри, - — нотўғри)
              </span>
            </Label>
            <Textarea
              rows={12}
              value={form.raw}
              onChange={(e) => setForm({ ...form, raw: e.target.value })}
              placeholder={`#2+2 қанча?\n+4\n-3\n-5\n-22\n\n#Франция пойтахти?\n+Париж\n-Лондон\n-Берлин`}
            />
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-2.5">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
            <Button
              variant="secondary"
              onClick={() => setOpen(false)}
              className="!w-full sm:!w-auto"
            >
              Бекор қилиш
            </Button>
            <Button onClick={createTest} className="!w-full sm:!w-auto">
              Яратиш
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TestCard({ test, onClick, isAdmin, onDelete }) {
  return (
    <Card
      onClick={onClick}
      className="group relative cursor-pointer p-4 sm:p-5 hover:shadow-lg hover:shadow-brand-500/10 hover:-translate-y-0.5 active:scale-[.99] transition-all duration-200 border-slate-100 hover:border-brand-200"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-lg sm:text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
          📝
        </div>
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-slate-800 group-hover:text-brand-700 transition leading-snug line-clamp-2 ${
              isAdmin ? "pr-8" : ""
            }`}
          >
            {test.title}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {test.questions?.length || 0} саволлар
          </p>
        </div>
      </div>

      {isAdmin && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.();
          }}
          className="absolute top-3 right-3 md:opacity-0 md:group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition flex items-center justify-center text-sm"
          title="Ўчириш"
        >
          🗑
        </button>
      )}
    </Card>
  );
}
