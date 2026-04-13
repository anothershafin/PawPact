const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema(
  {
    adopter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    petParent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: ["submitted", "under review", "accepted", "rejected", "withdrawn"],
      default: "submitted"
    },
    message: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);