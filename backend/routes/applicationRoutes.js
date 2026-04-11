const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

const {
  createApplication,
  getMyApplications,
  withdrawApplication,
  getApplicationsForMyPets,
  updateApplicationStatus,
} = require("../controllers/applicationController");

// Adopter
router.post("/", protect, requireRole("adopter"), createApplication);
router.get("/mine", protect, requireRole("adopter"), getMyApplications);
router.post("/:id/withdraw", protect, requireRole("adopter"), withdrawApplication);

// Pet parent
router.get("/for-my-pets", protect, requireRole("petparent"), getApplicationsForMyPets);
router.put("/:id/status", protect, requireRole("petparent"), updateApplicationStatus);

module.exports = router;

