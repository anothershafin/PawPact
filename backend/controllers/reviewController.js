const mongoose = require("mongoose");
const Review = require("../models/Review");
const User = require("../models/User");

// @desc    Create a review for a user
// @route   POST /api/reviews
// @access  Private
const createReview = async (req, res) => {
  try {
    const { reviewedUser, rating, comment } = req.body;

    if (!reviewedUser || !rating) {
      return res.status(400).json({ message: "Reviewed user and rating are required" });
    }
    if (!mongoose.Types.ObjectId.isValid(reviewedUser)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (reviewedUser === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot review yourself" });
    }

    const target = await User.findById(reviewedUser);
    if (!target) return res.status(404).json({ message: "User not found" });

    const review = await Review.create({
      reviewer: req.user._id,
      reviewedUser,
      rating,
      comment: comment || "",
    });

    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: "You have already reviewed this user" });
    }
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all reviews for a specific user
// @route   GET /api/reviews/user/:userId
// @access  Public
const getReviewsForUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const reviews = await Review.find({ reviewedUser: userId })
      .populate("reviewer", "name profilePhoto")
      .sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    res.json({
      reviews,
      averageRating: Math.round(averageRating * 10) / 10,
      totalReviews: reviews.length,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search users by name (for adding a review)
// @route   GET /api/reviews/search-users?q=...
// @access  Private
const searchUsersForReview = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.json([]);
    }
    const users = await User.find({
      name: { $regex: q.trim(), $options: "i" },
      _id: { $ne: req.user._id },
      role: { $ne: "admin" },
    })
      .select("name email role district profilePhoto")
      .limit(10);
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getReviewsForUser, searchUsersForReview };