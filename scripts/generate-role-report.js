// Generates docreport/Rentora-Role-Based-Report.docx
//
// A role-based QA report: one chapter per role (Guest · Renter · Owner · Admin)
// plus a cross-role Access-Control & Security chapter. Each chapter states the
// role's access, the surfaces verified live (Playwright-MCP, maximised 1920×1200
// + responsive sweep), a coverage table built from data/testcases.js and the
// live pass/fail from evidence/results.json, and the bugs affecting that role.
//
// Run: node scripts/generate-role-report.js

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ImageRun, ShadingType,
} = require("docx");
const { MODULES } = require("../data/testcases");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docreport", "Rentora-Role-Based-Report.docx");
const SHOTS = path.join(ROOT, "evidence", "screenshots");

const BRAND = "2E7D32";
const FAILC = "C62828";
const WARN = "EF6C00";
const OKC = "2E7D32";
const MUTED = "666666";

// --- Load execution results (tcId -> PASS/FAIL) ----------------------------
const execStatus = {};
try {
  const r = JSON.parse(fs.readFileSync(path.join(ROOT, "evidence", "results.json"), "utf8"));
  const walk = (suites) => {
    for (const s of suites || []) {
      if (s.suites) walk(s.suites);
      for (const sp of s.specs || []) {
        for (const t of sp.tests || []) {
          const st = t.results[t.results.length - 1].status;
          const id = (sp.title.match(/^[A-Z]+-\d+/) || [null])[0];
          if (id) execStatus[id] = st === "passed" ? "PASS" : "FAIL";
        }
      }
    }
  };
  walk(r.suites);
} catch (e) {
  console.warn("No results.json found — run the suite first.", e.message);
}

// --- Stats for a set of modules --------------------------------------------
function statsFor(moduleNames) {
  let total = 0, automated = 0, manual = 0, pass = 0, fail = 0;
  const failedIds = [];
  for (const m of moduleNames) {
    for (const tc of MODULES[m] || []) {
      total++;
      if (tc.automated) {
        automated++;
        const st = execStatus[tc.id];
        if (st === "PASS") pass++;
        else if (st === "FAIL") { fail++; failedIds.push(tc.id); }
      } else manual++;
    }
  }
  return { total, automated, manual, pass, fail, failedIds };
}

// --- Role model ------------------------------------------------------------
const ROLES = [
  {
    key: "Guest",
    title: "Guest — unauthenticated visitor",
    host: "http://127.0.0.1:8000",
    login: "None (public browsing)",
    surfaces: [
      "Home / landing page", "Property search /search with all filters (price, type, bedrooms, furnishing, amenities)",
      "Property detail page", "Registration & login entry points",
    ],
    modules: ["GuestBrowsing", "SearchFilters", "SearchMatrix", "BoundaryEquivalence", "FormValidation"],
    bugs: ["BUG-003 — price-range slider never renders (20 console errors)", "BUG-004 — search filters accept invalid input silently", "BUG-006 — header “Browse” inconsistent across breakpoints"],
    verdict: "Browsing and the server-side search work, but the budget-filter UI is broken (BUG-003) and filter inputs are unvalidated (BUG-004).",
    verdictColor: WARN,
  },
  {
    key: "Renter",
    title: "Renter — registered seeker",
    host: "http://127.0.0.1:8000",
    login: "qa.renter1@rentora.test (unverified seed) · a verified seed renter",
    surfaces: [
      "Account registration", "Login", "Email-verification gate (/verify-email)",
      "Renter dashboard", "Owner-contact / messaging (verification-gated)",
    ],
    modules: ["Authentication"],
    bugs: ["BUG-001 — registration returns HTTP 500 (mailer misconfig), blocking 100% of self-onboarding", "BUG-002 — debug stack-trace / SQL disclosure on that error"],
    verdict: "Renter self-onboarding is blocked by BUG-001 plus the verification gate; only pre-seeded renters can browse authenticated surfaces.",
    verdictColor: FAILC,
  },
  {
    key: "Owner",
    title: "Owner — property lister",
    host: "http://127.0.0.1:8000",
    login: "owner1@rentora.test",
    surfaces: [
      "Owner dashboard", "My Listings", "10-step Add-Listing wizard (Type → Location → Building → Pricing → Amenities → Landmarks → Photos → Rules → Description → Preview)",
      "Messages", "Profile",
    ],
    modules: ["OwnerPortal"],
    bugs: ["BUG-007 — photo upload returns HTTP 501 (Cloudinary not configured). Confirmed live by completing the wizard to step 7; the “minimum 3 photos” gate hard-blocks listing completion unless the placeholder is used."],
    verdict: "Dashboard and the wizard work through step 6; step 7 (Photos) is hard-blocked by BUG-007 unless the owner falls back to the placeholder image.",
    verdictColor: FAILC,
    shot: "BUG-007-owner-photo-501.png", shotCap: "Owner wizard step 7 — photo upload 501 with the ‘minimum 3 required’ gate.",
  },
  {
    key: "Admin",
    title: "Admin — platform moderator",
    host: "http://localhost:8000/admin",
    login: "admin@rentora.com.bd",
    surfaces: [
      "Dashboard KPIs", "Review Queue (FIFO approve / reject)", "Add Listing → Photos",
      "Users (search, role filter, ban / self-protection)", "NID Verify queue",
    ],
    modules: ["AdminPortal"],
    bugs: ["BUG-007 — Add-Listing photo upload returns HTTP 501; the uploader is also hidden behind a default-ON ‘use placeholder’ toggle", "BUG-005 — Users role breakdown does not reconcile with the stated total"],
    verdict: "Every admin surface is reachable and clean (0 console errors); photo upload fails (BUG-007) and the user-count breakdown doesn’t add up (BUG-005).",
    verdictColor: WARN,
    shot: "BUG-007-photo-upload-501.png", shotCap: "Admin Create Listing — photo upload 501 after revealing the dropzone.",
  },
];

