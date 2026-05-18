// Excel Result Writer
// -----------------------------------------------------------------------------
// Reads excel/Proctoring Pro.xlsx (the test-case source-of-truth), writes the
// "Actual Result" column for a given TC ID after a test runs, and saves a
// timestamped copy into excel/results/.
//
// Source workbook (input)  : excel/Proctoring Pro.xlsx
// Output (per test run)    : excel/results/Proctoring Pro - <timestamp>.xlsx
//
// Multiple tests in the same run accumulate into ONE output file (the writer
// reuses the run's timestamp until reset). Call ExcelResultWriter.flush() in
// test.afterAll if you want to force a save; it auto-saves after every update.

const path = require("path");
const fs = require("fs");
const XLSX = require("xlsx");

const ROOT = path.resolve(__dirname, "..");
const SOURCE = path.join(ROOT, "excel", "Proctoring Pro.xlsx");
const RESULTS_DIR = path.join(ROOT, "excel", "results");

// Header → expected column index mapping (1-based to match Excel ergonomics).
const COLUMNS = {
  ID: 1,
  TITLE: 2,
  PRECONDITION: 3,
  DESCRIPTION: 4,
  STEPS: 5,
  EXPECTED: 6,
  ACTUAL: 7,
  COMMENTS: 8,
};

function timestampForRun() {
  // Reuse the timestamp set by globalSetup so all workers share one output file.
  if (process.env.PLAYWRIGHT_RUN_TIMESTAMP) {
    return process.env.PLAYWRIGHT_RUN_TIMESTAMP;
  }
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

class ExcelResultWriter {
  constructor() {
    if (!fs.existsSync(SOURCE)) {
      throw new Error(`Source workbook not found at ${SOURCE}`);
    }
    fs.mkdirSync(RESULTS_DIR, { recursive: true });

    this.runId = timestampForRun();
    this.outPath = path.join(
      RESULTS_DIR,
      `Proctoring Pro - ${this.runId}.xlsx`,
    );

    // Bootstrap the per-run output by copying the source on first use.
    if (!fs.existsSync(this.outPath)) {
      fs.copyFileSync(SOURCE, this.outPath);
    }

    // Snapshot column G from the SOURCE workbook so write() can tell
    // "the cell still holds the workbook's baseline text" (→ overwrite)
    // apart from "a sibling-leg worker already wrote here this run" (→ merge).
    // Needed because each Playwright project runs in its own worker process,
    // so an in-memory _written Set would not see sibling-leg writes.
    this._sourceActuals = this._snapshotSourceActuals();
  }

  _snapshotSourceActuals() {
    const wb = XLSX.readFile(SOURCE);
    const snap = {};
    for (const sheetName of wb.SheetNames) {
      const ws = wb.Sheets[sheetName];
      if (!ws || !ws["!ref"]) continue;
      const range = XLSX.utils.decode_range(ws["!ref"]);
      const idCol = COLUMNS.ID - 1;
      const actualCol = COLUMNS.ACTUAL - 1;
      for (let r = range.s.r + 1; r <= range.e.r; r++) {
        const idCell = ws[XLSX.utils.encode_cell({ r, c: idCol })];
        if (!idCell) continue;
        const actualCell = ws[XLSX.utils.encode_cell({ r, c: actualCol })];
        snap[`${sheetName}:${String(idCell.v).trim()}`] = actualCell
          ? String(actualCell.v ?? "")
          : "";
      }
    }
    return snap;
  }

  /**
   * Write Actual Result for a single test row.
   *
   * The cell receives `detail` verbatim — the spec owns the full text (no
   * `[STATUS] timestamp` is auto-prepended). When `write()` is called twice
   * for the same (sheet, tcId) within a run (e.g. TC-5 leg A + leg B), the
   * new snippet is appended to the existing cell value with a single space,
   * so both legs end up in one row.
   *
   * @param {Object} opts
   * @param {string} opts.sheet    Worksheet/tab name (e.g. "Student").
   * @param {string|number} opts.tcId  Value in the ID column (matches as string).
   * @param {"PASS"|"FAIL"|"SKIP"|"BLOCKED"} opts.status  Logged only; not embedded in the cell.
   * @param {string} [opts.detail] Cell text. For PASS this should be a
   *                               past-tense restatement of Expected Result.
   *                               For FAIL/SKIP, lead with the status word
   *                               and include diagnostic info.
   */
  write({ sheet, tcId, status, detail = "" }) {
    const wb = XLSX.readFile(this.outPath, { cellStyles: true });
    const ws = wb.Sheets[sheet];
    if (!ws) throw new Error(`Sheet "${sheet}" not found`);

    const range = XLSX.utils.decode_range(ws["!ref"]);
    const idCol = COLUMNS.ID - 1; // sheet_to_json/encode_cell are 0-based
    const actualCol = COLUMNS.ACTUAL - 1;

    let targetRow = -1;
    for (let r = range.s.r + 1; r <= range.e.r; r++) {
      const idCell = ws[XLSX.utils.encode_cell({ r, c: idCol })];
      if (!idCell) continue;
      if (String(idCell.v).trim() === String(tcId).trim()) {
        targetRow = r;
        break;
      }
    }
    if (targetRow === -1) {
      throw new Error(`TC ID "${tcId}" not found in sheet "${sheet}"`);
    }

    const addr = XLSX.utils.encode_cell({ r: targetRow, c: actualCol });
    const key = `${sheet}:${String(tcId).trim()}`;
    const onDisk = String(ws[addr]?.v ?? "");
    const baseline = this._sourceActuals[key] ?? "";
    // If on-disk text still matches the source workbook, this is the first
    // write for this TC in the run → overwrite. Otherwise a sibling-leg
    // worker has already written → append our snippet (idempotent).
    const isFirstWrite = onDisk === baseline;
    const merged = isFirstWrite
      ? detail
      : onDisk.includes(detail)
        ? onDisk
        : `${onDisk} ${detail}`.trim();

    ws[addr] = { t: "s", v: merged };

    // Expand !ref if we wrote past the previous bounds (we shouldn't).
    if (targetRow > range.e.r || actualCol > range.e.c) {
      ws["!ref"] = XLSX.utils.encode_range({
        s: range.s,
        e: {
          r: Math.max(range.e.r, targetRow),
          c: Math.max(range.e.c, actualCol),
        },
      });
    }

    XLSX.writeFile(wb, this.outPath);
    return this.outPath;
  }

  /** Path of the per-run output file (handy for logging in CI). */
  getOutputPath() {
    return this.outPath;
  }
}

// Singleton — every spec in the same run shares one writer / one output file.
let _instance = null;
function getWriter() {
  if (!_instance) _instance = new ExcelResultWriter();
  return _instance;
}

module.exports = {
  ExcelResultWriter,
  getWriter,
  PATHS: { SOURCE, RESULTS_DIR },
};
