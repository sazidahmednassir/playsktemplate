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
- Don't use `page.waitForTimeout()` — prefer `waitFor()`, `waitForLoadState()`, or auto-waiting.
- Don't create duplicate page objects — check existing pages first.
- Don't write tests that depend on execution order.
- Don't skip the custom fixture — all tests use `require("../fixture/customfixture")`.

## Skills

All detailed instructions live in `.claude/skills/`:

- `/how-it-works` — Complete project guide: architecture, skills, references, CI/CD
- `/run-tests` — Run the full test suite (serial or parallel)
- `/self-heal` — Auto-detect and fix broken locators after test failures
- `/add-test` — Create a new E2E test spec following POM pattern
- `/add-page` — Create or update a page object with new locators
- `/add-action` — Create or update an action class with new methods
- `/setup-env` — Set up project environment: deps, .env, browsers, verify
- `/add-comments` — Add JSDoc comments to actions (locator traces) and tests (TC IDs, steps, validation)
- `/proctoring` — Author/update Proctoring Pro TCs: face validation, camera permission, suspicious activity, full proctoring flow. Documents the Y4M fixture system in `data/fixtures/face/`.
- `project-reference` — Full codebase map (auto-loaded, not user-invocable)

## Rules: TC Execution and Excel Update Protocol

For every TC listed in `data/Proctoring Pro.xlsx` (mirrored at `excel/Proctoring Pro.xlsx`):

### TC already exists in the spec file

1. Run it via the Playwright MCP server (`.mcp.json` is configured — use `browser_navigate` + `browser_snapshot` tools for live DOM inspection during debugging).
2. Execute the test: `npx playwright test --grep "TC-<N>"`.
3. The `ExcelResultWriter` (`utils/ExcelResultWriter.js`) auto-updates column G (Actual Result) and writes a timestamped copy to `excel/results/`. No manual Excel edit needed — it is wired into `afterEach` in every spec.
4. If the test fails, invoke `/self-heal` before reporting.

### TC is in Excel but NOT yet written in the spec file

1. Create it using the `/proctoring` skill (Student tab) or `/add-test` skill (other tabs).
2. Follow `codebase-rules` exactly:
   - One spec per Excel tab (§2 tab→file mapping).
   - Register the TC title in `TC_BY_TITLE` so the Excel writer captures results.
   - Locators in `pages/`, logic in `actions/`, expectations in the spec only.
3. After writing, run the new TC and confirm the Excel result is written.

### Never skip the Excel update

Every TC execution must produce a result row in `excel/results/`. If `ExcelResultWriter` throws, fix it before marking the TC done.

## Rules: After Test Failures

- After ANY test run with failures, immediately invoke `/self-heal`.
- Before declaring a fix: re-run ONLY the previously failing tests to confirm they pass.
- If a locator returns `<element(s) not found>`, check failure screenshots in `allure-results/` before guessing — the actual rendered text may differ from the expected regex.
- Playwright MCP server is configured in `.mcp.json`. Use `browser_snapshot` via MCP to inspect live DOM when screenshots are insufficient.

## Scheduled

- Every day at 12:00 PM: `/run-tests` then `/self-heal` if any fail
