// Generates docreport/Rentora-Bug-Report.docx
//
// A standalone defect report from the live Playwright-MCP E2E pass across roles
// (guest, renter, owner, admin) at 1920x1200 + responsive sweep. Each bug has
// severity / priority / steps / expected / actual / evidence / screenshot.
// Screenshots are read from evidence/screenshots/.
//
// Run: node scripts/generate-bug-report.js

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ImageRun, ShadingType,
} = require("docx");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docreport", "Rentora-Bug-Report.docx");
const SHOTS = path.join(ROOT, "evidence", "screenshots");

const BRAND = "2E7D32";
const FAILC = "C62828";
const WARN = "EF6C00";
const MUTED = "666666";
const sevColor = (s) =>
  /critical/i.test(s) ? "B71C1C" : /high/i.test(s) ? FAILC : /medium/i.test(s) ? WARN : MUTED;

const BUGS = [
  {
    id: "BUG-001",
    title: "User registration crashes with HTTP 500 (mailer scheme misconfiguration)",
    severity: "Critical", priority: "P1", module: "Authentication / Onboarding", role: "Guest → Renter",
    pre: "App running; guest on /register with valid form data.",
    steps: [
      "Open http://127.0.0.1:8000/register",
      "Fill Full Name, Email, Phone (01XXXXXXXXX), Password, Confirm Password",
      "Select ‘Find a rental’, accept Terms",
      "Click ‘Create account’",
    ],
    expected: "Account is created, the user is logged in, and redirected to the email-verification notice.",
    actual:
      "The user row IS inserted, but event(new Registered($user)) throws Symfony Mailer UnsupportedSchemeException: " +
      "“The \"tls\" scheme is not supported; supported schemes for mailer \"smtp\" are: \"smtp\", \"smtps\".” The request " +
      "returns HTTP 500, Auth::login() never runs, and the user is left on a stack-trace page. Combined with BUG-002 this " +
      "blocks 100% of renter self-onboarding.",
    evidence: "RegisteredUserController.php:45 event(new Registered($user)) → EsmtpTransportFactory. DB log confirms the user INSERT succeeded before the crash.",
    shot: "BUG-001-registration-500.png", w: 560, h: 320,
  },
  {
    id: "BUG-002",
    title: "Debug mode exposes full stack traces, file paths and SQL to end users",
    severity: "High", priority: "P1", module: "Platform / Security Hardening", role: "Any",
    pre: "Any unhandled server error (e.g. trigger BUG-001).",
    steps: ["Trigger a server-side error (submit the registration form)", "Observe the error response rendered to the browser"],
    expected: "A generic, branded HTTP 500 page with no internal detail.",
    actual:
      "Laravel/Ignition debug page is shown with framework version, full exception trace, source file paths " +
      "(app/Http/Controllers/...), middleware names, and the executed SQL including the inserted user’s email and bcrypt " +
      "hash. Sensitive information disclosure (APP_DEBUG=true in a reachable environment).",
    evidence: "Rendered page includes ‘LARAVEL 13.12.0’, ‘PHP 8.3.6’, stack frames and the insert-into-users SQL with the user email + hash.",
    shot: "BUG-002-stacktrace-leak.png", w: 560, h: 320,
  },
  {
    id: "BUG-003",
    title: "Price-range filter on /search never renders — 20 JS console errors",
    severity: "High", priority: "P2", module: "Search & Discovery", role: "Guest / Renter",
    pre: "Guest on http://127.0.0.1:8000/search (desktop, tablet or mobile).",
    steps: [
      "Open /search",
      "Scroll to the ‘Monthly Rent (৳)’ filter in the sidebar",
      "Open the browser developer console",
    ],
    expected: "A dual-handle price slider renders with live ৳ min/max labels and filters results by rent.",
    actual:
      "Only the ‘Monthly Rent (৳)’ heading renders; the slider is absent (input[type=range] count = 0). The inline Alpine.js " +
      "x-data component fails to compile (SyntaxError: Invalid or unexpected token at app-Dumc3-yK.js), so every binding throws " +
      "ReferenceError: fmt / lower / upper / loPct / hiPct is not defined — 20 console errors + 20 warnings on every render. " +
      "‘fmt’ is referenced by the markup but never defined in the component. Renters cannot filter by budget from the UI. " +
      "Reproduced at 1920×1200, 768 and 375.",
    evidence: "Console: SyntaxError at app-Dumc3-yK.js:5:727; ReferenceError: fmt is not defined (×6), loPct (×4), lower/upper/hiPct. input[type=range].length === 0.",
    shot: "BUG-003-search-1920x1200.png", w: 560, h: 310,
    shot2: "BUG-003-slider-gap.png", w2: 250, h2: 390,
    cap2: "Sidebar close-up: the blank gap under “Monthly Rent (৳)” where the slider should be.",
  },
  {
    id: "BUG-004",
    title: "Search filters silently accept invalid input instead of validating it",
    severity: "Low", priority: "P3", module: "Search & Discovery", role: "Guest / Renter",
    pre: "Guest on http://127.0.0.1:8000/search.",
    steps: [
      "Open /search?min_price=-100 (negative)",
      "Open /search?min_price=abc (non-numeric)",
      "Open /search?max_price=0 (zero ceiling)",
      "Read the ‘N rentals found’ counter for each",
    ],
    expected: "Invalid / out-of-range filter values are rejected or normalised with visible feedback (e.g. ignored AND flagged, or HTTP 422).",
    actual:
      "All three return HTTP 200 and silently drop the filter: min_price=-100 and min_price=abc each return the full catalogue " +
      "(8 of 8), and max_price=0 is treated as ‘no maximum’ (8 of 8) rather than ‘rent ≤ 0’. The query string still carries the " +
      "bogus value, so the result set contradicts the apparent filter with no message. Graceful (no crash) but unvalidated.",
    evidence: "Probed live: min_price=-100 → 8 found; min_price=abc → 8 found; max_price=0 → 8 found. Valid boundary min_price=6001 → 7 found.",
    shot: "BUG-004-filter-no-validation.png", w: 560, h: 310,
  },
  {
    id: "BUG-005",
    title: "Admin Users role breakdown does not reconcile with the total",
    severity: "Low", priority: "P4", module: "Admin / Users", role: "Admin",
    pre: "Logged in as admin at http://localhost:8000/admin/users.",
    steps: ["Open Admin → Users", "Read the count summary under the page title"],
    expected: "The role breakdown reconciles with the stated total (all roles accounted for).",
    actual:
      "Header reads “55 total · 2 owners · 52 renters”, which sums to 54 — the admin account(s) are excluded from the role " +
      "breakdown, so the figures don’t add up. Cosmetic but undermines trust in the dashboard numbers.",
    evidence: "Live read of the Users header: 55 total, 2 owners, 52 renters (2 + 52 = 54).",
    shot: "UI-admin-users.png", w: 560, h: 360,
  },
  {
    id: "BUG-007",
    title: "Photo upload fails platform-wide — endpoint returns HTTP 501 (Cloudinary not configured)",
    severity: "High", priority: "P1", module: "Listings / Media Upload", role: "Admin & Owner (both confirmed live)",
    pre: "Logged in as admin at http://localhost:8000/admin/listings/create; the Photos section ‘Use placeholder image instead’ toggle switched OFF to reveal the dropzone.",
    steps: [
      "Open /admin/listings/create and scroll to ‘Photos’",
      "Turn the ‘Use placeholder image instead’ switch OFF",
      "Click ‘Drop photos here or browse’ and choose a valid landscape image (PNG/JPG/WebP, < 10MB)",
      "Observe the upload network request and the UI",
    ],
    expected: "The image uploads, a thumbnail renders and the counter increments (e.g. ‘1 / 20 uploaded’).",
    actual:
      "Both upload surfaces were confirmed live. Admin: POST /admin/listings/create/images/upload => HTTP 501 Not " +
      "Implemented, banner “Image uploads require Cloudinary configuration.”, counter stuck at 0 / 20. Owner: the full " +
      "10-step wizard was completed to step 7 ‘Photos’ and POST /owner/listings/create/images/upload => HTTP 501, banner " +
      "“Image uploads require Cloudinary configuration — coming soon.” The 501 is a server-wide missing-config condition " +
      "(no CLOUDINARY_* environment), so every image-upload surface is affected. Impact differs by role: the admin form’s " +
      "uploader is hidden behind a default-ON placeholder toggle (perceived as ‘no way to upload’), while the owner wizard " +
      "shows the uploader by default but enforces a ‘minimum 3 photos’ gate — so the 501 hard-blocks owners from " +
      "completing a real-photo listing unless they fall back to the placeholder. Automated as ADM-10 (fails " +
      "deterministically with 501) and ADM-11 (default-ON toggle).",
    evidence: "Admin: [POST] /admin/listings/create/images/upload => 501. Owner: [POST] /owner/listings/create/images/upload => 501 (reached via full wizard, step 7). Banners: ‘…require Cloudinary configuration.’ / ‘…— coming soon.’ Reproduced at maximised 1920×1200.",
    shot: "BUG-007-photo-upload-501.png", w: 540, h: 150,
    cap: "Admin Create Listing — Photos section: 501 after revealing the dropzone (placeholder toggle off).",
    shot2: "BUG-007-owner-photo-501.png", w2: 540, h2: 165,
    cap2: "Owner Add-Listing wizard step 7 — same 501 (“…— coming soon.”), with the ‘minimum 3 required’ gate that blocks completion.",
  },
  {
    id: "BUG-006",
    title: "Header “Browse” link is inconsistent across breakpoints",
    severity: "Trivial", priority: "P4", module: "Public Header / IA", role: "Guest",
    pre: "Guest on http://127.0.0.1:8000 at desktop vs mobile widths.",
    steps: ["Load the home page at 1920px — note the header nav", "Resize to 375px and open the mobile drawer — compare links"],
    expected: "Primary navigation is consistent across breakpoints.",
    actual:
      "The desktop header shows a “Browse” link (→ /search), but the mobile drawer omits it entirely (only Log in / Sign up). " +
      "The destination is already reachable from the hero search, city cards, “View all” links and the footer, so the link is " +
      "redundant on desktop and missing on mobile. (See Recommendation R1 — remove it, or rename to “Search rentals” and add to the drawer.)",
    evidence: "Desktop header nav = [Browse]; mobile drawer links = [Log in, Sign up] (no Browse). Footer already has a full Browse column.",
    shot: "RESP-search-mobile.png", w: 250, h: 540,
  },
];

