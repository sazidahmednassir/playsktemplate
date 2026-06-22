---
name: add-page
description: Create or update a page object file with new locators. Use when new UI elements need to be targeted in tests.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Page — Create or Update Page Object

Page objects contain ONLY locators. No assertions, no business logic.

## Template for New Page Object

```javascript
const PageName = {
  getElementName: (page) => page.locator("selector"),
  getElementByParam: (page, param) =>
    page.locator("selector", { hasText: param }),
};

module.exports = PageName;
```

## Rules

1. **File location**: `pages/<PageName>.js`
2. **Locators only** — no `expect()`, no `click()`, no `fill()`, no `waitFor()`
3. **Every function takes `page` as first parameter**
4. **Use descriptive names**: `getLoginBtn`, `getUsernameInput`, `getDashboardHeading`
5. **Check existing pages first** — don't duplicate locators that already exist
6. **Prefer stable selectors**: role > placeholder > test-id > CSS class > tag

## Existing Page Objects

- `pages/AdminLoginPage.js` — staff login form (email/password/remember/sign-in)
- `pages/OrdersPage.js` — All Orders list + order detail (status, Return action, fulfillment, logs, stock)
- `pages/ReturnCreatePage.js` — Create Return/Exchange/Damage Claim form
- `pages/ReturnDetailPage.js` — return detail (settle/reject, settlement values, stock-updated)
- `pages/ReturnsListPage.js` — Returns & Refunds dashboard (KPIs, filter, rows)
- `pages/InventoryPage.js` — Stock Overview rows
- `pages/StoreFrontPage.js` — storefront product/cart/checkout/payment

## After Creating

If a new page object is created, make sure the corresponding action file imports it.
