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

## Phase 1 — Analyse (Playwright MCP)
Explore every portal and role before writing any test case:
- Public/Renter (`http://127.0.0.1:8000`): home, `/search` (+ console errors),
  property detail, register, login, verify-email.
- Owner (`/owner/*`, login `owner1@rentora.test`): dashboard, my listings,
  10-step Add-Listing wizard, messages, profile.
- Admin (`http://localhost:8000/admin/*`, `admin@rentora.com.bd`): dashboard,
  Review Queue, Users (ban), NID Verify.
Capture: roles & permissions, the owner→admin→publish flow, validations,
console errors, and any server errors. Create test users as needed.

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

## Phase 5 — Report
Maintain the BUGS / RECOMMENDATIONS / RISKS structures in
`scripts/generate-report.js`, then:
```bash
node scripts/generate-report.js  # -> docreport/Rentora-Test-Report.docx
```
The report contains: Executive Summary, Feature Coverage, Bug Report (with
screenshots), Improvement Recommendations, Risk Assessment, Overall QA Assessment.

## Deliverables
Excel test cases · automated specs · `evidence/results.json` + screenshots ·
`docreport/Rentora-Test-Report.docx`.

## After failures
Invoke `/self-heal`; re-run only the previously failing tests to confirm fixes.
Distinguish **app defects** (keep as failing evidence) from **test defects**
(fix the locator/spec).
