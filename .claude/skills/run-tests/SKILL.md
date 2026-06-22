---
name: run-tests
description: Run the full Playwright test suite in serial or parallel mode. Use when asked to run tests, execute test suite, or check if tests pass.
user-invocable: true
allowed-tools: Bash(npx playwright*) Bash(npm run test*) Read
---

# Run Tests

Run the Playwright E2E test suite against the Sikder Store admin/storefront and emit the report (`reports/<run>/report.md` + `report.docx`). Run `node utils/generateReport.js` for the curated `docs/Test-Report.*` deliverable.

## Two Modes

### Serial (default)
```bash
npm run test:serial
```
- 1 worker, tests run one at a time
- More stable on shared demo accounts

### Parallel
```bash
npm run test:parallel
```
- 4 workers, tests run concurrently
- Faster but requires stable session handling

## After Running

1. Report results: total passed, failed, duration
2. If any test fails, invoke the `/self-heal` skill to auto-fix
3. Show the Allure report command: `npx allure serve allure-results`

## Scheduled Run

Every day at 12:00 PM, run the full test suite:
```bash
npm run test:serial
```
If any test fails, automatically invoke the self-heal skill.
