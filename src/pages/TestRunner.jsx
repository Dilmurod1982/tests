// src/pages/TestRunner.jsx
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  doc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { prepareTest } from "../utils/parseTests";
import Modal from "../components/Modal";
import { useAuthStore } from "../store/authStore";
import { Button, Card } from "../components/ui";

export default function TestRunner() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [test, setTest] = useState(null);
  const [prepared, setPrepared] = useState(null);

  // Шаги: null → "start" → "mode" → "running" → "finished"
  const [step, setStep] = useState("start");
  const [mode, setMode] = useState(null); // "learn" | "exam"

  const [startedAt, setStartedAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null); // сек
  const timerRef = useRef(null);

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    (async () => {
      const snap = await getDoc(doc(db, "tests", id));
      if (snap.exists()) setTest({ id: snap.id, ...snap.data() });
    })();
  }, [id]);

  // Первый шаг: подготовить тест и открыть окно выбора режима
  const goToModeChoice = () => {
    setPrepared(prepareTest(test.questions));
    setStep("mode");
  };

  const startWithMode = (chosenMode) => {
    setMode(chosenMode);
    setStartedAt(Date.now());
    setStep("running");

    if (chosenMode === "exam") {
      setTimeLeft(prepared.length * 60); // 1 мин на вопрос
    }
  };

  // Таймер для режима exam
  useEffect(() => {
    if (step !== "running" || mode !== "exam" || timeLeft == null) return;

    if (timeLeft <= 0) {
      // время вышло — авто-завершение
      finish(true);
      return;
    }

    timerRef.current = setTimeout(() => {
      setTimeLeft((t) => (t == null ? null : t - 1));
    }, 1000);

    return () => clearTimeout(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, mode, timeLeft]);

  if (!test) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        Юкланмоқда...
      </div>
    );
  }

  /* ─── Шаг 1: старт ─── */
  if (step === "start") {
    return (
      <Modal open onClose={() => navigate(-1)} title="Тестни бошлаш?">
        <div className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-brand-700 font-medium">
              Тест
            </p>
            <p className="text-base sm:text-lg font-bold text-slate-800 break-words">
              {test.title}
            </p>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {test.questions.length} та савол · саволлар ва жавоблар тасодифий
              тартибда
            </p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => navigate(-1)}
              className="!w-full sm:!w-auto"
            >
              Бекор қилиш
            </Button>
            <Button onClick={goToModeChoice} className="!w-full sm:!w-auto">
              Бошлаш
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  /* ─── Шаг 2: выбор режима ─── */
  if (step === "mode") {
    return (
      <Modal
        open
        onClose={() => setStep("start")}
        title="Жавоблар кўрсатилсинми?"
      >
        <div className="space-y-5">
          <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-emerald-700 font-medium">
              Ўқув режими
            </p>
            <p className="text-sm text-slate-700 mt-1">
              Тўғри жавоб дарҳол яшил рангда кўрсатилади. Натижа{" "}
              <b>статистикага қўшилмайди</b>.
            </p>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand-50 to-brand-100 p-4 sm:p-5">
            <p className="text-xs sm:text-sm text-brand-700 font-medium">
              Имтиҳон режими
            </p>
            <p className="text-sm text-slate-700 mt-1">
              Жавоблар яширилади. Вақт: <b>{prepared.length} дақиқа</b>. Натижа
              статистикага қўшилади.
            </p>
          </div>
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
            <Button
              variant="secondary"
              onClick={() => startWithMode("exam")}
              className="!w-full sm:!w-auto"
            >
              Йўқ
            </Button>
            <Button
              onClick={() => startWithMode("learn")}
              className="!w-full sm:!w-auto !bg-emerald-500 hover:!bg-emerald-600"
            >
              Ҳа
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  /* ─── Шаг 4: результаты ─── */
  if (step === "finished") {
    const results = prepared.map((q, i) => {
      const chosen = answers[i];
      const correctIdx = q.answers.findIndex((a) => a.isCorrect);
      return {
        question: q.question,
        chosen: chosen != null ? q.answers[chosen].text : "—",
        correct: q.answers[correctIdx].text,
        isRight: chosen === correctIdx,
      };
    });
    const rightCount = results.filter((r) => r.isRight).length;
    const percent = Math.round((rightCount / prepared.length) * 100);
    const color = percent >= 80 ? "emerald" : percent >= 50 ? "amber" : "red";
    const ringColors = {
      emerald: "from-emerald-400 to-emerald-600",
      amber: "from-amber-400 to-amber-600",
      red: "from-red-400 to-red-600",
    };
    const durationSec = startedAt
      ? Math.round((Date.now() - startedAt) / 1000)
      : null;

    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/tests")}
          className="text-sm text-slate-500 hover:text-slate-800 mb-4 inline-flex items-center gap-1 transition"
        >
          ← Тестлар рўйхатига
        </button>

        <Card className="p-5 sm:p-8 mb-4 sm:mb-6 text-center">
          <div
            className={`inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${ringColors[color]} text-white text-3xl sm:text-4xl font-bold shadow-xl mb-3 sm:mb-4`}
          >
            {percent}%
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-800">
            Тест якунланди
          </h2>
          <p className="text-sm sm:text-base text-slate-500 mt-1 break-words">
            {test.title}
          </p>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Тўғри жавоблар: <b>{rightCount}</b> / <b>{prepared.length}</b>
          </p>
          {durationSec != null && (
            <p className="mt-1 text-xs sm:text-sm text-slate-400">
              Сарфланган вақт: {Math.floor(durationSec / 60)} дақ{" "}
              {durationSec % 60} сон
            </p>
          )}

          {mode === "learn" && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-800 text-xs sm:text-sm font-medium">
              ⚠️ Ўқув режими — бу натижа статистикага қўшилмади
            </div>
          )}
        </Card>

        <div className="space-y-3 mb-4 sm:mb-6">
          {results.map((r, i) => (
            <Card
              key={i}
              className={`p-3.5 sm:p-4 border-l-4 ${
                r.isRight ? "border-l-emerald-500" : "border-l-red-500"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold ${
                    r.isRight ? "bg-emerald-500" : "bg-red-500"
                  }`}
                >
                  {r.isRight ? "✓" : "✕"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 text-sm sm:text-base leading-snug">
                    {i + 1}. {r.question}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
                    Сизнинг жавобингиз:{" "}
                    <span
                      className={
                        r.isRight
                          ? "text-emerald-700 font-medium"
                          : "text-red-600"
                      }
                    >
                      {r.chosen}
                    </span>
                  </p>
                  {!r.isRight && (
                    <p className="text-xs sm:text-sm text-emerald-700 font-medium mt-0.5">
                      Тўғри жавоб: {r.correct}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => navigate("/tests")}
            className="!w-full sm:!w-auto"
          >
            ← Тестлар рўйхатига
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            className="!w-full sm:!w-auto"
          >
            📊 Статистикага
          </Button>
        </div>
      </div>
    );
  }

  /* ─── Шаг 3: прохождение ─── */
  const total = prepared.length;
  const answeredCount = Object.keys(answers).length;
  const remaining = total - answeredCount;
  const q = prepared[current];

  const choose = (idx) => {
    if (mode === "learn") {
      // фиксируем ответ, но НЕ переходим автоматически, чтобы юзер увидел подсветку
      setAnswers((prev) => ({ ...prev, [current]: idx }));
      return;
    }
    // exam: как раньше — фиксируем и через 200мс идём дальше
    setAnswers((prev) => ({ ...prev, [current]: idx }));
    if (current < total - 1) {
      setTimeout(() => setCurrent((c) => c + 1), 200);
    }
  };

  async function finish(isAuto = false) {
    if (step !== "running") return;

    if (!isAuto) {
      const msg =
        remaining > 0
          ? `Тестни якунлашни хоҳлайсизми? ${remaining} та савол жавобсиз қолди.`
          : "Тестни якунлашни хоҳлайсизми?";
      if (!window.confirm(msg)) return;
    } else {
      // авто-завершение при истечении таймера
      // без confirm
    }

    setStep("finished");

    // В режиме learn статистику НЕ сохраняем
    if (mode === "learn") return;

    try {
      const rightCount = prepared.reduce((acc, q, i) => {
        const chosen = answers[i];
        const correctIdx = q.answers.findIndex((a) => a.isCorrect);
        return acc + (chosen === correctIdx ? 1 : 0);
      }, 0);

      await addDoc(collection(db, "attempts"), {
        userId: user?.uid || null,
        userEmail: user?.email || null,
        testId: test.id,
        testTitle: test.title,
        subjectId: test.subjectId || null,
        total,
        rightCount,
        percent: Math.round((rightCount / total) * 100),
        durationSec: startedAt
          ? Math.round((Date.now() - startedAt) / 1000)
          : null,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn("Уринишни сақлаб бўлмади:", e);
    }
  }

  // Форматирование таймера mm:ss
  const formatTime = (sec) => {
    if (sec == null) return "";
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const timeDanger = mode === "exam" && timeLeft != null && timeLeft < 60;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Юқори статистика */}
      <Card className="p-4 sm:p-5 mb-4 sm:mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] sm:text-xs uppercase tracking-wider text-slate-400 font-semibold">
              Тест {mode === "learn" && "· Ўқув режими"}
            </p>
            <p className="font-semibold text-slate-800 text-sm sm:text-base break-words">
              {test.title}
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 text-sm">
            {mode === "exam" && timeLeft != null && (
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-mono font-bold text-base sm:text-lg tabular-nums ${
                  timeDanger
                    ? "bg-red-100 text-red-700 animate-pulse"
                    : "bg-brand-100 text-brand-700"
                }`}
              >
                ⏱ {formatTime(timeLeft)}
              </div>
            )}
            <div className="grid grid-cols-3 gap-2 sm:gap-6">
              <div className="text-center sm:text-right">
                <p className="text-slate-400 text-[10px] sm:text-xs">Жами</p>
                <p className="font-bold text-slate-800 text-base sm:text-lg">
                  {total}
                </p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-slate-400 text-[10px] sm:text-xs">Жавоб</p>
                <p className="font-bold text-emerald-600 text-base sm:text-lg">
                  {answeredCount}
                </p>
              </div>
              <div className="text-center sm:text-right">
                <p className="text-slate-400 text-[10px] sm:text-xs">Қолди</p>
                <p className="font-bold text-amber-600 text-base sm:text-lg">
                  {remaining}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden mt-3 sm:mt-4">
          <div
            className="h-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-300"
            style={{ width: `${(answeredCount / total) * 100}%` }}
          />
        </div>
      </Card>

      {/* Савол */}
      <Card className="p-4 sm:p-6 md:p-8 mb-4 sm:mb-5">
        <div className="flex items-center gap-2 mb-3 sm:mb-4 flex-wrap">
          <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-brand-100 text-brand-700">
            Савол {current + 1} / {total}
          </span>
          {answers[current] != null && (
            <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-emerald-100 text-emerald-700">
              Сиз жавоб бердингиз
            </span>
          )}
          {mode === "learn" && (
            <span className="text-[11px] sm:text-xs font-semibold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-amber-100 text-amber-700">
              Ўқув
            </span>
          )}
        </div>

        <h2 className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 mb-4 sm:mb-6 leading-snug">
          {q.question}
        </h2>

        <ul className="space-y-2.5 sm:space-y-3">
          {q.answers.map((a, i) => {
            const selected = answers[current] === i;
            const isCorrect = a.isCorrect;
            const showCorrect = mode === "learn" && isCorrect;

            // Базовая рамка/фон
            let cls =
              "w-full text-left flex items-start gap-3 px-3 sm:px-4 py-3 sm:py-3.5 rounded-xl border-2 transition-all duration-150 active:scale-[.99] ";

            if (mode === "learn") {
              if (showCorrect) {
                // светло-зелёный фон
                cls += "border-emerald-400 bg-emerald-50";
              } else if (selected && !isCorrect) {
                // выбрал неправильный — красная подсветка
                cls += "border-red-300 bg-red-50";
              } else {
                cls += "border-slate-200 bg-white hover:border-slate-300";
              }
            } else {
              if (selected) {
                cls +=
                  "border-brand-500 bg-brand-50 shadow-sm shadow-brand-500/10";
              } else {
                cls +=
                  "border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40";
              }
            }

            return (
              <li key={i}>
                <button
                  onClick={() => choose(i)}
                  className={cls}
                  disabled={mode === "learn" && answers[current] != null}
                >
                  <span
                    className={`w-5 h-5 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
                      showCorrect
                        ? "border-emerald-500"
                        : selected
                        ? mode === "learn" && !isCorrect
                          ? "border-red-400"
                          : "border-brand-500"
                        : "border-slate-300"
                    }`}
                  >
                    {showCorrect && (
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    )}
                    {!showCorrect && selected && (
                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          mode === "learn" && !isCorrect
                            ? "bg-red-400"
                            : "bg-brand-500"
                        }`}
                      />
                    )}
                  </span>
                  <span
                    className={`text-sm sm:text-base leading-snug ${
                      showCorrect
                        ? "text-emerald-900 font-medium"
                        : selected && mode === "learn" && !isCorrect
                        ? "text-red-800"
                        : selected
                        ? "text-brand-900 font-medium"
                        : "text-slate-700"
                    }`}
                  >
                    {a.text}
                    {showCorrect && (
                      <span className="ml-2 text-emerald-600 font-bold">✓</span>
                    )}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {mode === "learn" && answers[current] != null && (
          <div className="mt-4 text-xs sm:text-sm text-slate-500 italic">
            Тўғри жавоб яшил рангда кўрсатилди. Кейинги саволга ўтинг.
          </div>
        )}
      </Card>

      {/* Навигация */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-between sm:gap-3 mb-4 sm:mb-5">
        <Button
          variant="secondary"
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
          className="!w-full sm:!w-auto"
        >
          ← Олдинги
        </Button>
        <Button
          variant="secondary"
          disabled={current === total - 1}
          onClick={() => setCurrent((c) => c + 1)}
          className="!w-full sm:!w-auto"
        >
          Кейинги →
        </Button>
        <Button
          onClick={() => finish(false)}
          className="!w-full sm:!w-auto !bg-emerald-500 hover:!bg-emerald-600 !shadow-emerald-500/20 col-span-2 sm:col-span-1 sm:ml-auto"
        >
          Якунлаш
        </Button>
      </div>

      {/* Саволларга ўтиш */}
      <Card className="p-3 sm:p-4">
        <p className="text-[10px] sm:text-xs text-slate-400 font-semibold mb-2 sm:mb-3 uppercase tracking-wider">
          Саволга ўтиш
        </p>
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          {prepared.map((_, i) => {
            const isCurrent = i === current;
            const isAnswered = answers[i] != null;
            return (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-8 h-8 sm:w-9 sm:h-9 rounded-md sm:rounded-lg text-[11px] sm:text-xs font-semibold transition-all active:scale-95 ${
                  isCurrent
                    ? "bg-brand-500 text-white shadow-md shadow-brand-500/30 ring-2 ring-brand-200"
                    : isAnswered
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"
                    : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
