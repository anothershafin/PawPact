// One-time script to create the bootstrap admin user.
// Run with:  node scripts/createAdmin.js
// Reads ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD from .env

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const User = require("../models/User");

const createAdmin = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error("❌ MONGO_URI not set in .env");
      process.exit(1);
    }
    if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
      console.error("❌ ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const existing = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (existing) {
      if (existing.role === "admin") {
        console.log(`ℹ️  Admin already exists: ${existing.email}`);
      } else {
        existing.role = "admin";
        await existing.save();
        console.log(`✅ Promoted existing user to admin: ${existing.email}`);
      }
    } else {
      const admin = await User.create({
        name: process.env.ADMIN_NAME || "Admin",
        email: process.env.ADMIN_EMAIL,
        phone: process.env.ADMIN_PHONE || "0000000000",
        password: process.env.ADMIN_PASSWORD,
        role: "admin",
        district: "N/A",
        upazilla: "N/A",
        isVerified: true,
      });
      console.log(`✅ Admin created: ${admin.email}`);
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
};

createAdmin();