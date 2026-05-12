# Playwright E2E Automation Framework

Playwright E2E test automation framework built using the **Page Object Model (POM)** pattern. This repository includes Proctoring Pro coverage for the eLearning23 LMS and supporting framework files for automated test generation and self-healing.

> Current branch: `proctoring`

## Project Structure

```text
playreltemp/
├── .claude/                               # Claude skill definitions and AI config
│   ├── CLAUDE.md                          # AI identity, style, avoidances
│   └── skills/                            # Claude Code skills
│
├── .mcp.json                              # Playwright MCP server config
├── actions/                               # Layer 2: business logic methods
│   └── StudentLMSActions.js               # Proctoring Pro action flows
│
├── pages/                                 # Layer 1: locators only
│   └── StudentLMSPage.js                  # Proctoring Pro page elements
│
├── tests/                                 # Layer 3: test specs
│   ├── fixture/
│   │   └── customfixture.js               # Shared fixtures and action injection
│   ├── regression/                         # Existing regression specs
│   └── student/                            # Proctoring Pro student flow specs
│
├── config/
│   └── env.config.js                      # Loads environment variables
│
├── data/fixtures/face/                    # Face fixture assets and video generation
│   ├── generate-y4m.sh                    # Generate .y4m files from JPEGs
│   └── baseline.jpg                       # Reference face image for proctoring tests
│
├── excel/                                 # Test case source and result reports
│   ├── Proctoring Pro.xlsx                # Proctoring source test matrix
│   └── results/                           # Timestamped result exports
│
├── playwright.config.js                   # Playwright runner config
├── package.json                           # Scripts and dependencies
└── README.md                              # Project documentation
```

## Architecture

3-layer Page Object Model:

```text
TEST SPEC  →  calls  →  ACTION CLASS  →  uses  →  PAGE OBJECT
(what to test)          (how to do it)            (where to find it)
```

## Setup

```bash
npm install
npx playwright install --with-deps
cp .env.example .env
```

Update `.env` with your actual values.

## Running Tests

| Command                 | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `npm run test`          | Run Playwright tests in default serial mode |
| `npm run test:parallel` | Run tests in parallel mode                  |
| `npm run test:serial`   | Run tests in serial mode                    |
| `npm run smoke`         | Run smoke tests tagged `@smoke`             |
| `npm run regression`    | Run regression tests tagged `@regression`   |

## Proctoring Pro Coverage

The `student` test suite covers face validation and camera permission flows for the eLearning23 LMS proctoring experience.

| Case  | Description                                  |
| ----- | -------------------------------------------- |
| TC-1  | Face validation matches enrolled user        |
| TC-2  | Face mismatch scenario                       |
| TC-3  | Camera permission denied                     |
| TC-4  | No camera device available                   |
| TC-5a | Suspicious activity: no face detected        |
| TC-5b | Suspicious activity: multiple faces detected |
| TC-6  | Full proctoring + quiz attempt flow          |

## Fake Webcam Workflow

Playwright uses Chromium fake media flags to simulate webcams:

1. Store the reference image at `data/fixtures/face/baseline.jpg`
2. Run `bash data/fixtures/face/generate-y4m.sh` (requires `ffmpeg`)
3. Test suites use generated `.y4m` files to simulate camera input

## Excel Reporting

Proctoring test execution results are written to Excel automatically.

- Source: `excel/Proctoring Pro.xlsx`
- Output: `excel/results/Proctoring Pro - <timestamp>.xlsx`

## Notes

- All tests use `tests/fixture/customfixture.js` to inject shared fixtures and action helpers.
- The current branch for this work is `proctoring`.
- The repository is configured for Playwright with `@playwright/test`, `allure-playwright`, and Excel result reporting.
