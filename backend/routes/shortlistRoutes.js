const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");
const {
  getShortlist,
  createLabel,
  renameLabel,
  deleteLabel,
  addPetToLabel,
  removePetFromLabel,
} = require("../controllers/shortlistController");

router.use(protect, requireRole("adopter"));

router.get("/", getShortlist);
router.post("/labels", createLabel);
router.put("/labels/:labelId", renameLabel);
router.delete("/labels/:labelId", deleteLabel);

router.post("/labels/:labelId/pets", addPetToLabel);
router.delete("/labels/:labelId/pets/:petId", removePetFromLabel);

module.exports = router;

