---
name: add-action
description: Create or update an action class with new methods for page interactions. Use when new business logic or step methods are needed for tests.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Action — Create or Update Action Class

Actions contain business logic, page interactions, and assertions.

## Template for New Action Class

```javascript
const PageName = require("../pages/PageName");
const { expect } = require("@playwright/test");

class NewActions {
  constructor(page) {
    this.page = page;
  }

  async doSomething() {
    const element = PageName.getElement(this.page);
    await element.click();
  }

  async verifySomething() {
    await expect(PageName.getElement(this.page)).toBeVisible({ timeout: 10000 });
  }
}

module.exports = NewActions;
```

## Rules

1. **File location**: `actions/<ActionName>.js`
2. **Constructor takes `page`** — store as `this.page`
3. **Import locators from page objects** — never write raw selectors in actions
4. **Use `expect` for assertions** — imported from `@playwright/test`
5. **Prefer Playwright auto-waiting** — use `waitFor()` and `waitForLoadState()` over `waitForTimeout()`

## After Creating

1. **Register in fixture** — add the new action to `tests/fixture/customfixture.js`:

```javascript
const NewActions = safeRequire("../../actions/NewActions");

exports.test = base.extend({
  actions: async ({ page }, use) => {
    const actions = {};
    if (AdminAuthActions) actions.auth = new AdminAuthActions(page);
    // ... existing registrations ...
    if (NewActions) actions.newAction = new NewActions(page);  // <-- add here
    await use(actions);
  },
});
```

2. **Update `/add-test` skill** if the new action adds a new `actions.*` namespace

## Existing Actions

- `actions/AdminAuthActions.js` — staff login (`loginAsOwner`, `loginAsAdminUser`, `attemptLogin`)
- `actions/OrderActions.js` — list/find/open orders, status, `hasReturnAction`, logs
- `actions/ReturnActions.js` — dashboard summary, `createRequest`, `openReturn`, `getDetailFacts`, `settle`, `reject`
- `actions/InventoryActions.js` — stock `snapshot`, `availableFor`
- `actions/StoreFrontActions.js` — storefront reachability + cart
