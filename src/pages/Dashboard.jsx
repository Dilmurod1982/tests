// src/pages/Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuthStore } from "../store/authStore";
import { Card, PageHeader, Button } from "../components/ui";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [attempts, setAttempts] = useState([]);
  const [subjects, setSubjects] = useState({});
  const [loading, setLoading] = useState(true);

  // Загружаем попытки юзера
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "attempts"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        setAttempts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        console.warn(err);
        setLoading(false);
      }
    );
    return unsub;
  }, [user]);

  // Загружаем subjects, чтобы показывать имена в слабых темах
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "subjects"), (snap) => {
      const map = {};
      snap.docs.forEach((d) => {
        map[d.id] = d.data().name;
      });
      setSubjects(map);
    });
    return unsub;
  }, []);

  const stats = useMemo(() => computeStats(attempts), [attempts]);
  const streak = useMemo(() => computeStreak(attempts), [attempts]);
  const weakTopics = useMemo(
    () => computeWeakTopics(attempts, subjects),
    [attempts, subjects]
  );
  const badges = useMemo(
    () => computeBadges(attempts, streak),
    [attempts, streak]
  );

  const recent = attempts.slice(0, 10);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32 text-slate-400">
        Юкланмоқда...
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Статистика"
        subtitle={`Салом, ${
          user?.email?.split("@")[0] || ""
        }! Сизнинг натижаларингиз`}
        action={
          <Button onClick={() => navigate("/tests")}>📝 Тестларга ўтиш</Button>
        }
      />

      {attempts.length === 0 ? (
        <EmptyState onStart={() => navigate("/tests")} />
      ) : (
        <>
          {/* Верхние метрики + стрик */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
            <StatCard
              icon="📋"
              label="Топширилган"
              value={stats.total}
              hint="жами уриниш"
              color="brand"
            />
            <StatCard
              icon="🎯"
              label="Ўртача"
              value={`${stats.avg}%`}
              hint="барча тестлар"
              color="emerald"
            />
            <StatCard
              icon="🏆"
              label="Энг яхши"
              value={`${stats.best}%`}
              hint="энг юқори"
              color="amber"
            />
            <StatCard
              icon="🔥"
              label="Стрик"
              value={`${streak.current} кун`}
              hint={
                streak.best > 0 ? `энг узоқ: ${streak.best} кун` : "кунма-кун"
              }
              color="flame"
            />
          </div>

          {/* Стрик + достижения */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 mb-6">
            <StreakCard streak={streak} />

            <div className="lg:col-span-2">
              <BadgesCard badges={badges} />
            </div>
          </div>

          {/* Слабые темы */}
          {weakTopics.length > 0 && (
            <div className="mb-6">
              <WeakTopicsCard topics={weakTopics} />
            </div>
          )}

          {/* График последних попыток */}
          {recent.length > 1 && (
            <Card className="p-4 sm:p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-800">
                    Сўнгги 10 та уриниш
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Фоиз кўринишида
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-400">
                  100%
                </span>
              </div>
              <ProgressChart data={recent} />
            </Card>
          )}

          {/* Последние попытки */}
          <Card className="overflow-hidden">
            <div className="px-4 sm:px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">Сўнгги натижалар</h3>
              <button
                onClick={() => navigate("/tests")}
                className="text-xs sm:text-sm text-brand-600 hover:text-brand-700 font-medium"
              >
                Барча тестлар →
              </button>
            </div>
            <ul className="divide-y divide-slate-100">
              {recent.map((a) => (
                <AttemptRow key={a.id} attempt={a} />
              ))}
            </ul>
          </Card>
        </>
      )}
    </div>
  );
}

/* ─────────── Вычисления ─────────── */

function computeStats(attempts) {
  if (!attempts.length) return { total: 0, avg: 0, best: 0 };
  const total = attempts.length;
  const avg = Math.round(
    attempts.reduce((s, a) => s + (a.percent ?? 0), 0) / total
  );
  const best = Math.max(...attempts.map((a) => a.percent ?? 0));
  return { total, avg, best };
}

