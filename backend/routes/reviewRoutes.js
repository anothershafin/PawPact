const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  createReview,
  getReviewsForUser,
  searchUsersForReview,
} = require("../controllers/reviewController");

router.post("/", protect, createReview);
router.get("/search-users", protect, searchUsersForReview);
router.get("/user/:userId", getReviewsForUser);

module.exports = router;