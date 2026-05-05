const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");

const { 
  updateShortlist, 
  updateLifestyleAnswers, 
  createApplication, 
  updateApplicationStatus,
  getApplications,
  removeFromShortlist,
  getApplicationById,
  confirmAgreement,
} = require("../controllers/shortlist")

// FR-9 & FR-11
router.post("/shortlist", protect, updateShortlist);
router.post("/lifestyle", protect, updateLifestyleAnswers);

// FR-13
router.post("/applications", protect, createApplication);
router.get("/applications", protect, getApplications);
router.get("/applications/:id", protect, getApplicationById);
router.put("/applications/:id", protect, updateApplicationStatus);
router.put("/applications/:id/agreement", protect, confirmAgreement);
router.delete("/shortlist/:petId", protect, removeFromShortlist);

module.exports = router;