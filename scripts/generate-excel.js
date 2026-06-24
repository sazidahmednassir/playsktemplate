// Generates excel/Rentora-Testcases.xlsx from data/testcases.js.
// One worksheet per module. Columns follow the framework result-writer model:
//   ID | Title | Precondition | Description | Steps | Expected | Actual Result | Comments
//
// Run: node scripts/generate-excel.js

const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");
const { MODULES } = require("../data/testcases");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "excel", "Rentora-Testcases.xlsx");

const HEADERS = [
  "ID",
  "Title",
  "Precondition",
  "Description",
  "Steps",
  "Expected Result",
  "Actual Result",
  "Comments",
];

function sheetForModule(tcs) {
  const rows = [HEADERS];
  for (const tc of tcs) {
    rows.push([
      tc.id,
      tc.title,
      tc.precondition,
      tc.description,
      tc.steps,
      tc.expected,
      "", // Actual Result — filled at runtime by RentoraResultWriter
      `${tc.priority} | ${tc.technique}${tc.automated ? " | automated" : " | manual"}`,
    ]);
  }
  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 10 }, { wch: 42 }, { wch: 30 }, { wch: 36 },
    { wch: 48 }, { wch: 46 }, { wch: 40 }, { wch: 26 },
  ];
  return ws;
}

const wb = XLSX.utils.book_new();
let total = 0;
let automated = 0;
for (const [moduleName, tcs] of Object.entries(MODULES)) {
  XLSX.utils.book_append_sheet(wb, sheetForModule(tcs), moduleName);
  total += tcs.length;
  automated += tcs.filter((t) => t.automated).length;
}

fs.mkdirSync(path.dirname(OUT), { recursive: true });
XLSX.writeFile(wb, OUT);
console.log(`Wrote ${OUT}`);
console.log(`Modules: ${Object.keys(MODULES).length} | Total TCs: ${total} | Automated: ${automated} | Manual: ${total - automated}`);
