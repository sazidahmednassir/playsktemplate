---
name: add-page
description: Create or update a page object file with new locators. Use when new UI elements need to be targeted in tests.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Page — Create or Update Page Object

Page objects contain ONLY locators. No assertions, no business logic.

## ⚠️ Mandatory: Verify DOM Before Writing Locators

**Before creating or updating page locators, you MUST use the Playwright MCP server**
(`browser_navigate` + `browser_snapshot`) to inspect the actual rendered DOM.
Never guess selectors — verify role names, labels, and element structure from the live page.

## Template (class style, matches the Rentora framework)

```javascript
class SomePage {
  constructor(page) {
    this.page = page;
    this.heading = page.getByRole("heading", { name: "Title" });
    this.submitButton = page.getByRole("button", { name: "Submit" });
  }

  path() {
    return "/some-route";   // relative; combine with baseURL/adminBaseURL
  }
}

module.exports = SomePage;
```

## Rules
1. **File location**: `pages/<Name>.js`; portal pages go in `pages/owner/` or `pages/admin/`.
2. **Locators only** — no `expect()`, `click()`, `fill()`, `goto()`.
3. Constructor takes `page`; expose locators as properties.
4. **Prefer stable selectors**: role > label/placeholder > test-id > CSS.
5. **Check existing pages first** — don't duplicate.
6. Add a `path()` (and parametrised helpers like `path(slug)`) for navigation.

## Existing Page Objects
- `HomePage`, `SearchPage`, `PropertyDetailPage`, `LoginPage`, `RegisterPage`
- `owner/OwnerDashboardPage`, `owner/OwnerCreateWizardPage`
- `admin/AdminDashboardPage`, `admin/AdminUsersPage`

## After Creating
Instantiate the page inside the relevant action or spec (`new SomePage(page)`).
