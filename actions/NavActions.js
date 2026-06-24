// NavActions — navigation helpers + lightweight response capture.
const cfg = require("../config/env.config");

class NavActions {
  constructor(page) {
    this.page = page;
  }

  /** Navigate and return the HTTP status of the main document response. */
  async gotoStatus(pathOrUrl, base = cfg.baseURL) {
    const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${base}${pathOrUrl}`;
    const resp = await this.page.goto(url, { waitUntil: "domcontentloaded" });
    return resp ? resp.status() : 0;
  }

  async goto(pathOrUrl, base = cfg.baseURL) {
    const url = pathOrUrl.startsWith("http") ? pathOrUrl : `${base}${pathOrUrl}`;
    await this.page.goto(url, { waitUntil: "domcontentloaded" });
  }

  /** Collect page console errors over the course of a navigation. */
  attachConsoleCollector() {
    const errors = [];
    this.page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    this.page.on("pageerror", (err) => errors.push(String(err)));
    return errors;
  }
}

module.exports = NavActions;
