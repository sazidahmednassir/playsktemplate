---
name: add-comments
description: Add structured JSDoc comments to action methods and test specs. Actions get step-by-step locator traces. Tests get TC IDs, preconditions, steps, validation, and expected results.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Comments — Document Actions and Test Specs

Add human-readable comments to action classes and test spec files so any team member can understand the full flow.

## Action Class Comment Template

Every method in `actions/StudentLMSActions.js` gets a JSDoc block with:

```javascript
/**
 * Brief description of what this method does
 * Used by: which TC in tests/student/student.spec.js calls this method
 * @param {type} paramName - What the parameter is and where it comes from
 * Step 1: What happens → PageObject.getLocatorName → actual Playwright selector
 * Step 2: Next action → PageObject.getLocatorName → actual Playwright selector
 * ...
 */
```

### Action Comment Rules

1. **First line**: One sentence — what the method does
2. **Used by**: Which TC title calls this (skip for utility methods)
3. **@param**: Every parameter with type, name, and source (e.g., "from config.lms.student.email")
4. **Steps**: Numbered, each showing:
   - What happens (e.g., "Fill email", "Click Validate Face", "Assert visible")
   - Page object locator used (e.g., `StudentLMSPage.getValidateFaceBtn`)
   - Actual Playwright selector (e.g., `page.locator("#fcvalidate")`)
5. **@returns**: If the method returns a value, document what it returns

### Action Comment Example

```javascript
/**
 * Click the Validate Face button and wait for the proctoring plugin response
 * Used by: TC-1, TC-2, TC-3, TC-4, TC-5a, TC-5b, TC-6
 * Step 1: Click Validate Face → StudentLMSPage.getValidateFaceBtn → page.locator("#fcvalidate")
 * Step 2: Wait for face validation popup → StudentLMSPage.getFaceValidationPopup → page.locator('[role="dialog"]...')
 */
async clickValidateFace() {
```

---

## Test Spec Comment Template

Every test in `tests/student/student.spec.js` gets a JSDoc block with:

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

1. **TC ID**: Format `TC-N` matching the Excel row number (e.g., `TC-1`, `TC-5a`, `TC-6`)
2. **Precondition**: Session state, camera fixture in use, permissions granted/denied
3. **Steps**: Numbered user-facing actions (not code-level — "Click Validate Face" not "call clickValidateFace()")
4. **Validation**: The actual assertion — what element or state is checked, include the Playwright locator
5. **Expected**: Plain English — what the user should see if the test passes

### Test Comment Example

```javascript
/**
 * TC-1: Face validation on quiz start shows 'Face matched'
 * Precondition: Student logged in, baseline.y4m fed to Chromium fake camera, camera+mic granted
 * Steps:
 *   1. Navigate to the course and open the quiz
 *   2. Click Attempt Quiz or Continue Attempt
 *   3. Click Validate Face
 *   4. Read the face validation message
 * Validation: Text matches /face\s*matched/i → StudentLMSPage.getFaceMatchedMessage
 * Expected: Proctoring Pro popup shows "Face Validation: Face matched."
 */
```

---

## How to Run This Skill

1. Read the target file (action or test spec)
2. Read `pages/StudentLMSPage.js` to get exact selectors for each locator
3. Add comments following the templates above
4. Do NOT change any code — only add comments
5. Verify the file still runs: `npx playwright test tests/student/student.spec.js --workers=1`

## Existing TC ID Ranges

| Module | IDs in use |
|--------|------------|
| Student (Proctoring Pro) | TC-1, TC-2, TC-3, TC-4, TC-5a, TC-5b, TC-6 |

When adding new Student TCs, continue from TC-7 onward.
