// Form Validation — EP/BVA/edge over the /register and /login inputs.
// Data-driven from data/form-validation.json (kept only where the live app
// actually rejects/blocks the input). Each register case keeps exactly one
// field invalid so the assertion isolates that field; invalid input is rejected
// before the mailer event, so BUG-001's HTTP 500 is never reached.
const { test, expect } = require("./fixture/customfixture");
const { FORM_CASES } = require("../data/testcases");
const SHEET = "FormValidation";

test.describe("Form Validation (EP / BVA / edge)", () => {
  for (const c of FORM_CASES) {
    test(`${c.id} ${c.surface} — ${c.label}`, async ({ page, actions, result }) => {
      result.for(SHEET, c.id, c.expected);

      if (c.surface === "register") {
        const f = c.fields || {};
        const opts = { email: c.emailUnderTest ? f.email : `fv.${Date.now()}.${c.id}@rentora.test` };
        if (f.name !== undefined) opts.name = f.name;
        if (f.phone !== undefined) opts.phone = f.phone;
        if (f.password !== undefined) opts.password = f.password;
        if (f.confirm !== undefined) opts.confirm = f.confirm;
        if (f.terms !== undefined) opts.acceptTerms = f.terms;
        await actions.auth.registerUser(opts);
        await expect(page).toHaveURL(/register/);
      } else {
        await actions.auth.signIn(c.email, c.password);
        await expect(page).toHaveURL(/login/);
      }

      await expect(
        page.getByText(/Internal Server Error|UnsupportedSchemeException|tls.*scheme is not supported/i)
      ).toHaveCount(0);
    });
  }
});
