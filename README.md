# Playwright E2E Automation Framework

A clean Playwright E2E framework built around the **Page Object Model (POM)** pattern, ready to be pointed at a new site. Skills, utilities, and harness wiring are in place; page objects, actions, and specs are intentionally empty so you can author them with the Claude skills.

> Current branch: `fresh-template`

## Project Structure

```text
playreltemp/
├── .claude/                  # Claude skills and harness config
│   └── skills/               # add-test, add-page, add-action, self-heal, run-tests, ...
│
├── .mcp.json                 # Playwright MCP server config
│
├── pages/                    # Layer 1: locators only (empty — add via /add-page)
├── actions/                  # Layer 2: business logic (empty — add via /add-action)
├── tests/                    # Layer 3: specs (empty — add via /add-test)
│   ├── fixture/
│   │   └── customfixture.js  # Shared fixture; register action classes here
│   ├── admin/
│   ├── student/
│   ├── teacher/
│   └── regression/
│
├── config/
│   └── env.config.js         # Loads environment variables from .env
│
├── data/                     # Test data (empty)
├── excel/
│   └── results/              # Timestamped result exports (populated by ExcelResultWriter)
│
├── utils/
│   └── ExcelResultWriter.js  # Writes per-TC results to excel/results/
│
├── playwright.config.js      # Single default Chrome project
├── package.json
├── CLAUDE.md                 # AI operating instructions
└── README.md
```

## Architecture

3-layer Page Object Model:

```text
TEST SPEC  →  calls  →  ACTION CLASS  →  uses  →  PAGE OBJECT
(what to test)          (how to do it)            (where to find it)
```

Every spec imports the custom fixture (`tests/fixture/customfixture.js`) to access the `actions` namespace. Register each new action class inside `customfixture.js` so it becomes available on `actions` in every test.

## Setup

```bash
npm install
npx playwright install --with-deps
cp .env.example .env
```

Update `.env` with your site's URL and credentials. The default config exposes:

| Variable           | Purpose                                  |
| ------------------ | ---------------------------------------- |
| `BASE_URL`         | Application URL under test               |
| `USER_EMAIL`       | Login username/email                     |
| `USER_PASSWORD`    | Login password                           |
| `AUTH_STATE_PATH`  | Storage state path (default `.auth/state.json`) |

Add more env-driven values in `config/env.config.js` as the suite grows.

## Running Tests

| Command                 | Purpose                                     |
| ----------------------- | ------------------------------------------- |
| `npm run test`          | Run Playwright tests in default serial mode |
| `npm run test:parallel` | Run tests in parallel (`PARALLEL=true`)     |
| `npm run test:serial`   | Run tests in serial mode                    |
| `npm run smoke`         | Run tests tagged `@smoke`                   |
| `npm run regression`    | Run tests tagged `@regression`              |

`pretest` clears `excel/results/*.xlsx` before every run.

## Authoring with Claude Skills

| Skill              | Use when                                                       |
| ------------------ | -------------------------------------------------------------- |
| `/setup-env`       | First-time setup: deps, `.env`, browsers, verification         |
| `/add-page`        | Create or update a page object with new locators               |
| `/add-action`      | Create or update an action class with new step methods         |
| `/add-test`        | Create a new spec following the POM pattern                    |
| `/add-comments`    | Add JSDoc to actions (locator traces) and specs (TC metadata)  |
| `/run-tests`       | Execute the full suite (serial or parallel)                    |
| `/self-heal`       | Auto-detect and fix broken locators after failures             |
| `/how-it-works`    | Full project guide                                             |

## Excel Reporting (optional)

`utils/ExcelResultWriter.js` writes a per-run timestamped result file to `excel/results/` whenever a spec registers TC titles via `TC_BY_TITLE` and wires it into `afterEach`. Leave this opt-in per spec — it does nothing unless invoked.

## Notes

- All tests must `require("../fixture/customfixture")` to share the `actions` fixture.
- Page objects hold locators only — no assertions, no logic.
- Assertions live in the spec; reusable flows live in actions.
- Credentials and URLs come from `config/env.config.js` — never hardcoded.
