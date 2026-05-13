---
name: add-test
description: Create a new E2E test spec file following the POM pattern. Use when asked to add new test cases, test scenarios, or test coverage.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep
---

# Add Test — Create New E2E Test Spec

Create a new Playwright test file following the project's POM architecture.

## Template

Every test file must follow this structure:

```javascript
const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const config = require("../../config/env.config");

test.describe("[Module] Tests", () => {
  test("TC-N [Test description] @tag", async ({ actions }) => {
    await actions.studentLms.loginAsStudent(
      config.lms.baseURL,
      config.lms.student.email,
      config.lms.student.password,
    );
    // Test steps using action methods
  });
});
```

## Rules

1. **File location**: follows `codebase-rules` §2 — one spec per Excel tab:
   - Student tab → `tests/student/student.spec.js`
   - Teacher tab → `tests/teacher/teacher.spec.js`
   - Quiz tab → `tests/quiz/quiz.spec.js`
   - etc.
2. **Always use custom fixture**: `require("../fixture/customfixture")`
3. **Login inside each test** — Student module tests have no shared `beforeEach` login; each test logs in independently
4. **Never hardcode credentials** — use `config.lms.student.email` / `config.lms.baseURL` etc.
5. **Use action methods** — don't write raw Playwright calls in test files
6. **Each test must be independent** — no test should depend on another test's state
7. **Register in `TC_BY_TITLE`** — every TC must have an entry so `ExcelResultWriter` captures the result
8. **Tag every test** — tag maps to a `playwright.config.js` project (e.g. `@baseline`, `@mismatch`, `@noFace`)
9. **If a new action method is needed**, create it first using `/add-action`
10. **If a new page locator is needed**, create it first using `/add-page`

## Available Actions in Fixture

```javascript
actions.studentLms   // StudentLMSActions — login, navigate quiz, face validation,
                     // camera checks, suspicious activity, start/finish attempt
```

## TC_BY_TITLE Registration (required for Excel writer)

```javascript
const TC_BY_TITLE = {
  "TC-N Test title @tag": { sheet: "Student", tcId: N },
};
```
