---
name: project-reference
description: Complete codebase map of the Playwright E2E framework — all page objects, actions, tests, config, ticket source, and reporting with their methods and purpose. Auto-invoked when Claude needs to understand the project structure.
user-invocable: false
---

# Project Reference — Codebase Map

## Architecture

3-layer POM (Page Object Model):
```
pages/    -> Locators only (selectors, no logic)
actions/  -> Business logic (interactions, data extraction; no assertions)
tests/    -> Specs using the custom fixture; assertions + report annotations
```

## Target Application

- **Storefront (customer):** https://sk-store.myei.app — "Sikder Store".
- **Admin dashboard (staff):** https://admin.myei.app/shop/sk-store (EcomIntelligence, store-scoped; reached via `sk-store.myei.app/admin`). Auth = `/api/v1/auth/staff/login`.
- **Plugin/feature under test:** Return / Exchange / Damage Claim workflow (touches Order, Inventory, Refund, Store Ops).
- **Not used:** `platform-admin.myei.app` (rejects these credentials — see `tickets/return-exchange-damage.md`).
- Payments bKash + SSLCommerz in sandbox. Credentials/URLs via `config/env.config.js` ← `.env`.

## Ticket Source (replaces Excel)

| File | Purpose |
|------|---------|
| `tickets/return-exchange-damage.md` | Ticket context + Test-Case matrix (TC id, Area, Title, Expected). Source of truth for test generation. |

## Page Objects

| File | Key Locators |
|------|-------------|
| `pages/AdminLoginPage.js` | email/password/remember/sign-in — staff login |
| `pages/OrdersPage.js` | search, rows, view link, status badge, Return action, fulfillment, logs, product stock |
| `pages/ReturnCreatePage.js` | type cards (Return/Exchange/Damage Claim), reason, item checkboxes, full-return toggle, qty, condition, note, submit |
| `pages/ReturnDetailPage.js` | RTN heading, status badge, returned items, settlement values, stock-updated, settle/reject |
| `pages/ReturnsListPage.js` | heading, Total Refunded KPI, search, status filter, rows, refund cell, view button |
| `pages/InventoryPage.js` | stock-overview rows |
| `pages/StoreFrontPage.js` | product cards, buy/add-to-cart, cart, checkout, address, payment options |

## Actions

| File | Methods |
|------|---------|
| `actions/AdminAuthActions.js` | loginAs / loginAsOwner / loginAsAdminUser / attemptLogin |
| `actions/OrderActions.js` | openAllOrders, listOrders, findOrderByStatus, openOrder, getOrderStatus, hasReturnAction, clickReturnAction, getLogsText |
| `actions/ReturnActions.js` | openReturnsList, getDashboardSummary, createRequest, openReturn, getDetailFacts, settle, reject |
| `actions/InventoryActions.js` | openInventory, snapshot, availableFor |
| `actions/StoreFrontActions.js` | openHome, isReachable, addFirstAvailableProductToCart |

## Test Specs

| File | Area | TCs |
|------|------|-----|
| `tests/order/order.spec.js` | Order | TC-1 storefront→All Orders, TC-2 status logs |
| `tests/return/return.spec.js` | Return/Inventory/Refund | TC-3 gating, TC-6 restock, TC-7 refund method, TC-8 dashboard KPIs, TC-11 reject, TC-12 status filter |
| `tests/exchange/exchange.spec.js` | Exchange | TC-9 replacement order |
| `tests/damage/damage.spec.js` | Damage | TC-10 damage claim |
| `tests/auth.setup.js` | (setup) | staff login → `.auth/owner.json`, `.auth/admin.json` |

## Fixture

`tests/fixture/customfixture.js` — injects `actions.{auth,orders,returns,inventory,store}` into every test via `safeRequire`.

## Config & Auth

| File | Purpose |
|------|---------|
| `.env` / `.env.example` | STORE_URL, ADMIN_URL, SHOP_SLUG, OWNER_*, ADMIN_*, BKASH_*, AUTH_DIR |
| `config/env.config.js` | `config.store.*`, `config.admin.*` (with `admin.path()`), `config.payment.bkash` |
| `tests/auth.setup.js` | staff login, saves storageState (hydration-safe, keys on `/auth/staff/login`) |
| `global.setup.js` | pins one `PLAYWRIGHT_RUN_TIMESTAMP` so all workers share one report folder |
| `playwright.config.js` | setup→chromium projects, owner storageState, headless, list/html/allure reporters, 180s timeout |
| `.mcp.json` | Playwright MCP server for live DOM inspection |

## Reporting (replaces Excel)

| File | Purpose |
|------|---------|
| `utils/ReportWriter.js` | Accumulates TC results (file-based ledger); renders `reports/<run>/report.md` + `report.docx` with severity/priority + embedded screenshots |
| `utils/generateReport.js` | Builds the curated stakeholder report `docs/Test-Report.md` + `.docx` |
| `reports/<timestamp>/` | Per-run machine report + `evidence/` screenshots |
| `docs/Test-Report.*` | Curated deliverable; `docs/evidence/` full-page screenshots |

## CI/CD

`.github/workflows/playwright.yml` — install, run tests, publish report.

## NPM Scripts

| Command | Mode |
|---------|------|
| `npm test` / `npm run test:serial` | 1 worker (default) |
| `npm run test:parallel` | 4 workers |
| `npm run smoke` / `npm run regression` | tag-filtered |
