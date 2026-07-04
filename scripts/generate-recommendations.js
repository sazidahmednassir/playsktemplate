// Generates docreport/Rentora-Recommendations.docx
//
// A recommendations report from a live Playwright-MCP E2E pass across all roles
// (guest, renter, owner, admin) at full-screen 1920x1080 plus a responsiveness
// sweep at tablet (768) and mobile (375). Screenshots live in
// evidence/recommendations/.
//
// Run: node scripts/generate-recommendations.js

const fs = require("fs");
const path = require("path");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ImageRun, ShadingType,
} = require("docx");

const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "docreport", "Rentora-Recommendations.docx");
const SHOTS = path.join(ROOT, "evidence", "recommendations");

// --- branding / helpers ----------------------------------------------------
const BRAND = "2E7D32";
const FAILC = "C62828";
const WARN = "EF6C00";
const OKC = "2E7D32";
const MUTED = "666666";

const H = (text, level) => new Paragraph({ text, heading: level, spacing: { before: 240, after: 120 } });
const P = (text, opts = {}) =>
  new Paragraph({ children: [new TextRun({ text, ...opts })], spacing: { after: 80 } });
const bullet = (text, opts = {}) =>
  new Paragraph({ children: [new TextRun({ text, ...opts })], bullet: { level: 0 }, spacing: { after: 40 } });
const numbered = (text, ref) =>
  new Paragraph({ children: [new TextRun({ text })], numbering: { reference: ref, level: 0 }, spacing: { after: 40 } });

function cell(text, { bold = false, color, fill, width, align } = {}) {
  return new TableCell({
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    children: [new Paragraph({
      alignment: align,
      children: [new TextRun({ text: String(text), bold, color })],
    })],
  });
}
function headerRow(labels) {
  return new TableRow({
    tableHeader: true,
    children: labels.map((l) => cell(l, { bold: true, color: "FFFFFF", fill: BRAND })),
  });
}
function table(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: ["top", "bottom", "left", "right", "insideHorizontal", "insideVertical"].reduce((a, k) => {
      a[k] = { style: BorderStyle.SINGLE, size: 1, color: "BBBBBB" };
      return a;
    }, {}),
    rows,
  });
}
function img(file, w = 560, h = 315) {
  const p = path.join(SHOTS, file);
  if (!fs.existsSync(p)) return P(`[screenshot ${file} not found]`, { italics: true, color: "888888" });
  return new Paragraph({
    children: [new ImageRun({ type: "png", data: fs.readFileSync(p), transformation: { width: w, height: h } })],
    spacing: { after: 60 },
  });
}
const caption = (t) =>
  new Paragraph({ children: [new TextRun({ text: t, italics: true, size: 16, color: MUTED })], spacing: { after: 160 } });
const code = (t) =>
  new Paragraph({ children: [new TextRun({ text: t, font: "Consolas", size: 16, color: "333333" })], spacing: { after: 20 } });

// chip-style label (Severity / priority)
function metaTable(pairs) {
  return table([
    new TableRow({
      children: pairs.map(([k]) => cell(k, { bold: true, color: "FFFFFF", fill: "455A64" })),
    }),
    new TableRow({
      children: pairs.map(([, v]) => cell(v)),
    }),
  ]);
}

const children = [];

// --- Cover -----------------------------------------------------------------
children.push(new Paragraph({
  children: [new TextRun({ text: "Rentora — UI/UX Recommendations Report", bold: true, size: 46, color: BRAND })],
  alignment: AlignmentType.CENTER, spacing: { after: 80 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "End-to-End Testing across Guest, Renter, Owner & Admin roles", size: 24, color: "555555" })],
  alignment: AlignmentType.CENTER, spacing: { after: 40 },
}));
children.push(new Paragraph({
  children: [new TextRun({ text: "Playwright-MCP live analysis · Desktop 1920×1200 maximised + Responsive (768 / 375) · 27 Jun 2026", size: 18, color: "888888" })],
  alignment: AlignmentType.CENTER, spacing: { after: 240 },
}));

// --- 1. Scope --------------------------------------------------------------
children.push(H("1. Scope & Test Environment", HeadingLevel.HEADING_1));
children.push(P(
  "The live application was driven end-to-end with the Playwright MCP browser across every role. " +
  "The desktop pass ran full-screen at a maximised 1920×1200 window; a responsiveness sweep was then run at tablet " +
  "(768×1024) and mobile (375×812). This report contains the targeted recommendations for this cycle " +
  "(remove Browse from the header, fix the search sidebar filter, clear the console report, update the admin UI, " +
  "and configure Cloudinary so photo upload works), plus the responsiveness findings."));
