// Builds the human-facing testing report (docs/Test-Report.md + .docx) from the
// validated findings of the live E2E run. Reuses ReportWriter's renderers.
//
//   node utils/generateReport.js
//
// The machine ledger from `npx playwright test` lives in reports/<run>/; this
// script produces the curated, screenshot-rich deliverable for stakeholders.

const fs = require("fs");
const path = require("path");
const { ReportWriter } = require("./ReportWriter");

const EV = (f) => path.resolve(__dirname, "..", "docs", "evidence", f);

const findings = [
  {
    tcId: "TC-1", area: "Order", status: "PASS", severity: "-", priority: "High",
    title: "Storefront orders reach All Orders",
    expected: "Orders placed on the storefront (bKash / SSLCommerz / COD) appear in the admin All Orders list.",
    actual: "Storefront reachable (HTTP 200). All Orders showed 20 orders, 17 placed via storefront payment methods (bkash / sslcommerz / cod).",
    steps: ["Open https://sk-store.myei.app", "Login to admin as Store Owner", "Open Orders → All Orders", "Confirm storefront-sourced orders are listed"],
    evidence: [],
  },
  {
    tcId: "TC-2", area: "Order", status: "PASS", severity: "-", priority: "High",
    title: "Order status transitions are logged",
    expected: "Status changes (confirmed → shipped → delivered …) are persisted and recorded in the order Logs with actor + timestamp.",
    actual: "Order 50000072 Logs record the full chain: payment_pending → confirmed → verification → ready_for_box → shipped → delivered → returned → refunded, each with staff actor.",
    steps: ["Open a Delivered/Refunded order", "Read the Logs panel"],
    evidence: [EV("order_lifecycle_logs.png")],
  },
  {
    tcId: "TC-3", area: "Return", status: "PASS", severity: "-", priority: "High",
    title: "Return action is gated by order status",
    expected: "No Return action on a Pending order; Return action present on Shipped and Delivered orders.",
    actual: "Pending order 50000071 → no Return action. Delivered order 50000066 → Return action present. (Shipped 50000053 also exposes it.)",
    steps: ["Open a PENDING order — confirm no Return action", "Open a SHIPPED order — confirm Return action", "Open a DELIVERED order — confirm Return action"],
    evidence: [],
  },
  {
    tcId: "TC-4", area: "Return", status: "PASS", severity: "-", priority: "High",
    title: "Create Return request on a Delivered order",
    expected: "Return action opens a Create Return form (Type / Reason / Items / Note); submitting creates an RTN-DDMMYY-NNN record listed in Returns & Refunds.",
    actual: "Create Return form exposes Return / Exchange / Damage Claim types, Reason dropdown, per-item selection with returnable counts, Full-return toggle and Note. Created returns appear as RTN-260622-00N in Returns & Refunds.",
    steps: ["Open a Delivered order", "Click Return", "Review the Create Return form"],
    evidence: [EV("create_return_form_types.png")],
  },
  {
    tcId: "TC-5", area: "Return", status: "PASS", severity: "-", priority: "High",
    title: "Settle Return adjusts refund / due and order status",
    expected: "Settling a Return refunds the item value and/or reduces order due, and moves the order to returned/refunded.",
    actual: "RTN-260622-009 settled: Items refund ৳3900, order due reduced 0; order 50000072 moved delivered → returned → refunded. Refund/due maths matched item value.",
    steps: ["Open a Settled Return", "Read the Settlement panel and order Logs"],
    evidence: [EV("return_settled_cash_refund_no_restock.png")],
  },
  {
    tcId: "TC-6", area: "Inventory", status: "FAIL", severity: "High", priority: "High",
    title: "Settling a Return does NOT restock the returned item",
    expected: 'After a Return-type return is settled (items physically come back), the item is restocked and the return shows "Stock Updated: Yes".',
    actual: 'On settled returns the Detail panel shows "Stock Updated: No" and the returned line shows "Stock: Pending" — inventory is never incremented. Verified on RTN-260622-009 (and the same on every settled return/exchange). Returned stock is lost.',
    steps: ["Open Returns & Refunds", "Open a Settled Return-type record (e.g. RTN-260622-009)", 'Read the Settlement panel + Details → "Stock Updated"', "Cross-check the product in Inventory → Stock Overview"],
    evidence: [EV("return_settled_cash_refund_no_restock.png")],
  },
  {
    tcId: "TC-7", area: "Refund", status: "FAIL", severity: "High", priority: "Medium",
    title: "bKash / digital refund is recorded as a Cash refund",
    expected: "A bKash-paid (prepaid/digital) order refunds through the original method; settlement must not record a digital refund as 'cash'.",
    actual: 'RTN-260622-009 settles a bKash-paid order (50000072) yet the Settlement panel records "Cash refund (cash) ৳3900". Digital refunds are mislabelled/misrouted as cash, corrupting reconciliation.',
    steps: ["Identify a settled return for a bKash-paid order (order 50000072 / RTN-260622-009)", "Open the return detail", "Inspect the Settlement refund method"],
    evidence: [EV("return_settled_cash_refund_no_restock.png")],
  },
  {
    tcId: "TC-8", area: "Refund", status: "FAIL", severity: "Medium", priority: "Medium",
    title: 'Returns dashboard "Total Refunded" KPI and REFUND column show 0 / blank',
    expected: 'The Returns & Refunds "Total Refunded" KPI and the REFUND column reflect the actual settled refund amounts.',
    actual: 'With multiple settled returns refunding ৳3900, ৳1200, etc., the dashboard header still reads "Total Refunded: BDT 0" and every row\'s REFUND column shows "—". Refund reporting is non-functional.',
    steps: ["Open Returns & Refunds", 'Read the "Total Refunded" KPI card', "Read the REFUND column for settled rows"],
    evidence: [EV("dashboard_total_refunded_zero.png")],
  },
  {
    tcId: "TC-9", area: "Exchange", status: "PASS", severity: "Medium", priority: "Medium",
    title: "Settling an Exchange spawns a linked replacement order",
    expected: "A settled Exchange creates and links a replacement order; the returned item is restocked.",
    actual: 'RTN-260622-002 (Exchange) settled: Items refund ৳1200, due reduced ৳1200, "Exchange order created: …cebd7401" — replacement order created and linked. NOTE: "Stock Updated: No" here too (shared with TC-6 restock defect).',
    steps: ["Open a settled Exchange (RTN-260622-002)", "Confirm the replacement order reference", "Check Stock Updated"],
    evidence: [EV("exchange_replacement_order.png")],
  },
  {
    tcId: "TC-10", area: "Damage", status: "PASS", severity: "Medium", priority: "Medium",
    title: "Damage Claim captures condition + photos and is recorded",
    expected: "A Damage Claim records per-item Condition (Good/Damaged/Defective/Used) and photos, and is logged against the order.",
    actual: "Create form for Damage Claim adds per-item Qty, Condition and Photos. RTN-260622-004 recorded as a settled Damage Claim and linked to its order. (Stock Updated: No — see TC-6.)",
    steps: ["Open a Delivered order → Return → choose Damage Claim", "Review per-item Condition + Photos fields", "Open a settled Damage Claim record"],
    evidence: [EV("damage_claim_form.png")],
  },
  {
    tcId: "TC-11", area: "Return", status: "PASS", severity: "-", priority: "Medium",
    title: "A return request can be rejected",
    expected: "A return can be Rejected; rejected returns show status Rejected with no refund / no stock change / unchanged order.",
    actual: "Return detail exposes Settle Return and Reject actions. RTN-260619-006 exists with status Rejected; no refund or stock movement recorded.",
    steps: ["Open a Requested return", "Use the Reject action", "Confirm status Rejected in Returns & Refunds"],
    evidence: [EV("return_detail_settle_reject.png")],
  },
  {
    tcId: "TC-12", area: "Return", status: "PASS", severity: "Low", priority: "Low",
    title: "Returns status filter — usability observation",
    expected: "The status filter offers the statuses actually used on records (Requested / Settled / Rejected).",
    actual: 'Filter technically contains the used statuses, but mixes statuses with TYPES and has duplicates: [Requested, Processing, Stock Updated, Refund Pending, Refund Completed, Completed, Closed, Returned, Refunded, Return, Exchange, Issue, Partial, Closed, Awaiting Return, Pickup Failed, Rejected, Settled, Damage Claim]. Records only ever use Requested/Settled/Rejected — minor UX/data-model inconsistency.',
    steps: ["Open Returns & Refunds", "Open the status filter dropdown", "Compare options against statuses on records"],
    evidence: [EV("dashboard_total_refunded_zero.png")],
  },
  {
    tcId: "ENV-1", area: "Environment", status: "BLOCKED", severity: "Medium", priority: "High",
    title: "Provided Admin Portal URL rejects the supplied credentials",
    expected: "The Store Owner / Admin User credentials authenticate at the documented Admin Portal (platform-admin.myei.app).",
    actual: 'platform-admin.myei.app/login → POST /api/v1/auth/admin/login returns 401 "Invalid credentials" for BOTH accounts. Order management actually lives in the EcomIntelligence dashboard at admin.myei.app/shop/sk-store (staff login, /api/v1/auth/staff/login), reached via sk-store.myei.app/admin. Ticket documentation points testers to the wrong portal.',
    steps: ["Open https://platform-admin.myei.app/login", "Sign in with the Store Owner credentials", "Observe 401 Invalid credentials", "Open https://sk-store.myei.app/admin → redirects to admin.myei.app/shop/sk-store → login succeeds"],
    evidence: [EV("platform_admin_401.png")],
  },
];

(async () => {
  const w = new ReportWriter({
    title: "Sikder Store — Return / Exchange / Damage Claim E2E Test Report",
    ticket: "Return, Exchange & Damage Claim workflow validation (Order, Inventory, Refund, Store Ops)",
    environment: "Sandbox — storefront sk-store.myei.app, admin admin.myei.app/shop/sk-store; bKash & SSLCommerz in sandbox mode",
  });
  // Render straight into docs/ so evidence/<img> paths resolve from the report.
  const docs = path.resolve(__dirname, "..", "docs");
  w.dir = docs;
  w.ledger = path.join(docs, ".report-ledger.json");
  fs.mkdirSync(path.join(docs, "evidence"), { recursive: true });
  fs.writeFileSync(w.ledger, "[]");

  for (const f of findings) w.add(f);
  await w.flush();

  fs.renameSync(path.join(docs, "report.md"), path.join(docs, "Test-Report.md"));
  fs.renameSync(path.join(docs, "report.docx"), path.join(docs, "Test-Report.docx"));
  fs.rmSync(w.ledger, { force: true });
  console.log("Wrote docs/Test-Report.md and docs/Test-Report.docx");
})();
