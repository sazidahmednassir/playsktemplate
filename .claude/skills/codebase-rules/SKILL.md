---
name: codebase-rules
description: Authoritative codebase rules and spec file generation guidelines. Auto-loaded reference for all spec/page/action generators. Defines comment style, Excel-tab → spec-file mapping, folder structure, and the Rentora module test inventory.
user-invocable: false
allowed-tools: Read
---

# Codebase Rules — Spec File Generation Guidelines

These rules are authoritative. Every other skill that creates or edits files under `tests/`, `actions/`, or `pages/` must comply with them.

## 1. Documentation Comment Restriction

Do **not** use block-style JSDoc comments inside `actions/`, `pages/`, or spec
files. Prefer meaningful names and short inline comments.

```js
// Allowed
async signInAsOwner() {}
```

> Exception: the `/add-comments` skill explicitly governs JSDoc on actions and TC
> headers on specs. Outside that skill, do not add JSDoc blocks.

## 2. Layer Responsibilities (POM)

- `pages/` — **locators only**. No assertions, no logic. One class per page.
- `actions/` — **business logic / steps**. Compose page locators; no assertions.
- `tests/` — **assertions only**, via `expect`. Every spec requires the custom fixture.

## 3. Excel Tab → Spec File Mapping

Test cases live in `data/testcases.js` grouped by **module** (= Excel sheet).
Each module maps to a single spec file. Never create one spec per test case.

| Excel Sheet / Module | Spec File |
| -------------------- | --------- |
| Authentication       | `tests/auth.spec.js` |
| GuestBrowsing        | `tests/guest-browsing.spec.js` |
| SearchFilters        | `tests/search-filter.spec.js` |
| OwnerPortal          | `tests/owner-portal.spec.js` |
| AdminPortal          | `tests/admin-portal.spec.js` |
| AccessControl        | `tests/rbac-security.spec.js` |
| Security             | `tests/rbac-security.spec.js` |

The `result.for(sheet, tcId, detail)` call in each test MUST use the exact
module/sheet name from the table above so the Excel writer finds the row.

## 4. Folder Structure

```
data/testcases.js          # master TC inventory (single source of truth)
scripts/generate-excel.js  # builds excel/Rentora-Testcases.xlsx
scripts/generate-report.js # builds docreport/Rentora-Test-Report.docx
pages/                     # locators (pages/owner/*, pages/admin/* for portals)
actions/                   # AuthActions, NavActions, ...
tests/                     # *.spec.js + fixture/customfixture.js
utils/RentoraResultWriter.js
config/env.config.js
```

## 5. Rentora Module Test Inventory

Modules and representative coverage (full list in `data/testcases.js`):

- **Authentication** — register (valid/invalid/duplicate/terms/phone), login
  (owner/admin/renter/invalid/empty), verify-email gate, logout.
- **GuestBrowsing** — home, search catalogue, type filter, property detail,
  PII gating, city pages, 404s.
- **SearchFilters** — price slider health, console-error health, type/bedroom/combined filters.
- **OwnerPortal** — dashboard, my listings, 10-step wizard, pricing BVA, IDOR, profile.
- **AdminPortal** — dashboard KPIs, review queue, approve/reject, users, role filter, ban, NID verify.
- **AccessControl** — guest/owner/renter/admin route guards.
- **Security** — contact-PII gating, error info-disclosure, password hashing, CSRF, banned login.

## 6. Generator Contract

Any automation that produces specs must:
1. Read the module name from `data/testcases.js`.
2. Resolve the spec path from §3; append, never split.
3. Reuse existing pages/actions; do not duplicate helpers.
4. Register the result via `result.for(sheet, tcId, detail)`.
5. After authoring, run the TC and confirm the Excel result is written.

## 7. Cross-References
- `/add-test`, `/add-page`, `/add-action` — must follow §1–§4.
- `/add-comments` — the only skill allowed to add JSDoc.
- `/rentora-qa` — owns the analyse→Excel→automate→report workflow.
