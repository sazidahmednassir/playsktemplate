// Student tests — generated from excel/Proctoring Pro.xlsx → tab "Student".
//
// TC ID: 1
// Title: Face validation on quiz start
// Precondition: Student account, navigate to course "Computational Problem Solving"
// Steps:
//   1. Open quiz
//   2. Click the Attempt Quiz button or Continue Attempt button
//   3. Click Validate Face button
// Expected: Popup shows "Face Validation: Face matched."
//
// After execution this spec writes the Actual Result back to a timestamped copy
// at excel/results/Proctoring Pro - <timestamp>.xlsx via utils/ExcelResultWriter.

const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const config = require("../../config/env.config");
const { getWriter } = require("../../utils/ExcelResultWriter");

// LMS uses its own baseURL and a fresh (un-authenticated) browser context.
test.use({
  baseURL: config.lms.baseURL,
  storageState: undefined,
  permissions: ["camera", "microphone"],
});

// Map this spec's tests back to the Excel rows they exercise.
const TC_BY_TITLE = {
  "TC-1 Face validation on quiz start shows 'Face matched'": {
    sheet: "Student",
    tcId: 1,
  },
};

test.describe("Student | Proctoring Pro", () => {
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
    const screenshot = testInfo.attachments.find(
      (a) => a.name === "screenshot",
    );
    if (screenshot?.path) detailParts.push(`Screenshot: ${screenshot.path}`);
    detailParts.push(`Duration: ${testInfo.duration} ms`);

    try {
      const out = getWriter().write({
        sheet: meta.sheet,
        tcId: meta.tcId,
        status,
        detail: detailParts.join("\n"),
      });
      console.log(`[ExcelResultWriter] wrote TC-${meta.tcId} (${status}) → ${out}`);
    } catch (e) {
      console.error(`[ExcelResultWriter] failed for TC-${meta.tcId}:`, e.message);
    }
  });

  test("TC-1 Face validation on quiz start shows 'Face matched'", async ({
    actions,
  }) => {
    // ---- Precondition: login as student & open the course quiz ----
    await actions.studentLms.loginAsStudent(
      config.lms.baseURL,
      config.lms.student.email,
      config.lms.student.password,
    );
    await actions.studentLms.openCourseQuiz(config.lms.course);

    // ---- Step 1 + 2: open quiz, then Attempt Quiz / Continue Attempt ----
    await actions.studentLms.clickAttemptOrContinue();

    // ---- Step 3: click Validate Face ----
    await actions.studentLms.clickValidateFace();

    // ---- Expected: popup says "Face Validation: Face matched." ----
    await actions.studentLms.verifyFaceValidationMatched();

    const message = await actions.studentLms.readFaceValidationMessage();
    expect(message).toMatch(/face\s*matched/i);
  });
});
