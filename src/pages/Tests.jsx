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
import { useTr } from "../store/langStore";
import { useT } from "../i18n/useT";
import Modal from "../components/Modal";
import { useNavigate } from "react-router-dom";
import {
  exportTestToExcel,
  exportAllTestsToExcel,
} from "../utils/exportToExcel";
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
  const [preview, setPreview] = useState(null); // { questions, warnings }
  const navigate = useNavigate();
  const t = useT();
  const tr = useTr();

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

  const reset = () => {
    setForm({ title: "", subjectId: "", raw: "" });
    setError("");
    setPreview(null);
  };

  // Пересчёт предпросмотра при изменении формы
  useEffect(() => {
    if (!form.raw.trim()) {
      setPreview(null);
      return;
    }
    const questions = parseTest(form.raw);
    const warnings = [];

    questions.forEach((q, i) => {
      const correct = q.answers.filter((a) => a.isCorrect).length;
      if (correct === 0)
        warnings.push(`#${i + 1}: toʻgʻri javob belgilanmagan`);
      else if (correct > 1)
        warnings.push(`#${i + 1}: bir nechta toʻgʻri javob`);
      if (q.answers.length < 2)
        warnings.push(`#${i + 1}: javoblar soni kamida 2 ta boʻlishi kerak`);
    });

    setPreview({ count: questions.length, warnings });
  }, [form.raw]);

  const createTest = async () => {
    setError("");
    if (!form.title.trim()) return setError(t("testNameRequired"));
    if (!form.subjectId) return setError(t("subjectRequired"));
    const questions = parseTest(form.raw);
    if (!questions.length) return setError(t("noQuestionsFound"));
    if (preview?.warnings?.length) return setError(t("fixWarningsFirst"));

    await addDoc(collection(db, "tests"), {
      title: form.title.trim(),
      subjectId: form.subjectId,
      questions,
      createdAt: serverTimestamp(),
    });
    setOpen(false);
    reset();
  };

  const removeTest = async (test) => {
    if (!window.confirm(`${tr(test.title)} — ${t("confirmDelete")}`)) return;
    try {
      await deleteDoc(doc(db, "tests", test.id));
    } catch (e) {
      alert(e.message || e);
    }
  };

  const orphanTests = tests.filter(
    (x) => !subjects.find((s) => s.id === x.subjectId)
  );

  return (
    <div>
      <PageHeader
        title={t("testsTitle")}
        subtitle={`${t("total")}: ${tests.length}`}
        action={
          <div className="flex flex-col-reverse sm:flex-row sm:items-center gap-2">
            {tests.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => exportAllTestsToExcel(tests)}
                className="!w-full sm:!w-auto"
              >
                ⬇️ {t("exportAll")}
              </Button>
            )}
            {isAdmin && (
              <Button
                onClick={() => setOpen(true)}
                className="!w-full sm:!w-auto"
              >
                <span className="text-lg leading-none">+</span>{" "}
                {t("createTest")}
              </Button>
            )}
          </div>
        }
      />

      {tests.length === 0 ? (
        <Card className="p-10 sm:p-16 text-center">
          <div className="text-4xl sm:text-5xl mb-4">📝</div>
          <p className="text-slate-500 text-sm sm:text-base">{t("noTests")}</p>
        </Card>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {subjects.map((sub) => {
            const subTests = tests.filter((x) => x.subjectId === sub.id);
            if (!subTests.length) return null;
            return (
              <div key={sub.id}>
                <h2 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">
                  {tr(sub.name)}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {subTests.map((x) => (
                    <TestCard
                      key={x.id}
                      test={x}
                      isAdmin={isAdmin}
                      tr={tr}
                      t={t}
                      onDelete={() => removeTest(x)}
                      onExport={() => exportTestToExcel(x)}
                      onClick={() => navigate(`/tests/${x.id}`)}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {orphanTests.length > 0 && (
            <div>
              <h2 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">
                {t("noSubject")}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {orphanTests.map((x) => (
                  <TestCard
                    key={x.id}
                    test={x}
                    isAdmin={isAdmin}
                    tr={tr}
                    t={t}
                    onDelete={() => removeTest(x)}
                    onExport={() => exportTestToExcel(x)}
                    onClick={() => navigate(`/tests/${x.id}`)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <Modal
        open={open}
        onClose={() => {
          setOpen(false);
          reset();
        }}
        title={t("createTest")}
        size="xl"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>{t("testName")}</Label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder={t("testNamePlaceholder")}
              />
            </div>
            <div>
              <Label>{t("subject")}</Label>
              <Select
                value={form.subjectId}
                onChange={(e) =>
                  setForm({ ...form, subjectId: e.target.value })
                }
              >
                <option value="">{t("selectSubject")}</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {tr(s.name)}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <Label>
              {t("testText")}{" "}
              <span className="text-slate-400 font-normal">
                {t("formatHint")}
              </span>
            </Label>
            <Textarea
              rows={14}
              value={form.raw}
              onChange={(e) => setForm({ ...form, raw: e.target.value })}
              placeholder={`++++
2+2 qancha?
====
#4
====
3
====
5
====
22
++++
Fransiya poytaxti?
====
#Parij
====
London
====
Berlin

— yoki eski format —

#2+2 qancha?
+4
-3
-5
-22`}
            />
          </div>

          {/* Предпросмотр */}
          {preview && (
            <div
              className={`rounded-xl px-4 py-3 text-sm border ${
                preview.warnings.length
                  ? "bg-amber-50 border-amber-100 text-amber-800"
                  : "bg-emerald-50 border-emerald-100 text-emerald-700"
              }`}
            >
              <p className="font-semibold">
                {t("foundQuestions")}: {preview.count}
              </p>
              {preview.warnings.length > 0 && (
                <ul className="mt-1.5 list-disc list-inside space-y-0.5">
                  {preview.warnings.map((w, i) => (
                    <li key={i}>{w}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

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
              {t("cancel")}
            </Button>
            <Button onClick={createTest} className="!w-full sm:!w-auto">
              {t("create")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function TestCard({ test, onClick, isAdmin, onDelete, onExport, tr, t }) {
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
          <h3 className="font-semibold text-slate-800 group-hover:text-brand-700 transition leading-snug line-clamp-2 pr-20 sm:pr-24">
            {tr(test.title)}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {test.questions?.length || 0} {t("questionsCount")}
          </p>
        </div>
      </div>

      <div className="absolute top-3 right-3 flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onExport?.();
          }}
          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition flex items-center justify-center text-sm"
          title={t("exportExcel")}
          aria-label={t("exportExcel")}
        >
          ⬇️
        </button>

        {isAdmin && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition flex items-center justify-center text-sm"
            title={t("delete")}
            aria-label={t("delete")}
          >
            🗑
          </button>
        )}
      </div>
    </Card>
  );
}
