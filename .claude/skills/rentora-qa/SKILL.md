---
name: rentora-qa
description: End-to-end senior-QA workflow for Rentora — analyse the live app with Playwright MCP, derive and record test cases in Excel, automate them as POM specs, execute, and produce the Word test report. Use when asked to "analyse the app", "generate test cases from the application", "do a full QA pass", "produce a test report", or "do a boundary / equivalence-partitioning / BVA / edge-case pass".
user-invocable: true
allowed-tools: Bash Read Edit Write
---

# Rentora QA — Analyse → Excel → Automate → Report

Behave like a senior QA engineer: understand the system before writing tests,
then automate and report. Always use the **Playwright MCP server**
(`browser_navigate` + `browser_snapshot`) for live analysis.

## Phase 0 — Mandatory Website Analysis (MUST run before any code generation)
**Before generating ANY test cases or automation code, you MUST:**

1. **Analyze the website** using the Playwright MCP Server (`browser_navigate` + `browser_snapshot`).
2. **Explore every page** in the relevant portal(s) — understand the complete user journey end-to-end.
3. **Verify actual UI elements**, locators, and business workflows from the live DOM — never guess or assume.
4. **Understand the application's business logic** — roles, permissions, state machines, validation rules, error handling.
5. **Generate test cases and automation code ONLY after completing full website analysis.**
6. **Validate** that the generated test cases cover the actual functionality and E2E workflows observed.

> This rule is MANDATORY. Do not skip analysis. Do not assume you know the UI.
> The Playwright MCP server is configured in `.mcp.json` at the project root.

## Phase 0a — Browser size (always)
**Run the desktop pass full-screen in a maximised window, then sweep responsive.**
The window must actually fill the monitor — a *fixed* `viewport` emulates a box
and detaches the window from the screen, so it never maximises. Use
`viewport: null` + `--start-maximized` instead (with `--window-size=1920,1200`
as the headless/CI fallback). This is already wired in:
- `playwright.config.js` → `use: { viewport: null, launchOptions: { args:
  ["--start-maximized", "--window-size=1920,1200"] } }`.
- `playwright-mcp.config.json` (referenced from `.mcp.json` via `--config`) →
  `launchOptions.args` start-maximized + `contextOptions.viewport: null`.

Do **not** call `browser_resize` on the desktop pass — `setViewportSize` is what
shrinks the window. Only resize for the responsive sweep (tablet 768×1024,
mobile 375×812), then the screenshots/specs cover both. Roles to log in with come
from `config/env.config.js` (admin / owner1 / owner2 / renter).

## Phase 1 — Analyse (Playwright MCP)
Explore every portal and role before writing any test case:
- Public/Renter (`http://127.0.0.1:8000`): home, `/search` (+ console errors),
  property detail, register, login, verify-email.
- Owner (`/owner/*`, login `owner1@rentora.test`): dashboard, my listings,
  10-step Add-Listing wizard (step 7 = **Photos**), messages, profile.
- Admin (`http://localhost:8000/admin/*`, `admin@rentora.com.bd`): dashboard,
  Review Queue, **Add Listing → Photos (image upload)**, Users (ban), NID Verify.
Capture: roles & permissions, the owner→admin→publish flow, validations,
console errors, and any server errors (e.g. the photo-upload `/images/upload`
**HTTP 501 — Cloudinary not configured**, BUG-007). Create test users as needed.

## Phase 2 — Record test cases
**Check existing first.** Before writing anything, grep `data/testcases.js` and
`tests/*.spec.js` for what already covers the target technique (e.g. existing
EP/BVA/edge cases: `AUTH-07` phone BVA, `OWN-06` rent BVA, `SRCH-04` bedrooms EP,
`GUEST-10` no-match edge). Do not duplicate — only add the missing cases, and
when you automate a previously-manual one note "mirrors manual <ID>" in its
description.

Add/maintain cases in `data/testcases.js` (grouped by module). Cover positive,
negative, edge, BVA, equivalence partitioning, permission, validation, UI,
integration, E2E, security, error handling. Then:
```bash
node scripts/generate-excel.js   # -> excel/Rentora-Testcases.xlsx
```
The generator preserves every existing sheet and appends a new sheet per module,
so adding a module never disturbs prior cases.

### Phase 2b — Equivalence Partitioning (EP) + Boundary Value Analysis (BVA)
When the task asks for a "thorough" / "EP / BVA / boundary / edge-case" pass,
treat it as a first-class deliverable in its own `BoundaryEquivalence` module
(own Excel sheet + own `tests/boundary-equivalence.spec.js`). Target the two
richest input surfaces:
- **/search filter query params** — `min_price`/`max_price` (boundaries are
  *inclusive*: e.g. `min_price=6000` keeps the ৳6,000 listing, `6001` drops it;
  `max_price=0` means "no upper bound", not "rent ≤ 0"), `bedrooms` (X+
  partitions), `type[]` / `for_whom` / `furnishing[]` partitions, plus edge
  inputs: inverted range, negative, non-numeric, no-match (`q=Zzzzzz`).
- **/register validation** — password length boundary (min **8**), BD phone
  format EP (`12345` / alphabetic rejected), email format. Submit *invalid*
  values so the server rejects before the mailer event — this avoids BUG-001's
  HTTP 500 and stays deterministic.

