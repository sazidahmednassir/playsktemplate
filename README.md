# Playwright E2E Automation Framework

A **Playwright E2E automation framework** for LMS proctoring applications, built on the **Page Object Model (POM)** pattern. Includes Claude skills for test authoring, self-healing locators, Excel result reporting, and AI-assisted development.

> **Status**: Active development | **Current branch**: `main` | **Remotes**: `origin` (playreltemp), `sk` (playsktemplate)

## Project Structure

```text
playreltemp/
├── .claude/                          # Claude skills & configuration
│   └── skills/
│       ├── how-it-works/             # Complete project guide
│       ├── setup-env/                # Environment setup instructions
│       ├── add-test/                 # Create new test specs
│       ├── add-page/                 # Create page objects
│       ├── add-action/               # Create action classes
│       ├── add-comments/             # JSDoc documentation
│       ├── run-tests/                # Test execution guide
│       ├── self-heal/                # Auto-fix broken locators
│       ├── proctoring/               # Proctoring Pro LMS tests
│       ├── codebase-rules/           # POM rules & conventions
│       └── project-reference/        # Full codebase map
│
├── .mcp.json                         # Playwright MCP server config
├── CLAUDE.md                         # AI operating instructions
│
├── pages/                            # Page objects (locators only)
│   └── .gitkeep
│
├── actions/                          # Action classes (business logic)
│   └── .gitkeep
│
├── tests/                            # Test specifications
│   ├── fixture/
│   │   └── customfixture.js          # Shared fixture registry
│   └── regression/                   # Regression test suites
│
├── config/
│   └── env.config.js                 # Environment variable config
│
├── data/
│   ├── fixtures/
│   │   └── face/                     # Proctoring face recognition fixtures (Y4M files)
│   │       ├── generate-y4m.sh       # Y4M file generator script
│   │       └── README.md
│   ├── _perm_test.txt
│   └── .gitkeep
│
├── excel/
│   └── results/                      # Timestamped result exports
│
├── utils/
│   └── ExcelResultWriter.js          # Excel result writer utility
│
├── test-results/                     # Playwright test reports
├── Screenshots/                      # Test screenshots
│
├── playwright.config.js              # Playwright configuration
├── package.json
├── .env.example                      # Environment template
└── README.md
```

## Architecture

**3-Layer Page Object Model (POM):**

```
SPEC (expectations only)
  ↓
  → ACTION CLASS (business logic & steps)
      ↓
      → PAGE OBJECT (locators & element getters)
```

Each test imports `tests/fixture/customfixture.js`, which provides the `actions` namespace. Register new action classes in `customfixture.js` to make them available in all tests.

**Key Principles:**
- **Pages**: Define locators only — no assertions, no business logic
- **Actions**: Define reusable flows and step methods — call page methods
- **Specs**: Define expectations and test flow — call action methods
- **Config**: All credentials and URLs come from `config/env.config.js` (loaded from `.env`)

## Setup

**1. Install dependencies and browsers:**

```bash
npm install
npx playwright install --with-deps
```

**2. Configure environment:**

```bash
cp .env.example .env
```

Then edit `.env` with your target LMS URL and credentials:

| Variable           | Purpose                                  | Example |
| ------------------ | ---------------------------------------- | ----------- |
| `BASE_URL`         | Application login URL                    | `https://your-lms.com/login/index.php` |
| `LMS_BASE_URL`     | LMS root URL (optional for LMS projects) | `https://your-lms.com/` |
| `USER_EMAIL`       | Test user email/username                 | `testuser@example.com` |
| `USER_PASSWORD`    | Test user password                       | `(from .env, not committed)` |
| `AUTH_STATE_PATH`  | Playwright session storage path          | `.auth/state.json` |

**3. Verify setup:**

```bash
npm run test -- --dry-run
```

## Running Tests

**Basic commands:**

```bash
npm run test              # Run tests in default serial mode
npm run test:parallel    # Run tests in parallel
npm run test:serial      # Explicit serial mode
npm run smoke            # Run tests tagged @smoke
npm run regression       # Run tests tagged @regression
```

**Advanced options:**

```bash
npx playwright test --grep "TC-123"     # Run specific TC by ID
npx playwright test --debug             # Debug mode with inspector
npx playwright test --headed            # Run in visible browser
```

**Before each test run:**
- `pretest` script clears old Excel results: `rm -f excel/results/*.xlsx`
- New results are written to timestamped files in `excel/results/`

## Authoring Tests with Claude Skills

All test development is AI-assisted via Claude skills in `.claude/skills/`:

