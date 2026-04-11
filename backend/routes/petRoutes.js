const express = require("express");
const router = express.Router();
const {
  createPet,
  getMyPets,
  getPetById,
  updatePet,
} = require("../controllers/petController");
const { protect } = require("../middleware/auth");

router.post("/", protect, createPet);
router.get("/mypets", protect, getMyPets);
router.get("/:id", getPetById);
router.put("/:id", protect, updatePet);

module.exports = router;