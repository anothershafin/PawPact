const express = require("express");
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  sendOtp,
  verifyOtp,
  getAllUsers,
  deleteUser,
  getUserById,
} = require("../controllers/userController");
const { protect, adminOnly } = require("../middleware/auth");

// Public routes (no login required)
router.post("/register", registerUser);
router.post("/login", loginUser);

// Private routes (login required)
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.post("/send-otp", protect, sendOtp);
router.post("/verify-otp", protect, verifyOtp);
// Admin routes
router.get("/", protect, adminOnly, getAllUsers);
router.delete("/:id", protect, adminOnly, deleteUser);

// Get single user (any logged-in user can view)
router.get("/:id", protect, getUserById);

module.exports = router;
