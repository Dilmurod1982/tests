// src/pages/AllQuestions.jsx
import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase/config";
import { useTr } from "../store/langStore";
import { useT } from "../i18n/useT";
import { Card, PageHeader, Input, Button } from "../components/ui";
import { filterAndSortQuestions } from "../utils/searchQuestions";

export default function AllQuestions() {
  const t = useT();
  const tr = useTr();

  const [tests, setTests] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Выбранный тест: null = экран выбора, "ALL" = все тесты, "<id>" = конкретный
  const [selectedTestId, setSelectedTestId] = useState(null);

  // Поиск — только для экрана 2
  const [search, setSearch] = useState("");

  useEffect(() => {
    const u1 = onSnapshot(
      query(collection(db, "tests"), orderBy("title")),
      (snap) => {
        setTests(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.warn("tests load error:", err);
        setLoading(false);
      }
    );
    const u2 = onSnapshot(collection(db, "subjects"), (snap) => {
      setSubjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => {
      u1();
      u2();
    };
  }, []);

  // Готовим плоский список вопросов только для выбранного теста
  const questions = useMemo(() => {
    if (!selectedTestId) return [];

    const source =
      selectedTestId === "ALL"
        ? tests
        : tests.filter((x) => x.id === selectedTestId);

    const list = [];
    source.forEach((test) => {
      (test.questions || []).forEach((q, idx) => {
        const correct = q.answers?.find((a) => a.isCorrect);
        list.push({
          id: `${test.id}__${idx}`,
          testId: test.id,
          testTitle: test.title,
          question: q.question,
          correct: correct?.text || "—",
        });
      });
    });
    return list;
  }, [tests, selectedTestId]);

  const filtered = useMemo(
    () => filterAndSortQuestions(questions, search),
    [questions, search]
  );

  const selectedTest = useMemo(
    () => tests.find((x) => x.id === selectedTestId) || null,
    [tests, selectedTestId]
  );

  const goBack = () => {
    setSelectedTestId(null);
    setSearch("");
  };

  const pickTest = (id) => {
    setSelectedTestId(id);
    setSearch("");
  };

  /* ─── Экран 1: выбор теста ─── */
  if (!selectedTestId) {
    return (
      <TestPicker
        loading={loading}
        tests={tests}
        subjects={subjects}
        onPick={pickTest}
        t={t}
        tr={tr}
      />
    );
  }

  /* ─── Экран 2: вопросы выбранного теста ─── */
  const title =
    selectedTestId === "ALL"
      ? t("allQuestionsTitle")
      : tr(selectedTest?.title || "");

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={goBack}
          className="text-sm text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 transition"
        >
          ← {t("back")}
        </button>
      </div>

      <PageHeader
        title={title}
        subtitle={`${t("total")}: ${questions.length} · ${t("shown")}: ${
          filtered.length
        }`}
      />

      {/* Строка поиска */}
      <div className="relative mb-3 sm:mb-4">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="!pl-10"
        />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          🔍
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center text-xs"
            aria-label={t("clear")}
            title={t("clear")}
          >
            ✕
          </button>
        )}
      </div>

      {search.trim() && (
        <p className="text-xs text-slate-400 mb-4">{t("searchHint")}</p>
      )}

      {filtered.length === 0 ? (
        <Card className="p-10 sm:p-16 text-center">
          <div className="text-4xl sm:text-5xl mb-4">🔎</div>
          <p className="text-slate-500 text-sm sm:text-base">
            {t("nothingFound")}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <QuestionCard key={item.id} item={item} t={t} tr={tr} />
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Экран выбора теста ─── */
function TestPicker({ loading, tests, subjects, onPick, t, tr }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        {t("loading")}
      </div>
    );
  }

  const totalQuestions = tests.reduce(
    (sum, x) => sum + (x.questions?.length || 0),
    0
  );

  const orphans = tests.filter(
    (x) => !subjects.find((s) => s.id === x.subjectId)
  );

  return (
    <div>
      <PageHeader
        title={t("allQuestionsTitle")}
        subtitle={`${t("pickTest")} · ${tests.length} ${t(
          "testsCount"
        )} · ${totalQuestions} ${t("questionsCount")}`}
      />

      {/* Кнопка "Все тесты" */}
      {tests.length > 0 && (
        <Card
          onClick={() => onPick("ALL")}
          className="group cursor-pointer p-4 sm:p-5 mb-6 hover:shadow-lg hover:shadow-brand-500/10 hover:-translate-y-0.5 active:scale-[.99] transition-all duration-200 border-brand-200 bg-gradient-to-br from-brand-50 to-brand-100"
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
              🌐
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-brand-800 group-hover:text-brand-900 transition leading-snug">
                {t("allTestsCombined")}
              </h3>
              <p className="text-xs sm:text-sm text-brand-700/80 mt-1">
                {tests.length} {t("testsCount")} · {totalQuestions}{" "}
                {t("questionsCount")}
              </p>
            </div>
            <span className="hidden sm:block text-brand-400 group-hover:text-brand-600 group-hover:translate-x-1 transition">
              →
            </span>
          </div>
        </Card>
      )}

      {/* Тесты по предметам */}
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
                  <PickerCard
                    key={x.id}
                    test={x}
                    onPick={() => onPick(x.id)}
                    t={t}
                    tr={tr}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {orphans.length > 0 && (
          <div>
            <h2 className="text-xs sm:text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 sm:mb-3">
              {t("noSubject")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              {orphans.map((x) => (
                <PickerCard
                  key={x.id}
                  test={x}
                  onPick={() => onPick(x.id)}
                  t={t}
                  tr={tr}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {tests.length === 0 && (
        <Card className="p-10 sm:p-16 text-center">
          <div className="text-4xl sm:text-5xl mb-4">📝</div>
          <p className="text-slate-500 text-sm sm:text-base">{t("noTests")}</p>
        </Card>
      )}
    </div>
  );
}

function PickerCard({ test, onPick, t, tr }) {
  return (
    <Card
      onClick={onPick}
      className="group cursor-pointer p-4 sm:p-5 hover:shadow-lg hover:shadow-brand-500/10 hover:-translate-y-0.5 active:scale-[.99] transition-all duration-200 border-slate-100 hover:border-brand-200"
    >
      <div className="flex items-start gap-3 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-lg sm:rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white flex items-center justify-center text-lg sm:text-xl shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform">
          📝
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-slate-800 group-hover:text-brand-700 transition leading-snug line-clamp-2">
            {tr(test.title)}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {test.questions?.length || 0} {t("questionsCount")}
          </p>
        </div>
        <span className="hidden sm:block text-slate-300 group-hover:text-brand-500 group-hover:translate-x-1 transition">
          →
        </span>
      </div>
    </Card>
  );
}

/* ─── Карточка вопроса ─── */
function QuestionCard({ item, t, tr }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left p-4 sm:p-5 hover:bg-slate-50/60 transition"
      >
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center text-sm font-bold">
            ?
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-800 text-sm sm:text-base leading-snug">
              {tr(item.question)}
            </p>
            <p className="text-[11px] sm:text-xs text-slate-400 mt-1.5">
              {tr(item.testTitle)}
            </p>
          </div>
          <span
            className={`text-slate-400 flex-shrink-0 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          >
            ▾
          </span>
        </div>
      </button>

      {open && (
        <div className="px-4 sm:px-5 pb-4 sm:pb-5 border-t border-slate-100 pt-3 sm:pt-4">
          <div className="rounded-xl bg-emerald-50 border border-emerald-100 px-3 sm:px-4 py-3">
            <p className="text-[10px] sm:text-xs font-semibold text-emerald-700 uppercase tracking-wider mb-1">
              {t("correctAnswer")}
            </p>
            <p className="text-emerald-900 text-sm sm:text-base font-medium">
              {tr(item.correct)}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
