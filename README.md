# OrangeHRM E2E Automation

Playwright E2E test automation framework for [OrangeHRM](https://opensource-demo.orangehrmlive.com/web/index.php/auth/login) using the **Page Object Model (POM)** pattern. Managed by **Claude Code skills** for test execution, self-healing locators, and code generation.

## Project Structure

```
playwrightskill/
├── .claude/
│   ├── CLAUDE.md                          # AI identity, style, avoidances
│   └── skills/                            # Claude Code skills
│       ├── how-it-works/SKILL.md          # /how-it-works — full project guide
│       ├── run-tests/SKILL.md             # /run-tests — execute test suite
│       ├── self-heal/SKILL.md             # /self-heal — auto-fix broken locators
│       ├── add-test/SKILL.md              # /add-test — create new test spec
│       ├── add-page/SKILL.md              # /add-page — create/update page object
│       ├── add-action/SKILL.md            # /add-action — create/update action class
│       ├── setup-env/SKILL.md             # /setup-env — project environment setup
│       ├── add-comments/SKILL.md          # /add-comments — JSDoc for actions & tests
│       └── project-reference/SKILL.md     # Codebase map (auto-loaded)
│
├── pages/                                 # Layer 1: Locators only
│   ├── LoginPage.js                       # Login form selectors
│   ├── DashboardPage.js                   # Dashboard widget selectors
│   ├── ProfilePage.js                     # User dropdown selectors
│   └── SidebarPage.js                     # Sidebar menu selectors
│
├── actions/                               # Layer 2: Business logic
│   ├── BaseActions.js                     # Static navigation helpers
│   ├── LoginActions.js                    # Login, verify, ensureLoggedIn
│   ├── DashboardActions.js                # Dashboard widgets, Quick Launch
│   ├── ProfileActions.js                  # User dropdown, logout
│   └── NavigationActions.js               # Sidebar module navigation
│
├── tests/                                 # Layer 3: Test specs
│   ├── fixture/
│   │   └── customfixture.js               # Injects actions into all tests
│   └── regression/
│       ├── loginTests.spec.js             # Fresh login, stored auth (2 tests)
│       ├── negativeLoginTests.spec.js     # Wrong password/user, empty fields (3 tests)
│       ├── dashboardTests.spec.js         # Heading, cards, widgets (4 tests)
│       ├── signOutTests.spec.js           # Logout, session invalidation (2 tests)
│       └── navigationTests.spec.js        # Sidebar, Admin/PIM/Leave/Dir (5 tests)
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

## Architecture

3-layer Page Object Model:

```
TEST SPEC  →  calls  →  ACTION CLASS  →  uses  →  PAGE OBJECT
(what to test)          (how to do it)            (where to find it)
```

| Layer | Directory | Responsibility |
|-------|-----------|---------------|
| Pages | `pages/` | Locators only — no logic, no assertions |
| Actions | `actions/` | Business logic — clicks, fills, assertions |
| Tests | `tests/regression/` | Test scenarios — uses custom fixture |

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Create .env from template
cp .env.example .env
```

Then update `.env` with your actual values:

```env
BASE_URL=https://your-app-url.com/login
USER2_EMAIL=your_username
USER2_PASSWORD=your_password
AUTH_STATE_PATH=.auth/state.json
```

> Or use `/setup-env` skill — it handles the full setup interactively.

## Running Tests

| Command | Mode | Workers |
|---------|------|---------|
| `npm run test` | Serial (default) | 1 |
| `npm run test:serial` | Serial | 1 |
| `npm run test:parallel` | Parallel | 4 |
| `npm run smoke` | Smoke tagged | Configured |
| `npm run regression` | Regression tagged | Configured |

## Authentication

Authentication runs **once** before all tests via `auth.setup.js` (globalSetup):

1. Launches browser, logs into OrangeHRM
2. Saves session to `.auth/state.json`
3. All tests load this session automatically
4. Each test's `beforeEach` calls `ensureLoggedIn()` — if session expired, re-logs in

## Test Coverage (16 tests)

| Suite | Tests |
|-------|-------|
| Login | Fresh login with valid credentials, stored auth verification |
| Negative Login | Invalid password, invalid username, empty fields |
| Dashboard | Dashboard heading, Quick Launch cards, widgets, card navigation |
| Sign Out | Logout redirect, session invalidation after logout |
| Navigation | Sidebar visibility, Admin, PIM, Leave, Directory modules |

## Claude Code Skills

This project uses Claude Code skills for automation:

| Skill | Command | Description |
|-------|---------|-------------|
| How It Works | `/how-it-works` | Full project guide with architecture and references |
| Run Tests | `/run-tests` | Execute test suite (serial or parallel) |
| Self-Heal | `/self-heal` | Auto-fix broken locators after test failures |
| Add Test | `/add-test` | Create new test spec following POM template |
| Add Page | `/add-page` | Create or update page object with locators |
| Add Action | `/add-action` | Create or update action class with methods |
| Setup Env | `/setup-env` | Set up project environment: deps, .env, browsers, verify |
| Add Comments | `/add-comments` | Add JSDoc comments to actions and test specs |

**Scheduled**: Tests run daily at 12:00 PM. If any fail, self-heal auto-fixes locators.

## CI/CD

GitHub Actions (`.github/workflows/playwright.yml`):
- Triggers on push/PR to `main` and daily schedule
- Installs deps, Playwright browsers, runs tests
- Generates Allure single-file HTML report
- Emails report via Gmail SMTP

**Required Secrets**: `EMAIL_USERNAME`, `EMAIL_PASSWORD`

## Writing Tests

```javascript
const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const config = require("../../config/env.config");

test.describe("Module Tests", () => {
  test.beforeEach(async ({ actions }) => {
    await actions.login.ensureLoggedIn(
      config.baseURL,
      config.user2.username,
      config.user2.password,
    );
  });

  test("Test description", async ({ actions, page }) => {
    await actions.dashboard.verifyDashboardLoaded();
    await actions.navigation.navigateToModule("Admin");
  });
});
```

**Available actions in fixture:**
- `actions.login` — Login, verify, ensureLoggedIn
- `actions.dashboard` — Dashboard widgets, Quick Launch
- `actions.profile` — User dropdown, logout
- `actions.navigation` — Sidebar module navigation

## Tech Stack

| Package | Purpose |
|---------|---------|
| `@playwright/test` | E2E test framework |
| `allure-playwright` | Test reporting |
| `dotenv` | Environment variable management |
| `xlsx` | Excel data support |
| `@cucumber/cucumber` | BDD support (available) |
