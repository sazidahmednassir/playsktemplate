const path = require("path");
const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const config = require("../../config/env.config");
const { getWriter } = require("../../utils/ExcelResultWriter");

// Auth file created in globalSetup (auth.setup.js) before any project runs.
const STUDENT_AUTH_FILE = path.resolve(__dirname, "../../.auth/student.json");

// Student | Proctoring Pro — all TCs from the "Student" tab of excel/Proctoring Pro.xlsx.
// Per codebase-rules §2: every TC under one Excel tab lives in one spec file.
// Per codebase-rules §1: inline comments only, no JSDoc.
//
// Launch args (camera fixture, permissions) live in playwright.config.js as
// per-tag projects. Each test title carries one tag that selects its project:
//   @baseline          → TC-1, TC-6
//   @mismatch          → TC-2
//   @permissionDenied  → TC-3
//   @noCamera          → TC-4
//   @noFace            → TC-5a
//   @multiFace         → TC-5b

// Title → Excel row mapping. Both legs of TC-5 write to row 5; the writer
// merges them into one cell. `passDetail` is the past-tense restatement of
// the Excel Expected Result (column F) — the writer drops it into column G
// verbatim on PASS, so the actual result reads as plain English instead of
// a `[PASS] timestamp + duration` dump.
const TC_BY_TITLE = {
  "TC-1 Face validation on quiz start shows 'Face matched' @baseline": {
    sheet: "Student", tcId: 1,
    passDetail: 'Face validation popup showed "Face Validation: Face matched."',
  },
  "TC-2 Face mismatch on quiz start shows 'Face not matched' @mismatch": {
    sheet: "Student", tcId: 2,
    passDetail: 'Popup showed "Face Validation: Face not matched." (or equivalent rejection message). Validate Face button did NOT advance to Start Attempt.',
  },
  "TC-3 Camera permission denied shows a camera-blocked error @permissionDenied": {
    sheet: "Student", tcId: 3,
    passDetail: 'A camera-permission / "Allow camera access" error message was visible. The student could not proceed to Start Attempt.',
  },
  "TC-4 No camera device available shows a camera-not-detected error @noCamera": {
    sheet: "Student", tcId: 4,
    passDetail: 'A "No camera detected" or equivalent error was shown. The Validate Face flow did not proceed.',
  },
  "TC-5a Suspicious activity (no face) shows a warning @noFace": {
    sheet: "Student", tcId: 5, legLabel: "Leg A: No Face",
    passDetail: 'Leg A: "No face detected" warning was visible.',
  },
  "TC-5b Suspicious activity (multiple faces) shows a warning @multiFace": {
    sheet: "Student", tcId: 5, legLabel: "Leg B: Multi Face",
    passDetail: 'Leg B: "Multiple faces detected" warning OR a suspicious-activity banner was visible.',
  },
  "TC-6 Full proctoring flow — face match, start attempt, submit @baseline": {
    sheet: "Student", tcId: 6,
    passDetail: "Quiz transitioned through validation → attempt → review/summary without errors. Webcam preview remained visible while the quiz was open.",
  },
  "TC-7 Student logs out and is redirected to homepage @logout": {
    sheet: "Student", tcId: 7,
    passDetail: "User saw the homepage after logout (https://education.elearning23.com/).",
  },
};

