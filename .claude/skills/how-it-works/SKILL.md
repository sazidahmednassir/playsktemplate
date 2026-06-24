---
name: how-it-works
description: Complete guide to this project — what it does, how it works, how skills are organized, and all references. Use when someone new needs to understand the full system.
user-invocable: true
---

# How This Project Works

## What Is This?

A **Playwright E2E automation framework** for **Rentora** — a Bangladesh rental
marketplace. The framework follows a 3-layer Page Object Model and an
analysis-first QA workflow: the live application is explored with the Playwright
MCP server, test cases are derived from observed behaviour, recorded in Excel,
automated as POM specs, executed, and rolled up into a Word report.

**Target App**: Rentora (Laravel 13 / PHP 8.3 / Alpine.js, SQLite)
**Project Type**: Multi-portal web app QA (renter site, owner portal, admin portal)
**Authentication**: Credentials + hosts in `.env`, loaded by `config/env.config.js`

## The Three Portals & Roles

| Portal | Host | Roles | Key features |
|--------|------|-------|--------------|
| Public / Renter | `http://127.0.0.1:8000` | Guest, Renter | Home, `/search`, property detail, register/login, verify-email |
| Owner | `http://127.0.0.1:8000/owner/*` | Owner | Dashboard, My Listings, 10-step Add-Listing wizard, Messages, Profile |
| Admin | `http://localhost:8000/admin/*` | Admin | Dashboard, Review Queue (FIFO), Users (ban), NID Verify, Messages |

> The renter/owner site and the admin site use **different hosts** (`127.0.0.1`
> vs `localhost`) so they hold independent session cookies. `config.baseURL` and
> `config.adminBaseURL` reflect this.

### Core cross-portal business flow
Owner completes the 10-step wizard → listing enters the admin **Review Queue**
(status *Pending*) → admin **Approves** → listing goes live in public `/search`.

## Architecture (3-layer POM)

```
pages/    -> Locators only. No logic, no assertions.
actions/  -> Business logic / steps (login, register, navigate).
tests/    -> Spec files. Assertions live here ONLY.
```

- Every spec requires `tests/fixture/customfixture.js`, which injects
  `actions` (`auth`, `nav`) and a `result` recorder.
- `result.for(sheet, tcId, detail)` writes the Actual Result into
  `excel/Rentora-Testcases.xlsx` on teardown, keyed by the run timestamp.

## Test-case lifecycle (single source of truth)

`data/testcases.js` holds the master inventory (id, title, steps, expected,
priority, technique, automated). It feeds three outputs:

1. `node scripts/generate-excel.js` → `excel/Rentora-Testcases.xlsx` (one sheet per module).
2. `tests/*.spec.js` → automated coverage (matched by TC id).
3. `node scripts/generate-report.js` → `docreport/Rentora-Test-Report.docx`.

## Skills

- `/how-it-works` — this guide
- `/rentora-qa` — end-to-end senior-QA workflow (analyse → Excel → automate → report)
- `/run-tests` — execute the suite + write Excel results
- `/add-test`, `/add-page`, `/add-action`, `/add-comments` — POM authoring helpers
- `/self-heal` — fix broken locators after failures
- `/setup-env` — install deps, configure `.env`, install browsers
- `codebase-rules`, `project-reference` — auto-loaded references

> The `proctoring` skill is **legacy** (it targets a previous eLearning/LMS
> project) and does not apply to Rentora.

## Known defects (baseline, 24 Jun 2026)
- **BUG-001 (Critical):** `/register` returns HTTP 500 — mailer `tls` scheme
  unsupported; the user row is created but `Auth::login` never runs. Blocks renter onboarding.
- **BUG-002 (High):** `APP_DEBUG=true` leaks stack traces/SQL/file paths on errors.
- **BUG-003 (High):** `/search` price-range slider never renders (20 Alpine JS errors).

See `docreport/Rentora-Test-Report.docx` for the full report.
