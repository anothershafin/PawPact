const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const { 
  updateShortlist, 
  updateLifestyleAnswers, 
  createApplication, 
  updateApplicationStatus,
  getApplications,
  removeFromShortlist
} = require("../controllers/shortlist")

// FR-9 & FR-11
router.post("/shortlist", protect, updateShortlist);
router.post("/lifestyle", protect, updateLifestyleAnswers);

// FR-13
router.post("/applications", protect, createApplication);
router.put("/applications/:id", protect, updateApplicationStatus);
router.get("/applications", protect, getApplications);
router.delete("/shortlist/:petId", protect, removeFromShortlist);

module.exports = router;