const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["pet", "user", "contract"], required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
    reason: { type: String, required: true, trim: true },
    evidencePhotos: { type: [String], default: [] },
    status: { type: String, enum: ["open", "triaged", "resolved", "rejected"], default: "open" },
    adminNotes: { type: String, default: "", trim: true },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);
module.exports = Report;

