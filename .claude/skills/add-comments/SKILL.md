---
name: add-comments
description: Add structured JSDoc comments to action methods and test specs. Actions get step-by-step locator traces. Tests get TC IDs, preconditions, steps, validation, and expected results.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Comments — Document Actions and Test Specs

Add human-readable comments to action classes and test spec files so any team member can understand the full flow.

## Action Class Comment Template

Every method in `actions/*.js` gets a JSDoc block with:

```javascript
/**
 * Brief description of what this method does
 * Used by: which test spec calls this method (if applicable)
 * @param {type} paramName - What the parameter is and where it comes from
 * Step 1: What happens → PageObject.getLocatorName → actual Playwright selector
 * Step 2: Next action → PageObject.getLocatorName → actual Playwright selector
 * ...
 */
```

### Action Comment Rules

1. **First line**: One sentence — what the method does
2. **Used by**: Which test file/test name calls this (skip for utility methods)
3. **@param**: Every parameter with type, name, and source (e.g., "from config.user2.username")
4. **Steps**: Numbered, each showing:
   - What happens (e.g., "Fill username", "Click Login button", "Assert visible")
   - Page object locator used (e.g., `LoginPage.getUsernameInput`)
   - Actual Playwright selector (e.g., `page.getByPlaceholder("Username")`)
5. **@returns**: If the method returns a value, document what it returns

### Action Comment Example

```javascript
/**
 * Login and wait until the dashboard heading appears (confirms successful login)
 * @param {string} username - Username from config.user2.username
 * @param {string} password - Password from config.user2.password
 * Step 1: Calls this.login() → fills username, password, clicks Login button
 * Step 2: Wait for dashboard heading → DashboardPage.getDashboardHeading → page.locator(".oxd-topbar-header-breadcrumb", { hasText: "Dashboard" })
 */
async validLogin(username, password) {
```

---

## Test Spec Comment Template

Every test in `tests/regression/*.spec.js` gets a JSDoc block with:

```javascript
/**
 * TC-MODULE-NNN: Short title of what is being tested
 * Precondition: What must be true before the test runs
 * Steps:
 *   1. First user action
 *   2. Second user action
 *   ...
 * Validation: What element/state is checked and the selector used
 * Expected: What should happen if the test passes
 */
```

### Test Comment Rules

1. **TC ID**: Format `TC-MODULE-NNN` (e.g., `TC-LOGIN-001`, `TC-DASH-003`, `TC-NAV-002`)
2. **Module codes**: LOGIN, NEG (negative login), DASH (dashboard), SIGN (sign out), NAV (navigation) — or create new codes for new modules
3. **Precondition**: Session state, logged in/out, clean browser, beforeEach dependency
4. **Steps**: Numbered user-facing actions (not code-level — "Enter username" not "call fill()")
5. **Validation**: The actual assertion — what element or state is checked, include the CSS selector
6. **Expected**: Plain English — what the user should see if the test passes

### Test Comment Example

```javascript
/**
 * TC-DASH-004: Clicking "Assign Leave" card navigates to Leave module
 * Precondition: User is logged in (beforeEach)
 * Steps:
 *   1. Find the "Assign Leave" Quick Launch card
 *   2. Click the card
 *   3. Check the URL after navigation
 * Validation: URL no longer contains "dashboard"
 * Expected: User is navigated away from dashboard to the Assign Leave page
 */
```

### beforeEach Comment

```javascript
/**
 * beforeEach: Ensure user is authenticated before every test
 * Uses ensureLoggedIn() → navigates to app, auto re-logins if session expired
 */
```

---

## How to Run This Skill

1. Read the target file (action or test spec)
2. Read the corresponding page object to get exact selectors
3. Add comments following the templates above
4. Do NOT change any code — only add comments
5. Verify the file still runs: `npx playwright test <file> --workers=1`

## Existing TC ID Ranges

| Module | Prefix | Range |
|--------|--------|-------|
| Login | TC-LOGIN | 001-002 |
| Negative Login | TC-NEG | 001-003 |
| Dashboard | TC-DASH | 001-004 |
| Sign Out | TC-SIGN | 001-002 |
| Navigation | TC-NAV | 001-005 |

When adding new tests, continue the numbering from the last used ID in that module.
