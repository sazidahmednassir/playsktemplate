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

## Target Application

- **App**: LMS (Moodle-based) — configured via `LMS_BASE_URL` in `.env`
- **Plugin under test**: Proctoring Pro (face validation on quiz attempts)
- **Credentials**: loaded from `.env` via `config/env.config.js`

## Page Objects

| File | Key Locators |
|------|-------------|
| `pages/StudentLMSPage.js` | getEmailInput, getPasswordInput, getLoginBtn — login form |
| | getDashboardHeading, getMyCoursesLink, getCourseLink — navigation |
| | getAttemptQuizBtn, getContinueAttemptBtn — quiz attempt entry |
| | getValidateFaceBtn(`#fcvalidate`) — Proctoring Pro trigger |
| | getFaceValidationPopup, getFaceMatchedMessage, getFaceMismatchMessage — validation results |
| | getValidationAgreementCheckbox, getStartAttemptBtn(`#id_submitbutton`) — start attempt |
| | getCameraPermissionError, getNoCameraDeviceError — camera error states |
| | getNoFaceWarning, getMultipleFacesWarning, getSuspiciousActivityBanner — TC-5 states |
| | getQuizQuestionStem, getFinishAttemptBtn, getSubmitAllAndFinishBtn — quiz in progress |

## Actions

| File | Methods |
|------|---------|
| `actions/StudentLMSActions.js` | loginAsStudent(baseURL, email, password) |
| | openCourseQuiz(courseName, quizName) |
| | clickAttemptOrContinue() |
| | clickValidateFace() |
| | verifyFaceValidationMatched() |
| | readFaceValidationMessage() |
| | verifyFaceValidationMismatch() |
| | verifyCameraPermissionError() |
| | verifyNoCameraDeviceError() |
| | verifyNoFaceWarning() |
| | verifyMultipleFacesWarning() |
| | startAttempt() |
| | verifyQuizInProgressWithProctoring() |
| | finishAttempt() |

## Test Specs (7 tests)

| File | Tests | Tag | Project |
|------|-------|-----|---------|
| `tests/student/student.spec.js` | TC-1 Face matched | `@baseline` | student-baseline |
| | TC-2 Face mismatch | `@mismatch` | student-mismatch |
| | TC-3 Camera permission denied | `@permissionDenied` | student-permission-denied |
| | TC-4 No camera device | `@noCamera` | student-no-camera |
| | TC-5a No face warning | `@noFace` | student-no-face |
| | TC-5b Multiple faces warning | `@multiFace` | student-multi-face |
| | TC-6 Full proctoring flow | `@baseline` | student-baseline |

## Fixture

`tests/fixture/customfixture.js` — Injects `actions.studentLms` (StudentLMSActions) into all tests.

## Config & Auth

| File | Purpose |
|------|---------|
| `.env` | LMS_BASE_URL, LMS_STUDENT_EMAIL, LMS_STUDENT_PASSWORD, LMS_COURSE_NAME, LMS_QUIZ_NAME, USE_REAL_CAMERA |
| `.env.example` | Template for all env vars |
| `config/env.config.js` | Loads .env into `config` object with `config.lms.*` namespace |
| `auth.setup.js` | Global setup — one-time login, saves session to `.auth/state.json` |
| `playwright.config.js` | Per-tag browser projects, fake-media flags, Allure reporter, 120s timeout |
| `.mcp.json` | Playwright MCP server (`@playwright/mcp`) for live DOM inspection |

## Camera Fixtures (Y4M)

| File | Purpose |
|------|---------|
| `data/fixtures/face/baseline.y4m` | Matching face — TC-1, TC-6 |
| `data/fixtures/face/mismatch.y4m` | Non-matching face — TC-2 |
| `data/fixtures/face/no-face.y4m` | Empty frame — TC-5a |
| `data/fixtures/face/multi-face.y4m` | Two faces — TC-5b |
| `data/fixtures/face/generate-y4m.sh` | Regenerates Y4M from source JPEGs |

Y4M files are git-ignored. Run `generate-y4m.sh` on every fresh clone.

## Excel Integration

| File | Purpose |
|------|---------|
| `data/Proctoring Pro.xlsx` | Source test case matrix (Student tab) |
| `excel/Proctoring Pro.xlsx` | Mirror copy |
| `excel/results/` | Timestamped PASS/FAIL exports written by ExcelResultWriter |
| `utils/ExcelResultWriter.js` | Writes TC result to column G after each test via `afterEach` |

## CI/CD

`.github/workflows/playwright.yml` — GitHub Actions: install, run tests, Allure report, email results.

## NPM Scripts

| Command | Mode |
|---------|------|
| `npm run test:serial` | Serial — 1 worker (default) |
| `npm run test:parallel` | Parallel — 4 workers |
