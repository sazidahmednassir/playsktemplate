---
name: add-test
description: Create a new E2E test spec file following the POM pattern. Use when asked to add new test cases, test scenarios, or test coverage.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Test — Create New E2E Test Spec

Create/extend a Playwright spec following the Rentora POM architecture.
**Assertions live in specs only.**

## ⚠️ Step 0 — Website Analysis (MANDATORY)

**Before writing ANY test code, you MUST:**

1. Use the Playwright MCP server (`browser_navigate` + `browser_snapshot`) to explore the live page(s) the test targets.
2. Verify actual UI elements, locators, and business workflows from the live DOM.
3. Understand the page flow, validation rules, and state transitions.
4. Only after analysis — write the page locators, actions, and spec.

> Violating this rule produces fragile tests based on assumptions. The Playwright MCP server is in `.mcp.json`.

## Template

```javascript
const { test, expect } = require("./fixture/customfixture");
const HomePage = require("../pages/HomePage");
const SHEET = "GuestBrowsing"; // = Excel sheet / module name

test.describe("Guest Browsing", () => {
  test("GUEST-01 home page renders core sections", async ({ page, actions, result }) => {
    const home = new HomePage(page);
    await actions.nav.goto(home.path());
    await expect(home.heroHeading).toBeVisible();
    // Records the Actual Result (PASS/FAIL) into the Excel workbook on teardown:
    result.for(SHEET, "GUEST-01", "Home rendered hero and core sections.");
  });
});
```

## Rules
1. **One spec per module** (see `codebase-rules` §3 mapping). Append; never split per-TC.
2. **Always** require `./fixture/customfixture` for `actions` + `result`.
3. **Use action methods / page locators** — no raw selectors or hardcoded URLs.
4. **Each test independent** — no ordering dependencies; log in within the test
   or a `beforeEach` for that module.
5. **Never hardcode credentials** — use `config/env.config.js` (`cfg.owner`, etc.).
6. **No `waitForTimeout()`** — prefer `waitFor`, `waitForLoadState`, auto-waiting.
7. **Register the result**: every test ends with
   `result.for(<sheet>, <tcId>, <past-tense detail>)`. The `<sheet>` MUST equal
   the module name in `data/testcases.js` so the Excel row is found.
8. Add the matching entry to `data/testcases.js` and regenerate the workbook
   (`node scripts/generate-excel.js`) before running.
9. If a new locator/action is needed, create it first via `/add-page` / `/add-action`.

## Fixture provides
```javascript
actions.auth   // AuthActions  — login/register/logout
actions.nav    // NavActions   — goto, gotoStatus, attachConsoleCollector
result         // .for(sheet, tcId, detail) — writes Excel Actual Result on teardown
```

## passDetail guidance
Write the detail as a **past-tense restatement of the Expected Result**
(`is visible` → `was visible`). On FAIL the fixture appends the error
automatically; on SKIP it records `[SKIP]`. Do not bake status words into the detail.
