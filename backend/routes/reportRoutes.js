const express = require("express");
const router = express.Router();
const {
  createReport,
  getMyReports,
  getAllReports,
  updateReportStatus,
  deleteReport,
} = require("../controllers/reportController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, createReport);
router.get("/my", protect, getMyReports);

// Admin routes
router.get("/", protect, adminOnly, getAllReports);
router.put("/:id", protect, adminOnly, updateReportStatus);
router.delete("/:id", protect, adminOnly, deleteReport);

module.exports = router;