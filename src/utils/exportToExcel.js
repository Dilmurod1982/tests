// src/utils/exportToExcel.js
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/* ────────────────────────────────────────────────
   Вспомогательные функции
   ──────────────────────────────────────────────── */

function buildRows(questions) {
  return (questions || [])
    .map((q) => {
      const correct = q.answers?.find((a) => a.isCorrect);
      return {
        q: String(q.question ?? "").trim(),
        a: String(correct?.text ?? "").trim(),
      };
    })
    // сортировка по алфавиту по вопросу (узбекская локаль)
    .sort((x, y) => x.q.localeCompare(y.q, "uz"));
}

function sanitizeFileName(name) {
  return String(name || "test")
    .replace(/[\\/:*?"<>|]/g, "_")
    .slice(0, 80);
}

// Excel ограничивает имя листа 31 символом и запрещает : \ / ? * [ ]
function sanitizeSheetName(name) {
  return String(name || "Test")
    .replace(/[\\/?*[\]:]/g, "_")
    .slice(0, 31);
}

function styleHeaderRow(ws) {
  const header = ws.getRow(1);
  header.font = { bold: true, color: { argb: "FF173F8F" } };
  header.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFEEF6FF" },
  };
  header.alignment = { vertical: "middle", horizontal: "left" };
  header.height = 22;
  header.border = {
    bottom: { style: "thin", color: { argb: "FFBBD2F0" } },
  };
}

function applyColumnWidths(ws) {
  ws.columns = [
    { header: "Savol", key: "q", width: 80 },
    { header: "Toʻgʻri javob", key: "a", width: 50 },
  ];
}

function makeSheet(wb, sheetName, questions) {
  const ws = wb.addWorksheet(sanitizeSheetName(sheetName));
  applyColumnWidths(ws);
  styleHeaderRow(ws);

  const rows = buildRows(questions);
  rows.forEach((r) => ws.addRow({ q: r.q, a: r.a }));

  // перенос строк, если текст длинный
  ws.eachRow((row, i) => {
    if (i > 1) row.alignment = { wrapText: true, vertical: "top" };
  });

  return ws;
}

/* ────────────────────────────────────────────────
   1) Экспорт одного теста
   ──────────────────────────────────────────────── */
export async function exportTestToExcel(test) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "TestApp";
  wb.created = new Date();

  makeSheet(wb, test?.title || "Test", test?.questions);

  const buf = await wb.xlsx.writeBuffer();
  const fileName = sanitizeFileName(test?.title || "test") + ".xlsx";
  saveAs(new Blob([buf]), fileName);
}

/* ────────────────────────────────────────────────
   2) Экспорт всех тестов — по листу на каждый тест
   ──────────────────────────────────────────────── */
export async function exportAllTestsToExcel(tests) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "TestApp";
  wb.created = new Date();

  const usedNames = new Set();

  (tests || []).forEach((test, idx) => {
    // Excel не разрешает одинаковые имена листов
    let base = sanitizeSheetName(test?.title || `Test ${idx + 1}`);
    let name = base;
    let counter = 2;
    while (usedNames.has(name)) {
      name = `${base.slice(0, 28)}_${counter}`;
      counter += 1;
    }
    usedNames.add(name);

    makeSheet(wb, name, test?.questions);
  });

  if (!wb.worksheets.length) {
    // если тестов нет — создадим пустой лист, чтобы файл не падал
    wb.addWorksheet("Empty");
  }

  const buf = await wb.xlsx.writeBuffer();
  const stamp = new Date().toISOString().slice(0, 10);
  saveAs(new Blob([buf]), `testlar_${stamp}.xlsx`);
}