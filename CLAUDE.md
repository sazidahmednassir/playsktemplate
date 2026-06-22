# AI OPERATING SYSTEM

## Identity

My name is Nassir. QA Automation Engineer building E2E test frameworks with Playwright using the Page Object Model (POM) pattern.

## Communication Style

- Be direct. No fluff. No filler. Get to the point.
- Use technical but clear language. I understand testing terminology, Playwright APIs, and JavaScript/Node.js.
- If my approach has a problem, tell me. Useful pushback > polite agreement.
- Show the relevant code and error first, then the fix.

## Avoidances

- Don't put assertions or logic in page objects — pages are locators only.
- Don't hardcode credentials or URLs — always use `config/env.config.js`.
- Don't use `page.waitForTimeout()` in spec/action code — prefer `waitFor()`, `waitForLoadState()`, or auto-waiting. (Short settles are tolerated only in setup/exploration helpers.)
- Don't create duplicate page objects — check existing pages first.
- Don't write tests that depend on execution order.
- Don't skip the custom fixture — all tests use `require("../fixture/customfixture")`.

## System Under Test

- **Storefront (customer):** https://sk-store.myei.app — "Sikder Store" (EcomIntelligence).
- **Admin dashboard (staff):** https://admin.myei.app/shop/sk-store — reached via `sk-store.myei.app/admin`. Order management, returns, inventory, refunds live here. Staff login = `/api/v1/auth/staff/login`.
- **Not used:** `platform-admin.myei.app` (super-admin portal; rejects the store/admin staff credentials).
- Payments bKash + SSLCommerz are in **sandbox** mode. See `config/env.config.js` for all URLs/credentials (loaded from `.env`).

## Skills

All detailed instructions live in `.claude/skills/`:

- `/how-it-works` — Complete project guide: architecture, skills, references, CI/CD
- `/run-tests` — Run the full test suite (serial or parallel) and emit the report
- `/self-heal` — Auto-detect and fix broken locators after test failures
- `/add-test` — Create a new E2E test spec from a ticket, following the POM pattern
- `/add-page` — Create or update a page object with new locators
- `/add-action` — Create or update an action class with new methods
- `/setup-env` — Set up project environment: deps, .env, browsers, verify
- `/add-comments` — Add JSDoc comments to actions (locator traces) and tests (TC IDs, steps, validation)
- `project-reference` — Full codebase map (auto-loaded, not user-invocable)
- `codebase-rules` — POM rules & conventions (auto-loaded, not user-invocable)

## Rules: Keyword Triggers

### "generate test case" (and variants: "create tc", "write tc", "add tc")

Test cases are derived from a **TICKET**, not a spreadsheet. The ticket source-of-truth lives in `tickets/*.md` (context + a Test-Case matrix grouped by **Area**).

When the user says any of these phrases:

1. **Read the ticket** — open the relevant file in `tickets/`. If the user pasted ticket context inline, write it to `tickets/<slug>.md` first, then derive the Test-Case matrix (TC id, Area, Title, Expected).
2. **Check existing TCs first** — grep the spec files (`tests/`) for already-written TC IDs and titles. Build a list of what exists.
3. **Skip TCs that already exist** — do not rewrite or overwrite any TC already present.
4. **Only generate missing TCs** — generate only the ticket TCs not yet in the codebase, via `/add-test`.
5. Use the Playwright MCP server (`browser_navigate` + `browser_snapshot`) — or a headless Playwright exploration script when MCP is unavailable — to inspect live DOM and derive accurate locators before writing any page object or spec code.
6. Follow `codebase-rules` exactly (locators in `pages/`, logic in `actions/`, assertions in spec only; one spec per ticket **Area**).
7. Annotate every TC for `ReportWriter` (`tcId`, `area`, `severity`, `priority`, `expected`, `steps`, `actual`) so the report captures the result.
8. After writing, run the TC and confirm a result row lands in the run's `reports/<timestamp>/` folder.

No confirmation step needed — start immediately when the trigger keyword is detected.

## Rules: TC Execution and Report Protocol

For every TC in the active ticket (`tickets/*.md`):

### TC already exists in the spec file

1. Run it: `npx playwright test --grep "TC-<N>"` (the Playwright MCP server in `.mcp.json` is available for live DOM inspection while debugging).
2. `utils/ReportWriter.js` records the result (PASS/FAIL/BLOCKED/SKIP) from each test's annotations + attachments into `reports/<run>/` and renders `report.md` + `report.docx`. No manual edit needed — it is wired into `afterEach` + `afterAll` in every spec.
3. If the test fails, invoke `/self-heal` before reporting (distinguish a **locator break** from a **real product defect** — only heal the former; a real defect stays FAIL and is documented).

### TC is in the ticket but NOT yet written in the spec file

1. Create it using `/add-test`.
2. Follow `codebase-rules`: one spec per ticket Area (§2), locators in `pages/`, logic in `actions/`, expectations in the spec, annotate for `ReportWriter`.
3. After writing, run the new TC and confirm the report captures it.

### Report is the deliverable

Every run produces `reports/<timestamp>/report.md` + `report.docx` (failed-TC names, steps to reproduce, expected/actual, severity/priority, screenshots). `node utils/generateReport.js` builds the curated stakeholder report at `docs/Test-Report.*`. Never leave a failing run without an updated report.

## Rules: After Test Failures

- After a test run with failures, decide: **locator break** (→ `/self-heal`) vs **product defect** (→ keep FAIL, capture evidence, document in the report).
- Before declaring a locator fix: re-run ONLY the previously failing tests to confirm they pass.
- If a locator returns `<element(s) not found>`, check failure screenshots under `test-results/` / the run's `reports/<run>/evidence/` before guessing — the rendered text may differ from the expected regex.
- The Playwright MCP server is configured in `.mcp.json`; use `browser_snapshot` to inspect live DOM when screenshots are insufficient.

## Scheduled

- Every day at 12:00 PM: `/run-tests` then `/self-heal` if any failures are locator breaks.
