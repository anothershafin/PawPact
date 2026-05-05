const express = require("express");
const router = express.Router();
const {
  createReport,
  getMyReports,
  getAllReports,
} = require("../controllers/reportController");
const { protect } = require("../middleware/auth");

router.post("/", protect, createReport);
router.get("/my", protect, getMyReports);

// optional admin route
router.get("/", protect, getAllReports);

module.exports = router;