// --- helpers ---------------------------------------------------------------
const H = (text, level) => new Paragraph({ text, heading: level, spacing: { before: 220, after: 110 } });
const P = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 80 } });
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
function img(file, w = 560, h = 320) {
  const p = path.join(SHOTS, file);
  if (!fs.existsSync(p)) return P(`[screenshot ${file} not found]`, { italics: true, color: "888888" });
  return new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(p), transformation: { width: w, height: h } })],
    spacing: { after: 60 },
  });
}

const children = [];

// --- Cover -----------------------------------------------------------------
children.push(new Paragraph({
  children: [new TextRun({ text: "Rentora — Bug Report", bold: true, size: 46, color: BRAND })],
  alignment: AlignmentType.CENTER, spacing: { after: 80 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "Defects from End-to-End Testing (Guest · Renter · Owner · Admin)", size: 24, color: "555555" })],
  alignment: AlignmentType.CENTER, spacing: { after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "Playwright-MCP live analysis · Desktop 1920×1200 maximised + Responsive (768 / 375) · 27 Jun 2026", size: 18, color: "888888" })],
  alignment: AlignmentType.CENTER, spacing: { after: 220 },
}));

// --- Summary ---------------------------------------------------------------
children.push(H("Summary", HeadingLevel.HEADING_1));
const sevCount = (re) => BUGS.filter((b) => re.test(b.severity)).length;
children.push(P(
  `${BUGS.length} defects were captured across all roles. Three are release-blockers (registration crash, debug-mode ` +
  `disclosure and platform-wide photo-upload failure). The single broken /search price-slider component is responsible ` +
  `for both the missing budget filter and all 20 console errors on that page. Photo upload is broken everywhere a user ` +
  `adds a listing because the server has no Cloudinary configuration (HTTP 501).`));
