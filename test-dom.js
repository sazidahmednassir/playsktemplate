const { chromium } = require('playwright');
const config = require('./config/env.config.js');

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--use-fake-ui-for-media-stream",
      "--use-fake-device-for-media-stream",
      `--use-file-for-fake-video-capture=${config.lms.faceFixtures.baseline}`,
    ]
  });
  const context = await browser.newContext({ permissions: ["camera", "microphone"] });
  const page = await context.newPage();
  
  // Login
  await page.goto(config.lms.baseURL + 'login/index.php');
  await page.fill('#username', config.lms.student.email);
  await page.fill('#password', config.lms.student.password);
  await page.click('#loginbtn');
  await page.waitForLoadState('networkidle');

  // Go to Quiz
  await page.goto('https://education.elearning23.com/mod/quiz/view.php?id=107');
  await page.waitForLoadState('networkidle');

  // Click Attempt Quiz / Continue Attempt
  const attempt = page.getByRole("button", { name: /attempt quiz/i }).or(page.getByRole("link", { name: /attempt quiz/i }));
  const cont = page.getByRole("button", { name: /continue attempt/i }).or(page.getByRole("link", { name: /continue attempt/i }));
  if (await cont.isVisible()) {
    await cont.click();
  } else {
    await attempt.click();
  }
  
  // Click Validate Face
  await page.locator('#btn-verify-face').click();
  
  // Wait for Face Matched
  await page.getByText(/face matched/i).waitFor({ state: "visible", timeout: 30000 });
  
  // Get outerHTML of the start attempt button's parent
  const html = await page.locator('#id_submitbutton').evaluate(node => node.parentElement.outerHTML);
  console.log("PARENT HTML:");
  console.log(html);
  
  await browser.close();
})();
