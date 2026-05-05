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
    message: { type: String, default: "" },
    // Observation period fields
    observationStartDate: { type: Date, default: null },
    returnRequested: { type: Boolean, default: false },
    returnReason: { type: String, default: "" },
    // Chat messages during observation
    chatMessages: [
      {
        sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        message: String,
        timestamp: { type: Date, default: Date.now }
      }
    ],
    // Agreement fields
    agreement: {
      adopterConfirmed: { type: Boolean, default: false },
      parentConfirmed: { type: Boolean, default: false },
      adopterConfirmedAt: { type: Date },
      parentConfirmedAt: { type: Date },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Application", applicationSchema);