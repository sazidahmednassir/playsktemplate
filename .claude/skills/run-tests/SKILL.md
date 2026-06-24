---
name: run-tests
description: Run the full Playwright test suite in serial or parallel mode. Use when asked to run tests, execute test suite, or check if tests pass.
user-invocable: true
allowed-tools: Bash(npx playwright*) Bash(npm run test*) Bash(node scripts/*) Bash(rm -f excel/results/*) Read
---

# Run Tests

Run the Playwright E2E suite against **Rentora** (renter/owner site on
`127.0.0.1:8000`, admin on `localhost:8000`). Both must be running first.

## Before running
1. Ensure the source workbook exists: `node scripts/generate-excel.js`
   (creates `excel/Rentora-Testcases.xlsx` if missing).
2. Clean previous results: `rm -f excel/results/*.xlsx`.

## Run

### Serial (default — recommended)
```bash
npm run test:serial
```
1 worker; stable for the shared seeded accounts.

### Parallel
```bash
npm run test:parallel
```
4 workers; faster.

### A single module / TC
```bash
npx playwright test tests/auth.spec.js
npx playwright test --grep "AUTH-08"
```

## After running
1. Report totals: passed / failed / duration.
2. Results are written to:
   - `excel/results/Rentora-Testcases - <timestamp>.xlsx` (Actual Result column)
   - `evidence/results.json` and `evidence/html-report/` (HTML report)
   - failure screenshots under `test-results/.../test-failed-1.png`
3. Regenerate the Word report from the latest run:
   `node scripts/generate-report.js` → `docreport/Rentora-Test-Report.docx`
4. If any test fails, invoke `/self-heal` before reporting a fix.

## Known baseline failures
AUTH-01, AUTH-02 (BUG-001 registration 500), SEC-02 (BUG-002 debug leak),
SRCH-01, SRCH-02 (BUG-003 price slider). These are real app defects, not flaky
tests — see `docreport/Rentora-Test-Report.docx`.
