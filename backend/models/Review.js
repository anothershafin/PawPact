const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    reviewer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    reviewedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

// Prevent the same user reviewing the same target twice
reviewSchema.index({ reviewer: 1, reviewedUser: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);