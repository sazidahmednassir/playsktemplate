---
name: add-test
description: Create a new E2E test spec file from a ticket, following the POM pattern. Use when asked to add new test cases, test scenarios, or test coverage.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Test — Create New E2E Test Spec (ticket-driven)

Create a new Playwright spec following the project's POM architecture. Test
cases come from a **ticket** (`tickets/*.md`), grouped by **Area**.

## Template

```javascript
const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const { getReporter } = require("../../utils/ReportWriter");

const reporter = getReporter();
function meta(testInfo, m) {
  for (const [k, v] of Object.entries(m)) testInfo.annotations.push({ type: k, description: String(v) });
}

test.describe("[Area] workflow", () => {
  test.afterEach(async ({}, testInfo) => reporter.record(testInfo));
  test.afterAll(async () => reporter.flush());

  test("TC-N [Title] @regression", async ({ actions }, testInfo) => {
    meta(testInfo, {
      tcId: "TC-N", area: "[Area]", severity: "High", priority: "High",
      expected: "[the Expected Result from the ticket]",
      steps: "Step 1 | Step 2 | Step 3",
    });
    // Drive the app through action methods (logic lives in actions/).
    const facts = await actions.returns.getDetailFacts();
    meta(testInfo, { actual: `Observed: ${JSON.stringify(facts)}` });
    expect(facts.stockUpdated).toBe("Yes");
  });
});
```

## Rules

1. **File location** — follows `codebase-rules` §2 (one spec per ticket Area):
   - Order → `tests/order/order.spec.js`
   - Return → `tests/return/return.spec.js`
   - Exchange → `tests/exchange/exchange.spec.js`
   - Damage → `tests/damage/damage.spec.js`
2. **Always use the custom fixture** — `require("../fixture/customfixture")`; drive the app via `actions.*` (auth, orders, returns, inventory, store).
3. **Auth** — staff session is provided by `tests/auth.setup.js` (storageState in `playwright.config.js`). Don't log in inside each test unless testing login itself; use `actions.auth.attemptLogin()` for negative-login cases.
4. **Never hardcode credentials/URLs** — everything comes from `config/env.config.js`.
5. **Use action methods** — no raw Playwright navigation/locator calls in spec files.
6. **Each test independent** — never depend on another test's state or order.
7. **Annotate every TC** for `ReportWriter`: `tcId`, `area`, `severity` (Critical/High/Medium/Low/-), `priority`, `expected`, `steps` (pipe-separated), and a human-readable `actual`. Attach screenshots via `testInfo.attach(...)` for evidence.
8. **Tag every test** — `@smoke` / `@regression`.
9. **New action method needed?** create it first via `/add-action`. **New locator?** via `/add-page`.

## Available Actions in the Fixture

```javascript
actions.auth       // AdminAuthActions  — loginAsOwner/loginAsAdminUser, attemptLogin
actions.orders     // OrderActions      — listOrders, findOrderByStatus, openOrder, hasReturnAction
actions.returns    // ReturnActions     — getDashboardSummary, createRequest, openReturn, getDetailFacts, settle, reject
actions.inventory  // InventoryActions  — snapshot, availableFor
actions.store      // StoreFrontActions — isReachable, openHome, addFirstAvailableProductToCart
```

## Reporting (replaces the old Excel writer)

`reporter.record(testInfo)` maps each test's annotations + screenshot
attachments into a result row. `reporter.flush()` renders `report.md` +
`report.docx` into `reports/<run>/`. On PASS the `actual` annotation is used
verbatim; on FAIL the assertion error is captured if no `actual` is set.
Distinguish a **locator break** (heal it) from a **real product defect**
(keep FAIL, document it) — the report's value is the defects it surfaces.
