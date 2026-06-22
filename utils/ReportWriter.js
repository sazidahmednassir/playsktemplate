// Report Writer (ticket-driven)
// -----------------------------------------------------------------------------
// Replaces the old Excel result writer. Test cases are derived from a TICKET
// (see tickets/*.md) instead of an Excel sheet, and results are emitted as a
// human-readable testing report in BOTH Markdown and Word (.docx).
//
// Usage in a spec:
//   const { getReporter } = require("../../utils/ReportWriter");
//   const reporter = getReporter();
//   test.afterEach(async ({}, testInfo) => reporter.record(testInfo));
//   test.afterAll(async () => reporter.flush());
//
// Or build a report programmatically by pushing result objects via add().
//
// Output: reports/<run-timestamp>/report.md  +  report.docx
// One run = one folder; all workers/specs accumulate into a single JSON ledger
// that flush() renders. Screenshots are copied next to the report.

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const REPORTS_DIR = path.join(ROOT, "reports");

function runId() {
  if (process.env.PLAYWRIGHT_RUN_TIMESTAMP) return process.env.PLAYWRIGHT_RUN_TIMESTAMP;
  try {
    const f = path.join(REPORTS_DIR, ".run_id");
    if (fs.existsSync(f)) return fs.readFileSync(f, "utf8").trim();
  } catch { /* fall through */ }
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
}

const SEV_ORDER = { Critical: 0, High: 1, Medium: 2, Low: 3, "-": 4 };

class ReportWriter {
  constructor(meta = {}) {
    this.meta = {
      title: meta.title || "Sikder Store — E2E Test Report",
      ticket: meta.ticket || "Return / Exchange / Damage Claim Workflow",
      environment: meta.environment || "Sandbox (bKash / SSLCommerz test mode)",
      ...meta,
    };
    this.runId = runId();
    this.dir = path.join(REPORTS_DIR, this.runId);
    this.ledger = path.join(this.dir, "results.json");
    fs.mkdirSync(path.join(this.dir, "evidence"), { recursive: true });
  }

  _read() {
    if (!fs.existsSync(this.ledger)) return [];
    try { return JSON.parse(fs.readFileSync(this.ledger, "utf8")); } catch { return []; }
  }
  _write(rows) { fs.writeFileSync(this.ledger, JSON.stringify(rows, null, 2)); }

  // Add a fully-formed result row.
  // { tcId, title, area, status, severity, priority, steps[], expected, actual, evidence[] }
  add(row) {
    const rows = this._read();
    const copied = (row.evidence || []).map((src) => this._copyEvidence(row.tcId, src)).filter(Boolean);
    rows.push({
      tcId: row.tcId || `TC-${rows.length + 1}`,
      title: row.title || "Untitled",
      area: row.area || "General",
      status: (row.status || "UNKNOWN").toUpperCase(),
      severity: row.severity || "-",
      priority: row.priority || "-",
      steps: row.steps || [],
      expected: row.expected || "",
      actual: row.actual || "",
      evidence: copied,
    });
    this._write(rows);
  }

  // Record a Playwright testInfo (maps annotations/attachments → a result row).
  record(testInfo) {
    const ann = Object.fromEntries((testInfo.annotations || []).map((a) => [a.type, a.description]));
    const status = testInfo.status === "passed" ? "PASS" : testInfo.status === "skipped" ? "SKIP" : "FAIL";
    const evidence = (testInfo.attachments || [])
      .filter((a) => a.path && /\.(png|jpg|jpeg)$/i.test(a.path))
      .map((a) => a.path);
    this.add({
      tcId: ann.tcId || testInfo.title.split(" ")[0],
      title: ann.title || testInfo.title,
      area: ann.area,
      status,
      severity: ann.severity,
      priority: ann.priority,
      steps: ann.steps ? ann.steps.split("|").map((s) => s.trim()) : [],
      expected: ann.expected,
      actual: ann.actual || (status === "FAIL" ? (testInfo.error?.message || "Assertion failed") : ann.expected),
      evidence,
    });
  }

  _copyEvidence(tcId, src) {
    try {
      if (!src || !fs.existsSync(src)) return null;
      const base = `${(tcId || "tc").replace(/[^\w-]/g, "_")}_${path.basename(src)}`;
      const dest = path.join(this.dir, "evidence", base);
      fs.copyFileSync(src, dest);
      return path.join("evidence", base);
    } catch { return null; }
  }

  async flush() {
    const rows = this._read().sort(
      (a, b) => (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9),
    );
    const md = this._renderMarkdown(rows);
    fs.writeFileSync(path.join(this.dir, "report.md"), md);
    await this._renderDocx(rows);
    return this.dir;
  }

  _summary(rows) {
    const c = (s) => rows.filter((r) => r.status === s).length;
    return { total: rows.length, pass: c("PASS"), fail: c("FAIL"), blocked: c("BLOCKED"), skip: c("SKIP") };
  }

