const InventoryPage = require("../pages/InventoryPage");
const config = require("../config/env.config");

class InventoryActions {
  constructor(page) {
    this.page = page;
    this.inventory = new InventoryPage(page);
  }

  async openInventory() {
    await this.page.goto(config.admin.path("inventory"), { waitUntil: "domcontentloaded" });
    await this.inventory.getRows().first().waitFor({ timeout: 60000 });
    await this.page.waitForTimeout(2000);
  }

  // Parse the stock overview into { product, warehouse, total, reserved, available }.
  async snapshot() {
    await this.openInventory();
    return this.page.evaluate(() => {
      return [...document.querySelectorAll("table tbody tr")].map((tr) => {
        const cells = [...tr.querySelectorAll("td")].map((td) => td.innerText.replace(/\s+/g, " ").trim());
        const nums = (tr.innerText.match(/\b\d+\b/g) || []).map(Number);
        return {
          product: cells[0] || null,
          warehouse: cells[1] || null,
          raw: tr.innerText.replace(/\s+/g, " ").trim(),
          // last three integers in a row are total / reserved / available
          available: nums.length >= 1 ? nums[nums.length - 1] : null,
        };
      });
    });
  }

  async availableFor(product, warehouseHint) {
    const rows = await this.snapshot();
    const row = rows.find(
      (r) => r.raw.includes(product) && (!warehouseHint || r.raw.includes(warehouseHint)),
    );
    return row ? row.available : null;
  }
}
module.exports = InventoryActions;
