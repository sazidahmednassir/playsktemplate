# Playwright E2E Automation Framework

Playwright E2E test automation framework built using the **Page Object Model (POM)** pattern. Managed by **Claude Code skills** for test execution, self-healing locators, and code generation.

Currently, this framework automates two primary applications:
1. **OrangeHRM** (Core HR flows)
2. **eLearning23 LMS - Proctoring Pro** (Face validation, camera permissions, and quiz attempts)

## Project Structure

```text
playwrightskill/
├── .claude/
│   ├── CLAUDE.md                          # AI identity, style, avoidances
│   └── skills/                            # Claude Code skills
│
├── pages/                                 # Layer 1: Locators only
│   ├── LoginPage.js, DashboardPage.js     # OrangeHRM pages
│   └── StudentLMSPage.js                  # eLearning23 Proctoring Pro pages
│
├── actions/                               # Layer 2: Business logic
│   ├── LoginActions.js, DashboardActions.js
│   └── StudentLMSActions.js               # eLearning23 Proctoring Pro actions
│
├── tests/                                 # Layer 3: Test specs
│   ├── fixture/customfixture.js           # Injects actions into all tests
│   └── regression/
│       ├── loginTests.spec.js             # OrangeHRM tests
│       ├── studentTC1_match.spec.js       # Proctoring Pro tests (TC-1 to TC-6)
│       └── ...
│
├── data/fixtures/face/                    # Y4M Face Mocking files
│   ├── generate-y4m.sh                    # Generates Y4M videos from JPEGs
│   └── baseline.jpg                       # Real student face for TC-1 & TC-6
│
├── excel/                                 # Test Data & Reporting
│   ├── Proctoring Pro.xlsx                # Source of truth test cases
│   └── results/                           # Timestamped test execution reports
│
├── config/
│   └── env.config.js                      # Loads .env into config object
│
├── .env                                   # Environment variables
├── playwright.config.js                   # Runner config: Chrome, Allure, timeouts
└── package.json                           # Dependencies and npm scripts
```

## Architecture

3-layer Page Object Model:

```text
TEST SPEC  →  calls  →  ACTION CLASS  →  uses  →  PAGE OBJECT
(what to test)          (how to do it)            (where to find it)
```

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps

# Create .env from template
cp .env.example .env
```

Update `.env` with your actual values:

```env
# OrangeHRM
BASE_URL=https://your-app-url.com/login
USER2_EMAIL=your_username
USER2_PASSWORD=your_password
AUTH_STATE_PATH=.auth/state.json

# eLearning23 LMS (Proctoring Pro)
LMS_BASE_URL=https://education.elearning23.com/
LMS_STUDENT_EMAIL=sazidnx23@yopmail.com
LMS_STUDENT_PASSWORD=Admin@123
LMS_COURSE_NAME=Computational Problem Solving
LMS_QUIZ_NAME=Test Quiz
```

## Running Tests

| Command | Mode | Workers |
|---------|------|---------|
| `npm run test` | Serial (default) | 1 |
| `npx playwright test --headed` | Headed mode (visible) | Configurable |
| `npm run smoke` | Smoke tagged | Configured |
| `npm run regression` | Regression tagged | Configured |

## Test Coverage

### OrangeHRM
| Suite | Tests |
|-------|-------|
| Login | Fresh login, stored auth verification, negative logins |
| Dashboard | Dashboard heading, Quick Launch cards, widgets |
| Sign Out | Logout redirect, session invalidation |
| Navigation | Sidebar visibility, Admin, PIM, Leave modules |

### Proctoring Pro (eLearning23 LMS)
These tests assert the camera validation logic for quizzes on Moodle using automated Chromium fake-media flags.

| Suite | Description | Expected |
|-------|-------------|----------|
| **TC-1** | Face validation on quiz start matches real enrolled user | PASS ("Face matched") |
| **TC-2** | Face mismatch (different user face video) | PASS ("Face not matched") |
| **TC-3** | Camera permission denied block | PASS (Permission error) |
| **TC-4** | No camera device physically available | PASS (Not detected error) |
| **TC-5 Leg A** | Suspicious activity - no face detected | PASS (Face not matched) |
| **TC-5 Leg B** | Suspicious activity - multiple faces detected | PASS (Face not matched) |
| **TC-6** | Full flow: Face Match -> Agree -> Attempt Quiz -> Submit | PASS (Successful submission) |

## Proctoring Pro: Fake Webcams & Face Matching
Playwright runs these tests using Chromium's `--use-file-for-fake-video-capture` flag to simulate webcam feeds without physical hardware.

1. Store the actual student's photo at `data/fixtures/face/baseline.jpg`.
2. Run `bash data/fixtures/face/generate-y4m.sh` *(Requires `ffmpeg` installed via `brew install ffmpeg`)*.
3. Playwright automatically loads `.y4m` files mapped to specific test cases to trigger the expected proctoring outcomes!

## Excel Result Reporting
For the Proctoring Pro test cases, results are automatically written to a timestamped Excel file.
- **Source**: `excel/Proctoring Pro.xlsx`
- **Output**: `excel/results/Proctoring Pro - <timestamp>.xlsx`

Check the `Actual Result` column inside the `Student` sheet to see PASS/FAIL status along with error messages and screenshots!

## CI/CD
GitHub Actions (`.github/workflows/playwright.yml`) triggers on push/PR to `main` and daily schedule. It runs tests, generates an Allure HTML report, and optionally emails it.
