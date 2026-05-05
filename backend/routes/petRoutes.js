const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/upload");
const {
  createPet,
  getMyPets,
  getAllPets,
  getPetById,
  updatePet,
  deletePet,
  searchPets,
  uploadProfilePhoto,
  uploadAlbumPhotos,
} = require("../controllers/petController");
const { protect } = require("../middleware/auth");

router.get("/", getAllPets);
router.post("/", protect, createPet);
router.get("/mypets", protect, getMyPets);
router.get("/search", searchPets);
router.get("/:id", getPetById);
router.put("/:id", protect, updatePet);
router.delete("/:id", protect, deletePet);
router.post("/:id/profile-photo", protect, upload.single("image"), uploadProfilePhoto);
router.post("/:id/photos", protect, upload.array("images", 10), uploadAlbumPhotos);

module.exports = router;