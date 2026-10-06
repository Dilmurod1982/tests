// src/utils/parseTests.js

/* ────────────────────────────────────────────────
   Парсер формата Word:
   — начало вопроса: 3+ знаков "+" (++++, +++++, +++++++++, "++++ ++++")
   — разделитель вариантов: 3+ знаков "=" (====, =====, ========, ...)
   — правильный ответ: строка начинается с "#"

   Плюс автоспасение: если внутри одного вопроса уже был "#"
   и встречается второй "#" — считаем, что начался новый вопрос
   (это спасает, когда в исходнике пропущен "++++").
   ──────────────────────────────────────────────── */

   export function parseWordFormat(rawText) {
    if (!rawText) return [];
  
    // Нормализация: переносы, неразрывные пробелы, табы
    const text = rawText
      .replace(/\r\n/g, "\n")
      .replace(/\u00A0/g, " ")
      .replace(/\t+/g, " ");
  
    const lines = text.split("\n").map((l) => l.trim());
  
    const questions = [];
    let current = null;
    let stage = "idle"; // idle | question | answers
  
    const pushCurrent = () => {
      if (current && current.question) questions.push(current);
      current = null;
      stage = "idle";
    };
  
    for (const rawLine of lines) {
      if (!rawLine) continue;
  
      // Строка без пробелов — чтобы поймать "++++ ++++", "== == ==" и т.п.
      const clean = rawLine.replace(/\s+/g, "");
  
      // ─── Начало нового вопроса: 3 и более "+" ───
      if (/^\+{3,}$/.test(clean)) {
        pushCurrent();
        current = { question: "", answers: [] };
        stage = "question";
        continue;
      }
  
      // ─── Разделитель вариантов: 3 и более "=" ───
      if (/^={3,}$/.test(clean)) {
        if (stage === "question") stage = "answers";
        continue;
      }
  
      // ─── Текст вопроса (может быть многострочным) ───
      if (stage === "question" && current) {
        current.question = current.question
          ? current.question + " " + rawLine
          : rawLine;
        continue;
      }
  
      // ─── Варианты ответа ───
      if (stage === "answers" && current) {
        const isCorrect = rawLine.startsWith("#");
        const value = isCorrect ? rawLine.slice(1).trim() : rawLine;
  
        // АВТОСПАСЕНИЕ: если уже есть правильный ответ и встречаем второй "#",
        // значит в исходнике пропущен "++++" — закрываем текущий вопрос
        // и начинаем новый.
        const alreadyHasCorrect = current.answers.some((a) => a.isCorrect);
        if (isCorrect && alreadyHasCorrect) {
          pushCurrent();
          current = { question: value, answers: [] };
          stage = "question";
          continue;
        }
  
        if (value) current.answers.push({ text: value, isCorrect });
        continue;
      }
    }
  
    pushCurrent();
  
    // Фильтр: минимум 2 ответа и хотя бы один правильный
    return questions.filter(
      (q) =>
        q.question &&
        q.answers.length >= 2 &&
        q.answers.some((a) => a.isCorrect)
    );
  }
  
  /* ────────────────────────────────────────────────
     Старый формат:
     # вопрос
     + правильный
     - неправильный
     ──────────────────────────────────────────────── */
  export function parseLegacyFormat(rawText) {
    if (!rawText) return [];
  
    const lines = rawText
      .replace(/\r\n/g, "\n")
      .replace(/\u00A0/g, " ")
      .replace(/\t+/g, " ")
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);
  
    const questions = [];
    let current = null;
  
    for (const line of lines) {
      if (line.startsWith("#")) {
        if (current) questions.push(current);
        current = {
          question: line.slice(1).trim(),
          answers: [],
        };
      } else if (line.startsWith("+")) {
        current?.answers.push({ text: line.slice(1).trim(), isCorrect: true });
      } else if (line.startsWith("-")) {
        current?.answers.push({ text: line.slice(1).trim(), isCorrect: false });
      }
    }
    if (current) questions.push(current);
  
    return questions.filter((q) => q.question && q.answers.length >= 2);
  }
  
  /* ────────────────────────────────────────────────
     Автоопределение формата:
     если в тексте встречается "+++" — Word-формат,
     иначе — старый #/+/-.
     ──────────────────────────────────────────────── */
  export function parseTest(rawText) {
    if (!rawText) return [];
    if (/\+{3,}/.test(rawText)) return parseWordFormat(rawText);
    return parseLegacyFormat(rawText);
  }
  
  /* ────────────────────────────────────────────────
     Перемешивание (Fisher–Yates)
     ──────────────────────────────────────────────── */
  export function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  
  /* ────────────────────────────────────────────────
     Подготовка теста: вопросы и ответы в случайном порядке
     ──────────────────────────────────────────────── */
  export function prepareTest(questions) {
    return shuffle(questions).map((q) => ({
      ...q,
      answers: shuffle(q.answers),
    }));
  }