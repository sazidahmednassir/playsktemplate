const StoreFrontPage = require("../pages/StoreFrontPage");
const config = require("../config/env.config");

class StoreFrontActions {
  constructor(page) {
    this.page = page;
    this.store = new StoreFrontPage(page);
  }

  async openHome() {
    await this.page.goto(config.store.baseURL, { waitUntil: "domcontentloaded" });
    await this.page.waitForTimeout(3000);
  }

  async isReachable() {
    const resp = await this.page.goto(config.store.baseURL, { waitUntil: "domcontentloaded" });
    return resp ? resp.status() : null;
  }

  async addFirstAvailableProductToCart() {
    await this.openHome();
    const addBtns = this.store.getAddToCartButtons();
    await addBtns.first().click();
    await this.page.waitForTimeout(2000);
  }
}
module.exports = StoreFrontActions;