/**
 * Стрик: подряд идущие дни (по локальной дате) с хотя бы одной попыткой.
 * current — серия, которая завершается сегодня или вчера (чтобы стрик не рвался
 * в течение дня, пока юзер ещё не зашёл).
 * best — лучшая серия за всё время.
 */
function computeStreak(attempts) {
  if (!attempts.length) return { current: 0, best: 0, lastDate: null };

  const dateSet = new Set(attempts.map((a) => toLocalDateKey(a.createdAt)));

  // все даты, отсортированные по возрастанию
  const sortedDates = [...dateSet].sort();
  if (!sortedDates.length) return { current: 0, best: 0, lastDate: null };

  // best streak
  let best = 1;
  let run = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    if (isNextDay(sortedDates[i - 1], sortedDates[i])) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 1;
    }
  }

  // current streak: считаем с сегодня назад
  const todayKey = toLocalDateKey(new Date());
  const yesterdayKey = toLocalDateKey(
    new Date(Date.now() - 24 * 60 * 60 * 1000)
  );

  let current = 0;
  let anchor;
  if (dateSet.has(todayKey)) {
    anchor = todayKey;
  } else if (dateSet.has(yesterdayKey)) {
    anchor = yesterdayKey;
  } else {
    return { current: 0, best, lastDate: sortedDates[sortedDates.length - 1] };
  }

  // идём назад по дням
  let cursor = new Date(anchor);
  while (dateSet.has(toLocalDateKey(cursor))) {
    current += 1;
    cursor = new Date(cursor.getTime() - 24 * 60 * 60 * 1000);
  }

  return {
    current,
    best: Math.max(best, current),
    lastDate: sortedDates[sortedDates.length - 1],
  };
}

function toLocalDateKey(input) {
  const d = input?.toDate?.() ?? (input instanceof Date ? input : null);
  if (!d) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function isNextDay(a, b) {
  const da = new Date(a);
  const db = new Date(b);
  const diff = (db - da) / (24 * 60 * 60 * 1000);
  return diff === 1;
}

/**
 * Слабые темы: группируем попытки по subjectId, считаем средний %.
 * Возвращаем от худшего к лучшему.
 */
function computeWeakTopics(attempts, subjectsMap) {
  const bySubject = {};

  attempts.forEach((a) => {
    const sid = a.subjectId;
    if (!sid) return;
    if (!bySubject[sid]) bySubject[sid] = { sum: 0, count: 0 };
    bySubject[sid].sum += a.percent ?? 0;
    bySubject[sid].count += 1;
  });

  return Object.entries(bySubject)
    .map(([sid, { sum, count }]) => ({
      subjectId: sid,
      name: subjectsMap[sid] || "Фансиз",
      avg: Math.round(sum / count),
      count,
    }))
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 5);
}

/**
 * Достижения. Каждое — { id, icon, title, description, earned }.
 */
function computeBadges(attempts, streak) {
  const total = attempts.length;
  const best = attempts.length
    ? Math.max(...attempts.map((a) => a.percent ?? 0))
    : 0;
  const perfect = attempts.filter((a) => (a.percent ?? 0) === 100).length;

  return [
    {
      id: "first",
      icon: "🎓",
      title: "Биринчи қадам",
      description: "Биринчи тестни топширдингиз",
      earned: total >= 1,
    },
    {
      id: "ten",
      icon: "📚",
      title: "Китобхон",
      description: "10 та тест топширилди",
      earned: total >= 10,
    },
    {
      id: "fifty",
      icon: "🏅",
      title: "Марафончи",
      description: "50 та тест топширилди",
      earned: total >= 50,
    },
    {
      id: "hundred",
      icon: "💎",
      title: "Юзлик",
      description: "100 та тест топширилди",
      earned: total >= 100,
    },
    {
      id: "perfect",
      icon: "⭐",
      title: "Мукаммал",
      description: "100% натижага эришдингиз",
      earned: perfect >= 1,
    },
    {
      id: "perfect5",
      icon: "🌟",
      title: "Соҳибкор",
      description: "5 та мукаммал натижа",
      earned: perfect >= 5,
    },
    {
      id: "top90",
      icon: "🎯",
      title: "Снайпер",
      description: "Энг яхши натижа ≥ 90%",
      earned: best >= 90,
    },
    {
      id: "streak3",
      icon: "🔥",
      title: "3 кунлик серия",
      description: "3 кун кетма-кет машқ",
      earned: streak.best >= 3,
    },
    {
      id: "streak7",
      icon: "🚀",
      title: "Бир ҳафта",
      description: "7 кун кетма-кет машқ",
      earned: streak.best >= 7,
    },
    {
      id: "streak30",
      icon: "👑",
      title: "Бир ой",
      description: "30 кун кетма-кет машқ",
      earned: streak.best >= 30,
    },
  ];
}

