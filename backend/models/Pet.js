const mongoose = require("mongoose");

const petSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    name: {
      type: String,
      required: [true, "Pet name is required"],
      trim: true,
    },
    breed: {
      type: String,
      required: [true, "Breed is required"],
      trim: true,
    },
    age: {
      type: String,
      required: [true, "Age is required"],
      trim: true,
    },
    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },
    upazilla: {
      type: String,
      required: [true, "Upazilla is required"],
      trim: true,
    },
    diet: {
      type: String,
      default: "",
      trim: true,
    },
    pottyTrained: {
      type: Boolean,
      default: false,
    },
    vaccinationStatus: {
      type: String,
      default: "Not Vaccinated",
      trim: true,
    },
    adoptionStatus: {
      type: String,
      enum: ["available", "paused", "reserved", "adopted", "withdrawn"],
      default: "available",
    },
    bio: {
      type: String,
      default: "",
    },
    profilePhoto: {
      type: String,
      default: "",
    },
    requirements: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Pet = mongoose.model("Pet", petSchema);

module.exports = Pet;