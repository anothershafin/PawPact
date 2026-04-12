const express = require("express");
const router = express.Router();
const { upload } = require("../middleware/upload");
const {
  createPet,
  getMyPets,
  getPetById,
  updatePet,
  searchPets,
  uploadProfilePhoto,
  uploadAlbumPhotos,
} = require("../controllers/petController");
const { protect } = require("../middleware/auth");

router.post("/", protect, createPet);
router.get("/mypets", protect, getMyPets);
router.get("/search", searchPets);
router.get("/:id", getPetById);
router.put("/:id", protect, updatePet);
router.post("/:id/profile-photo", protect, upload.single("image"), uploadProfilePhoto);
router.post("/:id/photos", protect, upload.array("images", 10), uploadAlbumPhotos);

module.exports = router;