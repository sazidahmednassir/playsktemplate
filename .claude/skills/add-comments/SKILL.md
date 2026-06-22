---
name: add-comments
description: Add structured JSDoc comments to action methods and test specs. Actions get step-by-step locator traces. Tests get TC IDs, preconditions, steps, validation, and expected results.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Comments — Document Actions and Test Specs

Add human-readable comments to action classes and test spec files so any team member can understand the full flow.

## Action Class Comment Template

Every method in an action class (e.g. `actions/ReturnActions.js`) gets a JSDoc block with:

```javascript
/**
 * Brief description of what this method does
 * Used by: which TC in tests/<area>/<area>.spec.js calls this method
 * @param {type} paramName - What the parameter is and where it comes from
 * Step 1: What happens → PageObject.getLocatorName → actual Playwright selector
 * Step 2: Next action → PageObject.getLocatorName → actual Playwright selector
 * ...
 */
```

### Action Comment Rules

1. **First line**: One sentence — what the method does
2. **Used by**: Which TC title calls this (skip for utility methods)
3. **@param**: Every parameter with type, name, and source (e.g., "from config.admin.owner.email")
4. **Steps**: Numbered, each showing:
   - What happens (e.g., "Fill email", "Click Return", "Read Stock Updated")
   - Page object locator used (e.g., `ReturnDetailPage.getSettleButton`)
   - Actual Playwright selector (e.g., `page.locator("#fcvalidate")`)
5. **@returns**: If the method returns a value, document what it returns

### Action Comment Example

```javascript
/**
 * Open a return record from the Returns & Refunds list and read its facts
 * Used by: TC-6, TC-7, TC-9, TC-10
 * Step 1: Open Returns list → ReturnsListPage.getRows → table tbody tr
 * Step 2: Click the row's View → ReturnsListPage.getViewButtonFor → role=button "View"
 * Step 3: Read Settlement + Details → ReturnDetailPage.getStockUpdatedValue
 */
async openReturn(rtn) {
```

---

## Test Spec Comment Template

Every test in an Area spec (e.g. `tests/return/return.spec.js`) gets a JSDoc block with:

```javascript
/**
 * TC-N: Short title of what is being tested
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

1. **TC ID**: Format `TC-N` matching the ticket Test-Case row (e.g., `TC-1`, `TC-6`)
2. **Precondition**: Session state (which staff role), order status required, data prerequisites
3. **Steps**: Numbered user-facing actions (not code-level — "Click Return" not "call clickReturnAction()")
4. **Validation**: The actual assertion — what element or state is checked, include the Playwright locator
5. **Expected**: Plain English — what the user should see if the test passes

### Test Comment Example

```javascript
/**
 * TC-6: Settling a Return restocks the returned item
 * Precondition: Logged in as Store Owner; a settled Return-type return exists
 * Steps:
 *   1. Open Returns & Refunds
 *   2. Open a settled Return record
 *   3. Read the Settlement panel + Details
 * Validation: Details "Stock Updated" → ReturnDetailPage.getStockUpdatedValue
 * Expected: Stock Updated = Yes and the item is restocked in Inventory
 */
```

---

## How to Run This Skill

1. Read the target file (action or test spec)
2. Read the relevant page object (e.g. `pages/ReturnDetailPage.js`) to get exact selectors
3. Add comments following the templates above
4. Do NOT change any code — only add comments
5. Verify the file still runs: `npx playwright test tests/return/return.spec.js --workers=1`

## Existing TC ID Ranges

| Area | IDs in use |
|------|------------|
| Order | TC-1, TC-2 |
| Return / Inventory / Refund | TC-3, TC-6, TC-7, TC-8, TC-11, TC-12 |
| Exchange | TC-9 |
| Damage | TC-10 |

When adding new TCs, continue from TC-13 onward.