const CROSS = {
  title: "Cross-role — Access Control & Security",
  modules: ["AccessControl", "Security"],
  notes: [
    "Route guards were exercised across role boundaries: guests are redirected from /owner/* and /admin/* to login; a renter cannot reach owner or admin areas; an owner cannot reach admin areas.",
    "Security checks cover debug-mode disclosure (BUG-002), password hashing, and unverified-renter gating.",
    "These modules are role-agnostic by design — they assert that each role is confined to its own surfaces.",
  ],
};

// --- helpers ---------------------------------------------------------------
const H = (text, level) => new Paragraph({ text, heading: level, spacing: { before: 220, after: 110 } });
const P = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 80 } });
const bullet = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, ...opts })], bullet: { level: 0 }, spacing: { after: 30 } });
function cell(text, { bold = false, color, fill, width, align } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text: String(text), bold, color })] })],
  });
}
const headerRow = (labels) => new TableRow({ tableHeader: true, children: labels.map((l) => cell(l, { bold: true, color: "FFFFFF", fill: BRAND })) });
function table(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: ["top", "bottom", "left", "right", "insideHorizontal", "insideVertical"].reduce((a, k) => {
      a[k] = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" }; return a;
    }, {}),
    rows,
  });
}
function img(file, w, h) {
  const p = path.join(SHOTS, file);
  if (!fs.existsSync(p)) return P(`[screenshot ${file} not found]`, { italics: true, color: "888888" });
  return new Paragraph({ children: [new ImageRun({ type: "png", data: fs.readFileSync(p), transformation: { width: w, height: h } })], spacing: { after: 60 } });
}
const caption = (t) => new Paragraph({ children: [new TextRun({ text: t, italics: true, size: 16, color: MUTED })], spacing: { after: 140 } });
const passColor = (s) => (s.fail > 0 ? FAILC : OKC);

const children = [];

// --- Cover -----------------------------------------------------------------
children.push(new Paragraph({
  children: [new TextRun({ text: "Rentora — Role-Based QA Report", bold: true, size: 46, color: BRAND })],
  alignment: AlignmentType.CENTER, spacing: { after: 80 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "Coverage, Findings & Verdict per Role — Guest · Renter · Owner · Admin", size: 24, color: "555555" })],
  alignment: AlignmentType.CENTER, spacing: { after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "Playwright-MCP live analysis · Desktop 1920×1200 maximised + Responsive (768 / 375) · 27 Jun 2026", size: 18, color: "888888" })],
  alignment: AlignmentType.CENTER, spacing: { after: 220 },
}));

// --- Executive summary -----------------------------------------------------
children.push(H("Executive Summary", HeadingLevel.HEADING_1));
children.push(P(
  "Each role was driven end-to-end in a maximised headed browser, then swept at tablet and mobile widths. The table " +
  "below summarises coverage and the live automated pass/fail per role; blocking defects are called out in each chapter."));
