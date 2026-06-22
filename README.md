# Sikder Store — Playwright E2E Automation Framework

A **Playwright E2E automation framework** (Page Object Model) for the **Sikder
Store** e-commerce platform. It validates the **Return / Exchange / Damage
Claim** workflow end-to-end across Order Management, Inventory, Refund, and
Store Operations. Test cases are **ticket-driven** and every run produces a
**Markdown + Word testing report** (this replaces the previous Excel reporting).

> Storefront: **https://sk-store.myei.app** · Admin dashboard: **https://admin.myei.app/shop/sk-store** (via `sk-store.myei.app/admin`) · Payments bKash + SSLCommerz in **sandbox**.

## Project Structure

```text
tickets/                     # ticket context + Test-Case matrix (source of truth)
.claude/skills/              # Claude skills (ticket-driven authoring, self-heal, etc.)
.mcp.json                    # Playwright MCP server (live DOM inspection)
CLAUDE.md                    # AI operating instructions

pages/                       # page objects — locators only
actions/                     # action classes — business logic (no assertions)
tests/
 ├── auth.setup.js           # staff login → .auth/*.json (storageState)
 ├── order/   order.spec.js
 ├── return/  return.spec.js
 ├── exchange/ exchange.spec.js
 ├── damage/  damage.spec.js
 └── fixture/customfixture.js

config/env.config.js         # store + admin config from .env
utils/ReportWriter.js        # TC results → report.md + report.docx
utils/generateReport.js      # curated stakeholder report → docs/Test-Report.*
global.setup.js              # pins one report folder per run
playwright.config.js
reports/<timestamp>/         # per-run report + evidence screenshots
docs/Test-Report.*           # curated deliverable + docs/evidence/
```

## Architecture — 3-Layer POM

```
SPEC (expectations + report annotations)
  → ACTION CLASS (flows, interactions, data extraction)
      → PAGE OBJECT (locators only)
```

Each test imports `tests/fixture/customfixture.js`, which provides the `actions`
namespace: `actions.{auth, orders, returns, inventory, store}`.

## Setup

```bash
npm install
npx playwright install --with-deps
cp .env.example .env        # fill in store/admin URLs + credentials
```

`.env` keys: `STORE_URL`, `ADMIN_URL`, `SHOP_SLUG`, `OWNER_EMAIL/PASSWORD`,
`ADMIN_EMAIL/PASSWORD`, `BKASH_NUMBER/OTP/PIN`, `AUTH_DIR`.

## Running Tests

```bash
npm test                 # serial (default) — runs setup → chromium
npm run test:parallel    # parallel
npm run smoke            # @smoke only
npm run regression       # @regression only
npx playwright test --grep "TC-6"   # a single TC
```

Each run writes `reports/<timestamp>/report.md` + `report.docx` (with evidence).
For the curated stakeholder report:

```bash
node utils/generateReport.js     # → docs/Test-Report.md + docs/Test-Report.docx
```

## Ticket-driven test authoring

The source of truth is `tickets/*.md` (ticket context + a Test-Case matrix
grouped by **Area**). The `/add-test` skill reads it and generates one spec per
Area. See `CLAUDE.md` and `.claude/skills/` for the full workflow.

## Reporting

`utils/ReportWriter.js` accumulates each TC's result (PASS/FAIL/BLOCKED/SKIP)
from its annotations + screenshot attachments into a per-run ledger, then renders:

- **`report.md`** — summary, results table, and a Defects section with steps to
  reproduce, expected/actual, severity & priority, and embedded screenshots.
- **`report.docx`** — the same content as a Word document (`docx` library).

## Latest run

12 ticket TCs + 1 environment finding — **9 pass / 3 fail / 1 blocked**. The
three failures are genuine product defects in the Return/Refund/Inventory flow
(no restock on settlement; digital refunds recorded as cash; Returns dashboard
"Total Refunded" stuck at 0). See `docs/Test-Report.md`.

## Best Practices

- Pages hold **locators only**; actions hold **logic**; specs hold **assertions**.
- Never commit `.env`; all URLs/credentials come from `config/env.config.js`.
- After a failure, decide **locator break** (→ `/self-heal`) vs **product defect** (→ keep FAIL, document it).