children.push(table([
  headerRow(["Item", "Detail"]),
  new TableRow({ children: [cell("Renter / Owner host", { bold: true }), cell("http://127.0.0.1:8000")] }),
  new TableRow({ children: [cell("Admin host", { bold: true }), cell("http://localhost:8000/admin/dashboard")] }),
  new TableRow({ children: [cell("Roles exercised", { bold: true }), cell("Guest · Renter · Owner (owner1@rentora.test) · Admin (admin@rentora.com.bd)")] }),
  new TableRow({ children: [cell("Viewports", { bold: true }), cell("Desktop 1920×1080 · Tablet 768×1024 · Mobile 375×812")] }),
  new TableRow({ children: [cell("Seed data", { bold: true }), cell("8 approved listings · 55 users · 2 owners")] }),
]));

children.push(H("1.1 Recommendations at a glance", HeadingLevel.HEADING_2));
children.push(table([
  headerRow(["#", "Recommendation", "Area", "Priority"]),
  new TableRow({ children: [cell("R1"), cell("Remove “Browse” from the header"), cell("Public header / IA"), cell("Low", { color: MUTED })] }),
  new TableRow({ children: [cell("R2"), cell("Fix the /search sidebar “Monthly Rent” price slider"), cell("Search & Discovery"), cell("High", { color: FAILC, bold: true })] }),
  new TableRow({ children: [cell("R3"), cell("Clear the 20 console errors on /search"), cell("Front-end health"), cell("High", { color: FAILC, bold: true })] }),
  new TableRow({ children: [cell("R4"), cell("Update / polish the Admin UI"), cell("Admin portal"), cell("Medium", { color: WARN })] }),
  new TableRow({ children: [cell("R5"), cell("Responsiveness refinements (tablet / mobile)"), cell("Cross-cutting"), cell("Medium", { color: WARN })] }),
  new TableRow({ children: [cell("R6"), cell("Configure Cloudinary & surface the photo uploader by default"), cell("Listings / Media"), cell("High", { color: FAILC, bold: true })] }),
]));

// --- 2. R1 — Remove Browse -------------------------------------------------
children.push(H("2. R1 — Remove “Browse” from the header", HeadingLevel.HEADING_1));
children.push(metaTable([["Area", "Public header / Information Architecture"], ["Priority", "Low"], ["Effort", "Trivial (1 template edit)"], ["Status", "Confirmed live"]]));
children.push(P("Finding", { bold: true, size: 24 }));
children.push(P(
  "The global header renders a single primary navigation link, “Browse” (→ /search), next to the Rentora brand and the " +
  "Log in / Sign up actions. Its destination is already reachable from several more prominent places, so the link adds " +
  "navigational noise without adding a new destination."));
children.push(img("REC-01-header-browse-fullscreen.png", 580, 90));
children.push(caption("REC-01 — Desktop header at 1920×1080: “Browse” sits between the brand and the auth actions."));
children.push(P("Why remove it", { bold: true }));
[
  "Redundant destination — the hero search bar, the “Find a rental” CTA, the city cards, every “View all” link and the footer “Browse” column all already route to /search.",
  "“Browse” is a vague label; the prominent hero search communicates the same intent more clearly.",
  "Inconsistent across breakpoints — the mobile drawer does NOT include “Browse” (it shows only Log in / Sign up), so the link only exists on desktop. Removing it makes the header consistent everywhere.",
  "A cleaner top bar (brand + auth only) sharpens the primary call-to-action for guests: sign up / log in.",
].forEach((t) => children.push(bullet(t)));
children.push(P("Recommendation", { bold: true }));
children.push(bullet("Remove the “Browse” link from the desktop top navigation (the <nav> inside the banner)."));
children.push(bullet("Keep discovery via the hero search, the “Find a rental” CTA and the footer “Browse” column."));
children.push(bullet("If a top-level discovery link is still wanted, rename it to “Search rentals” and add it to the mobile drawer too, so desktop and mobile match."));

