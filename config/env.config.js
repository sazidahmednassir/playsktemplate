require("dotenv").config();

// Rentora environment configuration.
// User/owner portal and admin portal are served on different hosts so they get
// independent session cookies (127.0.0.1 vs localhost).
const config = {
  baseURL: process.env.BASE_URL || "http://127.0.0.1:8000",
  adminBaseURL: process.env.ADMIN_BASE_URL || "http://localhost:8000",

  owner: {
    username: process.env.OWNER_EMAIL || "owner1@rentora.test",
    password: process.env.OWNER_PASSWORD || "password",
  },
  owner2: {
    username: process.env.OWNER2_EMAIL || "owner2@rentora.test",
    password: process.env.OWNER2_PASSWORD || "password",
  },
  admin: {
    username: process.env.ADMIN_EMAIL || "admin@rentora.com.bd",
    password: process.env.ADMIN_PASSWORD || "password",
  },
  // Seeded QA renter (created during analysis; unverified due to mailer bug).
  renter: {
    username: process.env.RENTER_EMAIL || "qa.renter1@rentora.test",
    password: process.env.RENTER_PASSWORD || "Password123!",
  },

  authStatePath: process.env.AUTH_STATE_PATH || ".auth/state.json",
};

module.exports = config;
