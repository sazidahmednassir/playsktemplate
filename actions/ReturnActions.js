const ReturnCreatePage = require("../pages/ReturnCreatePage");
const ReturnDetailPage = require("../pages/ReturnDetailPage");
const ReturnsListPage = require("../pages/ReturnsListPage");
const config = require("../config/env.config");

class ReturnActions {
  constructor(page) {
    this.page = page;
    this.create = new ReturnCreatePage(page);
    this.detail = new ReturnDetailPage(page);
    this.list = new ReturnsListPage(page);
  }

  async openReturnsList() {
    await this.page.goto(config.admin.path("returns"), { waitUntil: "domcontentloaded" });
    await this.list.getHeading().waitFor({ timeout: 60000 });
    await this.page.waitForTimeout(2500);
  }

  // KPIs + rows from the Returns & Refunds dashboard.
  async getDashboardSummary() {
    await this.openReturnsList();
    return this.page.evaluate(() => {
      const totalRefunded = (document.body.innerText.match(/Total Refunded[^\d]*([\d,]+)/i) || [])[1] || null;
      const rows = [...document.querySelectorAll("table tbody tr")].map((tr) => {
        const t = tr.innerText.replace(/\s+/g, " ").trim();
        return {
          rtn: (t.match(/RTN-\d+-\d+/) || [])[0] || null,
          type: (t.match(/\b(Return|Exchange|Damage Claim)\b/) || [])[0] || null,
          status: (t.match(/\b(Requested|Settled|Rejected|Processing)\b/) || [])[0] || null,
          text: t,
        };
      });
      // Status filter option labels (to compare against real statuses).
      const filter = document.querySelector("select");
      const filterOptions = filter ? [...filter.options].map((o) => o.text.trim()).filter(Boolean) : [];
      return { totalRefunded, rows, filterOptions };
    });
  }

  // Fill + submit the Create Return form. opts: { type, reason, items?, full?, note?, condition? }
  async createRequest({ type = "Return", reason, items = [], full = false, note, condition } = {}) {
    await this.create.getTypeCard(type).first().click();
    await this.page.waitForTimeout(800);
    if (reason) await this.create.getReasonSelect().selectOption({ label: reason }).catch(() => {});
    if (full) {
      await this.create.getFullReturnToggle().click().catch(() => {});
    } else {
      const boxes = this.create.getItemCheckboxes();
      const n = await boxes.count();
      const want = items.length ? items.length : 1;
      for (let i = 0; i < Math.min(want, n); i++) await boxes.nth(i).check().catch(() => {});
    }
    if (condition) await this.create.getConditionSelect().selectOption({ label: condition }).catch(() => {});
    if (note) await this.create.getNoteTextarea().first().fill(note).catch(() => {});
    await this.create.getSubmitButton().click();
    await this.page.waitForTimeout(4000);
    // After submit we land on the return detail page; capture the RTN number.
    const rtn = (await this.detail.getRtnHeading().innerText().catch(() => "")).match(/RTN-\d+-\d+/);
    return { rtn: rtn ? rtn[0] : null, url: this.page.url() };
  }

  async openReturn(rtn) {
    await this.openReturnsList();
    await this.list.getViewButtonFor(rtn).first().click();
    await this.page.waitForTimeout(3000);
  }

  async getDetailFacts() {
    return this.page.evaluate(() => {
      const txt = document.body.innerText.replace(/\s+/g, " ");
      // Type/status come from the header next to the RTN heading, not the body
      // (the body contains "Returned Items", which would falsely match "Return").
      const h1 = document.querySelector("h1");
      const header = h1 ? (h1.parentElement?.innerText || h1.innerText) : txt;
      const type = /Damage Claim/i.test(header) ? "Damage Claim"
        : /Exchange/i.test(header) ? "Exchange"
        : /Return/i.test(header) ? "Return" : null;
      // NB: amounts are prefixed with the Taka sign (৳); don't exclude it from the gap.
      const itemsRefund = (txt.match(/Items refund[^\d]*?৳?\s*([\d,]+)/i) || [])[1] || null;
      const cashRefund = (txt.match(/Cash refund \([^)]*\)[^\d]*?৳?\s*([\d,]+)/i) || [])[1] || null;
      // Settlement may instead reduce the customer's outstanding due rather than pay cash.
      const dueReduced = (txt.match(/(?:Order )?due reduced[^\d]*?৳?\s*([\d,]+)/i) || [])[1] || null;
      const num = (s) => (s == null ? 0 : Number(String(s).replace(/,/g, "")) || 0);
      return {
        status: (header.match(/\b(Requested|Settled|Rejected|Processing)\b/) || [])[0] || null,
        type,
        itemsRefund,
        cashRefund,
        dueReduced,
        // Net value the settlement moved (cash paid out OR due reduced OR item value credited).
        refund: Math.max(num(cashRefund), num(itemsRefund), num(dueReduced)),
        // Cash actually paid out to the customer (excludes due reductions).
        cashOut: num(cashRefund),
        // True when the settlement labels the refund as cash, e.g. "Cash refund (cash)".
        refundIsCash: /Cash refund \([^)]*cash[^)]*\)/i.test(txt),
        stockUpdated: (txt.match(/Stock Updated\s*(Yes|No)/i) || [])[1] || null,
        // Replacement order id may be prefixed with a unicode ellipsis (…).
        exchangeOrder: (txt.match(/Exchange order created[^\w]*([\w]+)/i) || [])[1] || null,
        stockPending: /Stock:\s*Pending/i.test(txt),
      };
    });
  }

  // True when the open return detail still offers a Settle action (used to assert no double-settle).
  async hasSettleAction() {
    const btn = this.detail.getSettleButton();
    return (await btn.count()) > 0 && (await btn.first().isVisible().catch(() => false));
  }

  // Open each Settled return (capped) and collect its settlement facts for refund-integrity checks.
  async collectSettledFacts(limit = 6) {
    const summary = await this.getDashboardSummary();
    const settled = summary.rows.filter((r) => r.status === "Settled" && r.rtn).slice(0, limit);
    const out = [];
    for (const r of settled) {
      await this.openReturn(r.rtn);
      const facts = await this.getDetailFacts();
      out.push({ rtn: r.rtn, type: r.type, ...facts });
    }
    return { totalRefunded: summary.totalRefunded, settled: out };
  }

  async settle(noteText) {
    if (noteText) await this.detail.getNoteInput().fill(noteText).catch(() => {});
    await this.detail.getSettleButton().click();
    await this.page.waitForTimeout(4000);
  }

  async reject(noteText) {
    if (noteText) await this.detail.getNoteInput().fill(noteText).catch(() => {});
    await this.detail.getRejectButton().click();
    await this.page.waitForTimeout(4000);
  }
}
module.exports = ReturnActions;
