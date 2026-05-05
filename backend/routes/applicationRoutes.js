const express = require("express");
const router = express.Router();
const {
  startObservation,
  sendCheckInQuestion,
  requestReturn,
  sendChatMessage,
  getApplication
} = require("../controllers/applicationController");
const { protect } = require("../middleware/auth");

// All routes require authentication
router.use(protect);

// Get application details
router.get("/:id", getApplication);

// Start observation period (when application status is changed to "under review")
router.post("/:id/start-observation", startObservation);

// Send check-in question
router.post("/:id/check-in-questions", sendCheckInQuestion);

// Request return
router.post("/:id/request-return", requestReturn);

// Send chat message
router.post("/:id/chat", sendChatMessage);

module.exports = router;
