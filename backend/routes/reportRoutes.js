const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { createReport, getMyReports } = require("../controllers/reportController");

router.post("/", protect, createReport);
router.get("/mine", protect, getMyReports);

module.exports = router;