/* ─────────── Компоненты ─────────── */

function StatCard({ icon, label, value, hint, color }) {
  const colors = {
    brand: "from-brand-500 to-brand-700 shadow-brand-500/20",
    emerald: "from-emerald-500 to-emerald-700 shadow-emerald-500/20",
    amber: "from-amber-500 to-amber-700 shadow-amber-500/20",
    flame: "from-orange-500 to-red-600 shadow-orange-500/20",
  };
  return (
    <Card className="p-3 sm:p-5">
      <div className="flex items-center gap-2.5 sm:gap-4">
        <div
          className={`w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0 rounded-xl bg-gradient-to-br ${colors[color]} text-white flex items-center justify-center text-lg sm:text-2xl shadow-lg`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] sm:text-xs text-slate-400 font-medium truncate">
            {label}
          </p>
          <p className="text-lg sm:text-2xl font-bold text-slate-800 leading-tight">
            {value}
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">
            {hint}
          </p>
        </div>
      </div>
    </Card>
  );
}

function StreakCard({ streak }) {
  const current = streak.current;
  const best = streak.best;
  const days = ["Ду", "Се", "Чо", "Па", "Жу", "Ша", "Як"];

  // считаем, в какие из последних 7 дней были попытки
  const last7 = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
    last7.push({
      label: days[(d.getDay() + 6) % 7], // Ду=0
      isToday: i === 0,
      active: false, // заполним ниже
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(d.getDate()).padStart(2, "0")}`,
    });
  }

  return (
    <Card className="p-4 sm:p-5 flex flex-col">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <p className="text-xs text-slate-400 font-medium">Кунлик серия</p>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-3xl sm:text-4xl font-extrabold text-orange-500">
              {current}
            </span>
            <span className="text-sm text-slate-500">кун</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Энг узоқ: <b>{best}</b> кун
          </p>
        </div>
        <div
          className={`text-3xl sm:text-4xl transition-transform ${
            current > 0 ? "scale-110" : "opacity-40"
          }`}
        >
          🔥
        </div>
      </div>

      <div className="flex justify-between gap-1 mt-auto">
        {last7.map((d) => (
          <div key={d.key} className="flex flex-col items-center gap-1">
            <div
              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-semibold ${
                d.isToday ? "ring-2 ring-orange-300 ring-offset-1" : ""
              } ${
                d.active
                  ? "bg-orange-500 text-white"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              {d.label}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function BadgesCard({ badges }) {
  const earned = badges.filter((b) => b.earned).length;
  return (
    <Card className="p-4 sm:p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-800">Достижения</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {earned} / {badges.length} очилди
          </p>
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 text-amber-700 flex items-center justify-center text-2xl">
          🏆
        </div>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 sm:gap-3">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`group relative flex flex-col items-center gap-1 p-2 rounded-xl transition cursor-default ${
              b.earned
                ? "bg-amber-50 hover:bg-amber-100"
                : "bg-slate-50 opacity-60"
            }`}
            title={b.description}
          >
            <div
              className={`text-2xl sm:text-3xl transition ${
                b.earned ? "" : "grayscale"
              }`}
            >
              {b.icon}
            </div>
            <p
              className={`text-[10px] sm:text-[11px] text-center font-medium leading-tight ${
                b.earned ? "text-amber-800" : "text-slate-400"
              }`}
            >
              {b.title}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function WeakTopicsCard({ topics }) {
  const worst = topics[0];
  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-slate-800">Кучсиз мавзулар</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Ўртача натижа паст бўлган фанлар
          </p>
        </div>
        {worst && worst.avg < 60 && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-700 whitespace-nowrap">
            Диққат талаб
          </span>
        )}
      </div>

      <ul className="space-y-3">
        {topics.map((t) => {
          const color = t.avg >= 80 ? "emerald" : t.avg >= 50 ? "amber" : "red";
          const barColors = {
            emerald: "from-emerald-400 to-emerald-600",
            amber: "from-amber-400 to-amber-600",
            red: "from-red-400 to-red-600",
          };
          return (
            <li key={t.subjectId}>
              <div className="flex items-center justify-between gap-3 mb-1.5">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="text-lg">📚</span>
                  <span className="text-sm font-medium text-slate-700 truncate">
                    {t.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] text-slate-400">
                    {t.count} та
                  </span>
                  <span
                    className={`text-sm font-bold ${
                      color === "emerald"
                        ? "text-emerald-600"
                        : color === "amber"
                        ? "text-amber-600"
                        : "text-red-600"
                    }`}
                  >
                    {t.avg}%
                  </span>
                </div>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${barColors[color]} transition-all duration-500`}
                  style={{ width: `${t.avg}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function ProgressChart({ data }) {
  const ordered = [...data].reverse();
  return (
    <div className="flex items-end gap-1.5 sm:gap-2 h-40">
      {ordered.map((a) => {
        const p = a.percent ?? 0;
        const h = (p / 100) * 100;
        const color =
          p >= 80
            ? "from-emerald-400 to-emerald-600"
            : p >= 50
            ? "from-amber-400 to-amber-600"
            : "from-red-400 to-red-600";
        return (
          <div
            key={a.id}
            className="flex-1 flex flex-col items-center justify-end gap-1 h-full"
            title={`${a.testTitle}: ${p}%`}
          >
            <span className="text-[10px] sm:text-xs text-slate-400 font-semibold">
              {p}
            </span>
            <div
              className={`w-full rounded-t-md bg-gradient-to-t ${color} transition-all duration-300`}
              style={{ height: `${Math.max(h, 4)}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function AttemptRow({ attempt }) {
  const percent = attempt.percent ?? 0;
  const date = attempt.createdAt?.toDate?.();
  const dateStr = date
    ? date.toLocaleString("uz-UZ", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

  const color = percent >= 80 ? "emerald" : percent >= 50 ? "amber" : "red";
  const colors = {
    emerald: "bg-emerald-100 text-emerald-700",
    amber: "bg-amber-100 text-amber-700",
    red: "bg-red-100 text-red-700",
  };

  return (
    <li className="px-4 sm:px-6 py-3.5 sm:py-4 flex items-center gap-3 sm:gap-4 hover:bg-slate-50/60 transition">
      <div
        className={`w-11 h-11 sm:w-12 sm:h-12 flex-shrink-0 rounded-full ${colors[color]} flex items-center justify-center font-bold text-sm sm:text-base`}
      >
        {percent}%
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-slate-800 text-sm sm:text-base truncate">
          {attempt.testTitle}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">{dateStr}</p>
      </div>
      <div className="hidden sm:block text-right text-xs text-slate-400">
        <p>
          Тўғри:{" "}
          <span className="font-semibold text-slate-600">
            {attempt.rightCount}
          </span>{" "}
          / {attempt.total}
        </p>
        {attempt.durationSec ? (
          <p className="mt-0.5">
            Вақт: {Math.floor(attempt.durationSec / 60)} дақ{" "}
            {attempt.durationSec % 60} сон
          </p>
        ) : null}
      </div>
    </li>
  );
}

function EmptyState({ onStart }) {
  return (
    <Card className="p-10 sm:p-16 text-center">
      <div className="text-5xl sm:text-6xl mb-4">📊</div>
      <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2">
        Ҳозирча натижалар йўқ
      </h3>
      <p className="text-slate-500 text-sm sm:text-base mb-6 max-w-md mx-auto">
        Биринчи тестни топширинг — натижаларингиз, стрик ва ютуқларингиз шу ерда
        пайдо бўлади.
      </p>
      <Button onClick={onStart}>📝 Тестларни бошлаш</Button>
    </Card>
  );
}
