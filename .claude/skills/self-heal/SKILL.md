---
name: self-heal
description: Auto-detect and fix broken locators or UI changes when Playwright tests fail. Use after test failures to identify changed selectors and update page objects.
user-invocable: true
allowed-tools: Bash(npx playwright*) Bash(npm run test*) Read Edit Glob Grep mcp__playwright__browser_navigate mcp__playwright__browser_snapshot mcp__playwright__browser_click mcp__playwright__browser_fill_form mcp__playwright__browser_take_screenshot mcp__playwright__browser_wait_for
---

# Self-Heal — Auto-Fix Broken Locators

When tests fail, follow this process to diagnose and fix.

## Step 1: Read Error Output

- Parse the Playwright error output and trace logs
- Identify which locator or element caused the failure
- Check failure screenshots in `allure-results/` (find most recent `*-attachment.png` files)

## Step 2: Inspect Live DOM with Playwright MCP Server (MANDATORY)

**Always use the Playwright MCP server to inspect the live page before modifying any locator or flow.**

1. Use `browser_navigate` to open the failing page in the MCP browser.
2. Use `browser_snapshot` to capture the accessibility tree — this reveals the actual element structure, text content, roles, and IDs as rendered by the browser.
3. Compare snapshot output against the selector that failed. The actual text or attribute may differ from the regex in the page object.
4. If the page requires login first, navigate to `/login/index.php` and use `browser_fill_form` + `browser_click` to authenticate before navigating to the target page.

Screenshots in `allure-results/` provide a visual reference but the MCP `browser_snapshot` gives the actual DOM — always prefer `browser_snapshot` when the screenshot is ambiguous or the element is hidden.

## Step 3: Identify the Root Cause

| Symptom | Cause | Fix Location |
|---------|-------|--------------|
| Locator not found / `<element(s) not found>` | Selector changed in UI | the relevant `pages/*.js` (e.g. `OrdersPage.js`, `ReturnCreatePage.js`) |
| Strict mode violation (multiple elements) | Selector too broad | the relevant `pages/*.js` |
| Timeout waiting for element | Page flow changed | the relevant `actions/*.js` (e.g. `ReturnActions.js`) |
| URL assertion failed | Route/redirect changed | the relevant `actions/*.js` |
| Test scenario invalid | Feature removed | the Area spec under `tests/` (e.g. `tests/return/return.spec.js`) |

> **Heal vs defect:** only self-heal a **locator/flow break** (the framework drifted from the UI). A **real product defect** (the feature behaves wrong) must stay FAIL and be documented in the report — do not "heal" it away.

## Step 4: Apply the Fix

### Locator-only change (most common)
- Update ONLY the affected locator in the matching page object (e.g. `pages/OrdersPage.js`)
- Never touch actions or test files for a locator change

### Flow change
- Update the corresponding method in the matching action class (e.g. `actions/ReturnActions.js`)
- Flag it for review: "Flow changed in [Area], updated [action file]"

### Feature removed
- Comment out the test in the Area spec (e.g. `tests/return/return.spec.js`)
- Report: "Feature [name] appears removed, test commented out"

## Step 5: Verify

- Re-run ONLY the previously failing tests to confirm the fix
- Report: `old locator -> new locator`, which file was updated

## Rules

- NEVER put assertions or logic in page objects
- NEVER hardcode values in test files
- ALWAYS use `browser_snapshot` via MCP before guessing at a locator change
- Preserve POM structure: locator fix in `pages/`, flow fix in `actions/`
