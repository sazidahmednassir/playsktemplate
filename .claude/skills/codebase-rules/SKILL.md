---
name: codebase-rules
description: Authoritative codebase rules and spec file generation guidelines. Auto-loaded reference for all spec/page/action generators. Defines comment style, Excel-tab → spec-file mapping, folder structure, and the Student module test inventory.
user-invocable: false
allowed-tools: Read
---

# Codebase Rules — Spec File Generation Guidelines

These rules are authoritative. Every other skill that creates or edits files under `tests/`, `actions/`, or `pages/` must comply with them.

## 1. Documentation Comment Restriction

Do **not** use block-style documentation comments inside:

- `actions/`
- `pages/`
- spec files
- any file under the `tests/` directory

### Not Allowed

```js
/**
 * Precondition step: open login page and log in as a student.
 * @param {string} baseURL
 * @param {string} email
 * @param {string} password
 */
async loginStudent() {}
```

### Allowed

- Meaningful function names
- Inline comments only when necessary
- Clear method naming conventions

```js
async loginAsStudent(email, password) {}
```

> Exception: the `/add-comments` skill explicitly governs JSDoc on actions and TC headers on specs. Outside of that skill, do not add JSDoc blocks.

## 2. Excel Tab → Spec File Mapping

All test cases under the same Excel tab must live in a **single** spec file, grouped by tab/module name.

| Excel Tab | Generated Spec File             |
| --------- | ------------------------------- |
| Student   | `tests/student/student.spec.js` |
| Teacher   | `tests/teacher/teacher.spec.js` |
| Quiz      | `tests/quiz/quiz.spec.js`       |
| Course    | `tests/course/course.spec.js`   |
| Admin     | `tests/admin/admin.spec.js`     |

Rules:

- Read Excel tabs dynamically.
- Create or update spec files based on tab names.
- Append all related test cases into the same spec file.
- Never create a separate spec file per test case.

## 3. Folder Structure

```bash
tests/
 ├── student/
 │    └── student.spec.js
 ├── teacher/
 │    └── teacher.spec.js
 ├── quiz/
 │    └── quiz.spec.js
pages/
actions/
utils/
```

Each spec file must:

- Contain module-specific test cases only
- Reuse common actions/utilities
- Avoid duplicate helper methods
- Follow tab-wise organization from Excel

## 4. Student Module — Required Test Cases

Source: Proctoring Pro plugin workflow (https://proctoringformoodle.com/).

All of the following must exist in `tests/student/student.spec.js`:

1. Face validation on quiz start
2. Face mismatch on quiz start
3. Camera permission denied
4. No camera device available
5. Suspicious activity — no face / multiple faces
6. Full proctoring flow (match → start → submit)

Student module coverage areas:

- Face validation
- Suspicious activity detection
- Camera permission validation
- No-face detection
- Multiple-face detection

## 5. Generator Contract

Any automation that produces specs must:

1. Read the Excel tab name.
2. Resolve the target spec path from the table in §2.
3. Append new test cases into that spec — never split.
4. Reuse existing actions/pages; do not duplicate helpers.
5. Follow the comment rules in §1.

## 6. Cross-References

- `/add-test` — creates/updates spec files; must follow §1, §2, §3.
- `/add-page` — page objects are locators only (no assertions/logic).
- `/add-action` — action methods live here, not in pages.
- `/add-comments` — the only skill allowed to add JSDoc, and only in the patterns it defines.
- `/proctoring` — owns the Student module TCs listed in §4.
