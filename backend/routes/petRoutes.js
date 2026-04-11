const express = require("express");
const router = express.Router();
const {
  createPet,
  listPets,
  getMyPets,
  getPetById,
  updatePet,
  addVaccination,
  updateVaccination,
  deleteVaccination,
} = require("../controllers/petController");
const { protect } = require("../middleware/auth");
const { requireRole } = require("../middleware/rbac");

router.get("/", listPets);

router.post("/", protect, requireRole("petparent", "admin"), createPet);
router.get("/mypets", protect, requireRole("petparent", "admin"), getMyPets);
router.get("/:id", getPetById);
router.put("/:id", protect, requireRole("petparent", "admin"), updatePet);

router.post("/:id/vaccinations", protect, requireRole("petparent", "admin"), addVaccination);
router.put("/:id/vaccinations/:vaccinationId", protect, requireRole("petparent", "admin"), updateVaccination);
router.delete("/:id/vaccinations/:vaccinationId", protect, requireRole("petparent", "admin"), deleteVaccination);

module.exports = router;