const summaryRows = [headerRow(["Role", "Login", "TCs (auto/total)", "Pass", "Fail", "Blocking defects"])];
for (const role of ROLES) {
  const s = statsFor(role.modules);
  summaryRows.push(new TableRow({ children: [
    cell(role.key, { bold: true }),
    cell(role.login.split(" ")[0]),
    cell(`${s.automated}/${s.total}`, { align: AlignmentType.CENTER }),
    cell(String(s.pass), { color: OKC, bold: true, align: AlignmentType.CENTER }),
    cell(String(s.fail), { color: passColor(s), bold: true, align: AlignmentType.CENTER }),
    cell(role.bugs.map((b) => b.split(" ")[0]).join(", ")),
  ] }));
}
{
  const s = statsFor(CROSS.modules);
  summaryRows.push(new TableRow({ children: [
    cell("Cross-role", { bold: true }), cell("—"),
    cell(`${s.automated}/${s.total}`, { align: AlignmentType.CENTER }),
    cell(String(s.pass), { color: OKC, bold: true, align: AlignmentType.CENTER }),
    cell(String(s.fail), { color: passColor(s), bold: true, align: AlignmentType.CENTER }),
    cell("BUG-002"),
  ] }));
}
children.push(table(summaryRows));

// --- Per-role chapters -----------------------------------------------------
let chapter = 1;
for (const role of ROLES) {
  const s = statsFor(role.modules);
  children.push(H(`${chapter}. ${role.title}`, HeadingLevel.HEADING_1));
  chapter++;
  children.push(table([
    new TableRow({ children: [cell("Host", { bold: true, fill: "F2F2F2", width: 22 }), cell(role.host), cell("Login", { bold: true, fill: "F2F2F2", width: 14 }), cell(role.login)] }),
    new TableRow({ children: [cell("Automated", { bold: true, fill: "F2F2F2" }), cell(`${s.automated} of ${s.total} TCs`), cell("Result", { bold: true, fill: "F2F2F2" }), cell(`${s.pass} pass · ${s.fail} fail`, { color: passColor(s), bold: true })] }),
  ]));

  children.push(P("Surfaces verified", { bold: true }));
  role.surfaces.forEach((x) => children.push(bullet(x)));

  children.push(P("Coverage by module", { bold: true }));
  const covRows = [headerRow(["Module", "Total", "Automated", "Pass", "Fail"])];
  for (const m of role.modules) {
    const ms = statsFor([m]);
    covRows.push(new TableRow({ children: [
      cell(m), cell(String(ms.total), { align: AlignmentType.CENTER }), cell(String(ms.automated), { align: AlignmentType.CENTER }),
      cell(String(ms.pass), { color: OKC, align: AlignmentType.CENTER }), cell(String(ms.fail), { color: passColor(ms), bold: ms.fail > 0, align: AlignmentType.CENTER }),
    ] }));
  }
  children.push(table(covRows));
  if (s.failedIds.length) children.push(P(`Failing TCs (live): ${s.failedIds.join(", ")}`, { italics: true, color: FAILC }));

  children.push(P("Defects affecting this role", { bold: true }));
  if (role.bugs.length) role.bugs.forEach((b) => children.push(bullet(b)));
  else children.push(P("None.", { color: OKC }));

  if (role.shot) {
    children.push(img(role.shot, 540, 165));
    children.push(caption(role.shotCap));
  }

  children.push(P("Verdict", { bold: true }));
  children.push(P(role.verdict, { color: role.verdictColor, bold: true }));
}

// --- Cross-role chapter ----------------------------------------------------
{
  const s = statsFor(CROSS.modules);
  children.push(H(`${chapter}. ${CROSS.title}`, HeadingLevel.HEADING_1));
  children.push(P(`${s.automated} of ${s.total} TCs automated · ${s.pass} pass · ${s.fail} fail.`, { bold: true, color: passColor(s) }));
  CROSS.notes.forEach((n) => children.push(bullet(n)));
  const covRows = [headerRow(["Module", "Total", "Automated", "Pass", "Fail"])];
  for (const m of CROSS.modules) {
    const ms = statsFor([m]);
    covRows.push(new TableRow({ children: [
      cell(m), cell(String(ms.total), { align: AlignmentType.CENTER }), cell(String(ms.automated), { align: AlignmentType.CENTER }),
      cell(String(ms.pass), { color: OKC, align: AlignmentType.CENTER }), cell(String(ms.fail), { color: passColor(ms), align: AlignmentType.CENTER }),
    ] }));
  }
  children.push(table(covRows));
}

const doc = new Document({ creator: "Rentora QA Automation", title: "Rentora Role-Based QA Report", sections: [{ children }] });
fs.mkdirSync(path.dirname(OUT), { recursive: true });
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  const tot = ROLES.reduce((a, r) => { const s = statsFor(r.modules); return { p: a.p + s.pass, f: a.f + s.fail }; }, { p: 0, f: 0 });
  console.log(`Wrote ${OUT} (${(buf.length / 1024).toFixed(0)} KB) — ${ROLES.length} roles · ${tot.p} pass / ${tot.f} fail across role modules`);
});
