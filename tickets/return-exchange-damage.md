# Ticket — Return / Exchange / Damage Claim Workflow

> This file is the **source of truth** for test generation (it replaces the old
> Excel sheet). The `/add-test` skill reads the **Test Cases** table below and
> generates one spec per **Area**. Results are reported by `utils/ReportWriter.js`
> as Markdown + Word, not back into this file.

## Context

Customers place orders on the storefront (**https://sk-store.myei.app**).
bKash and SSLCommerz are in **sandbox** mode.

- bKash sandbox wallet: `01770618575` / OTP `12121` / PIN `123456`

After an order is placed it appears in **All Orders** of the admin dashboard.
The **Store Owner** or **Admin User** updates the order status. Once the status
reaches **Shipped** or **Delivered**, the **Return** action becomes available and
they can initiate a **Return**, **Exchange**, or **Damage Claim**.

These flows touch Order Management, Inventory, Refund Processing, and Store Ops,
so they need thorough end-to-end validation.

## System map (discovered)

| Surface | URL | Auth endpoint |
| ------- | --- | ------------- |
| Storefront (customer) | https://sk-store.myei.app | `/api/v1/auth/customer/login` |
| Admin dashboard (staff) | https://admin.myei.app/shop/sk-store | `/api/v1/auth/staff/login` |
| Platform admin (NOT used here) | https://platform-admin.myei.app | `/api/v1/auth/admin/login` |

> **Note:** the ticket pointed to `platform-admin.myei.app`, but the provided
> Store Owner / Admin User credentials are **rejected there** (401). Order
> management actually lives in the EcomIntelligence dashboard at
> `admin.myei.app/shop/sk-store` via the **staff** login.

**Order lifecycle:** `payment_pending → pending → confirmed → verification →
ready_for_box → shipped → delivered → (returned | exchange | damaged) → refunded`

**Return record:** `RTN-DDMMYY-NNN`, type ∈ {Return, Exchange, Damage Claim},
status ∈ {Requested, Settled, Rejected}. Create form fields: Type, Reason,
per-item selection + Qty, Full-return toggle, Note; Damage Claim adds per-item
Condition (Good/Damaged/Defective/Used) + Photos. Settle action refunds /
reduces due / (should) restock; Reject closes the request.

## Test Cases

| TC | Area | Title | Expected |
| -- | ---- | ----- | -------- |
| TC-1 | Order | Storefront order placement (bKash sandbox) reaches All Orders | Order created with `payment_pending`/`pending` and is visible in All Orders |
| TC-2 | Order | Staff can advance order status to Shipped / Delivered | Each transition is persisted and logged with actor + timestamp |
| TC-3 | Return | Return action is gated by status | No Return action on Pending; Return action present on Shipped & Delivered |
| TC-4 | Return | Create Return request on a Delivered order | RTN created (Requested), listed in Returns & Refunds, linked to order |
| TC-5 | Return | Settle Return adjusts refund / due and updates order status | Order → returned/refunded; due/refund match item value |
| TC-6 | Inventory | Settling a Return restocks the returned item | Item stock increases by returned qty; return shows "Stock Updated: Yes" |
| TC-7 | Refund | Refund method matches the original payment method | bKash-paid order refunds via bKash (not "cash") |
| TC-8 | Refund | Returns dashboard KPIs reflect settled refunds | "Total Refunded" and REFUND column show settled amounts |
| TC-9 | Exchange | Create + settle Exchange spawns a replacement order | Replacement order created and linked; original marked exchange |
| TC-10 | Damage | Create Damage Claim captures condition + photos | Claim records per-item condition; order marked damaged |
| TC-11 | Return | Reject a return request | Return → Rejected; no refund, no stock change, order status unchanged |
| TC-12 | Return | Returns status filter matches real statuses | Filter options correspond to the statuses actually used on records |

## Edge Cases — Return / Refund (depth)

Deeper negative / consistency / reconciliation checks on the refund path.

| TC | Area | Title | Expected |
| -- | ---- | ----- | -------- |
| TC-13 | Refund | Settled return records a positive refund (no silent zero/null settlement) | Every Settled return detail shows a refund amount > 0 |
| TC-14 | Refund | Total Refunded KPI reconciles with the sum of settled-return refunds | Dashboard "Total Refunded" KPI equals (±1) the sum of refunds on settled return details, and is > 0 |
| TC-15 | Return | No double-settle — a settled return exposes no Settle action | A return already in Settled state shows no Settle button (refund is idempotent) |
| TC-16 | Refund | Refund method matches payment across all settled returns | No settled return for a digitally-paid order records the refund as "Cash refund (cash)" |