| Skill | Trigger / Use | Purpose |
| ----- | ------------- | --------- |
| `/setup-env` | `@workspace setup` | First-time setup: deps, `.env`, browsers, Playwright install |
| `/add-page` | `@workspace add page` | Create or update page objects with locators |
| `/add-action` | `@workspace add action` | Create or update action classes with business logic |
| `/add-test` | `@workspace generate test case` | Create new test specs following POM pattern |
| `/add-comments` | `@workspace add comments` | Add JSDoc to actions (locator traces) and specs (TC metadata) |
| `/run-tests` | `@workspace run tests` | Execute full test suite (serial or parallel) |
| `/self-heal` | `@workspace self-heal` | Auto-detect and fix broken locators after test failures |
| `/proctoring` | `@workspace generate test case` (Student tab) | Author Proctoring Pro tests for face validation, camera permission, suspicious activity |
| `/how-it-works` | `@workspace how it works` | Full project architecture and conventions guide |
| `/codebase-rules` | Referenced by skills | POM rules, spec file mapping, Excel integration |

**Quick Start:**
1. Run `/setup-env` to verify environment
2. Use `/add-test` to create new specs
3. Use `/add-page` and `/add-action` as needed
4. Use `/self-heal` after test failures

## Excel Reporting

**Automated TC Result Tracking:**

`utils/ExcelResultWriter.js` automatically writes per-test-case results to Excel files in `excel/results/`:

- **Trigger**: Register TC title in `TC_BY_TITLE` map and wire into `afterEach` hook (per spec)
- **Output**: Timestamped `.xlsx` file with columns: TC ID, Title, Status, Actual Result, Screenshot, Timestamp
- **Cleanup**: `pretest` script removes old result files before each run
- **Optional**: Leave blank for specs that don't use Excel reporting

**Example Integration:**

```javascript
const TC_BY_TITLE = {
  'TC-001': 'User can login with valid credentials',
  'TC-002': 'User cannot login with invalid password',
};

test.afterEach(async ({ page }, testInfo) => {
  const excelWriter = new ExcelResultWriter('Proctoring Pro');
  excelWriter.writeResult(testInfo, TC_BY_TITLE);
});
```

## Git Branches & Remotes

**Branches:**
- `main` — Primary development branch
- `proctoring` — Proctoring Pro LMS-specific tests
- `fresh-template` — Clean template without proctoring code

**Remotes:**
- `origin` — https://github.com/sazidahmednassir/playreltemp (primary)
- `sk` — git@github.com:sazidahmednassir/playsktemplate.git (secondary template)

**Workflow:**
```bash
git fetch --all                    # Sync all branches
git checkout proctoring            # Switch to proctoring branch
git push origin main               # Push to primary remote
git push sk main                   # Sync to template remote
```

## Best Practices

**Test Development:**
- All tests must `require("../fixture/customfixture")` to access `actions`
- Page objects hold **locators only** — no assertions, no business logic
- Action methods handle **business logic** — multiple page interactions combined
- Specs hold **assertions only** — expectations and test flow

**Security:**
- Never commit `.env` files — use `.env.example` as template
- Credentials come from environment variables via `config/env.config.js`
- No hardcoded URLs or credentials anywhere in code

**Quality:**
- Run `/self-heal` after any test failure to auto-fix broken locators
- Add JSDoc comments using `/add-comments` skill
- Use `@smoke` and `@regression` tags for test filtering

## Troubleshooting

**Tests won't run:**
- Verify `.env` is configured with valid `BASE_URL` and credentials
- Run `npx playwright install --with-deps` to ensure all dependencies are installed
- Check `test-results/` for detailed failure reports

**Locator not found:**
- Run test with `--headed --debug` flags to see the browser
- Use Playwright Inspector to identify correct selectors
- Update page object and rerun
- Or use `/self-heal` skill to auto-fix

**Excel results not writing:**
- Ensure spec registers `TC_BY_TITLE` and calls `ExcelResultWriter` in `afterEach`
- Check `excel/results/` for timestamped output files
- Verify `pretest` script clears old results before each run

**Git conflicts on branches:**
```bash
git fetch --all
git rebase origin/main          # Rebase current branch on main
git push --force origin <branch> # Force push if needed
```

## Support

For detailed architecture and development workflow, see:
- `.claude/skills/how-it-works/SKILL.md` — Full project guide
- `.claude/skills/codebase-rules/SKILL.md` — POM conventions and rules
- `CLAUDE.md` — AI assistant operating instructions
