---
name: proctoring
description: Author or update Proctoring Pro test cases for the eLearning23 LMS — face validation, camera-permission, suspicious-activity, and full proctoring flow tests. Use whenever a TC under the "Student" tab of Proctoring Pro.xlsx needs to be created, edited, or run, or when a new face/camera fixture needs to be wired in.
user-invocable: true
allowed-tools: Read Edit Write Glob Grep Bash
---

# Proctoring — Author Proctoring Pro Test Cases

This skill is the source-of-truth for everything about **Proctoring Pro** tests in
this repo: the LMS under test, the face fixture system, the Chromium fake-media
camera setup, and the conventions every TC must follow.

## When to use

- Adding a new TC under `data/Proctoring Pro.xlsx` → "Student".
- Editing locators or actions for the Validate Face / proctoring modal.
- Changing how the camera feed is mocked (new fixture, new flag).
- Replacing `data/fixtures/face/baseline.jpg` with the real student photo.

## Target system

- App: Moodle on `https://education.elearning23.com/`
- Plugin: **Proctoring Pro** (block on quiz attempt page).
- Validate Face button: `#fcvalidate`.
- Match popup text: `Face Validation: Face matched.`
- Mismatch popup text: `Face Validation: Face not matched.`

## Architecture (3-layer POM, same as the rest of the repo)

```
tests/student/student.spec.js
        │ uses
        ▼
actions/StudentLMSActions.js     ← business logic + assertions
        │ imports
        ▼
pages/StudentLMSPage.js          ← locators only
```

All proctoring locators live under the comments
`---------- Proctoring Pro plugin output ----------` and
`---------- Proctoring Pro: negative + suspicious states ----------` in
`pages/StudentLMSPage.js`. Add new ones there — never inside actions or specs.

## Camera mocking

The runner uses **Chromium fake-media flags** by default:

```
--use-fake-ui-for-media-stream
--use-fake-device-for-media-stream
--use-file-for-fake-video-capture=<path-to-y4m>
```

The default `<path>` is `data/fixtures/face/baseline.y4m` (set in
`playwright.config.js` from `config.lms.faceFixtures.baseline`).

To feed a different image to a single test, override `launchOptions` in a nested
`test.describe`:

```js
test.describe("TC-X (mismatch feed)", () => {
  test.use({
    launchOptions: {
      args: [
        "--start-maximized",
        "--use-fake-ui-for-media-stream",
        "--use-fake-device-for-media-stream",
        `--use-file-for-fake-video-capture=${config.lms.faceFixtures.mismatch}`,
      ],
    },
  });

  test("...", async ({ actions }) => { /* ... */ });
});
```

Camera args per project are already defined in `playwright.config.js` via `fakeMediaArgs()`. No need to override in the test body — pick the right `@tag` and the config handles it.

### Fixture catalogue

| Fixture        | Path (relative)                          | Use it for                                     |
| -------------- | ---------------------------------------- | ---------------------------------------------- |
| baseline       | `data/fixtures/face/baseline.y4m`        | Face match (TC-1, TC-6).                       |
| mismatch       | `data/fixtures/face/mismatch.y4m`        | Face mismatch (TC-2).                          |
| no-face        | `data/fixtures/face/no-face.y4m`         | Suspicious — no face (TC-5 leg A).             |
| multi-face     | `data/fixtures/face/multi-face.y4m`      | Suspicious — multiple faces (TC-5 leg B).      |

Source `.jpg` files live next to the `.y4m`s. To regenerate the Y4M files after
editing any source image, run:

```bash
bash data/fixtures/face/generate-y4m.sh
```

The Y4M files are git-ignored — every contributor regenerates them locally.

### Replacing the baseline photo

`data/fixtures/face/baseline.jpg` ships as a synthetic placeholder. Before TC-1
and TC-6 can actually match, drop the real student photo (the one uploaded to the
LMS profile, 640x480 JPEG) at that path and re-run `generate-y4m.sh`.

### Real webcam mode

Set `USE_REAL_CAMERA=true` in `.env` to skip all fake-media flags and use
whatever device Chromium auto-selects. This is the workstation / manual-verify
mode.

## Permission handling

- TC-1, TC-2, TC-5, TC-6 use the spec-level
  `test.use({ permissions: ["camera", "microphone"] })`.
- TC-3 overrides with `test.use({ permissions: [] })` and additionally calls
  `actions.studentLms.denyCameraPermission()` after login to scope the deny to
  the LMS origin.

## Excel workflow

The "Student" tab of `data/Proctoring Pro.xlsx` (mirror: `excel/Proctoring Pro.xlsx`)
holds one row per TC:

| Col | Field             |
| --- | ----------------- |
| A   | ID (1, 2, 3, ...) |
| B   | Test Case Title   |
| C   | Precondition      |
| D   | Test Description  |
| E   | Test Steps        |
| F   | Expected Result   |
| G   | Actual Result *   |
| H   | Comments          |

\* Actual Result is overwritten by `utils/ExcelResultWriter.js` after each test
runs — a timestamped copy lands in `excel/results/`.

### Actual Result format (column G)

The writer drops `detail` verbatim into column G — no `[STATUS] timestamp`
prefix, no duration line. On PASS, write a **past-tense restatement** of the
Expected Result so the cell reads like plain English. Example:

| Expected (col F) | Actual on PASS (col G) |
| --- | --- |
| `Leg A: "No face detected" warning is visible.` `Leg B: "Multiple faces detected" warning OR a suspicious-activity banner is visible.` | `Leg A: "No face detected" warning was visible. Leg B: "Multiple faces detected" warning OR a suspicious-activity banner was visible.` |

On FAIL, the spec writes `FAIL — <error>` (plus optional `[Leg X]` /
screenshot path). On SKIP, the spec writes `SKIPPED`.

For multi-leg TCs (e.g. TC-5), each leg writes its own snippet; the writer
merges sibling-leg writes into a single cell within the same run.

When you add a new TC, also add it to:

1. `tests/student/student.spec.js` (a new `test(...)` plus an entry in
   `TC_BY_TITLE`).
2. The `TC_BY_TITLE` map — the title MUST match the `test()` title exactly,
   and the entry MUST include a `passDetail` string (past-tense restatement
   of column F).

## Rules

1. POM only — locators in `pages/StudentLMSPage.js`, logic in
   `actions/StudentLMSActions.js`, expectations in spec files.
2. No `waitForTimeout` — use `waitFor()`, `waitForLoadState()`, or auto-waiting.
3. No hardcoded credentials / URLs — use `config.lms.*` from
   `config/env.config.js`.
4. Camera-feed override happens at the `test.describe` level, not inside the
   test body (Chromium launch args are immutable per browser).
5. Every TC must register in `TC_BY_TITLE` so the Excel writer captures the
   actual result.
6. Negative test cases assert visibility of an error — never assert *absence*
   of the success path; that is a flaky null-test.

## Quick checklist for a new TC

1. Decide which fixture feeds the camera (or "no fake device" for hardware-fail).
2. Add a row to `data/Proctoring Pro.xlsx` → "Student".
3. Add locators to `pages/StudentLMSPage.js` if needed.
4. Add an action method to `actions/StudentLMSActions.js`.
5. Add the spec to `tests/student/student.spec.js` and update
   `TC_BY_TITLE`.
6. Run `npx playwright test tests/student/student.spec.js --headed`.
7. Paste the run summary; the writer overwrites column G with PASS/FAIL.
