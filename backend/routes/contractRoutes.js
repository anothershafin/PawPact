const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

const {
  listMyContracts,
  getContractById,
  postUpdate,
  createCheckIn,
  answerCheckIn,
  requestReturn,
  confirmCompletion,
} = require("../controllers/contractController");

router.use(protect, requireRole("adopter", "petparent"));

router.get("/mine", listMyContracts);
router.get("/:id", getContractById);

router.post("/:id/updates", requireRole("adopter"), postUpdate);
router.post("/:id/checkins", requireRole("petparent"), createCheckIn);
router.put("/:id/checkins/:checkinId/answer", requireRole("adopter"), answerCheckIn);
router.post("/:id/return-request", requireRole("petparent"), requestReturn);
router.post("/:id/confirm-completion", confirmCompletion);

module.exports = router;