  _renderMarkdown(rows) {
    const s = this._summary(rows);
    const L = [];
    L.push(`# ${this.meta.title}`, "");
    L.push(`**Ticket:** ${this.meta.ticket}  `);
    L.push(`**Environment:** ${this.meta.environment}  `);
    L.push(`**Date:** ${new Date().toISOString().slice(0, 10)}  `);
    L.push(`**Run:** ${this.runId}`, "");
    L.push(`## Summary`, "");
    L.push(`| Total | Pass | Fail | Blocked | Skipped |`);
    L.push(`| ----- | ---- | ---- | ------- | ------- |`);
    L.push(`| ${s.total} | ${s.pass} | ${s.fail} | ${s.blocked} | ${s.skip} |`, "");
    L.push(`## Results`, "");
    L.push(`| TC | Title | Area | Status | Severity | Priority |`);
    L.push(`| -- | ----- | ---- | ------ | -------- | -------- |`);
    for (const r of rows) {
      L.push(`| ${r.tcId} | ${r.title} | ${r.area} | ${r.status} | ${r.severity} | ${r.priority} |`);
    }
    L.push("");
    const failing = rows.filter((r) => r.status === "FAIL" || r.status === "BLOCKED");
    if (failing.length) {
      L.push(`## Defects (Failed / Blocked)`, "");
      for (const r of failing) {
        L.push(`### ${r.tcId} — ${r.title}`, "");
        L.push(`- **Area:** ${r.area}`);
        L.push(`- **Severity:** ${r.severity} | **Priority:** ${r.priority} | **Status:** ${r.status}`, "");
        if (r.steps.length) { L.push(`**Steps to reproduce:**`, ""); r.steps.forEach((st, i) => L.push(`${i + 1}. ${st}`)); L.push(""); }
        L.push(`**Expected:** ${r.expected}`, "");
        L.push(`**Actual:** ${r.actual}`, "");
        if (r.evidence.length) { L.push(`**Evidence:**`, ""); r.evidence.forEach((e) => L.push(`![${r.tcId}](${e})`)); L.push(""); }
      }
    }
    return L.join("\n");
  }

  async _renderDocx(rows) {
    const docx = require("docx");
    const { Document, Packer, Paragraph, HeadingLevel, TextRun, Table, TableRow, TableCell, WidthType, ImageRun, BorderStyle } = docx;
    const s = this._summary(rows);
    const children = [];
    const H = (text, level) => new Paragraph({ text, heading: level });
    const P = (runs) => new Paragraph({ children: Array.isArray(runs) ? runs : [new TextRun(runs)] });
    const cell = (text, bold = false) => new TableCell({
      width: { size: 16, type: WidthType.PERCENTAGE },
      children: [new Paragraph({ children: [new TextRun({ text: String(text), bold })] })],
    });
    const row = (cells, bold = false) => new TableRow({ children: cells.map((c) => cell(c, bold)) });

    children.push(H(this.meta.title, HeadingLevel.TITLE));
    children.push(P([new TextRun({ text: "Ticket: ", bold: true }), new TextRun(this.meta.ticket)]));
    children.push(P([new TextRun({ text: "Environment: ", bold: true }), new TextRun(this.meta.environment)]));
    children.push(P([new TextRun({ text: "Date: ", bold: true }), new TextRun(new Date().toISOString().slice(0, 10))]));
    children.push(H("Summary", HeadingLevel.HEADING_1));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [row(["Total", "Pass", "Fail", "Blocked", "Skipped"], true), row([s.total, s.pass, s.fail, s.blocked, s.skip])],
    }));
    children.push(P(""));
    children.push(H("Results", HeadingLevel.HEADING_1));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        row(["TC", "Title", "Area", "Status", "Severity", "Priority"], true),
        ...rows.map((r) => row([r.tcId, r.title, r.area, r.status, r.severity, r.priority])),
      ],
    }));

    const failing = rows.filter((r) => r.status === "FAIL" || r.status === "BLOCKED");
    if (failing.length) {
      children.push(H("Defects (Failed / Blocked)", HeadingLevel.HEADING_1));
      for (const r of failing) {
        children.push(H(`${r.tcId} — ${r.title}`, HeadingLevel.HEADING_2));
        children.push(P([new TextRun({ text: `Area: `, bold: true }), new TextRun(r.area)]));
        children.push(P([new TextRun({ text: `Severity: `, bold: true }), new TextRun(`${r.severity}   `), new TextRun({ text: `Priority: `, bold: true }), new TextRun(`${r.priority}   `), new TextRun({ text: `Status: `, bold: true }), new TextRun(r.status)]));
        if (r.steps.length) {
          children.push(P([new TextRun({ text: "Steps to reproduce:", bold: true })]));
          r.steps.forEach((st, i) => children.push(new Paragraph({ text: `${i + 1}. ${st}` })));
        }
        children.push(P([new TextRun({ text: "Expected: ", bold: true }), new TextRun(r.expected || "")]));
        children.push(P([new TextRun({ text: "Actual: ", bold: true }), new TextRun(r.actual || "")]));
        for (const e of r.evidence) {
          const abs = path.join(this.dir, e);
          if (fs.existsSync(abs)) {
            try {
              children.push(new Paragraph({ children: [new ImageRun({ data: fs.readFileSync(abs), transformation: { width: 560, height: 350 } })] }));
            } catch { /* skip unreadable image */ }
          }
        }
      }
    }

    const doc = new Document({ sections: [{ children }] });
    const buf = await Packer.toBuffer(doc);
    fs.writeFileSync(path.join(this.dir, "report.docx"), buf);
  }
}

let _instance = null;
function getReporter(meta) {
  if (!_instance) _instance = new ReportWriter(meta);
  return _instance;
}

module.exports = { ReportWriter, getReporter, PATHS: { REPORTS_DIR } };