// --- 3. R2 — Sidebar filter ------------------------------------------------
children.push(H("3. R2 — Fix the /search sidebar “Monthly Rent” price filter", HeadingLevel.HEADING_1));
children.push(metaTable([["Area", "Search & Discovery"], ["Priority", "High"], ["Severity", "Functional defect"], ["Linked bug", "BUG-003"]]));
children.push(P("Finding", { bold: true, size: 24 }));
children.push(P(
  "In the Filters sidebar on /search, the “Monthly Rent (৳)” section renders only its heading — the dual-handle price " +
  "slider never appears. A live DOM probe returns zero range inputs (document.querySelectorAll('input[type=range]').length === 0). " +
  "Reproduced at desktop, tablet and mobile. Renters therefore have no UI control to filter by budget, a primary rental " +
  "search dimension."));
children.push(img("REC-02-search-sidebar-cropped.png", 300, 470));
children.push(caption("REC-02 — Filters sidebar: the gap under “Monthly Rent (৳)” is where the slider should render. Every other filter (Type, Suitable For, Bedrooms, Furnishing, Amenities) renders correctly."));
children.push(P("Root cause", { bold: true }));
children.push(P(
  "The price filter is an Alpine.js component declared inline via a multi-line x-data attribute that defines " +
  "min/max/step/lower/upper plus getters loPct/hiPct and methods snap()/startDrag(). The compiled bundle " +
  "(build/assets/app-Dumc3-yK.js) throws a SyntaxError while compiling that expression in a new AsyncFunction, so the " +
  "component never initialises. Consequently every binding that reads its scope throws ReferenceError. Note the markup " +
  "also calls fmt(...) which is not defined anywhere in the x-data object — so even after the SyntaxError is fixed, " +
  "‘fmt is not defined’ will remain."));
children.push(code("x-data=\"{ min:6000, max:35000, step:1000, lower:6000, upper:35000,"));
children.push(code("          get loPct(){...}, get hiPct(){...}, snap(v){...}, startDrag(h,e){...} }\""));
children.push(code("// referenced by bindings but never defined → fmt(lower), fmt(upper), fmt(min), fmt(max)"));
children.push(P("Recommendation", { bold: true }));
children.push(bullet("Move the slider out of the inline x-data into a registered Alpine.data('priceSlider', () => ({...})) factory in a source module, then rebuild the asset — inline multi-line x-data with getters is exactly what the SyntaxError points at."));
children.push(bullet("Define the missing fmt currency helper on the component scope (or as an Alpine.magic('fmt')).", {}));
children.push(bullet("Add a no-JS fallback: two numeric min/max inputs bound to min_price / max_price so budget filtering still works if Alpine fails to boot."));
children.push(bullet("Add data-testid on the slider handles so the regression suite can assert it renders."));
children.push(P("Note: the server-side filter itself works (e.g. /search?min_price=6001 → 7 of 8 results). Only the on-page control is missing.", { italics: true, color: MUTED }));

// --- 4. R3 — Console report ------------------------------------------------
children.push(H("4. R3 — Console report: eliminate the 20 errors on /search", HeadingLevel.HEADING_1));
children.push(metaTable([["Area", "Front-end health"], ["Priority", "High"], ["Count", "20 errors + 20 warnings"], ["Scope", "/search only"]]));
children.push(P("Finding", { bold: true, size: 24 }));
children.push(P(
  "Loading /search prints 20 console errors and 20 warnings on every render. All of them originate from the broken " +
  "price-slider component (same root cause as R2). The home, owner and admin pages are clean (0 console errors), so the " +
  "problem is isolated to /search. Because the errors fire on every Alpine effect re-evaluation — not once — they waste " +
  "CPU and bury any genuine future errors in noise."));
children.push(P("Console error breakdown (captured live):", { bold: true }));
children.push(table([
  headerRow(["Error", "Count", "Origin"]),
  new TableRow({ children: [cell("SyntaxError: Invalid or unexpected token"), cell("2", { align: AlignmentType.CENTER }), cell("AsyncFunction compile of price x-data")] }),
  new TableRow({ children: [cell("ReferenceError: fmt is not defined"), cell("6", { align: AlignmentType.CENTER }), cell("fmt(lower/upper/min/max) bindings")] }),
  new TableRow({ children: [cell("ReferenceError: loPct is not defined"), cell("4", { align: AlignmentType.CENTER }), cell(":style track / handle position")] }),
  new TableRow({ children: [cell("ReferenceError: lower is not defined"), cell("2", { align: AlignmentType.CENTER }), cell("x-text lower label")] }),
  new TableRow({ children: [cell("ReferenceError: upper is not defined"), cell("2", { align: AlignmentType.CENTER }), cell("x-text upper label")] }),
  new TableRow({ children: [cell("ReferenceError: hiPct is not defined"), cell("2", { align: AlignmentType.CENTER }), cell(":style handle position")] }),
  new TableRow({ children: [cell("Total", { bold: true }), cell("20", { bold: true, align: AlignmentType.CENTER }), cell("All from the one slider component")] }),
]));
children.push(img("REC-02-search-sidebar-fullpage.png", 560, 360));
children.push(caption("REC-02 (full page) — /search renders fine visually, but the page header reports “20 errors, 20 warnings”; the slider area is blank."));
children.push(P("Recommendation", { bold: true }));
children.push(bullet("Fixing R2 removes all 20 errors — they share one root cause."));
children.push(bullet("Keep the existing console-health spec as a CI regression gate: assert zero console errors on /search."));
children.push(bullet("Add a client-side error monitor (e.g. Sentry) in staging so build-time bundle breakages are caught before release."));

