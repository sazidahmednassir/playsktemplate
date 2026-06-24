---
name: add-comments
description: Add structured JSDoc comments to action methods and test specs. Actions get step-by-step locator traces. Tests get TC IDs, preconditions, steps, validation, and expected results.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Comments — Document Actions and Test Specs

This is the **only** skill allowed to add JSDoc blocks to `actions/` and `tests/`
(see `codebase-rules` §1). Add comments; do not change behaviour.

## Action method template

```javascript
/**
 * Brief description of what this method does
 * Used by: which TC(s) call it (e.g. AUTH-08, AUTH-13)
 * @param {string} email - source, e.g. from config.owner.username
 * Step 1: Go to login → AuthActions.gotoLogin → page.goto(`${base}/login`)
 * Step 2: Fill email → LoginPage.emailInput → getByRole("textbox", { name: "Email address" })
 * Step 3: Submit → LoginPage.signInButton → getByRole("button", { name: "Sign in" })
 */
async signIn(email, password, base) {}
```

Rules: first line = what it does; `Used by` = TC ids; `@param` with source;
numbered steps each showing the page-object locator and the underlying selector.

## Test spec template

```javascript
/**
 * AUTH-08: Login with valid owner credentials
 * Precondition: seeded owner owner1@rentora.test exists and is verified
 * Steps:
 *   1. Open /login
 *   2. Enter owner email + password
 *   3. Click Sign in
 * Validation: URL matches /owner\/dashboard/ (toHaveURL)
 * Expected: owner lands on the owner dashboard
 */
test("AUTH-08 login with valid owner credentials", async ({ page, actions, result }) => {});
```

Rules:
1. **TC ID** matches `data/testcases.js` (e.g. `AUTH-08`, `GUEST-03`, `RBAC-01`).
2. **Precondition**: session state / role / seeded data.
3. **Steps**: user-facing actions, not code calls.
4. **Validation**: the actual assertion + locator/matcher used.
5. **Expected**: plain-English pass condition.

## How to run
1. Read the target file and the page objects it uses (for exact selectors).
2. Add comments per the templates; change no code.
3. Verify it still runs: `npx playwright test <file> --workers=1`.

## TC ID ranges in use
| Module | IDs |
|--------|-----|
| Authentication | AUTH-01 … AUTH-14 |
| GuestBrowsing | GUEST-01 … GUEST-11 |
| SearchFilters | SRCH-01 … SRCH-06 |
| OwnerPortal | OWN-01 … OWN-08 |
| AdminPortal | ADM-01 … ADM-09 |
| AccessControl | RBAC-01 … RBAC-05 |
| Security | SEC-01 … SEC-05 |

Continue numbering within a module when adding new TCs.
