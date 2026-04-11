const mongoose = require("mongoose");

const observationUpdateSchema = new mongoose.Schema(
  {
    contract: { type: mongoose.Schema.Types.ObjectId, ref: "ObservationContract", required: true, index: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: { type: String, required: true, trim: true },
    photos: { type: [String], default: [] },
  },
  { timestamps: true }
);

const ObservationUpdate = mongoose.model("ObservationUpdate", observationUpdateSchema);
module.exports = ObservationUpdate;

