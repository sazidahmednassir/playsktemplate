---
name: project-reference
description: Complete codebase map of the Rentora Playwright E2E framework — page objects, actions, tests, config, scripts and data with their purpose. Auto-invoked when Claude needs to understand the project structure.
user-invocable: false
---

# Project Reference — Codebase Map (Rentora)

## Architecture

3-layer POM:
```
pages/    -> Locators only (selectors, no logic)
actions/  -> Business logic / steps
tests/    -> Specs (assertions only) using the custom fixture
```

## Target Application
- **App**: Rentora rental marketplace (Laravel 13, PHP 8.3, Alpine.js, SQLite)
- **Renter/Owner host**: `BASE_URL` = `http://127.0.0.1:8000`
- **Admin host**: `ADMIN_BASE_URL` = `http://localhost:8000`
- Seeded accounts: `owner1@rentora.test` / `owner2@rentora.test` / `admin@rentora.com.bd` (pw `password`)

## config/
- `env.config.js` — exports `baseURL`, `adminBaseURL`, and `owner`, `owner2`,
  `admin`, `renter` credential objects (from `.env`, with safe defaults).

## data/
- `testcases.js` — master TC inventory, grouped by module (`MODULES`). Single
  source of truth for Excel, specs and the report.

## scripts/
- `generate-excel.js` — `data/testcases.js` → `excel/Rentora-Testcases.xlsx` (one sheet/module).
- `generate-report.js` — `testcases.js` + `evidence/results.json` + findings → `docreport/Rentora-Test-Report.docx`.

## utils/
- `RentoraResultWriter.js` — reads `excel/Rentora-Testcases.xlsx`, writes the
  Actual Result column per TC, saves a timestamped copy under `excel/results/`.
- `ExcelResultWriter.js` — legacy (Proctoring Pro); not used by Rentora specs.

## pages/  (locators only)
- `HomePage.js`, `SearchPage.js`, `PropertyDetailPage.js`, `LoginPage.js`,
  `RegisterPage.js`
- `owner/OwnerDashboardPage.js`, `owner/OwnerCreateWizardPage.js`
- `admin/AdminDashboardPage.js`, `admin/AdminUsersPage.js`

## actions/  (logic)
- `AuthActions.js` — `gotoLogin`, `signIn`, `signInAsOwner/Admin/Renter`,
  `registerUser`, `logout`.
- `NavActions.js` — `goto`, `gotoStatus` (returns HTTP status),
  `attachConsoleCollector` (capture console/page errors).

## tests/
- `auth.spec.js`, `guest-browsing.spec.js`, `search-filter.spec.js`,
  `owner-portal.spec.js`, `admin-portal.spec.js`, `rbac-security.spec.js`
- `fixture/customfixture.js` — injects `actions` (`auth`,`nav`) + `result` recorder.

## Root
- `playwright.config.js` — headless, `globalSetup`, list+json+html reporters,
  screenshot on failure.
- `global-setup.js` — pins `PLAYWRIGHT_RUN_TIMESTAMP`, ensures `evidence/`.

## Outputs
- `excel/results/Rentora-Testcases - <ts>.xlsx`, `evidence/results.json`,
  `evidence/html-report/`, `evidence/screenshots/`, `docreport/Rentora-Test-Report.docx`.
