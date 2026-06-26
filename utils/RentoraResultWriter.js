// Rentora Excel Result Writer
// -----------------------------------------------------------------------------
// Reads excel/Rentora-Testcases.xlsx (test-case source of truth), writes the
// "Actual Result" column for a given TC ID after a test runs, and saves a
// timestamped copy into excel/results/.
//
// Source workbook (input) : excel/Rentora-Testcases.xlsx
// Output (per test run)   : excel/results/Rentora-Testcases - <timestamp>.xlsx
//
// One output file per run (timestamp pinned via PLAYWRIGHT_RUN_TIMESTAMP).

const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "excel", "Rentora-Testcases.xlsx");
const RESULTS_DIR = path.join(ROOT, "excel", "results");

// 1-based column positions in the generated workbook.
const COLUMNS = { ID: 1, ACTUAL: 7 };

function timestampForRun() {
  if (process.env.PLAYWRIGHT_RUN_TIMESTAMP) return process.env.PLAYWRIGHT_RUN_TIMESTAMP;
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

class RentoraResultWriter {
  constructor() {
    if (!fs.existsSync(SOURCE)) {
      throw new Error(`Source workbook not found at ${SOURCE} — run: node scripts/generate-excel.js`);
    }
    fs.mkdirSync(RESULTS_DIR, { recursive: true });
    this.runId = timestampForRun();
    this.outPath = path.join(RESULTS_DIR, `Rentora-Testcases - ${this.runId}.xlsx`);
    if (!fs.existsSync(this.outPath)) fs.copyFileSync(SOURCE, this.outPath);
  }

  /**
   * Write the Actual Result for one TC row.
   * @param {{sheet:string, tcId:string, status:"PASS"|"FAIL"|"SKIP"|"BLOCKED", detail?:string}} opts
   */
  write({ sheet, tcId, status, detail = "" }) {
    // NB: do NOT pass { cellStyles: true } — round-tripping styles once per test
    // (×N tests, same file) duplicates style records and bloats the workbook to
    // tens of MB. Column widths (!cols) are sheet-level and survive without it.
    const wb = XLSX.readFile(this.outPath);
    const ws = wb.Sheets[sheet];
    if (!ws) throw new Error(`Sheet "${sheet}" not found in ${this.outPath}`);

    const range = XLSX.utils.decode_range(ws["!ref"]);
    const idCol = COLUMNS.ID - 1;
    const actualCol = COLUMNS.ACTUAL - 1;

    let targetRow = -1;
    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const idCell = ws[XLSX.utils.encode_cell({ r, c: idCol })];
      if (idCell && String(idCell.v).trim() === String(tcId).trim()) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) throw new Error(`TC ID "${tcId}" not found in sheet "${sheet}"`);

    const addr = XLSX.utils.encode_cell({ r: targetRow, c: actualCol });
    ws[addr] = { t: "s", v: `[${status}] ${detail}`.trim() };
    XLSX.writeFile(wb, this.outPath);
    return this.outPath;
  }

  getOutputPath() {
    return this.outPath;
  }
}

let _instance = null;
function getWriter() {
  if (!_instance) _instance = new RentoraResultWriter();
  return _instance;
}

module.exports = { RentoraResultWriter, getWriter, PATHS: { SOURCE, RESULTS_DIR } };
