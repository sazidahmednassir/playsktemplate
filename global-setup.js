// Pins one timestamp for the whole run so every worker writes to a single
// Excel results file, and ensures the evidence directory exists.
const fs = require("fs");
const path = require("path");

module.exports = async () => {
  if (!process.env.PLAYWRIGHT_RUN_TIMESTAMP) {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, "0");
    process.env.PLAYWRIGHT_RUN_TIMESTAMP =
      `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
      `_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
  }
  fs.mkdirSync(path.resolve(__dirname, "evidence"), { recursive: true });
};