// --- 5. R4 — Admin UI ------------------------------------------------------
children.push(H("5. R4 — Update the Admin UI", HeadingLevel.HEADING_1));
children.push(metaTable([["Area", "Admin portal"], ["Priority", "Medium"], ["Console", "0 errors"], ["Responsive", "Yes"]]));
children.push(P("Finding", { bold: true, size: 24 }));
children.push(P(
  "The admin portal (Dashboard, Review Queue, Add Listing, Users, Messages, NID Verify) is functional, clean and " +
  "responsive, with no console errors. The items below are polish / usability improvements, not blockers."));
children.push(img("REC-04-admin-dashboard.png", 560, 300));
children.push(caption("REC-04 — Admin dashboard: KPI cards + FIFO review queue. Note “39 New users today”, inflated by automated test accounts."));
children.push(img("REC-04b-admin-users.png", 560, 360));
children.push(caption("REC-04b — Users table: search, role filter, banned-only filter, pagination (55 users). Header reads “55 total · 2 owners · 52 renters” (= 54; admins omitted)."));
children.push(P("Recommended improvements", { bold: true }));
children.push(table([
  headerRow(["#", "Issue", "Recommendation"]),
  new TableRow({ children: [cell("1"), cell("User-count math: “55 total · 2 owners · 52 renters” sums to 54 — admin accounts excluded."), cell("Show all role buckets (incl. Admins) or relabel “by role (excl. admins)” so the numbers reconcile.")] }),
  new TableRow({ children: [cell("2"), cell("Test-data pollution: dozens of qa.auto.* / qa.sec.* rows and “39 new today” dominate the Users table."), cell("Add a “hide test accounts” toggle (or tag/filter seeded accounts) so real signal isn’t buried.")] }),
  new TableRow({ children: [cell("3"), cell("No user drill-down: the only row action is “Ban”; banned users have no visible “Unban”."), cell("Add a user-detail drawer (listings, messages, NID status) and an Unban action.")] }),
  new TableRow({ children: [cell("4"), cell("No bulk actions / sorting on a growing table (55+ and climbing)."), cell("Add column sort (Joined, Role) and bulk select → ban / export CSV.")] }),
  new TableRow({ children: [cell("5"), cell("Inconsistent CTA labels (“Add Listing” vs “Create Sample”)."), cell("Standardise to a single primary label across dashboard and listings.")] }),
  new TableRow({ children: [cell("6"), cell("Empty states: “No listings found” gives no next step."), cell("Add a helpful empty-state CTA (e.g. “Create a listing” / change filter).")] }),
]));
children.push(img("REC-04c-admin-review-queue.png", 560, 250));
children.push(caption("REC-04c — Review Queue with status tabs (Pending / Approved 8 / Rejected / Draft / Archived / All). Functional; benefits from the empty-state CTA above."));

// --- 5b. R6 — Cloudinary / photo upload ------------------------------------
children.push(H("5b. R6 — Configure Cloudinary & surface the photo uploader", HeadingLevel.HEADING_1));
children.push(metaTable([["Area", "Listings / Media upload"], ["Priority", "High"], ["Severity", "Functional blocker"], ["Linked bug", "BUG-007"]]));
children.push(P("Finding", { bold: true, size: 24 }));
children.push(P(
  "Adding photos to a listing fails for every role — confirmed live on both the admin Create Listing form and the owner " +
  "Add-Listing wizard step 7 (completed end-to-end). POST …/listings/create/images/upload returns HTTP 501 Not " +
  "Implemented with the banner “Image uploads require Cloudinary configuration” (the owner copy adds “— coming soon.”), " +
  "and the counter stays at 0 / 20. The impact differs by role: the admin uploader is hidden behind a default-ON " +
  "“Use placeholder image instead” switch (initial impression: “there is no way to upload images”), whereas the owner " +
  "wizard shows the uploader by default but enforces a “minimum 3 photos” gate — so the 501 hard-blocks owners from " +
  "completing a real-photo listing unless they fall back to the placeholder."));
