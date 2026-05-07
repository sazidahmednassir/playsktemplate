const { test } = require("../fixture/customfixture");
const { expect } = require("@playwright/test");
const config = require("../../config/env.config");
const { getWriter } = require("../../utils/ExcelResultWriter");

test.use({
  baseURL: config.lms.baseURL,
  storageState: undefined,
  permissions: ["camera", "microphone"],
  launchOptions: {
    args: [
      "--start-maximized",
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-video-capture=${config.lms.faceFixtures.baseline}`,
    ],
  },
});

const TC_BY_TITLE = {
  "TC-6 Full proctoring flow — face match, start attempt, submit quiz": { sheet: "Student", tcId: 6 },
};

test.describe("Student | Proctoring Pro | TC-6", () => {
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

  test("TC-6 Full proctoring flow — face match, start attempt, submit quiz", async ({
    actions,
  }) => {
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
});