test.describe("Student | Proctoring Pro", () => {
  // Session created once in globalSetup (auth.setup.js); reused by all tests here.
  test.use({ storageState: STUDENT_AUTH_FILE });

  test.afterEach(async ({}, testInfo) => {
    const meta = TC_BY_TITLE[testInfo.title];
    if (!meta) return;

    const status =
      testInfo.status === "passed"
        ? "PASS"
        : testInfo.status === "skipped"
          ? "SKIP"
          : "FAIL";

    let detail;
    if (status === "PASS") {
      // Plain past-tense restatement of the Expected Result. The writer
      // merges sibling-leg writes (e.g. TC-5 leg A + leg B) into one cell.
      detail = meta.passDetail || "Test passed.";
    } else if (status === "SKIP") {
      detail = "SKIPPED";
    } else {
      const parts = ["FAIL"];
      if (meta.legLabel) parts.push(`[${meta.legLabel}]`);
      if (testInfo.error?.message) parts.push(`— ${testInfo.error.message}`);
      const screenshot = testInfo.attachments.find((a) => a.name === "screenshot");
      if (screenshot?.path) parts.push(`Screenshot: ${screenshot.path}`);
      detail = parts.join(" ");
    }

    try {
      const out = getWriter().write({
        sheet: meta.sheet,
        tcId: meta.tcId,
        status,
        detail,
      });
      console.log(`[ExcelResultWriter] wrote TC-${meta.tcId} (${status}) → ${out}`);
    } catch (e) {
      console.error(`[ExcelResultWriter] failed for TC-${meta.tcId}:`, e.message);
    }
  });

  test("TC-1 Face validation on quiz start shows 'Face matched' @baseline", async ({ actions }) => {
    await actions.studentLms.loginAsStudent(
      config.lms.baseURL,
      config.lms.student.email,
      config.lms.student.password,
    );
    await actions.studentLms.openCourseQuiz(config.lms.course, config.lms.quizName);
    await actions.studentLms.clickAttemptOrContinue();
    await actions.studentLms.clickValidateFace();
    await actions.studentLms.verifyFaceValidationMatched();

    const message = await actions.studentLms.readFaceValidationMessage();
    expect(message).toMatch(/face\s*matched/i);
  });

  test("TC-2 Face mismatch on quiz start shows 'Face not matched' @mismatch", async ({ actions }) => {
    await actions.studentLms.loginAsStudent(
      config.lms.baseURL,
      config.lms.student.email,
      config.lms.student.password,
    );
    await actions.studentLms.openCourseQuiz(config.lms.course, config.lms.quizName);
    await actions.studentLms.clickAttemptOrContinue();
    await actions.studentLms.clickValidateFace();
    await actions.studentLms.verifyFaceValidationMismatch();
  });

  test("TC-3 Camera permission denied shows a camera-blocked error @permissionDenied", async ({ actions }) => {
    await actions.studentLms.loginAsStudent(
      config.lms.baseURL,
      config.lms.student.email,
      config.lms.student.password,
    );
    await actions.studentLms.denyCameraPermission();
    await actions.studentLms.openCourseQuiz(config.lms.course, config.lms.quizName);
    await actions.studentLms.clickAttemptOrContinue();
    await actions.studentLms.clickValidateFace();
    await actions.studentLms.verifyCameraPermissionError();
  });

  test("TC-4 No camera device available shows a camera-not-detected error @noCamera", async ({ actions }) => {
    await actions.studentLms.loginAsStudent(
      config.lms.baseURL,
      config.lms.student.email,
      config.lms.student.password,
    );
    await actions.studentLms.openCourseQuiz(config.lms.course, config.lms.quizName);
    await actions.studentLms.clickAttemptOrContinue();
    await actions.studentLms.clickValidateFace();
    await actions.studentLms.verifyNoCameraDeviceError();
  });

  test("TC-5a Suspicious activity (no face) shows a warning @noFace", async ({ actions }) => {
    await actions.studentLms.loginAsStudent(
      config.lms.baseURL,
      config.lms.student.email,
      config.lms.student.password,
    );
    await actions.studentLms.openCourseQuiz(config.lms.course, config.lms.quizName);
    await actions.studentLms.clickAttemptOrContinue();
    await actions.studentLms.clickValidateFace();
    await actions.studentLms.verifyNoFaceWarning();
  });

  test("TC-5b Suspicious activity (multiple faces) shows a warning @multiFace", async ({ actions }) => {
    await actions.studentLms.loginAsStudent(
      config.lms.baseURL,
      config.lms.student.email,
      config.lms.student.password,
    );
    await actions.studentLms.openCourseQuiz(config.lms.course, config.lms.quizName);
    await actions.studentLms.clickAttemptOrContinue();
    await actions.studentLms.clickValidateFace();
    await actions.studentLms.verifyMultipleFacesWarning();
  });

  test("TC-6 Full proctoring flow — face match, start attempt, submit @baseline", async ({ actions }) => {
    await actions.studentLms.loginAsStudent(
      config.lms.baseURL,
      config.lms.student.email,
      config.lms.student.password,
    );
    await actions.studentLms.openCourseQuiz(config.lms.course, config.lms.quizName);
    await actions.studentLms.clickAttemptOrContinue();
    await actions.studentLms.clickValidateFace();
    await actions.studentLms.verifyFaceValidationMatched();

    await actions.studentLms.startAttempt();
    await actions.studentLms.verifyQuizInProgressWithProctoring();
    await actions.studentLms.finishAttempt();
  });

  test("TC-7 Student logs out and is redirected to homepage @logout", async ({ actions, page }) => {
    await actions.studentLms.loginAsStudent(
      config.lms.baseURL,
      config.lms.student.email,
      config.lms.student.password,
    );
    await actions.studentLms.logout();
    await expect(page).toHaveURL(config.lms.baseURL);
  });
});
