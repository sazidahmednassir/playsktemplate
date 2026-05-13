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

// Title → Excel row mapping. Both legs of TC-5 write to row 5.
const TC_BY_TITLE = {
  "TC-1 Face validation on quiz start shows 'Face matched' @baseline": { sheet: "Student", tcId: 1 },
  "TC-2 Face mismatch on quiz start shows 'Face not matched' @mismatch": { sheet: "Student", tcId: 2 },
  "TC-3 Camera permission denied shows a camera-blocked error @permissionDenied": { sheet: "Student", tcId: 3 },
  "TC-4 No camera device available shows a camera-not-detected error @noCamera": { sheet: "Student", tcId: 4 },
  "TC-5a Suspicious activity (no face) shows a warning @noFace": { sheet: "Student", tcId: 5, legLabel: "Leg A: No Face" },
  "TC-5b Suspicious activity (multiple faces) shows a warning @multiFace": { sheet: "Student", tcId: 5, legLabel: "Leg B: Multi Face" },
  "TC-6 Full proctoring flow — face match, start attempt, submit @baseline": { sheet: "Student", tcId: 6 },
  "TC-7 Student logs out and is redirected to homepage @logout": { sheet: "Student", tcId: 7 },
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

    const detailParts = [];
    if (testInfo.error?.message) detailParts.push(`Error: ${testInfo.error.message}`);
    if (testInfo.errors?.length > 1) {
      detailParts.push(
        `Additional errors: ${testInfo.errors
          .slice(1)
          .map((e) => e.message)
          .join(" | ")}`,
      );
    }
    const screenshot = testInfo.attachments.find((a) => a.name === "screenshot");
    if (screenshot?.path) detailParts.push(`Screenshot: ${screenshot.path}`);
    detailParts.push(`Duration: ${testInfo.duration} ms`);

    const detail = meta.legLabel
      ? `[${meta.legLabel}] ${detailParts.join("\n")}`
      : detailParts.join("\n");

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
