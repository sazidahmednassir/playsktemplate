// Pins one run timestamp for the whole run so every worker/spec writes into a
// single reports/<timestamp>/ folder. Workers inherit this env at fork time.
const fs = require("fs");

module.exports = async () => {
  const d = new Date();
  const p = (n) => String(n).padStart(2, "0");
  const id = `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}_${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  process.env.PLAYWRIGHT_RUN_TIMESTAMP = id;
  fs.mkdirSync("reports", { recursive: true });
  fs.writeFileSync("reports/.run_id", id);
};
