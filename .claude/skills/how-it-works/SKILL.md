---
name: how-it-works
description: Complete project guide — architecture, skills, references, and CI/CD for the Sikder Store E2E framework. Invoke when asked "how it works", for onboarding, or for a full project overview.
user-invocable: true
---

# How It Works — Project Guide

A **Playwright E2E automation framework** for the **Sikder Store** e-commerce
platform (EcomIntelligence). It validates the **Return / Exchange / Damage
Claim** workflow end-to-end across Order Management, Inventory, Refund, and
Store Operations. Test cases are **ticket-driven** and results are emitted as a
**Markdown + Word report** (no Excel).

## What this project is

- **Storefront (customer):** https://sk-store.myei.app
- **Admin dashboard (staff):** https://admin.myei.app/shop/sk-store (reached via `sk-store.myei.app/admin`)
- **Feature under test:** Return / Exchange / Damage Claim (orders that reach Shipped/Delivered)
- **Payments:** bKash + SSLCommerz in **sandbox** mode
- Everything configurable lives in `config/env.config.js` ← `.env`

## Project Structure

```text
tickets/                         # ticket context + Test-Case matrix (source of truth)
.claude/skills/                  # Claude skills
.mcp.json                        # Playwright MCP server (live DOM inspection)
CLAUDE.md                        # AI operating instructions

pages/                           # page objects (locators only)
actions/                         # action classes (business logic, no assertions)
tests/
 ├── auth.setup.js               # staff login → .auth/*.json
 ├── order/   order.spec.js
 ├── return/  return.spec.js
 ├── exchange/ exchange.spec.js
 ├── damage/  damage.spec.js
 └── fixture/customfixture.js    # injects the `actions` namespace

config/env.config.js             # store + admin config from .env
utils/ReportWriter.js            # records TC results → report.md + report.docx
utils/generateReport.js          # curated stakeholder report → docs/Test-Report.*
global.setup.js                  # pins one report folder per run
playwright.config.js
reports/<timestamp>/             # per-run report + evidence
docs/Test-Report.*               # curated deliverable + docs/evidence/
```

## Architecture — 3-Layer POM

```
TEST SPEC (tests/**/**.spec.js)        expectations + report annotations
   └─ ACTION CLASS (actions/*.js)      flows, interactions, data extraction
        └─ PAGE OBJECT (pages/*.js)    locators only
```

- **UI changed?** Update only the page object.
- **Flow changed?** Update only the action class.
- **New scenario?** Add a spec under the matching Area folder and reuse actions.

## Test lifecycle

1. `global.setup.js` pins `PLAYWRIGHT_RUN_TIMESTAMP` (one report folder per run).
2. `tests/auth.setup.js` logs in as Store Owner / Admin User and saves `storageState` to `.auth/`.
3. Specs run with the owner session, drive the app via the `actions` fixture, and assert.
4. `afterEach` → `reporter.record(testInfo)`; `afterAll` → `reporter.flush()` renders `reports/<run>/report.md` + `report.docx`.

## Skills

| Skill | Trigger | Purpose |
|-------|---------|---------|
| `/setup-env` | "setup" | Install deps, write `.env`, install browsers, verify |
| `/add-page` | "add page" | Create/update page objects (locators only) |
| `/add-action` | "add action" | Create/update action classes (logic) |
| `/add-test` | "generate test case" | Create specs from a ticket Area |
| `/add-comments` | "add comments" | JSDoc on actions; TC headers on specs |
| `/run-tests` | "run tests" | Execute the suite and emit the report |
| `/self-heal` | "self-heal" | Fix broken locators after failures (not real defects) |
| `codebase-rules` | (auto) | POM conventions + ticket-Area mapping |
| `project-reference` | (auto) | Full codebase map |

## Key files

| File | Purpose |
|------|---------|
| `tickets/return-exchange-damage.md` | Ticket + Test-Case matrix |
| `config/env.config.js` | `config.store.*`, `config.admin.*`, `config.payment.bkash` |
| `utils/ReportWriter.js` | Result ledger → Markdown + Word report |
| `.mcp.json` | Playwright MCP server |

## Notes

- This repository targets **e-commerce return/refund automation**, not the prior LMS/proctoring project.
- The ticket points to `platform-admin.myei.app`, but order management actually lives at `admin.myei.app/shop/sk-store` (see the ticket file for the credential/portal discrepancy finding).
