// utils/parseTests.js
export function parseTest(rawText) {
    const lines = rawText.split("\n").map(l => l.trim()).filter(Boolean);
  
    const questions = [];
    let current = null;
  
    for (const line of lines) {
      if (line.startsWith("#")) {
        if (current) questions.push(current);
        current = {
          question: line.slice(1).trim(),
          answers: [], // { text, isCorrect }
        };
      } else if (line.startsWith("+")) {
        current?.answers.push({ text: line.slice(1).trim(), isCorrect: true });
      } else if (line.startsWith("-")) {
        current?.answers.push({ text: line.slice(1).trim(), isCorrect: false });
      }
    }
    if (current) questions.push(current);
    return questions;
  }
  
  // Перемешивание (Fisher–Yates)
  export function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  
  // Подготовка теста: вопросы и ответы в случайном порядке
  export function prepareTest(questions) {
    return shuffle(questions).map(q => ({
      ...q,
      answers: shuffle(q.answers),
    }));
  }