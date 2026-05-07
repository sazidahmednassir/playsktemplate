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
  "TC-1 Face validation on quiz start shows 'Face matched'": { sheet: "Student", tcId: 1 },
};

test.describe("Student | Proctoring Pro | TC-1", () => {
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
});
