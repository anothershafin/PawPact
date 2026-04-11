const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

const {
  getQuestionnaire,
  saveAnswers,
  scoreForPet,
} = require("../controllers/questionnaireController");

router.get("/", protect, requireRole("adopter"), getQuestionnaire);
router.put("/answers", protect, requireRole("adopter"), saveAnswers);
router.get("/pet/:id/score", protect, requireRole("adopter"), scoreForPet);

module.exports = router;

