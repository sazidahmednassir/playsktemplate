---
name: add-action
description: Create or update an action class with new methods for page interactions. Use when new business logic or step methods are needed for tests.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Action — Create or Update Action Class

Actions hold business logic / steps. They compose page-object locators.
Keep **assertions out of actions** — assertions belong in specs.

## ⚠️ Mandatory: Verify Flow Before Writing Actions

**Before writing or updating action methods, use the Playwright MCP server** to walk through the
actual user flow on the live site. Verify navigation paths, button clicks, form interactions,
and state transitions from the live DOM — never assume the flow.

## Template (matches the Rentora framework)

```javascript
const SomePage = require("../pages/SomePage");
const cfg = require("../config/env.config");

class SomeActions {
  constructor(page) {
    this.page = page;
    this.some = new SomePage(page);
  }

  async openAndSubmit(base = cfg.baseURL) {
    await this.page.goto(`${base}${this.some.path()}`, { waitUntil: "domcontentloaded" });
    await this.some.submitButton.click();
  }
}

module.exports = SomeActions;
```

## Rules
1. **File location**: `actions/<Name>Actions.js`.
2. Constructor takes `page`; instantiate page objects there.
3. **Import locators from page objects** — never write raw selectors in actions.
4. **No `expect()`** in actions (assertions live in specs).
5. **Never `waitForTimeout()`** — use `waitFor()`, `waitForLoadState()`, auto-waiting.
6. **Never hardcode URLs/credentials** — use `config/env.config.js`.
7. Support both hosts where relevant via a `base` arg (`cfg.baseURL` / `cfg.adminBaseURL`).

## After Creating — register in the fixture
Add the action to `tests/fixture/customfixture.js`:

```javascript
const SomeActions = require("../../actions/SomeActions");

actions: async ({ page }, use) => {
  await use({
    auth: new AuthActions(page),
    nav: new NavActions(page),
    some: new SomeActions(page),   // <-- add here
  });
},
```

## Existing Actions
- `AuthActions` — `signIn`, `signInAsOwner/Admin/Renter`, `registerUser`, `logout`.
- `NavActions` — `goto`, `gotoStatus`, `attachConsoleCollector`.
