const mongoose = require("mongoose");

const observationContractSchema = new mongoose.Schema(
  {
    application: { type: mongoose.Schema.Types.ObjectId, ref: "Application", required: true, unique: true },
    pet: { type: mongoose.Schema.Types.ObjectId, ref: "Pet", required: true },
    adopter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    petParent: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: {
      type: String,
      enum: [
        "active",
        "return_requested",
        "disputed",
        "closed_returned",
        "closed_adopted",
        "closed_cancelled",
      ],
      default: "active",
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    adopterConfirmedAt: { type: Date, default: null },
    petParentConfirmedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const ObservationContract = mongoose.model("ObservationContract", observationContractSchema);
module.exports = ObservationContract;