children.push(img("BUG-007-photo-upload-501.png", 540, 150));
children.push(caption("REC-06 — Photos section: the Cloudinary 501 error after turning the placeholder toggle off and choosing a valid image."));
children.push(P("Root cause", { bold: true }));
children.push(P(
  "The upload endpoint is gated on Cloudinary credentials that are absent in this environment, so it short-circuits with " +
  "501 rather than storing the file. Because it is server configuration (not page code), the failure is platform-wide — " +
  "every image-upload entry point is affected identically."));
children.push(P("Recommendation", { bold: true }));
children.push(bullet("Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET (or the app’s configured driver) in every environment and restart, so /images/upload returns 200 and stores the asset."));
children.push(bullet("If a non-Cloudinary driver is intended for local/dev, wire a local disk fallback so uploads degrade gracefully instead of returning 501."));
children.push(bullet("Default the Photos section to showing the uploader (placeholder OFF), or make the toggle a clearly-labelled secondary choice — don’t hide the primary action behind a default-on switch."));
children.push(bullet("When upload is genuinely unavailable, disable the dropzone and show an inline explanation instead of letting the user pick a file and then fail."));
children.push(bullet("Keep ADM-10 (upload must not 501) as a CI regression gate and ADM-11 (toggle default) as a UI guard."));

// --- 6. Role-wise core-feature verification --------------------------------
children.push(H("6. Role-wise core-feature verification", HeadingLevel.HEADING_1));
children.push(P(
  "Each role’s core journeys were exercised live in the headed browser. Every authenticated surface is clean " +
  "(0 console errors); only the public /search page carries the 20 slider errors (R2/R3). Guest→renter self-registration " +
  "remains blocked by BUG-001 (mailer 500)."));
children.push(table([
  headerRow(["Role", "Core surfaces verified", "Console", "Result"]),
  new TableRow({ children: [
    cell("Guest", { bold: true }),
    cell("Home, /search catalogue, property detail, property-type quick filter, city landing page, 404 handling"),
    cell("20 on /search", { color: FAILC }), cell("Pass*", { color: WARN, bold: true }),
  ] }),
  new TableRow({ children: [
    cell("Renter", { bold: true }),
    cell("/renter/dashboard (Saved · Messages · Verification · Profile), property detail with “Save listing” + “Message Owner”, owner phone PII-gated"),
    cell("0", { color: OKC }), cell("Pass", { color: OKC, bold: true }),
  ] }),
  new TableRow({ children: [
    cell("Owner", { bold: true }),
    cell("/owner/dashboard KPIs, My Listings, 10-step Add-Listing wizard (Continue gated until valid), Profile"),
    cell("0", { color: OKC }), cell("Pass", { color: OKC, bold: true }),
  ] }),
  new TableRow({ children: [
    cell("Admin", { bold: true }),
    cell("/admin/dashboard KPIs, Review Queue (status tabs), Users (search · role filter · ban · pagination), NID Verify, Messages"),
    cell("0", { color: OKC }), cell("Pass", { color: OKC, bold: true }),
  ] }),
]));
children.push(P("* Guest passes functionally; the /search slider defect (R2/R3) is the only blemish on the public path.", { italics: true, color: MUTED }));
children.push(img("ROLE-renter-property-detail.png", 560, 330));
children.push(caption("Renter — property detail: “Save listing” and “Message Owner” available; the owner’s phone is correctly hidden (PII-gated) until contact."));
children.push(img("ROLE-owner-addlisting-step1.png", 560, 300));
children.push(caption("Owner — 10-step Add-Listing wizard (Type → Preview); “Continue” stays disabled until a property type + audience are chosen, and the flow promises save-and-resume."));
children.push(img("ROLE-admin-nid-verify.png", 560, 250));
children.push(caption("Admin — NID Verify queue; loads cleanly with 0 console errors."));

// --- 7. R5 — Responsiveness ------------------------------------------------
children.push(H("7. R5 — Responsiveness findings", HeadingLevel.HEADING_1));
children.push(P(
  "Each surface was re-tested at tablet (768×1024) and mobile (375×812). Overall the responsive behaviour is solid — " +
  "proper breakpoints, collapsing navigation, and no horizontal overflow (admin documentScrollWidth 360 ≤ 375). " +
  "Two nits and one carry-over bug are noted."));
