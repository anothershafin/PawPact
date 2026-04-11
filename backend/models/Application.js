const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    adopter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petParent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, default: "", trim: true },
    status: {
      type: String,
      enum: ["submitted", "under_review", "accepted", "rejected", "withdrawn"],
      default: "submitted",
    },
  },
  { timestamps: true }
);

applicationSchema.index({ pet: 1, adopter: 1 }, { unique: true });

const Application = mongoose.model("Application", applicationSchema);

module.exports = Application;

