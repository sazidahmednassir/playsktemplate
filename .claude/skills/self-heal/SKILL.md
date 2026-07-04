---
name: self-heal
description: Auto-detect and fix broken locators or UI changes when Playwright tests fail. Use after test failures to identify changed selectors and update page objects.
user-invocable: true
allowed-tools: Bash(npx playwright*) Bash(npm run test*) Bash(node scripts/*) Read Edit Glob Grep mcp__playwright__browser_navigate mcp__playwright__browser_snapshot mcp__playwright__browser_click mcp__playwright__browser_fill_form mcp__playwright__browser_take_screenshot mcp__playwright__browser_wait_for
---

# Self-Heal — Auto-Fix Broken Locators

When tests fail, diagnose and fix. **First distinguish a test defect (fix it)
from a real app defect (keep it failing as evidence).** The Rentora baseline has
3 known app defects (BUG-001/002/003) — do NOT "heal" those away.

## ⚠️ Mandatory Rule Compliance
This skill inherently follows the **Website Analysis Before Code Generation** mandate —
Step 2 (inspect live DOM with Playwright MCP) is the analysis, and Steps 3-4 (fix locators/flow)
are the code generation. Never skip Step 2 even if the error message seems obvious.

## Step 1: Read error output
- Parse the Playwright error and `evidence/results.json`.
- Find the failing locator and the failure screenshot under
  `test-results/<...>/test-failed-1.png` (screenshot on failure is enabled).

## Step 2: Inspect live DOM with Playwright MCP (MANDATORY)
1. `browser_navigate` to the failing page.
   - Renter/owner site: `http://127.0.0.1:8000/...`
   - Admin site: `http://localhost:8000/admin/...`
   - If auth is required, log in via `browser_fill_form` + `browser_click` first
     (owner1@rentora.test / admin@rentora.com.bd, pw `password`).
2. `browser_snapshot` to read the accessibility tree (roles, names, text).
3. Compare the rendered element against the failing selector.

## Step 3: Root-cause table
| Symptom | Cause | Fix location |
|---------|-------|--------------|
| element not found | selector changed | the relevant `pages/*.js` |
| strict-mode violation (N elements) | selector too broad | add `{ exact: true }` / scope / `.first()` in `pages/*.js` |
| timeout waiting | flow/route changed | `actions/*.js` |
| URL assertion failed | redirect changed | `actions/*.js` or spec expectation |
| 500 / stack trace / console errors | **app defect** | do NOT heal — report as a bug |

## Step 4: Apply the fix
- **Locator-only**: edit the property in the matching `pages/*.js`; never touch actions/specs.
- **Flow**: edit the method in `actions/*.js`; report "flow changed in <module>".
- **Feature removed**: skip the test and report it.

## Step 5: Verify
Re-run ONLY the previously failing tests:
```bash
npx playwright test --grep "AUTH-08"
```
Report `old locator -> new locator` and the file changed. Regenerate the report
if results changed: `node scripts/generate-report.js`.

## Rules
- NEVER put assertions/logic in page objects.
- NEVER hardcode credentials/URLs — use `config/env.config.js`.
- ALWAYS `browser_snapshot` before guessing a locator change.
- Preserve POM: locator fix in `pages/`, flow fix in `actions/`.