**Pin every expected count to the live seed data** — derive boundaries with a
throwaway probe (navigate `/search?<param>` and read the "N rentals found"
counter; sweep values to find the exact inclusive/exclusive edge) *before*
writing the `expected`. Tag each case `technique: bva | ep | edge`. The result
counter renders singular **and** plural — match `/rentals? found/i`.

### Phase 2c — Scaling to many cases (120–220+) without inventing results
When a large case count is wanted, go **data-driven** instead of hand-writing
hundreds of objects:
1. A matrix probe enumerates every partition/boundary and records the *live*
   result count → `data/search-matrix.json` (price table per seeded rent ±1,
   `type[]`, `for_whom`, `furnishing[]`, `amenities[]` ×N, combined filters) and
   the register/login invalid-input probes → `data/form-validation.json`
   (**keep only inputs the app actually rejects/blocks**; drop any that slip
   through and 500 via BUG-001 — that pollutes the DB and isn't a clean negative).
2. `data/testcases.js` reads those JSON files and *generates* the `SearchMatrix`
   and `FormValidation` modules (and exports `SEARCH_MATRIX` / `FORM_CASES`).
3. Parametrized specs (`tests/search-matrix.spec.js`, `tests/form-validation.spec.js`)
   loop the exported arrays — one source of truth keeps TC IDs ↔ assertions in
   sync. Each register negative keeps exactly **one** field invalid so the
   assertion isolates that field.

Every valid registration the suite submits (AUTH-01/02) inserts a user *before*
BUG-001's 500, so the users table grows across runs — keep admin/users specs
**pagination-robust** (search by email / filter by role, never assume page 1).

## Phase 3 — Automate (POM)
Follow `codebase-rules`: locators in `pages/`, logic in `actions/`, assertions in
`tests/`. Each test calls `result.for(<sheet>, <tcId>, <detail>)` so the Excel
Actual Result column is written on teardown. Sheet name = module name.

## Phase 4 — Execute
```bash
rm -f excel/results/*.xlsx
rtk proxy npx playwright test   # config reporters fire -> evidence/results.json + html
```
**rtk caveat:** plain `rtk npx playwright test` injects rtk's compact reporter,
which replaces the config reporters and never writes `evidence/results.json`
(the report then reads a stale file). Run the suite through **`rtk proxy`** (raw,
unfiltered) so the JSON reporter writes the artifact. Do **not** pass
`--reporter=...` either — a CLI override drops the config's `outputFile` and
sends JSON to stdout instead of the file.

After the run, sanity-check the artifact reflects this run (mtime is fresh, total
== number of automated cases) before reporting. Failure screenshots land in
`test-results/`; copy bug evidence into `evidence/screenshots/` named
`BUG-00N-...png`.

## Phase 5 — Report (three deliverables, always regenerate all three)
There are **three** Word reports, each from its own data-driven generator. When a
QA pass changes findings, update the relevant data array(s) and regenerate **all
three** so they stay consistent — never leave one stale.

1. **Bug report** — defects only. Edit the `BUGS` array in
   `scripts/generate-bug-report.js` (id, severity, priority, steps, expected,
   actual, evidence, `shot`/`shot2` from `evidence/screenshots/`); keep the
   summary counts + defect index in sync. → `docreport/Rentora-Bug-Report.docx`.
2. **Recommendations report** — improvements. Add an `R#` to the at-a-glance
   table and a matching section in `scripts/generate-recommendations.js`; its
   screenshots live in `evidence/recommendations/` (copy any shared bug shot in).
   → `docreport/Rentora-Recommendations.docx`.
3. **Test report** — the full QA writeup (BUGS / RECOMMENDATIONS / RISKS) in
   `scripts/generate-report.js`. → `docreport/Rentora-Test-Report.docx`.
4. **Role-based report** — coverage + verdict per role (Guest / Renter / Owner /
   Admin + cross-role). `scripts/generate-role-report.js` reads `data/testcases.js`
   + `evidence/results.json` and a `ROLES` model (module→role map, surfaces, bugs).
   When a module or bug changes, update its `ROLES` entry. → `docreport/Rentora-Role-Based-Report.docx`.

```bash
rtk proxy node scripts/generate-bug-report.js
rtk proxy node scripts/generate-recommendations.js
rtk proxy node scripts/generate-report.js
rtk proxy node scripts/generate-role-report.js
```
Each new defect = a TC in `data/testcases.js` **and** a `BUGS` entry **and**
(usually) a recommendation. Run the desktop pass maximised + a responsive sweep
and cite the viewport in the cover line. **Remove superseded reports** — keep one
canonical file per type (`Rentora-Bug-Report.docx`, `Rentora-Recommendations.docx`,
`Rentora-Test-Report.docx`); delete stale/duplicate docx (e.g. an old
`Test-Report.docx`) so `docreport/` never accumulates outdated copies.

## Deliverables
Excel test cases · automated specs · `evidence/results.json` + screenshots ·
`docreport/Rentora-Bug-Report.docx` · `docreport/Rentora-Recommendations.docx` ·
`docreport/Rentora-Test-Report.docx` · `docreport/Rentora-Role-Based-Report.docx`.

## After failures
Invoke `/self-heal`; re-run only the previously failing tests to confirm fixes.
Distinguish **app defects** (keep as failing evidence) from **test defects**
(fix the locator/spec).
