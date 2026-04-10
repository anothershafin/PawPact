const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  sendOtp,
  verifyOtp,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

// Public routes (no login required)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private routes (login required)
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/send-otp", protect, sendOtp);
router.post("/verify-otp", protect, verifyOtp);
module.exports = router;
