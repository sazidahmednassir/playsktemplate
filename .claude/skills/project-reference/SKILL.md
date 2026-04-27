---
name: project-reference
description: Complete codebase map of the Playwright E2E framework — all page objects, actions, tests, config, and CI/CD files with their methods and purpose. Auto-invoked when Claude needs to understand the project structure.
user-invocable: false
---

# Project Reference — Codebase Map

## Architecture

3-layer POM (Page Object Model):
```
pages/    -> Locators only (selectors, no logic)
actions/  -> Business logic (interactions, assertions)
tests/    -> Specs using custom fixture
```

## Page Objects

| File | Locators |
|------|----------|
| `pages/LoginPage.js` | getUsernameInput, getPasswordInput, getLoginBtn, getErrorMessage, getRequiredError, getForgotPasswordLink |
| `pages/DashboardPage.js` | getBreadcrumb, getDashboardHeading, getQuickLaunchCards, getQuickLaunchByTitle, getTimeAtWorkWidget, getMyActionsWidget |
| `pages/ProfilePage.js` | getUserDropdown, getUserDropdownName, getLogoutLink, getAboutLink, getChangePasswordLink, getSupportLink |
| `pages/SidebarPage.js` | getSidebar, getMenuItemByName, getSearchInput |

## Actions

| File | Methods |
|------|---------|
| `actions/BaseActions.js` | navigate(), navigateAndVerifyAuth() |
| `actions/LoginActions.js` | login(), validLogin(), loginWithoutStoredState(), loginAndExpectFailure(), loginWithEmptyFields(), verifyLoggedIn(), verifyOnLoginPage(), verifyLoginErrorVisible(), verifyRequiredFieldError(), ensureLoggedIn() |
| `actions/DashboardActions.js` | verifyDashboardLoaded(), verifyQuickLaunchVisible(), getQuickLaunchCount(), clickQuickLaunchCard(), verifyTimeAtWorkWidget(), verifyMyActionsWidget() |
| `actions/ProfileActions.js` | openUserDropdown(), verifyDropdownOpen(), logout(), verifyUserName() |
| `actions/NavigationActions.js` | verifySidebarVisible(), navigateToModule(), verifyOnModule(), searchSidebar() |

## Test Specs (16 tests)

| File | Tests | Count |
|------|-------|-------|
| `tests/regression/loginTests.spec.js` | Fresh login, stored auth login | 2 |
| `tests/regression/negativeLoginTests.spec.js` | Invalid password, invalid username, empty fields | 3 |
| `tests/regression/dashboardTests.spec.js` | Dashboard heading, Quick Launch cards, widgets, card click | 4 |
| `tests/regression/signOutTests.spec.js` | Logout redirect, session invalidation | 2 |
| `tests/regression/navigationTests.spec.js` | Sidebar visible, Admin, PIM, Leave, Directory | 5 |

## Fixture

`tests/fixture/customfixture.js` — Injects `actions.login`, `actions.dashboard`, `actions.profile`, `actions.navigation` into all tests.

## Config & Auth

| File | Purpose |
|------|---------|
| `.env` | BASE_URL, USER2_EMAIL, USER2_PASSWORD, AUTH_STATE_PATH |
| `config/env.config.js` | Loads .env into `config` object |
| `auth.setup.js` | Global setup — one-time login, saves session to `.auth/state.json` |
| `playwright.config.js` | Chrome, Allure, 80s timeout, serial/parallel via `PARALLEL` env var |

## CI/CD

`.github/workflows/playwright.yml` — GitHub Actions: install, run tests, Allure report, email results.

## Target Application

- URL: Configured via `BASE_URL` in `.env`
- Credentials: Configured via `USER2_EMAIL` / `USER2_PASSWORD` in `.env`
- Tech: OrangeHRM (Vue.js SPA)

## NPM Scripts

| Command | Mode |
|---------|------|
| `npm run test` | Default (serial) |
| `npm run test:serial` | Serial — 1 worker |
| `npm run test:parallel` | Parallel — 4 workers |
| `npm run smoke` | Smoke tagged tests |
| `npm run regression` | Regression tagged tests |
