/**
 * Creates a default admin user (or skips if one already exists).
 * Run from backend folder: npm run seed:admin
 *
 * Required in .env: MONGO_URI, SEED_ADMIN_PASSWORD (min 6 chars)
 * Optional: SEED_ADMIN_EMAIL, SEED_ADMIN_NAME, SEED_ADMIN_PHONE, SEED_ADMIN_DISTRICT, SEED_ADMIN_UPAZILLA
 * If the email exists but role is not admin: set SEED_UPGRADE_NON_ADMIN=1 to promote (keeps existing password).
 */

require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Missing MONGO_URI in .env");
    process.exit(1);
  }

  const email = String(process.env.SEED_ADMIN_EMAIL || "admin@pawpact.local")
    .trim()
    .toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!password || String(password).length < 6) {
    console.error("Set SEED_ADMIN_PASSWORD in .env (at least 6 characters).");
    process.exit(1);
  }

  await mongoose.connect(uri);

  const existing = await User.findOne({ email });

  if (existing) {
    if (existing.role === "admin") {
      console.log(`Admin already exists: ${email}`);
      await mongoose.disconnect();
      return;
    }
    if (process.env.SEED_UPGRADE_NON_ADMIN === "1") {
      existing.role = "admin";
      await existing.save();
      console.log(`Promoted existing user to admin: ${email}`);
      await mongoose.disconnect();
      return;
    }
    console.error(
      `User ${email} exists but is not an admin. Use a different SEED_ADMIN_EMAIL, or set SEED_UPGRADE_NON_ADMIN=1 to promote this account.`
    );
    await mongoose.disconnect();
    process.exit(1);
  }

  await User.create({
    name: process.env.SEED_ADMIN_NAME || "Administrator",
    email,
    phone: process.env.SEED_ADMIN_PHONE || "0000000000",
    password,
    role: "admin",
    district: process.env.SEED_ADMIN_DISTRICT || "N/A",
    upazilla: process.env.SEED_ADMIN_UPAZILLA || "N/A",
  });

  console.log(`Created admin user: ${email}`);
  console.log("Log in via /login with this email and SEED_ADMIN_PASSWORD.");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
