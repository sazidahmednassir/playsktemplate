// SearchActions — /search filter navigation + result-count reading.
// Logic only; locators come from SearchPage, assertions stay in the spec.
const SearchPage = require("../pages/SearchPage");
const cfg = require("../config/env.config");

class SearchActions {
  constructor(page) {
    this.page = page;
    this.search = new SearchPage(page);
  }

  /**
   * Navigate to /search with an optional raw query string (with or without the
   * leading '?'). Returns the HTTP status of the document response.
   */
  async gotoFiltered(query = "", base = cfg.baseURL) {
    const qs = query ? (query.startsWith("?") ? query : `?${query}`) : "";
    const resp = await this.page.goto(`${base}/search${qs}`, { waitUntil: "domcontentloaded" });
    return resp ? resp.status() : 0;
  }

  /**
   * Read the "N rentals found" counter as a number. Returns 0 when the page
   * shows the "No rentals found" empty state, or -1 when no counter is present.
   */
  async resultCount() {
    const texts = await this.search.resultCount.allTextContents().catch(() => []);
    for (const t of texts) {
      const m = t.match(/(\d+)\s*rentals?\s*found/i);
      if (m) return Number(m[1]);
    }
    if (texts.some((t) => /no rentals?\s*found/i.test(t))) return 0;
    return -1;
  }

  /** True when the zero-results empty state ("No rentals found") is rendered. */
  async hasEmptyState() {
    return (await this.page.getByText(/No rentals found/i).count()) > 0;
  }
}

module.exports = SearchActions;
