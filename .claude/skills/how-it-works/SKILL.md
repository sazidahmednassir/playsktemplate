---
name: how-it-works
description: Complete guide to this project — what it does, how it works, how skills are organized, and all references. Use when someone new needs to understand the full system.
user-invocable: true
---

# How This Project Works

## What Is This?

A **Playwright E2E automation framework** for an **LMS proctoring** application. This repo targets a Moodle-based learning management system configured via environment variables.

See `.env.example` for setup instructions.

It is an LMS/proctoring automation project with special handling for camera validation, face matching, and fake webcam fixtures.

**Target App**: eLearning23 LMS — a Moodle-based learning management system
**Project Type**: LMS / proctoring automation (face validation, camera permissions, quiz attempt flows)
**Authentication**: Stored in `.env` and loaded by `config/env.config.js`

### Key project challenge

- The proctoring tests require a **baseline face image** and generated `.y4m` fixtures for Chromium fake-camera input.
- `data/fixtures/face/baseline.jpg` is the reference face image used to generate matching camera feeds.
- The test runtime depends on `.env` values and fake-media browser flags, not just simple page navigation.

---

## Repo Architecture

```
playreltemp/
├── CLAUDE.md                              # AI identity, style, rules (project root)
├── .claude/                               # Claude Code config
│   └── skills/                            # Claude Code skills
│       ├── how-it-works/SKILL.md          # This file — full project guide
│       ├── run-tests/SKILL.md             # /run-tests — execute test suite
│       ├── self-heal/SKILL.md             # /self-heal — auto-fix broken locators
│       ├── add-test/SKILL.md              # /add-test — create new test spec
│       ├── add-page/SKILL.md              # /add-page — create/update page object
│       ├── add-action/SKILL.md            # /add-action — create/update action class
│       ├── add-comments/SKILL.md          # /add-comments — add JSDoc to actions and specs
│       ├── proctoring/SKILL.md            # /proctoring — author/update Proctoring Pro TCs
│       ├── setup-env/SKILL.md             # /setup-env — first-time project setup
│       ├── codebase-rules/SKILL.md        # rules (auto-loaded, not user-invocable)
│       └── project-reference/SKILL.md     # Codebase map (auto-loaded)
├── .mcp.json                              # Playwright MCP server config
├── actions/
│   └── StudentLMSActions.js               # Proctoring business logic and assertions
├── pages/
│   └── StudentLMSPage.js                  # LMS locators only
├── tests/
│   ├── fixture/
│   │   └── customfixture.js               # Shared fixture injection
│   └── student/
│       └── student.spec.js                # Proctoring Pro test suite
├── config/
│   └── env.config.js                      # Loads `.env` into config object
├── data/fixtures/face/                    # Face fixture assets and Y4M generation
│   ├── generate-y4m.sh
│   └── baseline.jpg
├── excel/
│   ├── Proctoring Pro.xlsx                # Source test matrix
│   └── results/                           # Timestamped Excel exports
├── playwright.config.js                   # Runner config and browser options
├── package.json                           # Dependencies and npm scripts
└── README.md                              # Project documentation
```

---

## How the 3-Layer POM Works

```
┌─────────────────────────────────────────────────────┐
│  TEST SPEC (tests/student/student.spec.js)          │
│  - Uses custom fixture to get `actions` object      │
│  - Calls action methods, never raw Playwright APIs  │
│  - Each test is independent
└──────────────────────┬──────────────────────────────┘
                       │ calls
┌──────────────────────▼──────────────────────────────┐
│  ACTION CLASS (actions/StudentLMSActions.js)        │
│  - Constructor takes `page`                         │
│  - Contains business logic, clicks, fills, asserts  │
│  - Imports locators from page objects               │
└──────────────────────┬──────────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────────┐
│  PAGE OBJECT (pages/StudentLMSPage.js)              │
│  - Plain object with locator functions              │
│  - NO logic, NO assertions, NO interactions         │
└─────────────────────────────────────────────────────┘
```

### Why this matters:

- **UI changes?** Update only `pages/StudentLMSPage.js` — actions and specs stay untouched
- **Flow changes?** Update only `actions/StudentLMSActions.js` — specs stay untouched
- **New test scenario?** Add only a new spec in `tests/student/` and reuse existing actions

---

## How Authentication Works

This project uses `.env` to configure URLs and credentials. The workflow is:

1. `auth.setup.js` runs before tests to establish the LMS session
2. It saves browser state to `.auth/state.json`
3. `playwright.config.js` loads that state as `storageState`
4. Tests run with the saved authenticated session unless re-login is required

Note: current target login page is configured in `.env` as `BASE_URL`

---

## How to Run Tests

| Command                 | What it does                                |
| ----------------------- | ------------------------------------------- |
| `npm run test`          | Run Playwright tests in default serial mode |
| `npm run test:serial`   | Run tests serially                          |
| `npm run test:parallel` | Run tests in parallel mode                  |
| `npm run smoke`         | Run smoke-tagged tests                      |
| `npm run regression`    | Run regression-tagged tests                 |

---

## How Claude Code Skills Work

Skills live in `.claude/skills/<name>/SKILL.md` and are invoked by the AI assistant to perform repository tasks.

### Available Skills

| Skill                 | Invoke            | Purpose                                           |
| --------------------- | ----------------- | ------------------------------------------------- |
| **run-tests**         | `/run-tests`      | Run the test suite                                |
| **self-heal**         | `/self-heal`      | Fix broken locators and re-run failures           |
| **add-test**          | `/add-test`       | Create new spec files                             |
| **add-page**          | `/add-page`       | Create/update page objects                        |
| **add-action**        | `/add-action`     | Create/update action classes                      |
| **add-comments**      | `/add-comments`   | Add JSDoc to action methods and test specs        |
| **proctoring**        | `/proctoring`     | Author/update Proctoring Pro TCs and Y4M fixtures |
| **setup-env**         | `/setup-env`      | First-time project setup: env, deps, base image  |
| **codebase-rules**    | (auto)            | Authoritative rules for all skill generators      |
| **project-reference** | (auto)            | Load the codebase map                             |
| **how-it-works**      | `/how-it-works`   | Explain the repository                            |

### Playwright MCP server

This repo includes `.mcp.json`, so the assistant can use Playwright MCP capabilities to inspect browser DOM and locate elements during debug or self-heal actions.

---

## Key Files Reference

### Config Files

| File                   | What it controls                                           |
| ---------------------- | ---------------------------------------------------------- |
| `.env`                 | LMS URL, credentials, auth storage, camera mode            |
| `.env.example`         | Template for environment variables                         |
| `config/env.config.js` | Loads `.env` into a shared `config` object                 |
| `playwright.config.js` | Browser launch options, reporters, timeouts, storage state |
| `auth.setup.js`        | Global setup for login and session persistence             |

### Proctoring fixture files

- `data/fixtures/face/baseline.jpg` — reference image for face-match tests
- `data/fixtures/face/generate-y4m.sh` — converts JPEGs into Chromium fake-video `.y4m`
- `excel/Proctoring Pro.xlsx` — source test case matrix
- `excel/results/` — generated result exports after test runs

### Custom Fixture

`tests/fixture/customfixture.js` injects action helpers into every test.

---

## Important Notes

- This repository is focused on **LMS proctoring automation**, not ecommerce.
- The current site under test is configured via `BASE_URL` environment variable in `.env`.
- The proctoring flow depends on camera fixture generation and a baseline face image.
- Use `.env` values for URLs and credentials instead of hardcoding site URLs.