children.push(table([
  headerRow(["Severity", "Count", "IDs"]),
  new TableRow({ children: [cell("Critical", { color: "B71C1C", bold: true }), cell(String(sevCount(/critical/i)), { align: AlignmentType.CENTER }), cell("BUG-001")] }),
  new TableRow({ children: [cell("High", { color: FAILC, bold: true }), cell(String(sevCount(/high/i)), { align: AlignmentType.CENTER }), cell("BUG-002, BUG-003, BUG-007")] }),
  new TableRow({ children: [cell("Low", { color: MUTED }), cell(String(sevCount(/low/i)), { align: AlignmentType.CENTER }), cell("BUG-004, BUG-005")] }),
  new TableRow({ children: [cell("Trivial", { color: MUTED }), cell(String(sevCount(/trivial/i)), { align: AlignmentType.CENTER }), cell("BUG-006")] }),
]));
// test execution (this headed rerun)
children.push(H("Test execution — headed rerun (1920×1200)", HeadingLevel.HEADING_2));
children.push(P(
  "The full automated suite was re-run in the live headed browser at a maximised 1920×1200 window to match the current " +
  "configuration. 161 of 165 tests passed (98%) in 3.9 minutes. Of the 4 failures, three are app defects (BUG-003 ×2 and " +
  "the newly-added BUG-007) and one is a test-data artefact, not an application bug.", {}));
