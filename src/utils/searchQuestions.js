// src/utils/searchQuestions.js

/**
 * Ищет последовательность слов по началам, соблюдая порядок и без пропусков.
 *
 * Правила:
 *  1) Запрос разбивается по пробелам → массив токенов.
 *  2) В тексте вопроса слова идут слева направо.
 *  3) Находим такое i, что words[i].startsWith(tokens[0]),
 *     words[i+1].startsWith(tokens[1]), ... words[i+n-1].startsWith(tokens[n-1]).
 *  4) Если такое i существует — вопрос подходит.
 *
 * Регистр не важен. Апострофы (oʻ, o‘, o') игнорируются.
 */
export function matchesQuery(text, query) {
    if (!query.trim()) return true;
    if (!text) return false;
  
    const tokens = normalize(query).split(/\s+/).filter(Boolean);
    if (!tokens.length) return true;
  
    const words = normalize(text).split(/\s+/).filter(Boolean);
    if (words.length < tokens.length) return false;
  
    // Проходим по всем возможным стартам i, где может начаться совпадение
    for (let i = 0; i + tokens.length <= words.length; i++) {
      let ok = true;
      for (let j = 0; j < tokens.length; j++) {
        if (!words[i + j].startsWith(tokens[j])) {
          ok = false;
          break;
        }
      }
      if (ok) return true;
    }
    return false;
  }
  
  /**
   * Приведение к нижнему регистру + удаление апострофов + нормализация
   * разделителей (дефис, точка, запятая → пробел).
   */
  function normalize(s) {
    return String(s)
      .toLowerCase()
      .replace(/[ʻ‘’'`´]/g, "")   // апострофы
      .replace(/[.,;:!?()"«»…—–\-]/g, " ") // знаки препинания → пробел
      .replace(/\s+/g, " ")
      .trim();
  }
  
  /**
   * Возвращает список вопросов, отфильтрованных по запросу
   * и отсортированных по алфавиту.
   */
  export function filterAndSortQuestions(questions, query) {
    const filtered = query.trim()
      ? questions.filter((q) => matchesQuery(q.question, query))
      : questions;
  
    return [...filtered].sort((a, b) =>
      a.question.localeCompare(b.question, "uz")
    );
  }