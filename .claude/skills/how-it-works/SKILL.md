---
name: how-it-works
description: Complete guide to this project — what it does, how it works, how skills are organized, and all references. Use when someone new needs to understand the full system.
user-invocable: true
---

# How This Project Works

## What Is This?

A **Playwright E2E test automation framework** that tests the [OrangeHRM](https://opensource-demo.orangehrmlive.com/web/index.php/auth/login) demo web application. It uses the **Page Object Model (POM)** pattern with a 3-layer architecture and is fully managed by **Claude Code skills** for automation, self-healing, and code generation.

**Target App**: OrangeHRM — an open-source HR management system (Vue.js SPA)
**Credentials**: Stored in `.env` — see `.env.example` for template

---

## Project Architecture

```
playwrightskill/
├── .claude/
│   ├── CLAUDE.md                          # AI identity, style, avoidances
│   └── skills/                            # All Claude Code skills
│       ├── how-it-works/SKILL.md          # This file — full project guide
│       ├── run-tests/SKILL.md             # /run-tests — execute test suite
│       ├── self-heal/SKILL.md             # /self-heal — auto-fix broken locators
│       ├── add-test/SKILL.md              # /add-test — create new test spec
│       ├── add-page/SKILL.md              # /add-page — create/update page object
│       ├── add-action/SKILL.md            # /add-action — create/update action class
│       └── project-reference/SKILL.md     # Codebase map (auto-loaded)
│
├── pages/                                 # LAYER 1: Locators only
│   ├── LoginPage.js                       # Login form selectors
│   ├── DashboardPage.js                   # Dashboard widget selectors
│   ├── ProfilePage.js                     # User dropdown selectors
│   └── SidebarPage.js                     # Sidebar menu selectors
│
├── actions/                               # LAYER 2: Business logic
│   ├── BaseActions.js                     # Static navigation helpers
│   ├── LoginActions.js                    # Login, verify, ensureLoggedIn
│   ├── DashboardActions.js                # Dashboard widgets, Quick Launch
│   ├── ProfileActions.js                  # User dropdown, logout
│   └── NavigationActions.js               # Sidebar module navigation
│
├── tests/                                 # LAYER 3: Test specs
│   ├── fixture/
│   │   └── customfixture.js               # Injects actions into all tests
│   └── regression/
│       ├── loginTests.spec.js             # 2 tests: fresh login, stored auth
│       ├── negativeLoginTests.spec.js     # 3 tests: wrong password/user, empty
│       ├── dashboardTests.spec.js         # 4 tests: heading, cards, widgets
│       ├── signOutTests.spec.js           # 2 tests: logout, session invalidation
│       └── navigationTests.spec.js        # 5 tests: sidebar, Admin/PIM/Leave/Dir
│
├── config/
│   └── env.config.js                      # Loads .env into config object
│
├── .env                                   # BASE_URL, credentials, auth path
├── .env.example                           # Template for .env
├── auth.setup.js                          # Global setup: one-time login, save session
├── playwright.config.js                   # Runner config: Chrome, Allure, timeouts
├── package.json                           # Dependencies and npm scripts
└── .github/workflows/playwright.yml       # CI/CD: run tests, Allure report, email
```

---

## How the 3-Layer POM Works

```
┌─────────────────────────────────────────────────────┐
│  TEST SPEC (tests/regression/*.spec.js)             │
│  - Uses custom fixture to get `actions` object      │
│  - Calls action methods, never raw Playwright APIs  │
│  - Each test is independent (no shared state)       │
└──────────────────────┬──────────────────────────────┘
                       │ calls
┌──────────────────────▼──────────────────────────────┐
│  ACTION CLASS (actions/*.js)                        │
│  - Constructor takes `page`                         │
│  - Contains business logic, clicks, fills, asserts  │
│  - Imports locators from page objects               │
└──────────────────────┬──────────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────────┐
│  PAGE OBJECT (pages/*.js)                           │
│  - Plain object with locator functions              │
│  - getElement: (page) => page.locator("selector")   │
│  - NO logic, NO assertions, NO interactions         │
└─────────────────────────────────────────────────────┘
```

### Why this matters:
- **UI changes?** Update only `pages/*.js` — actions and tests stay untouched
- **Flow changes?** Update only `actions/*.js` — tests stay untouched
- **New test scenario?** Add only a new `tests/regression/*.spec.js` — reuse existing actions

---

## How Authentication Works

```
1. auth.setup.js (globalSetup) runs ONCE before all tests
2. Logs into OrangeHRM with credentials from .env
3. Saves browser session to .auth/state.json
4. All tests load this saved session automatically (playwright.config.js → storageState)
5. Each test's beforeEach calls ensureLoggedIn() which:
   - Navigates to the app
   - If session expired → re-logs in automatically
   - If session valid → proceeds directly to dashboard
```

---

## How to Run Tests

| Command | What it does |
|---------|-------------|
| `npm run test` | Run all 16 tests serially (1 worker) |
| `npm run test:serial` | Same as above — serial mode |
| `npm run test:parallel` | Run all 16 tests with 4 workers |
| `npm run smoke` | Run only `@smoke` tagged tests |
| `npm run regression` | Run only `@regression` tagged tests |

---

## How Claude Code Skills Work

Skills are stored in `.claude/skills/<name>/SKILL.md`. Each skill has:
- **YAML frontmatter** — name, description, permissions, invocability
- **Markdown body** — instructions Claude follows when the skill is invoked

### Available Skills

| Skill | Invoke | What it does |
|-------|--------|-------------|
| **run-tests** | `/run-tests` | Runs the full test suite (serial or parallel), reports results |
| **self-heal** | `/self-heal` | Reads test failures, identifies broken locators, fixes them in page objects, re-runs to verify |
| **add-test** | `/add-test` | Creates a new test spec file following the POM template |
| **add-page** | `/add-page` | Creates or updates a page object with new locators |
| **add-action** | `/add-action` | Creates or updates an action class, registers it in the fixture |
| **project-reference** | (auto) | Full codebase map — auto-loaded by Claude, not user-invocable |
| **how-it-works** | `/how-it-works` | This guide — explains the entire project |

### How skills connect:

```
User says "run tests"
  → /run-tests executes npm run test:serial
    → Tests fail?
      → /self-heal reads errors
        → Locator broken? → Updates pages/*.js
        → Flow changed? → Updates actions/*.js
        → Re-runs failing tests to verify fix

User says "add a test for X"
  → /add-test creates tests/regression/xTests.spec.js
    → Needs new locator? → /add-page creates/updates pages/XPage.js
    → Needs new action? → /add-action creates/updates actions/XActions.js
      → Registers new action in tests/fixture/customfixture.js
```

### Scheduled automation:
- Every day at **12:00 PM**: `/run-tests` runs automatically
- If any test fails: `/self-heal` kicks in to fix broken locators

---

## How CI/CD Works

`.github/workflows/playwright.yml` triggers on:
- Push to `main`
- Pull request to `main`
- Daily schedule at 18:15 UTC

**Pipeline steps:**
1. Checkout repo
2. Setup Node.js 18
3. Install dependencies (`npm ci`)
4. Install Playwright browsers
5. Run tests (`npx playwright test`)
6. Generate Allure single-file HTML report
7. Email report to `nassirctg1234@gmail.com` via Gmail SMTP
8. Fail workflow if tests failed

**Required GitHub Secrets:** `EMAIL_USERNAME`, `EMAIL_PASSWORD`

---

## Key Files Reference

### Config Files
| File | What it controls |
|------|-----------------|
| `.env` | `BASE_URL`, `USER2_EMAIL`, `USER2_PASSWORD`, `AUTH_STATE_PATH` |
| `config/env.config.js` | Loads `.env` into a `config` object used by all tests |
| `playwright.config.js` | Browser (Chrome), reporter (Allure), timeout (80s), workers, globalSetup |
| `auth.setup.js` | One-time login before all tests, saves session to `.auth/state.json` |

### Custom Fixture
`tests/fixture/customfixture.js` injects these into every test:
```javascript
actions.login        // LoginActions
actions.dashboard    // DashboardActions
actions.profile      // ProfileActions
actions.navigation   // NavigationActions
```

### Dependencies
| Package | Purpose |
|---------|---------|
| `@playwright/test` | Test framework and runner |
| `allure-playwright` | Allure test reporting |
| `dotenv` | Environment variable loading |
| `xlsx` | Excel file support (data-driven ready) |
| `@cucumber/cucumber` | BDD support (installed, not yet wired) |
