const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    contract: { type: mongoose.Schema.Types.ObjectId, ref: "ObservationContract", required: true, index: true },
    fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    text: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

reviewSchema.index({ contract: 1, fromUser: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;

