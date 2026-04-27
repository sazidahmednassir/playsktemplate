---
name: self-heal
description: Auto-detect and fix broken locators or UI changes when Playwright tests fail. Use after test failures to identify changed selectors and update page objects.
user-invocable: true
allowed-tools: Bash(npx playwright*) Bash(npm run test*) Read Edit Glob Grep
---

# Self-Heal — Auto-Fix Broken Locators

When tests fail, follow this process to diagnose and fix.

## Step 1: Read Error Output

- Parse the Playwright error output and trace logs
- Identify which locator or element caused the failure
- Check failure screenshots in `test-results/` directory

## Step 2: Identify the Root Cause

| Symptom | Cause | Fix Location |
|---------|-------|--------------|
| Locator not found | Selector changed in UI | `pages/*.js` |
| Strict mode violation (multiple elements) | Selector too broad | `pages/*.js` |
| Timeout waiting for element | Page flow changed | `actions/*.js` |
| URL assertion failed | Route/redirect changed | `actions/*.js` |
| Test scenario invalid | Feature removed | `tests/regression/*.spec.js` |

## Step 3: Apply the Fix

### Locator-only change (most common)
- Update ONLY the affected locator in the correct `pages/*.js` file
- Never touch actions or test files for a locator change

### Flow change
- Update the corresponding method in `actions/*.js`
- Flag it for review by reporting: "Flow changed in [module], updated [action file]"

### Feature removed
- Comment out the test in `tests/regression/*.spec.js`
- Report: "Feature [name] appears removed, test commented out"

## Step 4: Verify

- Re-run ONLY the previously failing tests to confirm the fix
- Report: `old locator -> new locator`, which file was updated

## Rules

- NEVER put assertions or logic in page objects
- NEVER hardcode values in test files
- Preserve POM structure: locator fix in `pages/`, flow fix in `actions/`
