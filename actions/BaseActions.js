class BaseActions {
  static async navigate(page, url) {
    await page.goto(url);
  }
}

module.exports = BaseActions;