children.push(table([
  headerRow(["Result", "Count"]),
  new TableRow({ children: [cell("Passed", { color: "2E7D32", bold: true }), cell("161", { color: "2E7D32", bold: true, align: AlignmentType.CENTER })] }),
  new TableRow({ children: [cell("Failed", { color: FAILC, bold: true }), cell("4", { color: FAILC, bold: true, align: AlignmentType.CENTER })] }),
  new TableRow({ children: [cell("Total", { bold: true }), cell("165", { bold: true, align: AlignmentType.CENTER })] }),
]));
children.push(table([
  headerRow(["Failed test", "Classification", "Maps to"]),
  new TableRow({ children: [cell("ADM-10 admin photo upload succeeds (no Cloudinary 501)"), cell("App defect", { color: FAILC }), cell("BUG-007")] }),
  new TableRow({ children: [cell("SRCH-01 price-range slider renders and is operable"), cell("App defect", { color: FAILC }), cell("BUG-003")] }),
  new TableRow({ children: [cell("SRCH-02 no JavaScript console errors on /search"), cell("App defect", { color: FAILC }), cell("BUG-003")] }),
  new TableRow({ children: [cell("AUTH-12 unverified renter gated at /verify-email"), cell("Test-data / config (not an app bug)", { color: WARN }), cell("Env note below")] }),
]));
children.push(P(
  "AUTH-12 note: the test signs in as the configured renter and expects the /verify-email gate, but .env contains a " +
  "duplicate RENTER_EMAIL — the last value (a verified account) overrides the intended unverified renter " +
  "(qa.renter1@rentora.test), so login lands on /renter/dashboard instead. Fix: remove the duplicate RENTER_EMAIL/" +
  "RENTER_PASSWORD pair from .env so the unverified seed account is used. No application change required.",
  { italics: true, color: MUTED }));

// index table
children.push(H("Defect index", HeadingLevel.HEADING_2));
children.push(table([
  headerRow(["ID", "Title", "Severity", "Role"]),
  ...BUGS.map((b) => new TableRow({ children: [
    cell(b.id, { bold: true }), cell(b.title), cell(b.severity, { color: sevColor(b.severity), bold: true }), cell(b.role),
  ] })),
]));

// --- Detail per bug --------------------------------------------------------
children.push(H("Defect Details", HeadingLevel.HEADING_1));
for (const b of BUGS) {
  children.push(new Paragraph({
    children: [new TextRun({ text: `${b.id} — ${b.title}`, bold: true, size: 26, color: sevColor(b.severity) })],
    spacing: { before: 240, after: 80 },
  }));
  children.push(table([
    new TableRow({ children: [
      cell("Severity", { bold: true, fill: "F2F2F2", width: 18 }), cell(b.severity, { color: sevColor(b.severity), bold: true }),
      cell("Priority", { bold: true, fill: "F2F2F2", width: 14 }), cell(b.priority),
    ] }),
    new TableRow({ children: [
      cell("Module", { bold: true, fill: "F2F2F2" }), cell(b.module),
      cell("Role", { bold: true, fill: "F2F2F2" }), cell(b.role),
    ] }),
  ]));
  children.push(P("Preconditions:", { bold: true }));
  children.push(P(b.pre));
  children.push(P("Steps to Reproduce:", { bold: true }));
  b.steps.forEach((s, i) => children.push(new Paragraph({ text: `${i + 1}. ${s}`, spacing: { after: 30 } })));
  children.push(P("Expected Result:", { bold: true }));
  children.push(P(b.expected));
  children.push(P("Actual Result:", { bold: true, color: FAILC }));
  children.push(P(b.actual));
  children.push(P("Supporting Evidence:", { bold: true }));
  children.push(P(b.evidence, { italics: true }));
  children.push(P("Screenshot:", { bold: true }));
  children.push(img(b.shot, b.w, b.h));
  if (b.shot2) {
    children.push(img(b.shot2, b.w2, b.h2));
    if (b.cap2) children.push(new Paragraph({ children: [new TextRun({ text: b.cap2, italics: true, size: 16, color: MUTED })], spacing: { after: 120 } }));
  }
}

const doc = new Document({ creator: "Rentora QA Automation", title: "Rentora Bug Report", sections: [{ children }] });
fs.mkdirSync(path.dirname(OUT), { recursive: true });
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log(`Wrote ${OUT} (${(buf.length / 1024).toFixed(0)} KB) — ${BUGS.length} defects`);
});