children.push(table([
  headerRow(["Surface", "Desktop 1920", "Tablet 768", "Mobile 375", "Verdict"]),
  new TableRow({ children: [cell("Home (guest)"), cell("Full header"), cell("Hamburger + drawer"), cell("Hamburger + drawer (Alpine OK, 0 errors)"), cell("Pass", { color: OKC, bold: true })] }),
  new TableRow({ children: [cell("Search (guest)"), cell("2-col sidebar + grid"), cell("Sidebar → Filters drawer"), cell("Single col + Filters drawer"), cell("Pass*", { color: WARN, bold: true })] }),
  new TableRow({ children: [cell("Admin"), cell("Fixed sidebar"), cell("Collapses"), cell("Off-canvas drawer, no overflow"), cell("Pass", { color: OKC, bold: true })] }),
  new TableRow({ children: [cell("Renter dashboard"), cell("Sidebar + content"), cell("Reflows"), cell("Sidebar collapses, no overflow (scrollWidth 360)"), cell("Pass", { color: OKC, bold: true })] }),
  new TableRow({ children: [cell("Owner"), cell("Sidebar + content"), cell("—"), cell("Same shell as renter/admin"), cell("Desktop OK", { color: MUTED })] }),
]));
children.push(P("* Search reflows correctly, but the price slider is missing at every breakpoint (R2).", { italics: true, color: MUTED }));
children.push(img("RESP-02-search-mobile-375.png", 250, 540));
children.push(caption("RESP-02 — Search at 375px: sidebar collapses, filters move into a Quick Filter / Filters drawer. Layout reflows cleanly."));
children.push(img("RESP-04b-admin-mobile-nav-open.png", 250, 540));
children.push(caption("RESP-04b — Admin at 375px with the off-canvas nav drawer open; no horizontal overflow."));
children.push(img("RESP-renter-dashboard-375.png", 250, 540));
children.push(caption("Renter dashboard at 375px: sidebar collapses, KPI cards stack, no horizontal overflow."));
children.push(P("Responsiveness recommendations", { bold: true }));
children.push(bullet("Add “Browse”/“Search rentals” to the mobile drawer for parity with desktop (ties to R1)."));
children.push(bullet("Ensure the fixed price-slider (R2) also renders inside the mobile Filters drawer once rebuilt."));
children.push(bullet("Run the owner portal through the same 768 / 375 sweep before release (not deep-tested this cycle)."));

// --- 8. Summary ------------------------------------------------------------
children.push(H("8. Summary", HeadingLevel.HEADING_1));
children.push(P(
  "Two recommendations (R2 + R3) share a single root cause — the broken /search price-slider Alpine component — and " +
  "fixing that one bundle issue resolves both the missing filter and all 20 console errors. R1 is a trivial " +
  "header cleanup, R4 is admin-UI polish, and R5 confirms the responsive layout is healthy bar the carry-over slider bug. " +
  "Defects are itemised with reproduction steps in the companion Bug Report."));
children.push(table([
  headerRow(["Rec", "Effort", "Impact", "Priority"]),
  new TableRow({ children: [cell("R1 Remove Browse"), cell("Trivial"), cell("Cleaner IA / consistency"), cell("Low", { color: MUTED })] }),
  new TableRow({ children: [cell("R2 Fix price slider"), cell("Medium"), cell("Restores budget filtering"), cell("High", { color: FAILC, bold: true })] }),
  new TableRow({ children: [cell("R3 Clear console"), cell("Medium (= R2)"), cell("Front-end health / CI gate"), cell("High", { color: FAILC, bold: true })] }),
  new TableRow({ children: [cell("R4 Admin UI"), cell("Medium"), cell("Admin usability at scale"), cell("Medium", { color: WARN })] }),
  new TableRow({ children: [cell("R5 Responsive"), cell("Low"), cell("Parity / polish"), cell("Medium", { color: WARN })] }),
]));

// --- write -----------------------------------------------------------------
const doc = new Document({
  creator: "Rentora QA Automation",
  title: "Rentora UI/UX Recommendations Report",
  sections: [{ children }],
});

fs.mkdirSync(path.dirname(OUT), { recursive: true });
Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log(`Wrote ${OUT} (${(buf.length / 1024).toFixed(0)} KB)`);
});
