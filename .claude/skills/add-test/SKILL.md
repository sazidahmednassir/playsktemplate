---
name: add-test
description: Create a new E2E test spec file following the POM pattern. Use when asked to add new test cases, test scenarios, or test coverage.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Test — Create New E2E Test Spec

Create a new Playwright test file following the project's POM architecture.

## Template

Every test file must follow this structure:

```javascript
const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const config = require("../../config/env.config");

test.describe("[Module] Tests", () => {
  test.beforeEach(async ({ actions }) => {
    await actions.login.ensureLoggedIn(
      config.baseURL,
      config.user2.username,
      config.user2.password,
    );
  });

  test("[Test description]", async ({ actions, page }) => {
    // Test steps using action methods
  });
});
```

## Rules

1. **File location**: `tests/regression/<moduleName>Tests.spec.js`
2. **Always use custom fixture**: `require("../fixture/customfixture")`
3. **Always use `ensureLoggedIn`** in `beforeEach` for tests that need auth
4. **Never hardcode credentials** — use `config.user2.username` / `config.user2.password`
5. **Use action methods** — don't write raw Playwright calls in test files
6. **Each test must be independent** — no test should depend on another test's state
7. **If a new action method is needed**, create it first using `/add-action`
8. **If a new page locator is needed**, create it first using `/add-page`

## Available Actions in Fixture

```javascript
actions.login        // LoginActions — login, ensureLoggedIn, verify methods
actions.dashboard    // DashboardActions — dashboard widgets, quick launch
actions.profile      // ProfileActions — user dropdown, logout
actions.navigation   // NavigationActions — sidebar, module navigation
```
