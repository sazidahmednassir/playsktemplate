---
name: codebase-rules
description: Authoritative codebase rules and spec file generation guidelines. Auto-loaded reference for all spec/page/action generators. Defines comment style, ticket-Area → spec-file mapping, folder structure, and the report-annotation contract.
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
 * Precondition step: open the admin and log in as the store owner.
 * @param {string} baseURL
 */
async loginOwner() {}
```

### Allowed

- Meaningful function names
- Inline comments only when necessary
- Clear method naming conventions

```js
async loginAsOwner() {}
```

> Exception: the `/add-comments` skill explicitly governs JSDoc on actions and TC headers on specs. Outside of that skill, do not add JSDoc blocks.

## 2. Ticket Area → Spec File Mapping

Test cases are derived from a **ticket** (`tickets/*.md`), grouped by **Area**. All TCs under the same Area live in a **single** spec file.

| Ticket Area | Generated Spec File             |
| ----------- | ------------------------------- |
| Order       | `tests/order/order.spec.js`     |
| Return      | `tests/return/return.spec.js`   |
| Exchange    | `tests/exchange/exchange.spec.js` |
| Damage      | `tests/damage/damage.spec.js`   |
| Inventory   | (assert inside the relevant flow spec, e.g. `return.spec.js`) |
| Refund      | (assert inside `return.spec.js`) |

Rules:

- Read ticket Areas from the ticket's Test-Case table.
- Create or update spec files based on Area names.
- Append all related test cases into the same Area spec file.
- Never create a separate spec file per test case.

## 3. Folder Structure

```bash
tickets/                # ticket context + Test-Case matrix (source of truth)
tests/
 ├── auth.setup.js      # staff login → .auth/*.json (storageState)
 ├── order/   order.spec.js
 ├── return/  return.spec.js
 ├── exchange/ exchange.spec.js
 └── damage/  damage.spec.js
pages/                  # locators only
actions/                # business logic
utils/                  # ReportWriter, generateReport
reports/<timestamp>/    # report.md + report.docx + evidence
```

Each spec file must:

- Contain Area-specific test cases only
- Reuse common actions/utilities (the `actions` fixture)
- Avoid duplicate helper methods
- Follow Area-wise organization from the ticket

## 4. Layer Responsibilities

- **`pages/`** — locators / element getters only. No assertions, no flows.
- **`actions/`** — reusable flows and step methods; call page getters; return data. No `expect`.
- **spec files** — expectations (`expect`) and test flow; call action methods; annotate for the report.

## 5. Generator Contract

Any automation that produces specs must:

1. Read the ticket Area name.
2. Resolve the target spec path from the table in §2.
3. Append new test cases into that spec — never split.
4. Reuse existing actions/pages; do not duplicate helpers.
5. Follow the comment rules in §1.
6. Register each TC's metadata via `testInfo.annotations` (`tcId`, `area`, `severity`, `priority`, `expected`, `steps`, `actual`) so `utils/ReportWriter.js` captures it. Wire `reporter.record(testInfo)` in `afterEach` and `reporter.flush()` in `afterAll`.

## 6. Cross-References

- `/add-test` — creates/updates spec files; must follow §1, §2, §3, §5.
- `/add-page` — page objects are locators only (no assertions/logic).
- `/add-action` — action methods live here, not in pages.
- `/add-comments` — the only skill allowed to add JSDoc, and only in the patterns it defines.
