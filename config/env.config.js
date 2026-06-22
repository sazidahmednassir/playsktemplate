require("dotenv").config();

// Central config for the Sikder Store E2E suite.
// Storefront = customer site; Admin = EcomIntelligence store-scoped dashboard.
// All URLs/credentials come from .env — never hardcode in pages/actions/specs.

const ADMIN_URL = process.env.ADMIN_URL || "https://admin.myei.app";
const SHOP_SLUG = process.env.SHOP_SLUG || "sk-store";

const config = {
  store: {
    baseURL: process.env.STORE_URL || "https://sk-store.myei.app",
    loginURL: (process.env.STORE_URL || "https://sk-store.myei.app") + "/auth/login",
    customer: {
      email: process.env.CUSTOMER_EMAIL,
      password: process.env.CUSTOMER_PASSWORD,
    },
  },

  admin: {
    baseURL: ADMIN_URL,
    shopSlug: SHOP_SLUG,
    // Staff login entry point (sk-store.myei.app/admin redirects here).
    loginURL: `${ADMIN_URL}/shop/${SHOP_SLUG}`,
    // Helper to build any store-scoped admin path.
    path: (p = "") => `${ADMIN_URL}/shop/${SHOP_SLUG}${p ? "/" + p.replace(/^\//, "") : ""}`,
    owner: {
      email: process.env.OWNER_EMAIL,
      password: process.env.OWNER_PASSWORD,
    },
    adminUser: {
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
    },
  },

  payment: {
    bkash: {
      number: process.env.BKASH_NUMBER || "01770618575",
      otp: process.env.BKASH_OTP || "12121",
      pin: process.env.BKASH_PIN || "123456",
    },
  },

  authDir: process.env.AUTH_DIR || ".auth",
};

module.exports = config;
