---
name: rentora-qa
description: End-to-end senior-QA workflow for Rentora — analyse the live app with Playwright MCP, derive and record test cases in Excel, automate them as POM specs, execute, and produce the Word test report. Use when asked to "analyse the app", "generate test cases from the application", "do a full QA pass", or "produce a test report".
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
Add/maintain cases in `data/testcases.js` (grouped by module). Cover positive,
negative, edge, BVA, equivalence partitioning, permission, validation, UI,
integration, E2E, security, error handling. Then:
```bash
node scripts/generate-excel.js   # -> excel/Rentora-Testcases.xlsx
```

## Phase 3 — Automate (POM)
Follow `codebase-rules`: locators in `pages/`, logic in `actions/`, assertions in
`tests/`. Each test calls `result.for(<sheet>, <tcId>, <detail>)` so the Excel
Actual Result column is written on teardown. Sheet name = module name.

## Phase 4 — Execute
```bash
rm -f excel/results/*.xlsx
npx playwright test --reporter=json > evidence/results.json
```
Failure screenshots land in `test-results/`; copy bug evidence into
`evidence/screenshots/` named `BUG-00N-...png`.

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
